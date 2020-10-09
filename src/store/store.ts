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
  makeItRain = false;

  // PostList state
  posts: Post[] = [];

  // PayModal state
  showPayModal = false;
  pmtForPost: Post | undefined;
  pmtAmount = '';
  pmtRequest = '';
  pmtHash = '';
  pmtSuccessMsg = '';
  pmtError = '';

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
  gotoCreate = () => (this.page = this.connected ? 'create' : 'connect');
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

  createPost = async (title: string, content: string) => {
    this.clearError();
    try {
      await api.createPost(title, content);
      this.gotoPosts();
    } catch (err) {
      this.error = err.message;
    }
  };

  upvotePost = async () => {
    this.pmtError = '';
    try {
      if (!this.pmtForPost) throw new Error('No post selected to upvote');
      await api.upvotePost(this.pmtForPost.id, this.pmtHash);
      this.pmtSuccessMsg = `Your payment of ${this.pmtAmount} sats to ${this.pmtForPost.username} was successful! The post has been upvoted!`;
    } catch (err) {
      this.pmtError = err.message;
    }
  };

  verifyPost = async (postId: number) => {
    this.clearError();
    try {
      const post = await api.verifyPost(postId);
      this._updatePost(post);
    } catch (err) {
      this.error = err.message;
    }
  };

  showPaymentRequest = async (post: Post) => {
    this.clearError();
    try {
      const res = await api.createInvoice(post.id);
      this.pmtForPost = post;
      this.pmtAmount = res.amount;
      this.pmtRequest = res.payreq;
      this.pmtHash = res.hash;
      this.pmtSuccessMsg = '';
      this.pmtError = '';
      this.showPayModal = true;
    } catch (err) {
      this.error = err.message;
    }
  };

  hidePaymentRequest = () => {
    this.pmtForPost = undefined;
    this.pmtAmount = '';
    this.pmtRequest = '';
    this.pmtHash = '';
    this.pmtSuccessMsg = '';
    this.pmtError = '';
    this.showPayModal = false;
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
    if (event.type === SocketEvents.invoicePaid) {
      const { hash, amount, pubkey } = event.data;
      // upvote the post when the incoming payment is made for the
      // pmtHash the we are waiting for
      if (hash === this.pmtHash) {
        this.upvotePost();
      }
      // update the balance when an invoice is paid to the current user
      if (pubkey === this.pubkey) {
        this._incrementBalance(parseInt(amount));
      }
    }
  };

  //
  // Private helper methods
  //
  private _incrementBalance = (amount: number) => {
    this.balance = this.balance + amount;

    // make it rain for 3 seconds 💸
    this.makeItRain = true;
    setTimeout(() => {
      this.makeItRain = false;
    }, 3000);
  };

  private _updatePost = (post: Post) => {
    this.posts = [
      // the updated post
      post,
      // the existing posts excluding the one that was updated
      ...this.posts.filter(p => p.id !== post.id),
    ];
  };
}
