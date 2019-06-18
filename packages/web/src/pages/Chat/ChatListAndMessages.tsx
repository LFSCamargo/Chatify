import * as React from 'react';
import styled from 'styled-components';
import ChatSideBar from './ChatSideBar';
import ChatUI from './ChatUI';

const Wrapper = styled.div`
  height: 100vh;
  width: 100vw;
  overflow: hidden;
`;

const ChatListAndMessages = () => (
  <Wrapper>
    <ChatSideBar />
    <ChatUI />
  </Wrapper>
);

export default ChatListAndMessages;
