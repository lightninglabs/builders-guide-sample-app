import { EventEmitter } from 'events';
import { existsSync, promises as fs } from 'fs';
import { Post } from '../src/shared/types';

const DB_FILE = 'db.json';

export interface LndNode {
  token: string;
  host: string;
  cert: string;
  macaroon: string;
  pubkey: string;
}

export interface DbData {
  posts: Post[];
  nodes: LndNode[];
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
    nodes: [],
  };

  //
  // Posts
  //

  getAllPosts() {
    return this._data.posts.sort((a, b) => b.votes - a.votes);
  }

  getPostById(id: number) {
    return this.getAllPosts().find(post => post.id === id);
  }

  async createPost(
    username: string,
    title: string,
    content: string,
    signature: string,
    pubkey: string,
  ) {
    // calculate the highest numeric id
    const maxId = Math.max(0, ...this._data.posts.map(p => p.id));

    const post: Post = {
      id: maxId + 1,
      title,
      content,
      username,
      votes: 0,
      signature,
      pubkey,
      verified: false,
    };
    this._data.posts.push(post);

    await this.persist();
    this.emit(PostEvents.updated, post);
    return post;
  }

  async upvotePost(postId: number) {
    const post = this._data.posts.find(p => p.id === postId);
    if (!post) {
      throw new Error('Post not found');
    }
    post.votes++;
    await this.persist();
    this.emit(PostEvents.updated, post);
  }

  async verifyPost(postId: number) {
    const post = this._data.posts.find(p => p.id === postId);
    if (!post) {
      throw new Error('Post not found');
    }
    post.verified = true;
    await this.persist();
    this.emit(PostEvents.updated, post);
  }

  //
  // Nodes
  //

  getAllNodes() {
    return this._data.nodes;
  }

  getNodeByPubkey(pubkey: string) {
    return this.getAllNodes().find(node => node.pubkey === pubkey);
  }

  getNodeByToken(token: string) {
    return this.getAllNodes().find(node => node.token === token);
  }

  async addNode(node: LndNode) {
    this._data.nodes = [
      // add new node
      node,
      // exclude existing nodes with the same server
      ...this._data.nodes.filter(n => n.host !== node.host),
    ];
    await this.persist();
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
      if (!this._data.nodes) this._data.nodes = [];
      console.log(`Loaded ${this._data.posts.length} posts`);
    }
  }
}

export default new PostsDb();
