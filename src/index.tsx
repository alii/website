import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';

import './index.css';
import * as serviceWorker from './serviceWorker';
import { Provider } from 'jotai';

ReactDOM.render(
  <StrictMode>
    <Provider>
      <App />
    </Provider>
  </StrictMode>,
  document.getElementById('root'),
);

const appHeight = () => {
  const doc = document.documentElement;
  doc.style.setProperty('--app-height', `${window.innerHeight}px`);
};

appHeight();
window.addEventListener('resize', appHeight);

serviceWorker.unregister();
