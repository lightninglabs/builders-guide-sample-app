import { EventEmitter } from 'events';
import { existsSync, promises as fs } from 'fs';
import { Post } from '../src/shared/types';

const DB_FILE = 'db.json';

export interface DbData {
  posts: Post[];
}

/**
 * The list of events emitted by the PostsDb
 */
export const PostEvents = {
  updated: 'post-updated',
};

/**
 * A very simple file-based DB to store the posts
 */
class PostsDb extends EventEmitter {
  // in-memory database
  private _data: DbData = {
    posts: [],
  };

  //
  // Posts
  //

  getAllPosts() {
    return this._data.posts.sort((a, b) => b.votes - a.votes);
  }

  getPostById(id: number) {
    return this.getAllPosts().find((post) => post.id === id);
  }

  async createPost(username: string, title: string, content: string) {
    // calculate the highest numeric id
    const maxId = Math.max(0, ...this._data.posts.map((p) => p.id));

    const post: Post = {
      id: maxId + 1,
      title,
      content,
      username,
      votes: 0,
    };
    this._data.posts.push(post);

    await this.persist();
    this.emit(PostEvents.updated, post);
    return post;
  }

  async upvotePost(postId: number) {
    const post = this._data.posts.find((p) => p.id === postId);
    if (!post) {
      throw new Error('Post not found');
    }
    post.votes++;
    await this.persist();
    this.emit(PostEvents.updated, post);
  }

  //
  // HACK! Persist data to a JSON file to keep it when the server restarts.
  // Do not do this in a production app. This is just for convenience when
  // developing this sample app locally.
  //

  async persist() {
    await fs.writeFile(DB_FILE, JSON.stringify(this._data, null, 2));
  }

  async restore() {
    if (!existsSync(DB_FILE)) return;

    const contents = await fs.readFile(DB_FILE);
    if (contents) {
      this._data = JSON.parse(contents.toString());
      console.log(`Loaded ${this._data.posts.length} posts`);
    }
  }
}

export default new PostsDb();
