import {createGlobalStyle} from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  html {
    font-family: 'Inter', sans-serif;
    height: 100%;
  }

  @supports (font-variation-settings: normal) {
    html {
      font-family: 'Inter var', sans-serif;
    }
  }
  
  body {
    height: 100%;
    margin: 0;
    box-sizing: border-box;

    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    min-height: 100%;
    background: #121212;
    color: #ededed;
  }
  
  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
  }

  * {
    margin: 0;
    padding: 0;
  }

  a {
    color: white;
    cursor: pointer; 
  }
  
  #__next {
    height: 100%;
  }

  .BottomModal {
    background-color: #121212;
    color: white;
  }
  
  .ModalBackdrop { 
    z-index: 50;
  }
`;
