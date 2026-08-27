import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

if (typeof window !== 'undefined' && window.location.search.includes('admin')) {
  const manifestLink = document.querySelector('link[rel="manifest"]');
  if (manifestLink) manifestLink.setAttribute('href', '/manifest-admin.json');
}

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
