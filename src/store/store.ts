import { makeAutoObservable } from 'mobx';
import * as api from '../lib/api';
import { Post, SocketEvents } from '../shared/types';

export class Store {
  constructor() {
    makeAutoObservable(this);

    this.init();
  }

  //
  // Observable state objects
  //

  // App state
  page = 'posts';
  error = '';
  connected = false;
  alias = '';
  balance = 0;
  pubkey = '';

  // PostList state
  posts: Post[] = [];

  //
  // Computed props
  //

  get sortedPosts() {
    return this.posts.slice().sort((a, b) => {
      // sort by votes desc if they are not equal
      if (a.votes !== b.votes) return b.votes - a.votes;
      // sort by id if they have the same votes
      return a.id - b.id;
    });
  }

  //
  // Actions
  //

  gotoPosts = () => (this.page = 'posts');
  gotoCreate = () => (this.page = 'create');
  gotoConnect = () => (this.page = 'connect');

  clearError = () => (this.error = '');

  init = async () => {
    // try to fetch the node's info on startup
    try {
      await this.fetchInfo();
      this.connected = true;
    } catch (err) {
      // don't display an error, just disconnect
      this.connected = false;
    }

    // fetch the posts from the backend
    try {
      this.posts = await api.fetchPosts();
    } catch (err) {
      this.error = err.message;
    }

    // connect to the backend WebSocket and listen for events
    const ws = api.getEventsSocket();
    ws.addEventListener('message', this.onSocketMessage);
  };

  connectToLnd = async (host: string, cert: string, macaroon: string) => {
    this.clearError();
    try {
      await api.connect(host, cert, macaroon);
      this.connected = true;
      this.fetchInfo();
      this.gotoPosts();
    } catch (err) {
      this.error = err.message;
    }
  };

  disconnect = () => {
    api.clearToken();
    this.connected = false;
  };

  fetchInfo = async () => {
    const info = await api.getInfo();
    this.alias = info.alias;
    this.balance = parseInt(info.balance);
    this.pubkey = info.pubkey;
  };

  fetchPosts = async () => {
    this.clearError();
    try {
      this.posts = await api.fetchPosts();
    } catch (err) {
      this.error = err.message;
    }
  };

  createPost = async (username: string, title: string, content: string) => {
    this.clearError();
    try {
      await api.createPost(username, title, content);
      this.gotoPosts();
    } catch (err) {
      this.error = err.message;
    }
  };

  upvotePost = async (post: Post) => {
    this.clearError();
    try {
      await api.upvotePost(post.id);
    } catch (err) {
      this.error = err.message;
    }
  };

  //
  // WebSocket listener
  //

  onSocketMessage = (msg: MessageEvent) => {
    const event = JSON.parse(msg.data);
    // update the posts array when a post is updated on the server
    if (event.type === SocketEvents.postUpdated) {
      // replacing the existing post with this new one
      this._updatePost(event.data);
    }
  };

  //
  // Private helper methods
  //

  private _updatePost = (post: Post) => {
    this.posts = [
      // the updated post
      post,
      // the existing posts excluding the one that was updated
      ...this.posts.filter(p => p.id !== post.id),
    ];
  };
}
