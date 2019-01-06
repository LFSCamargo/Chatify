import * as React from 'react'
import * as Apollo from 'react-apollo-hooks'
import { SafeAreaView, ActivityIndicator, TouchableOpacity, Alert, Dimensions } from 'react-native'
import styled from 'styled-components/native'
import { NavigationInjectedProps } from 'react-navigation'
import { GraphqlQueryControls, graphql } from 'react-apollo'
import { ChatScreenQuery_me, ChatScreenQuery_chat } from './__generated__/ChatScreenQuery'
import gql from 'graphql-tag'
import idx from 'idx'
import { gravatarURL } from '../../config/utils'

const Wrapper = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.primary};
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

const HeaderTitle = styled.Text`
  font-family: 'Rubik';
  color: white;
  font-size: 43;
  font-weight: 500;
  height: 50;
  justify-content: flex-end;
`

const Row = styled.View`
  flex-direction: row;
  align-items: center;
`

const UserProfile = styled.Image`
  width: 45;
  height: 45;
  border-radius: 6;
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

const ChatifyText = styled.Text`
  font-family: 'Rubik';
  color: white;
  font-size: 20;
  margin-top: -20;
  margin-bottom: 20;
`

const BackArrow = styled.Image.attrs({
  source: ({ theme }) => theme.images.back,
})`
  width: 13;
  height: 21;
  margin-right: 10;
`

const HeaderRow = styled.View`
  width: 100%;
  flex-direction: row;
  padding: 15px 20px;
  align-items: center;
  justify-content: space-between;
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

interface Data extends GraphqlQueryControls {
  me: ChatScreenQuery_me
  chat: ChatScreenQuery_chat
}

interface Params {
  _id: string
  userId: string
}

interface Props extends NavigationInjectedProps<Params> {
  data: Data
}

const ChatScreen = (props: Props) => {
  const { loading, error, me } = props.data

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
        <Row>
          <TouchableOpacity
            hitSlop={{ top: 20, left: 20, right: 20, bottom: 20 }}
            onPress={() => props.navigation.goBack()}
          >
            <BackArrow />
          </TouchableOpacity>
          <HeaderTitle>Add Chat</HeaderTitle>
        </Row>
        <UserProfile source={{ uri: gravatarURL(me.email || '') }} />
      </Header>
      <HeaderRow>
        <Input />
        <SearchIcon />
      </HeaderRow>
    </Wrapper>
  )
}

const Query = gql`
  query AddChatQuery($id: String!) {
    me {
      _id
      name
      email
    }
  }
`

export default graphql(Query, {
  options: (props: Props) => ({
    variables: {
      id: idx(props.navigation, _ => _.state.params._id) || '',
    },
  }),
})(ChatScreen)
