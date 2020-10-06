import React, { ReactNode } from 'react';
import { Alert, Container, Nav, Navbar, NavLink } from 'react-bootstrap';
import { observer } from 'mobx-react-lite';
import Connect from './pages/Connect';
import CreatePost from './pages/CreatePost';
import PostList from './pages/PostList';
import { useStore } from './store/Provider';

function App() {
  const store = useStore();

  const pages: Record<string, ReactNode> = {
    posts: <PostList />,
    create: <CreatePost />,
    connect: <Connect />,
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="md">
        <Navbar.Brand onClick={store.gotoPosts}>
          Builder's Guide to the LND Galaxy
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            <Nav.Item>
              {!store.connected ? (
                <NavLink onClick={store.gotoConnect}>Connect to LND</NavLink>
              ) : (
                <NavLink onClick={store.disconnect}>Disconnect</NavLink>
              )}
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
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
