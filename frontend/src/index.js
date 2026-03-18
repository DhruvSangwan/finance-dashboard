// =============================================================
// REACT ENTRY POINT (src/index.js)
// This is the very first file React runs.
// It mounts the App component into the HTML page.
// =============================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Find the <div id="root"> in public/index.html and render our app inside it
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
