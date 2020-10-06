import React, { useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { Post } from '../shared/types';
import { useStore } from '../store/Provider';

interface Props {
  post: Post;
}

const VoteButton: React.FC<Props> = ({ post }) => {
  const store = useStore();

  const handleUpvoteClick = useCallback(async () => {
    await store.upvotePost(post);
  }, [store, post]);

  return (
    <Button variant="outline-primary" onClick={handleUpvoteClick}>
      Upvote
    </Button>
  );
};

export default VoteButton;
