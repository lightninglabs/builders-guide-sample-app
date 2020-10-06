import React from 'react';
import { Badge, Card } from 'react-bootstrap';
import { Post } from '../shared/types';
import VoteButton from './VoteButton';

interface Props {
  post: Post;
}

const PostCard: React.FC<Props> = ({ post }) => {
  return (
    <Card key={post.id} className="my-4">
      <Card.Body>
        <Card.Title>
          <strong>{post.title}</strong>
        </Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          Posted by <strong>{post.username}</strong>
        </Card.Subtitle>
        <Card.Text>{post.content}</Card.Text>
      </Card.Body>
      <Card.Footer className="d-flex justify-content-between">
        <h5 className="mt-1">
          <Badge variant={post.votes ? 'primary' : 'light'}>{post.votes}</Badge>{' '}
          votes
        </h5>
        <span>
          <VoteButton post={post} />
        </span>
      </Card.Footer>
    </Card>
  );
};

export default PostCard;
