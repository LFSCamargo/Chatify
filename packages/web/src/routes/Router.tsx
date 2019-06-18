import * as React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import SignUp from '../pages/User/SignUp';
import Login from '../pages/User/Login';
import ChatListAndMessages from '../pages/Chat/ChatListAndMessages';

interface RouterProps {
  token: string | null;
}

export default ({ token }: RouterProps) => (
  <BrowserRouter>
    <div>
      <Route exact={true} path="/" render={() => (token ? <ChatListAndMessages /> : <Login />)} />
      <Route exact={true} path="/login" component={Login} />
      <Route exact={true} path="/signUp" component={SignUp} />
    </div>
  </BrowserRouter>
);
