import * as React from 'react'
import * as Apollo from 'react-apollo-hooks'
import {
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native'
import styled from 'styled-components/native'
import { NavigationInjectedProps } from 'react-navigation'
import { GraphqlQueryControls, graphql, compose } from 'react-apollo'
import { ChatScreenQuery_me, ChatScreenQuery_chat } from './__generated__/ChatScreenQuery'
import gql from 'graphql-tag'
import idx from 'idx'
import { gravatarURL } from '../../config/utils'
import Mutation, { MutationResult } from './mutations/SendMessageMutation'
import {
  GiftedChat,
  BubbleProps,
  InputToolbar,
  IMessage,
  InputToolbarProps,
} from 'react-native-gifted-chat'
import {
  MessageReceived_messageReceived_chat,
  MessageReceived_messageReceived,
} from './__generated__/MessageReceived'
import moment from 'moment'
import { withInAppNotification, ShowNotificationProps } from 'react-native-in-app-notification'
import { SendMessageMutationVariables } from './mutations/__generated__/SendMessageMutation'
import { Dispatch } from 'redux'
import { setChattingUser } from '../../ducks/chat'
import { connect } from 'react-redux'

const { width } = Dimensions.get('window')

const CustomToolbar = styled(InputToolbar).attrs({
  // @ts-ignore
  containerStyle: {
    backgroundColor: ({ theme }: any) => theme.colors.primary,
    borderTopColor: '#3A3F53',
    height: 60,
  },
})``

const CustomGiftedChat: any = styled(GiftedChat).attrs({
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

interface Data extends GraphqlQueryControls {
  me: ChatScreenQuery_me
  chat: ChatScreenQuery_chat
}

type Props = NavigationInjectedProps<any> &
  ShowNotificationProps & {
    data: Data
    setChattingUser: (username: string) => void
  }

const CHAT_SUBSCRIPTION = gql`
  subscription MessageReceived($id: String!) {
    messageReceived(yourUser: $id) {
      username
      notificationMessage
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

const ChatScreen: React.FunctionComponent<Props> = props => {
  const [message, setMessage] = React.useState('')
  const [loadingSend, setLoadingSend] = React.useState(false)
  const { loading, error, subscribeToMore } = props.data
  const sendMessageMutation = Apollo.useMutation(Mutation)

  const userID = idx(props.navigation.state.params, _ => _.userId)
  const chatID = idx(props.navigation.state.params, _ => _._id)

  const goBack = () => {
    props.setChattingUser('')
    return props.navigation.goBack()
  }

  const mutate = async () => {
    if (!message) {
      return Alert.alert('Error', 'You need to compose a message to send it!')
    }

    setLoadingSend(true)

    try {
      await sendMessageMutation({
        variables: {
          id: idx(props.navigation.state.params, _ => _._id),
          message,
        } as SendMessageMutationVariables,
        update: (proxy, result: MutationResult) => {
          const updatedChat = idx(result.data.sendMessage, _ => _.chat)

          if (!updatedChat) {
            return
          }

          proxy.writeQuery({
            query: Query,
            data: {
              me: props.data.me,
              chat: {
                ...props.data.chat,
                messages: updatedChat.messages,
              },
            },
          })
        },
      })

      return setLoadingSend(false)
    } catch (error) {
      setLoadingSend(false)
      return Alert.alert('Error', 'An unexpected error occurred while we send your message!')
    }
  }

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

  const renderSend = () => {
    return (
      <SendButtonWrapper disabled={loadingSend} onPress={() => mutate()}>
        {loadingSend && <ActivityIndicator color="white" />}
        {!loadingSend && <SendButtonIcon />}
      </SendButtonWrapper>
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

  React.useEffect(() => {
    props.setChattingUser(props.navigation.state.params.user)
    subscribeToMore({
      document: CHAT_SUBSCRIPTION,
      variables: {
        id: props.navigation.getParam('userId'),
      },
      updateQuery: (previous, { subscriptionData }) => {
        const updatedChat: MessageReceived_messageReceived_chat =
          subscriptionData.data.messageReceived.chat
        const received: MessageReceived_messageReceived = subscriptionData.data.messageReceived

        if (updatedChat._id !== chatID) {
          props.showNotification({
            title: received.username || '',
            message: received.notificationMessage || '',
            vibrate: true,
          })
        }

        if (!updatedChat) {
          return previous
        }

        if (updatedChat._id === chatID) {
          return {
            ...previous,
            chat: {
              ...previous.chat,
              messages: updatedChat.messages,
            },
          }
        }
      },
    })
  }, [])

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

  const users = idx(props.data.chat, _ => _.users)

  const otherUser = (idx(users, _ => _) || []).filter(element => element._id !== userID)[0]

  return (
    <Wrapper>
      <StatusBar hidden={false} />
      <Header>
        <Row>
          <TouchableOpacity
            hitSlop={{ top: 20, left: 20, right: 20, bottom: 20 }}
            onPress={() => goBack()}
          >
            <BackArrow />
          </TouchableOpacity>
          <HeaderTitle>{(otherUser && otherUser.name.split(' ')[0]) || ''}</HeaderTitle>
        </Row>
        <UserProfile source={{ uri: gravatarURL((otherUser && otherUser.email) || '') }} />
      </Header>
      <CustomGiftedChat
        text={message}
        renderComposer={renderComposer}
        renderSend={renderSend}
        onInputTextChanged={setMessage}
        minInputToolbarHeight={60}
        scrollToBottomOffset={100}
        renderInputToolbar={(props: InputToolbarProps) => <CustomToolbar {...props} />}
        showAvatarForEveryMessage={false}
        renderBubble={renderMessage}
        messages={(idx(props.data, _ => _.chat.messages) || [])
          .map(
            (element): IMessage => {
              return {
                _id: element._id,
                text: element.message,
                createdAt: moment(element.createdAt).toDate(),
                user: {
                  _id: element.user._id,
                  name: element.user.name,
                  avatar: gravatarURL(element.user.email),
                },
              }
            },
          )
          .reverse()}
        user={{
          _id: idx(props.navigation.state.params, _ => _.userId),
        }}
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

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setChattingUser: (name: string) => dispatch(setChattingUser(name)),
})

export default compose(
  graphql<Props>(Query, {
    options: (props: Props) => ({
      variables: {
        id: props.navigation.getParam('_id'),
      },
    }),
  }),
  withInAppNotification,
  connect(
    null,
    mapDispatchToProps,
  ),
)(ChatScreen)
