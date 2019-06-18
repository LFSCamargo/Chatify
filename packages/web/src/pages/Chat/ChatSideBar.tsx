import * as React from 'react';
import styled, { css } from 'styled-components';
import gql from 'graphql-tag';
import InfiniteScroll from 'react-infinite-scroll-component';
import { graphql, GraphqlQueryControls, compose } from 'react-apollo';
import { ChatSideBarQuery_me, ChatSideBarQuery_chats } from './__generated__/ChatSideBarQuery';
import { RouterProps, withRouter } from 'react-router';
import gravatar from 'gravatar';
import Loading from '../components/Loading';
import Button from '../components/Button';
import idx from 'idx';
import moment from 'moment';

const ScrollContainer = styled.div`
  ::-webkit-scrollbar {
    display: none;
  }
  overflow-y: scroll;
  overflow-x: hidden;
  height: 100vh;
  width: 420px;
  scroll-behavior: smooth;
  display: flex;
  flex-direction: column;
  align-items: center;
  p {
    margin-top: 20px;
    font-weight: 400;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }
`;

const SideBarWrapper = styled.div`
  width: 420px;
  /* float: left; */
  height: 100vh;
  background-color: ${({ theme }) => theme.lighter};
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  width: 380px;
  flex-direction: row;
  padding: 15px 20px;
  align-items: center;
  img {
    width: 50px;
    height: 50px;
    border-radius: 25px;
  }
  div {
    flex-direction: row;
    align-items: center;
    margin-left: 10px;
    h2 {
      font-size: 18px;
      font-weight: 400;
      color: rgba(255, 255, 255, 0.5);
    }
    p {
      margin-top: -10px;
      font-weight: 400;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
    }
  }
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

const SpaceBetween = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

interface Data extends GraphqlQueryControls {
  me: ChatSideBarQuery_me;
  chats: ChatSideBarQuery_chats;
}

interface Props extends RouterProps {
  data: Data;
}

const ChatSideBar = (props: Props) => {
  const { loading, error, me } = props.data;

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
      <ScrollContainer>
        {(idx(props.data.chats, _ => _.edges) || []).map((element, i) => {
          const user = element.users.filter(element => element._id !== idx(me, _ => _._id))[0];

          return (
            <SpaceBetween key={element._id}>
              <Row>
                <img src={gravatar.url(user.email || '', { s: '100', r: 'x', d: 'retro' }, true)} />
                <div>
                  <h2>{user.name}</h2>
                  <p>
                    {element.lastMessage} - {moment(element.updatedAt || '').fromNow()}
                  </p>
                </div>
              </Row>
            </SpaceBetween>
          );
        })}
        {props.data.chats.totalItems === props.data.chats.count ? (
          <p>Theres no more chats above ✨</p>
        ) : (
          <Button>Load More Chats</Button>
        )}
      </ScrollContainer>
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
      totalItems
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
