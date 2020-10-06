import React, { useCallback, useState } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { observer } from 'mobx-react-lite';
import { useStore } from '../store/Provider';

const Connect: React.FC = () => {
  const store = useStore();

  const [host, setHost] = useState('');
  const [cert, setCert] = useState('');
  const [macaroon, setMacaroon] = useState('');

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLElement>) => {
      e.preventDefault();
      store.connectToLnd(host, cert, macaroon);
    },
    [host, cert, macaroon, store],
  );

  return (
    <Form onSubmit={handleSubmit}>
      <Card>
        <Card.Header>Connect Node</Card.Header>
        <Card.Body>
          <Form.Group controlId="host">
            <Form.Label>LND Host</Form.Label>
            <Form.Control
              required
              value={host}
              placeholder="127.0.0.1:10001"
              onChange={e => setHost(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="cert">
            <Form.Label>TLS Certificate</Form.Label>
            <Form.Control
              required
              as="textarea"
              rows={8}
              value={cert}
              placeholder="HEX encoded. Ex: 4942416749514259476c4c7a577a6e6f4550564158..."
              onChange={e => setCert(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="macaroon">
            <Form.Label>Macaroon</Form.Label>
            <Form.Control
              required
              as="textarea"
              rows={3}
              value={macaroon}
              placeholder="HEX encoded. Ex: 0201036c6e64024f030a10e9366194c29d06acac69..."
              onChange={e => setMacaroon(e.target.value)}
            />
            <Form.Text className="text-muted">
              Open a Terminal and enter{' '}
              <code>
                lncli bakemacaroon info:read offchain:read invoices:read invoices:write
                message:read message:write
              </code>{' '}
              to bake a macaroon with only limited access to get node info, create
              invoices, and sign/verify messages.
            </Form.Text>
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

export default observer(Connect);
