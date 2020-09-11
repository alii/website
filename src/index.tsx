import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';

import './index.css';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
);

const appHeight = () => {
  const doc = document.documentElement;
  doc.style.setProperty('--app-height', `${window.innerHeight}px`);
};

appHeight();
window.addEventListener('resize', appHeight);

serviceWorker.unregister();
