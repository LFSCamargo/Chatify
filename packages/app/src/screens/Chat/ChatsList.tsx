import * as React from 'react'
import {
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native'
import { graphql, GraphqlQueryControls, compose } from 'react-apollo'
import { withInAppNotification, ShowNotificationProps } from 'react-native-in-app-notification'
import { connect } from 'react-redux'
import { getChattingUser, setChattingUser } from '../../ducks/chat'
import * as Apollo from 'react-apollo-hooks'
import gql from 'graphql-tag'
import idx from 'idx'
import moment from 'moment'
import styled from 'styled-components/native'
import RNCallKit from 'react-native-callkeep'
import { NavigationInjectedProps } from 'react-navigation'
import {
  ChatListQuery_me,
  ChatListQuery_chats,
  ChatListQuery_chats_edges,
} from './__generated__/ChatListQuery'
import { gravatarURL, CALL_TYPES, createUUID } from '../../config/utils'
import { Routes } from '../../config/Router'
import { SendRTCMessageVariables } from './__generated__/SendRTCMessage'
import { ReduxState } from '../../ducks'
import { Dispatch } from 'redux'
import CallModal from './CallModal'

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
  height: 53;
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
  width: 180;
`

const TextContainer = styled.View`
  margin-left: 10;
`

const CallButton = styled.TouchableOpacity.attrs({
  hitSlop: { top: 20, left: 20, right: 20, bottom: 20 },
})`
  width: 35;
  height: 35;
  border-radius: ${35 / 2};
  background-color: ${({ theme }) => theme.colors.accent};
  align-items: center;
  justify-content: center;
`

const CallIcon = styled.Image.attrs({
  source: ({ theme }) => theme.images.phone,
})`
  width: 23;
  height: 8;
  transform: rotate(130deg);
`

interface Data extends GraphqlQueryControls {
  me: ChatListQuery_me
  chats: ChatListQuery_chats
}

const WEBRTC_SEND_MESSAGE = gql`
  mutation SendRTCMessage($id: String!, $callID: String!, $message: String!, $type: String!) {
    sendWebRTCMessage(_id: $id, callID: $callID, message: $message, type: $type) {
      message
    }
  }
`

const WEBRTC_SUBSCRIPTION = gql`
  subscription CallsSubscription($id: String!) {
    webRTCMessage(yourUser: $id) {
      callID
      type
      message
      fromUser
      chat {
        _id
        users {
          _id
          name
          email
        }
      }
    }
  }
`

interface SetCalling {
  visible: boolean
  callingUserName: string
  callingEmail: string
  callId: string
  chatId: string
  sdp: any
}

type Props = NavigationInjectedProps &
  ShowNotificationProps & {
    data: Data
    chattingUser: string
    setChattingUser: (username: string) => void
  }

const ChatList = (props: Props) => {
  const { loading, error, me, chats } = props.data
  const [isFetchingEnd, setFetchingEnd] = React.useState(false)
  const [calling, setCalling] = React.useState<SetCalling>({
    visible: false,
    callingUserName: '',
    callingEmail: '',
    sdp: null,
    callId: '',
    chatId: '',
  })

  const sendRTCMessage = Apollo.useMutation(WEBRTC_SEND_MESSAGE)

  React.useEffect(() => {
    if (!loading && !error) {
      if (props.chattingUser === '') {
        props.data.startPolling(500)
      } else {
        props.data.stopPolling()
      }
    }
  }, [props.chattingUser, props.data.loading])

  React.useEffect(() => {
    if (!loading && !error) {
      RNCallKit.setup({
        ios: {
          appName: 'Chatify',
        },
        android: {
          alertTitle: 'Permissions required',
          alertDescription: 'This application needs to access your phone accounts',
          cancelButton: 'Cancel',
          okButton: 'ok',
        },
      })

      props.data.subscribeToMore({
        document: WEBRTC_SUBSCRIPTION,
        variables: {
          id: me._id,
        },
        updateQuery: async (_, { subscriptionData }) => {
          const { callID, type, fromUser, chat, message } = subscriptionData.data.webRTCMessage
          const Busy = await RNCallKit.checkIfBusy()
          if (Busy) {
            await refuseCall(callID, chat._id, CALL_TYPES.BUSY)
          }

          const chatUser = chat.users.filter((e: any) => e._id === fromUser)[0]

          if (type === 'DIAL_SDP') {
            setCalling({
              callId: callID,
              callingUserName: chatUser.name,
              callingEmail: chatUser.email,
              sdp: message,
              visible: true,
              chatId: chat._id,
            })
          }
        },
      })
    }
  }, [props.data.loading])

  const goToChat = (_id: string, userId: string, user: string) => {
    props.setChattingUser(user)
    props.navigation.navigate(Routes.ChatScreen, {
      _id,
      userId,
      user,
    })
  }

  const renderMessage = (message: string | null | undefined) => {
    if (!message) {
      return 'Chat created ✨'
    }

    if (message.length > 10) {
      return `${message.substring(0, 10)}...`
    }

    return message
  }

  const renderItem = (item: ChatListQuery_chats_edges) => {
    const { _id, users, updatedAt, lastMessage } = item
    const user = (users || []).filter(element => element && element._id !== me._id)[0]

    const formattedNameArr = (user && (user.name || '').split(' ')) || []
    return (
      <TouchableOpacity
        onPress={() => goToChat(_id || '', me._id || '', (user && user.name) || '')}
      >
        <Row>
          <AvatarAndText>
            <UsersProfile source={{ uri: gravatarURL((user && user.email) || '') }} />
            <TextContainer>
              <ContactName>{`${formattedNameArr[0]}`}</ContactName>
              <SmallText>
                {renderMessage(lastMessage || '')} - {moment(updatedAt || '').fromNow()}
              </SmallText>
            </TextContainer>
          </AvatarAndText>
          <CallButton
            onPress={() =>
              goToCall((user && user.name) || '', _id || '', (user && user.email) || '')
            }
          >
            <CallIcon />
          </CallButton>
        </Row>
      </TouchableOpacity>
    )
  }

  const goToCall = (callUser: string, chatId: string, callUserEmail: string) => {
    const callID = createUUID()

    props.navigation.navigate(Routes.CallScreen, {
      calling: true,
      callID,
      callUser,
      chatId,
      callUserEmail,
    })
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
        <ActivityIndicator animating color='white' />
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

  const resetModal = () => {
    setCalling({
      visible: false,
      callingUserName: '',
      callingEmail: '',
      sdp: null,
      callId: '',
      chatId: '',
    })
  }

  const answerCall = (
    callID: string,
    chatId: string,
    fromUser: string,
    sdp: any,
    callUserEmail: string,
  ) => {
    resetModal()
    props.navigation.navigate(Routes.CallScreen, {
      calling: false,
      callID,
      callUser: fromUser,
      callUserEmail,
      sdp,
      chatId,
    })
  }

  const refuseCall = (callID: string, chatID: string, callType: string) => {
    resetModal()
    sendRTCMessage({
      variables: {
        id: chatID,
        callID,
        message: CALL_TYPES.REJECT,
        type: callType,
      } as SendRTCMessageVariables,
    })
  }

  return (
    <Wrapper>
      <StatusBar hidden={false} />
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
      <CallModal
        callingUserPic={gravatarURL(calling.callingEmail)}
        callingUser={calling.callingUserName}
        visible={calling.visible}
        acceptCall={() =>
          answerCall(
            calling.callId,
            calling.chatId,
            calling.callingUserName,
            calling.sdp,
            calling.callingEmail,
          )
        }
        rejectCall={() => refuseCall(calling.callId, calling.chatId, CALL_TYPES.REJECT)}
      />
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

const mapStateToProps = (state: ReduxState) => ({
  chattingUser: getChattingUser(state),
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setChattingUser: (name: string) => dispatch(setChattingUser(name)),
})

export default compose(
  graphql<Props>(ListQuery),
  withInAppNotification,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(ChatList)
