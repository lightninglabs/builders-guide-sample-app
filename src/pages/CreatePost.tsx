import React, { useCallback, useState } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { observer } from 'mobx-react-lite';
import { useStore } from '../store/Provider';

const CreatePost: React.FC = () => {
  const store = useStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLElement>) => {
      e.preventDefault();
      store.createPost(title, content);
    },
    [title, content, store],
  );

  return (
    <Form onSubmit={handleSubmit}>
      <Card>
        <Card.Header>Create a new Post</Card.Header>
        <Card.Body>
          <Form.Group controlId="title">
            <Form.Label>Title</Form.Label>
            <Form.Control
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="title">
            <Form.Label>Content</Form.Label>
            <Form.Control
              required
              as="textarea"
              rows={8}
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </Form.Group>
        </Card.Body>
        <Card.Footer>
          <Row>
            <Col>
              <Button variant="outline-danger" onClick={store.gotoPosts}>
                Cancel
              </Button>
            </Col>
            <Col className="text-right">
              <Button variant="primary" type="submit">
                Submit
              </Button>
            </Col>
          </Row>
        </Card.Footer>
      </Card>
    </Form>
  );
};

export default observer(CreatePost);
