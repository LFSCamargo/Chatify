import * as React from 'react'
import { SafeAreaView, InteractionManager, ActivityIndicator } from 'react-native'
import { graphql, GraphqlQueryControls } from 'react-apollo'
import gql from 'graphql-tag'
import styled from 'styled-components/native'
import { NavigationInjectedProps } from 'react-navigation'
import { ChatListQuery_me, ChatListQuery_chats } from './__generated__/ChatListQuery'

const Wrapper = styled(SafeAreaView)`
  flex: 1;
  backgroundcolor: ${({ theme }) => theme.colors.primary};
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

interface Data extends GraphqlQueryControls {
  me: ChatListQuery_me
  chats: ChatListQuery_chats
}

interface Props extends NavigationInjectedProps {
  data: Data
}

const ChatList = (props: Props) => {
  const { loading, error } = props.data
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
  return <Wrapper />
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

export default graphql(Query)(ChatList)
