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
  const { username, title, content } = req.body;

  const post = await db.createPost(username, title, content);
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
