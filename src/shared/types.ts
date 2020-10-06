export interface Post {
  id: number;
  title: string;
  content: string;
  username: string;
  votes: number;
}

export const SocketEvents = {
  postUpdated: 'post-updated',
};
