import * as React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  width: 100%;
  height: 100vh;
  background: ${({ theme }) => theme.primary};
`;

const ChatUI = () => {
  return <Wrapper />;
};

export default ChatUI;
