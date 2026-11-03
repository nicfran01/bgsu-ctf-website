import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/tokens.css';
import './styles/base.css';
import './styles/markdown.css';
import './styles/highlight.css';

// The app scrolls to the top on page changes and to #section links itself.
// Browser scroll restoration would fight that on reload.
history.scrollRestoration = 'manual';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
