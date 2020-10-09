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

  const { alias } = await rpc.getInfo();

  const post = await db.createPost(alias, title, content);
  res.status(201).send(post);
};

/**
 * POST /api/posts/:id/upvote
 */
export const upvotePost = async (req: Request, res: Response) => {
  const { id } = req.params;
  // find the post
  const post = db.getPostById(parseInt(id));
  if (!post) throw new Error('Post not found');

  db.upvotePost(post.id);
  res.send(post);
};
