import * as React from 'react';
import * as ReactDOM from 'react-dom';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';
import { ApolloProvider } from 'react-apollo';
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks';
import Router from './routes/Router';
import client from './config/client';
import Loading from './pages/components/Loading';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css?family=Rubik:100,200,300,400,500,600,700,800,900');

  body {
    font-family: 'Rubik', sans-serif;
    background-color: #212430;
    margin-top: 0px;
    margin: 0px;
  }
`;

const AlignAtCenter = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  background-color: #212430;
  justify-content: center;
`;

export interface ThemeInterface {
  primary: string;
  accent: string;
  lighter: string;
  grey: string;
}

export interface ITokenContext {
  token: null | string;
  setToken: (token: string | null) => void;
}

export const TokenContext = React.createContext<ITokenContext>({
  token: null,
  setToken: (token: string | null) => {},
});

export interface ISelectedUserContext {
  selectedUserId: string;
  setSelectedUser: (userId: string) => void;
}

export const SelectedUserContext = React.createContext<ISelectedUserContext>({
  selectedUserId: '',
  setSelectedUser: (userId: string) => {},
});

const Theme: ThemeInterface = {
  primary: '#212430',
  accent: '#08B2FA',
  lighter: '#2C3040',
  grey: '#A1A1A1',
};

const Root = () => {
  const [selectedUserId, setSelectedUser] = React.useState<string>('');
  const [token, setToken] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const localToken = localStorage.getItem('token');
    setToken(localToken);
    setTimeout(() => setLoading(false), 1000);
  }, []);

  React.useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    }
  }, [token]);

  return (
    <TokenContext.Provider value={{ token, setToken }}>
      <SelectedUserContext.Provider value={{ selectedUserId, setSelectedUser }}>
        <ThemeProvider theme={Theme}>
          <ApolloProvider client={client}>
            <ApolloHooksProvider client={client}>
              <div>
                <GlobalStyle />
                {loading ? (
                  <AlignAtCenter>
                    <Loading />
                  </AlignAtCenter>
                ) : (
                  <Router token={token} />
                )}
              </div>
            </ApolloHooksProvider>
          </ApolloProvider>
        </ThemeProvider>
      </SelectedUserContext.Provider>
    </TokenContext.Provider>
  );
};

ReactDOM.render(<Root />, document.getElementById('root'));
