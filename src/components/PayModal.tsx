import React from 'react';
import { Alert, Form, Modal, Spinner } from 'react-bootstrap';
import { observer } from 'mobx-react-lite';
import { useStore } from '../store/Provider';

const PayModal: React.FC = () => {
  const store = useStore();

  const body = !store.pmtSuccessMsg ? (
    <>
      <Form.Group controlId="title">
        {store.pmtError && <Alert variant="danger">{store.pmtError}</Alert>}
        <Form.Label>
          Payment Request for <strong>{store.pmtAmount} sats</strong> to{' '}
          <strong>{store.pmtForPost?.username}</strong>
        </Form.Label>
        <Form.Control required as="textarea" rows={5} value={store.pmtRequest} readOnly />
        <Form.Text></Form.Text>
      </Form.Group>
      <div className="text-center">
        <Spinner animation="border" size="sm" className="mr-2" />
        Waiting for payment to be completed...
      </div>
    </>
  ) : (
    <Alert variant="success">{store.pmtSuccessMsg}</Alert>
  );

  return (
    <Modal show={true} onHide={store.hidePaymentRequest}>
      <Modal.Header closeButton>
        <Modal.Title>{store.pmtForPost?.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{body}</Modal.Body>
    </Modal>
  );
};

export default observer(PayModal);
