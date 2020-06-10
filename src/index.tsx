import React from 'react';
import ReactDOM from 'react-dom';
// import App from './App';

import './index.css';
import * as serviceWorker from './serviceWorker';
// import Store from './core/store';

// ReactDOM.render(
//   <React.StrictMode>
//     <Store.Container>
//       <App />
//     </Store.Container>
//   </React.StrictMode>,
//   document.getElementById('root'),
// );

const BLM = () => {
  window.location.replace('https://blacklivesmatters.carrd.co/');
  return null;
};

ReactDOM.render(<BLM />, document.getElementById('root'));

// const appHeight = () => {
//   const doc = document.documentElement;
//   doc.style.setProperty('--app-height', `${window.innerHeight}px`);
// };

// appHeight();
// window.addEventListener('resize', appHeight);

serviceWorker.unregister();
