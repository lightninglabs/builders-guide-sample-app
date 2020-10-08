import React from 'react';
import { Button, Jumbotron } from 'react-bootstrap';
import { observer } from 'mobx-react-lite';
import PayModal from '../components/PayModal';
import PostCard from '../components/PostCard';
import { useStore } from '../store/Provider';

const PostList: React.FC = () => {
  const store = useStore();

  if (store.posts.length === 0) {
    return (
      <Jumbotron style={{ backgroundColor: '#fff' }}>
        <h1>Welcome to r/builders</h1>
        <p className="lead">
          It's a ghost town in here. Get the party started by creating the first post.
        </p>
        <p>
          <Button onClick={store.gotoCreate}>Create a Post</Button>
        </p>
      </Jumbotron>
    );
  }

  return (
    <>
      <h2>
        r/builders
        <Button onClick={store.gotoCreate} className="mr-2 float-right">
          Create a Post
        </Button>
      </h2>
      {store.sortedPosts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
      {store.showPayModal && <PayModal />}
    </>
  );
};

export default observer(PostList);
