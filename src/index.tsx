import React from 'react';
import { createRoot } from 'react-dom/client';
import { configure } from 'mobx';
import './index.css';
import App from './App';
import { StoreProvider } from './store/Provider';
import { Store } from './store/store';

// initialize mobx
configure({ enforceActions: 'observed' });

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <StoreProvider store={new Store()}>
      <App />
    </StoreProvider>
  </React.StrictMode>,
);
