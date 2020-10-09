export interface Post {
  id: number;
  title: string;
  content: string;
  username: string;
  votes: number;
  signature: string;
  pubkey: string;
}

export const SocketEvents = {
  postUpdated: 'post-updated',
};
