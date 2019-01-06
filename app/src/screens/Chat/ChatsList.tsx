import * as React from 'react'
import { SafeAreaView, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native'
import { graphql, GraphqlQueryControls } from 'react-apollo'
import gql from 'graphql-tag'
import idx from 'idx'
import * as R from 'ramda'
import moment from 'moment'
import styled from 'styled-components/native'
import { NavigationInjectedProps } from 'react-navigation'
import {
  ChatListQuery_me,
  ChatListQuery_chats,
  ChatListQuery_chats_edges,
} from './__generated__/ChatListQuery'
import { gravatarURL } from '../../config/utils'
import { Routes } from '../../config/Router'

const Wrapper = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.primary};
`

const ChatifyText = styled.Text`
  font-family: 'Rubik';
  color: white;
  font-size: 20;
  margin-top: -20;
  margin-bottom: 20;
`

const Fab = styled.TouchableOpacity`
  width: 65;
  height: 65;
  border-radius: ${65 / 2};
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 20;
  bottom: 20;
  background-color: ${({ theme }) => theme.colors.accent};
`

const PlusIcon = styled.Image.attrs({
  source: ({ theme }) => theme.images.add,
})`
  width: 22;
  height: 22;
`

const ButtonWrapper = styled.TouchableOpacity`
  padding: 18px 40px;
  align-items: center;
  justify-content: center;
  border-radius: 100px;
  margin: 10px 20px;
  background-color: ${({ theme }) => theme.colors.accent};
`

const ButtonText = styled.Text`
  color: white;
  font-size: 20px;
  font-family: 'Rubik';
`

const EmptyText = styled.Text`
  font-family: 'Rubik';
  color: white;
  font-size: 20;
  margin-top: -20;
  margin-bottom: 20;
  margin: 40px;
  text-align: center;
`

const Logo = styled.Image.attrs({
  source: ({ theme }) => theme.images.logo,
})`
  width: 400;
  height: 180;
`

const LogoEmpty = styled.Image.attrs({
  source: ({ theme }) => theme.images.logo,
})`
  width: 400;
  height: 100;
  margin-top: 100;
`

const AlignAtCenter = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.primary};
  align-items: center;
  justify-content: center;
`

const Header = styled.View`
  width: 100%;
  flex-direction: row;
  padding: 15px;
  align-items: center;
  justify-content: space-between;
  border-bottom-width: 1px;
  border-bottom-color: #3a3f53;
`

const Row = styled.View`
  width: 100%;
  flex-direction: row;
  padding: 15px 20px;
  align-items: center;
  justify-content: space-between;
`

const HeaderTitle = styled.Text`
  font-family: 'Rubik';
  color: white;
  font-size: 43;
  font-weight: 500;
  height: 45;
  justify-content: flex-end;
`

const MeProfile = styled.Image`
  width: 45;
  height: 45;
  border-radius: 6;
`

const AvatarAndText = styled.View`
  flex-direction: row;
  align-items: center;
`

const UsersProfile = styled.Image`
  width: 50;
  height: 50;
  border-radius: 25;
`

const ContactName = styled.Text`
  font-size: 18;
  font-family: 'Rubik';
  color: rgba(255, 255, 255, 0.5);
`

const SmallText = styled.Text`
  font-size: 12;
  font-family: 'Rubik';
  color: rgba(255, 255, 255, 0.5);
`

const TextContainer = styled.View`
  margin-left: 10;
`

interface Data extends GraphqlQueryControls {
  me: ChatListQuery_me
  chats: ChatListQuery_chats
}

const CHAT_SUBSCRIPTION = gql`
  subscription ChatListSubscription($id: String!) {
    messageReceived(yourUser: $id) {
      notificationMessage
      chat {
        updatedAt
        lastMessage
        _id
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
`

interface Props extends NavigationInjectedProps {
  data: Data
}

const ChatList = (props: Props) => {
  const { loading, error, me, chats } = props.data
  const [isFetchingEnd, setFetchingEnd] = React.useState(false)

  const renderMessage = (message: string | null | undefined) => {
    if (!message) {
      return 'Chat created ✨'
    }

    if (message.length > 30) {
      return `${message.substring(0, 30)}...`
    }

    return message
  }

  const renderItem = (item: ChatListQuery_chats_edges) => {
    const { _id, users, updatedAt, lastMessage } = item
    const user = (users || []).filter(element => element && element._id !== me._id)[0]

    const formattedNameArr = (user && (user.name || '').split(' ')) || []
    return (
      <TouchableOpacity
        onPress={() =>
          props.navigation.navigate(Routes.ChatScreen, {
            _id,
            userId: me._id,
          })
        }
      >
        <Row>
          <AvatarAndText>
            <UsersProfile source={{ uri: gravatarURL((user && user.email) || '') }} />
            <TextContainer>
              <ContactName>
                {formattedNameArr.length !== 1
                  ? `${formattedNameArr[0]} ${formattedNameArr[1]}`
                  : user && user.name}
              </ContactName>
              <SmallText>{renderMessage(lastMessage || '')}</SmallText>
            </TextContainer>
          </AvatarAndText>
          <SmallText>{moment(updatedAt || '').fromNow()}</SmallText>
        </Row>
      </TouchableOpacity>
    )
  }

  const onEndReached = () => {
    if (isFetchingEnd) {
      return
    }
    setFetchingEnd(true)

    const count = (chats && chats.count) || 10

    const more = count + 10

    return props.data
      .fetchMore({
        variables: { first: more },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          return {
            ...previousResult,
            chats: fetchMoreResult.chats,
          }
        },
      })
      .then(() => setFetchingEnd(false))
  }

  if (loading) {
    return (
      <AlignAtCenter>
        <ActivityIndicator animating color="white" />
      </AlignAtCenter>
    )
  }

  if (error) {
    return (
      <AlignAtCenter>
        <Logo />
        <ChatifyText>No Connection 😢</ChatifyText>
        <ButtonWrapper onPress={() => props.data.refetch()}>
          <ButtonText>Retry</ButtonText>
        </ButtonWrapper>
      </AlignAtCenter>
    )
  }

  props.data.subscribeToMore({
    document: CHAT_SUBSCRIPTION,
    variables: {
      id: me._id,
    },
    onError: error => console.log('Subscription Error: ', error),
    updateQuery: (previous, { subscriptionData }) => {
      const updatedChat = subscriptionData.data.messageReceived.chat

      const edges = (idx(previous.chats, _ => _.edges) || []).map((element: any) => ({
        _id: element._id,
      }))

      const obj = {
        _id: updatedChat._id,
      }

      const existsOnEdges = R.includes(obj, edges)

      if (existsOnEdges) {
        const filtered = previous.chats.edges.filter(
          (element: any) => element._id !== updatedChat._id,
        )
        return {
          ...previous,
          chats: {
            ...previous.chats,
            edges: [updatedChat, ...filtered],
          },
        }
      }

      if (!existsOnEdges) {
        return {
          ...previous,
          chats: {
            ...previous.chats,
            edges: [updatedChat, ...previous.chats.edges],
          },
        }
      }

      return previous
    },
  })

  return (
    <Wrapper>
      <Header>
        <HeaderTitle>Chats</HeaderTitle>
        <MeProfile source={{ uri: gravatarURL(me.email || '') }} />
      </Header>
      <FlatList
        data={idx(chats, _ => _.edges) || []}
        keyExtractor={item => item._id}
        renderItem={({ item }) => renderItem(item)}
        onEndReached={onEndReached}
        extraData={props.data}
        ListEmptyComponent={
          <AlignAtCenter>
            <LogoEmpty />
            <EmptyText>You have no chats start chating clicking on the plus button 😀</EmptyText>
          </AlignAtCenter>
        }
      />
      <Fab
        onPress={() =>
          props.navigation.navigate(Routes.AddChat, {
            refecth: props.data.refetch,
          })
        }
      >
        <PlusIcon />
      </Fab>
    </Wrapper>
  )
}

export const ListQuery = gql`
  query ChatListQuery($first: Int = 10) {
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
`
// @ts-ignore
export default graphql(ListQuery)(ChatList)
