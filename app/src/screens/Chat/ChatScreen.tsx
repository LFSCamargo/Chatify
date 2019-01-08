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
import Mutation, { MutationResult } from './mutations/SendMessageMutation'
import { GiftedChat, BubbleProps, InputToolbar } from 'react-native-gifted-chat'

const { width } = Dimensions.get('window')

const CustomToolbar = styled(InputToolbar).attrs({
  // @ts-ignore
  containerStyle: {
    backgroundColor: ({ theme }: any) => theme.colors.primary,
    borderTopColor: '#3A3F53',
    height: 60,
  },
})``

const CustomGiftedChat = styled(GiftedChat).attrs({
  imageStyle: {},
})``

const Input = styled.TextInput.attrs({
  underlineColorAndroid: 'transparent',
  placeholderTextColor: 'grey',
})`
  flex: 4;
  background-color: ${({ theme }) => theme.colors.lighter};
  align-items: center;
  font-size: 14;
  font-family: 'Rubik';
  font-weight: 200;
  color: white;
  height: 35;
  padding-left: 10;
  margin: 12px;
  border-radius: 100px;
`

const OtherUserMessageWrapper = styled.View`
  padding: 10px 15px;
  margin-top: 10;
  max-width: ${width - 20};
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.colors.lighter};
`

const OtherUserMessageText = styled.Text`
  color: white;
  font-size: 16px;
  font-family: 'Rubik';
`

const UserMessageWrapper = styled.View`
  padding: 10px 15px;
  align-items: center;
  max-width: ${width - 20};
  justify-content: center;
  margin-top: 10;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.colors.accent};
`

const UserMessageText = styled.Text`
  color: white;
  font-family: 'Rubik';
  font-size: 16px;
`

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
  height: 55;
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

const SendButtonWrapper = styled.TouchableOpacity`
  width: 35;
  height: 35;
  border-radius: ${35 / 2};
  align-items: center;
  justify-content: center;
  transform: rotate(180deg);
  margin: 12px 0px;
  margin-right: 10px;
  background-color: ${({ theme }) => theme.colors.accent};
`

const SendButtonIcon = styled.Image.attrs({
  source: ({ theme }) => theme.images.send,
})`
  width: 20;
  height: 20;
  tint-color: white;
  transform: rotate(180deg);
`

const CHAT_SUBSCRIPTION = gql`
  subscription MessageReceived($id: String!) {
    messageReceived(yourUser: $id) {
      chat {
        _id
        users {
          _id
          name
          email
        }
        messages {
          _id
          user {
            _id
            name
            email
          }
          message
          createdAt
        }
      }
    }
  }
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
  const { loading, error, me, chat } = props.data
  const [message, setMessage] = React.useState('')
  const send = Apollo.useMutation(Mutation)

  const renderMessage = ({ currentMessage, position }: BubbleProps) => {
    const text = idx(currentMessage, _ => _.text) || ''

    if (position === 'left') {
      return (
        <OtherUserMessageWrapper>
          <OtherUserMessageText>{text}</OtherUserMessageText>
        </OtherUserMessageWrapper>
      )
    }
    return (
      <UserMessageWrapper>
        <UserMessageText>{text}</UserMessageText>
      </UserMessageWrapper>
    )
  }

  const renderComposer = () => {
    return (
      <Input
        placeholder="Write here your message..."
        value={message}
        onChangeText={setMessage}
        clearButtonMode="while-editing"
      />
    )
  }

  const renderSend = () => {
    return (
      <SendButtonWrapper onPress={sendMessage}>
        <SendButtonIcon />
      </SendButtonWrapper>
    )
  }

  const sendMessage = () => {
    if (!message) {
      return Alert.alert('Error', 'You need to write the message to send it')
    }

    send({
      variables: {
        id: chat._id,
        message,
      },
      update: (proxy, result: MutationResult) => {
        const updatedChat = idx(result.data.sendMessage, _ => _.chat)

        if (!updatedChat) {
          return
        }

        proxy.writeQuery({
          query: Query,
          data: {
            me,
            chat: {
              ...chat,
              messages: updatedChat.messages,
            },
          },
        })
      },
    })
      .then(() => {
        setMessage('')
      })
      .catch(() => Alert.alert('Error', 'An Unexpected Error Occurred'))
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

  const users = idx(chat, _ => _.users) || []

  const user = users.filter(element => element._id !== me._id)[0] || null

  props.data.subscribeToMore({
    document: CHAT_SUBSCRIPTION,
    variables: {
      id: idx(props.navigation, _ => _.state.params.userId) || '',
    },
    onError: error => console.log('Subscription Error: ', error),
    updateQuery: (previous, { subscriptionData }) => {
      const updatedChat = subscriptionData.data.messageReceived.chat

      if (!updatedChat) {
        return previous
      }

      if (updatedChat._id === chat._id) {
        return {
          ...previous,
          chat: updatedChat,
        }
      }

      return previous
    },
  })

  const messages: any = (idx(chat, _ => _.messages) || []).map(element => {
    return {
      _id: element._id,
      text: element.message,
      createdAt: element.createdAt,
      user: {
        _id: element.user._id,
        name: element.user && element.user.name,
        avatar: gravatarURL(element.user.email),
      },
    }
  })

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
          <HeaderTitle>{(user && user.name.split(' ')[0]) || ''}</HeaderTitle>
        </Row>
        <UserProfile source={{ uri: gravatarURL((user && user.email) || '') }} />
      </Header>
      <CustomGiftedChat
        text={message}
        renderComposer={renderComposer}
        renderSend={renderSend}
        onSend={sendMessage}
        onInputTextChanged={setMessage}
        minInputToolbarHeight={60}
        renderInputToolbar={props => <CustomToolbar {...props} />}
        showAvatarForEveryMessage={false}
        renderBubble={renderMessage}
        messages={messages.reverse()}
        // @ts-ignore
        user={me}
      />
    </Wrapper>
  )
}

const Query = gql`
  query ChatScreenQuery($id: String!) {
    me {
      _id
      name
      email
    }
    chat(_id: $id) {
      _id
      users {
        _id
        name
        email
      }
      messages {
        _id
        user {
          _id
          name
          email
        }
        message
        createdAt
      }
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
