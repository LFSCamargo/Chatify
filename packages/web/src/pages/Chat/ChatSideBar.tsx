import * as React from 'react';
import styled from 'styled-components';
import gql from 'graphql-tag';
import { graphql, GraphqlQueryControls, compose } from 'react-apollo';
import { ChatSideBarQuery_me, ChatSideBarQuery_chats } from './__generated__/ChatSideBarQuery';
import { RouterProps, withRouter } from 'react-router';
import gravatar from 'gravatar';
import Loading from '../components/Loading';
import Button from '../components/Button';

const SideBarWrapper = styled.div`
  width: 420px;
  /* float: left; */
  height: 100vh;
  background-color: ${({ theme }) => theme.lighter};
  flex-direction: column;
`;

const SideBarWrapperLoading = styled.div`
  width: 420px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: ${({ theme }) => theme.lighter};
  flex-direction: column;
  h1 {
    font-size: 36px;
    text-align: center;
    color: white;
    font-weight: 200;
  }
`;

const Header = styled.div`
  display: flex;
  flex: 1;
  width: 400px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #3a3f53;
  h1 {
    font-size: 30px;
    color: white;
    font-weight: 500;
  }
  img {
    width: 45px;
    height: 45px;
    border-radius: 6px;
  }
`;

interface Data extends GraphqlQueryControls {
  me: ChatSideBarQuery_me;
  chats: ChatSideBarQuery_chats;
}

interface Props extends RouterProps {
  data: Data;
}

const ChatSideBar = (props: Props) => {
  console.log(props);
  const { loading, error } = props.data;

  if (error) {
    return (
      <SideBarWrapperLoading>
        <h1>Network Issues</h1>
        <Button onClick={() => props.data.refetch()}>Try Again</Button>
      </SideBarWrapperLoading>
    );
  }

  if (loading) {
    return (
      <SideBarWrapperLoading>
        <Loading />
      </SideBarWrapperLoading>
    );
  }

  return (
    <SideBarWrapper>
      <Header>
        <h1>Chats</h1>
        <img src={gravatar.url(props.data.me.email || '', { s: '100', r: 'x', d: 'retro' }, true)} />
      </Header>
    </SideBarWrapper>
  );
};

const query = gql`
  query ChatSideBarQuery($first: Int = 20) {
    me {
      _id
      email
      name
    }
    chats(first: $first) {
      count
      edges {
        updatedAt
        _id
        lastMessage
        users {
          _id
          email
          name
        }
        messages {
          message
          createdAt
          user {
            _id
          }
        }
      }
    }
  }
`;

export default compose(
  withRouter,
  graphql(query, {
    options: {
      variables: {
        first: 20,
      },
    },
  }),
)(ChatSideBar);
