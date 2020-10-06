//
// Constants
//
const API_URL = 'http://localhost:4000/api';
const WS_URL = 'ws://localhost:4000/api/events';

//
// Shared fetch wrapper funcs
//

const httpGet = async (path: string) => {
  const url = `${API_URL}/${path}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const json = await response.json();
  if (json.error) {
    throw new Error(json.error);
  }
  return json;
};

const httpPost = async (path: string, data: Record<string, any> = {}) => {
  const url = `${API_URL}/${path}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  if (json.error) {
    throw new Error(json.error);
  }
  return json;
};

//
// Exported API functions
//

// open a WebSocket connection to the server
export const getEventsSocket = () => {
  return new WebSocket(WS_URL);
};

export const fetchPosts = async () => {
  return await httpGet('posts');
};

export const createPost = async (
  username: string,
  title: string,
  content: string
) => {
  const request = { username, title, content };
  return await httpPost('posts', request);
};

export const upvotePost = async (postId: number) => {
  return await httpPost(`posts/${postId}/upvote`);
};
