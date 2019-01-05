import * as React from 'react'
import { SafeAreaView, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native'
import { graphql, GraphqlQueryControls } from 'react-apollo'
import gql from 'graphql-tag'
import idx from 'idx'
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

const Logo = styled.Image.attrs({
  source: ({ theme }) => theme.images.logo,
})`
  width: 400;
  height: 180;
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

const Input = styled.TextInput.attrs({
  underlineColorAndroid: 'transparent',
  placeholderTextColor: ({ theme }) => theme.colors.grey,
  placeholder: 'Search for a user here...',
})`
  color: ${({ theme }) => theme.colors.grey};
  font-size: 17;
  width: 80%;
`

const SearchIcon = styled.Image.attrs({
  source: ({ theme }) => theme.images.search,
})`
  width: 21;
  height: 22;
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

interface Props extends NavigationInjectedProps {
  data: Data
}

const ChatList = (props: Props) => {
  const { loading, error, me, chats } = props.data
  const [isFetchingEnd, setFetchingEnd] = React.useState(false)

  const renderItem = (item: ChatListQuery_chats_edges) => {
    const { _id, messages, users, updatedAt } = item
    const lastMessage = idx(messages, _ => _[0])
    const user = (users || []).filter(element => element && element._id !== me._id)[0]
    return (
      <TouchableOpacity
        onPress={() =>
          props.navigation.navigate(Routes.ChatScreen, {
            _id,
          })
        }
      >
        <Row>
          <AvatarAndText>
            <UsersProfile source={{ uri: gravatarURL((user && user.email) || '') }} />
            <TextContainer>
              <ContactName>{user && user.name}</ContactName>
              <SmallText>{(lastMessage && lastMessage.message) || 'Chat created ✨'}</SmallText>
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
            events: fetchMoreResult.events,
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
      />
    </Wrapper>
  )
}

const Query = gql`
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
export default graphql(Query)(ChatList)
