import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import Router from './routes/Router';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css?family=Work+Sans:100,200,300,400,500,600,700,800,900');

  body {
    font-family: 'Work Sans', sans-serif;
    background-color: white;
  }
`;

export interface ThemeInterface {
  primary: string;
  secondary: string;
}

const Theme: ThemeInterface = {
  primary: '#1e74ff',
  secondary: '#ffffff',
};

const Root = () => (
  <ThemeProvider theme={Theme}>
    <div>
      <GlobalStyle />
      <Router />
    </div>
  </ThemeProvider>
);

ReactDOM.render(<Root />, document.getElementById('root'));
