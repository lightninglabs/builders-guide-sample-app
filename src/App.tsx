import React, { ReactNode } from 'react';
import { Alert, Container, Navbar } from 'react-bootstrap';
import { observer } from 'mobx-react-lite';
import CreatePost from './pages/CreatePost';
import PostList from './pages/PostList';
import { useStore } from './store/Provider';

function App() {
  const store = useStore();

  const pages: Record<string, ReactNode> = {
    posts: <PostList />,
    create: <CreatePost />,
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="md">
        <Navbar.Brand onClick={store.gotoPosts}>
          Builder's Guide to the LND Galaxy
        </Navbar.Brand>
      </Navbar>

      <Container className="my-3">
        <div>
          {store.error && (
            <Alert variant="danger" dismissible onClose={store.clearError}>
              {store.error}
            </Alert>
          )}
          {pages[store.page]}
        </div>
      </Container>
    </>
  );
}

export default observer(App);
