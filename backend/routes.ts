import { Request, Response } from 'express';
import nodeManager from './node-manager';
import db from './posts-db';

/**
 * POST /api/connect
 */
export const connect = async (req: Request, res: Response) => {
  const { host, cert, macaroon } = req.body;
  const { token, pubkey } = await nodeManager.connect(host, cert, macaroon);
  await db.addNode({ host, cert, macaroon, token, pubkey });
  res.send({ token });
};

/**
 * GET /api/info
 */
export const getInfo = async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) throw new Error('Your node is not connected!');
  // find the node that's making the request
  const node = db.getNodeByToken(token);
  if (!node) throw new Error('Node not found with this token');

  // get the node's pubkey and alias
  const rpc = nodeManager.getRpc(node.token);
  const { alias, identityPubkey: pubkey } = await rpc.getInfo();
  const { balance } = await rpc.channelBalance();
  res.send({ alias, balance, pubkey });
};

/**
 * GET /api/posts
 */
export const getPosts = (req: Request, res: Response) => {
  const posts = db.getAllPosts();
  res.send(posts);
};

/**
 * POST /api/posts
 */
export const createPost = async (req: Request, res: Response) => {
  const { token, title, content } = req.body;
  const rpc = nodeManager.getRpc(token);

  const { alias, identityPubkey: pubkey } = await rpc.getInfo();
  // lnd requires the message to sign to be base64 encoded
  const msg = Buffer.from(content).toString('base64');
  // sign the message to obtain a signature
  const { signature } = await rpc.signMessage({ msg });

  const post = await db.createPost(alias, title, content, signature, pubkey);
  res.status(201).send(post);
};

/**
 * POST /api/posts/:id/upvote
 */
export const upvotePost = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { hash } = req.body;

  // validate that a invoice hash was provided
  if (!hash) throw new Error('hash is required');
  // find the post
  const post = db.getPostById(parseInt(id));
  if (!post) throw new Error('Post not found');
  // find the node that made this post
  const node = db.getNodeByPubkey(post.pubkey);
  if (!node) throw new Error('Node not found for this post');

  const rpc = nodeManager.getRpc(node.token);
  const rHash = Buffer.from(hash, 'base64');
  const { settled } = await rpc.lookupInvoice({ rHash });
  if (!settled) {
    throw new Error('The payment has not been paid yet!');
  }

  db.upvotePost(post.id);
  res.send(post);
};

/**
 * POST /api/posts/:id/verify
 */
export const verifyPost = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { token } = req.body;
  // find the post
  const post = db.getPostById(parseInt(id));
  if (!post) throw new Error('Post not found');
  // find the node that's verifying this post
  const verifyingNode = db.getNodeByToken(token);
  if (!verifyingNode) throw new Error('Your node not found. Try reconnecting.');

  if (post.pubkey === verifyingNode.pubkey)
    throw new Error('You cannot verify your own posts!');

  const rpc = nodeManager.getRpc(verifyingNode.token);
  const msg = Buffer.from(post.content).toString('base64');
  const { signature } = post;
  const { pubkey, valid } = await rpc.verifyMessage({ msg, signature });

  if (!valid || pubkey !== post.pubkey) {
    throw new Error('Verification failed! The signature is invalid.');
  }

  db.verifyPost(post.id);
  res.send(post);
};

/**
 * POST /api/posts/:id/invoice
 */
export const postInvoice = async (req: Request, res: Response) => {
  const { id } = req.params;
  // find the post
  const post = db.getPostById(parseInt(id));
  if (!post) throw new Error('Post not found');
  // find the node that made this post
  const node = db.getNodeByPubkey(post.pubkey);
  if (!node) throw new Error('Node not found for this post');

  // create an invoice on the poster's node
  const rpc = nodeManager.getRpc(node.token);
  const amount = 100;
  const inv = await rpc.addInvoice({ value: amount.toString() });
  res.send({
    payreq: inv.paymentRequest,
    hash: (inv.rHash as Buffer).toString('base64'),
    amount,
  });
};
