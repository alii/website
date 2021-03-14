const root = document.getElementById('app');

const listener = () => {
  root.style.setProperty('--app-height', `${window.innerHeight}px`);
};

window.addEventListener('resize', listener);
listener();
