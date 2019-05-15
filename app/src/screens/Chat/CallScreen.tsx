import * as React from 'react'
import { SafeAreaView, ActivityIndicator, Alert, Dimensions, StatusBar } from 'react-native'
import styled from 'styled-components/native'
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  // MediaStream,
  // MediaStreamTrack,
  mediaDevices,
  // @ts-ignore
} from 'react-native-webrtc'
import { NavigationInjectedProps } from 'react-navigation'
import * as Apollo from 'react-apollo-hooks'
import gql from 'graphql-tag'
import { graphql, GraphqlQueryControls } from 'react-apollo'
import { CallScreenQuery_me } from './__generated__/CallScreenQuery'
import idx from 'idx'
import { SendRTCMessageVariables } from './__generated__/SendRTCMessage'
import { CALL_TYPES } from '../../config/utils'
import Theme from '../../config/Theme'

const { width, height } = Dimensions.get('window')

const peerVideoHeight = Math.round(height * 0.2)

const ButtonsContainer = styled.View`
  position: absolute;
  left: 30;
  right: 30;
  bottom: 30;
  width: width - 60;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`

const ActionButtons = styled.TouchableOpacity`
  width: 70;
  height: 70;
  border-radius: ${70 / 2};
  background-color: white;
  align-items: center;
  justify-content: center;
`

const CallIcon = styled.Image.attrs({
  source: props => props.theme.images.phone,
})`
  width: 30;
  height: 11;
`

const Icon = styled.Image`
  width: 24;
  height: 24;
  tint-color: black;
`

const HangupButton = styled.TouchableOpacity`
  width: 70;
  height: 70;
  border-radius: ${70 / 2};
  background-color: white;
  align-items: center;
  justify-content: center;
`

const LocalVideoContainer = styled(RTCView)`
  width: ${(peerVideoHeight * 9) / 16};
  height: ${peerVideoHeight};
  border-radius: 10;
  background-color: black;
  bottom: 120;
  right: 30;
`

const RemoteVideoContainer = styled(RTCView)`
  width: ${width};
  height: ${height};
  background-color: black;
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
`

const Wrapper = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.primary};
`

const TextContainer = styled.View`
  position: absolute;
  left: 30;
  right: 30;
  top: 90;
  width: ${width - 60};
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const UserName = styled.Text`
  font-size: 25;
  font-family: 'Rubik';
  color: white;
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

const mutationDoc = gql`
  mutation SendRTCMessage($id: String!, $callID: String!, $message: String!, $type: String!) {
    sendWebRTCMessage(_id: $id, callID: $callID, message: $message, type: $type) {
      message
    }
  }
`

const CallSub = gql`
  subscription CallScreenSub($id: String!) {
      webRTCMessage(yourUser: $id) {
        callID
        type
        message
        chat {
          _id
        }
      }
    }
  }
`

interface Params {
  calling: boolean
  sdp: string
  chatId: string
  callUser: string
  callID: string
}

interface Data extends GraphqlQueryControls {
  me: CallScreenQuery_me
}

interface Props extends NavigationInjectedProps<Params> {
  data: Data
}

const pc = new RTCPeerConnection({ iceServers: [{ url: 'stun:stun.l.google.com:19302' }] })

const CallScreen = (props: Props) => {
  const { loading, error } = props.data
  const [localVideo, setLocalVideo] = React.useState(false)
  const [peerVideo, setPeerVideo] = React.useState(true)
  const [localMic, setLocalMic] = React.useState(false)
  const [isFront, setFrontal] = React.useState(true)
  const [stream, setStream] = React.useState<any>(null)
  const [remoteStream, setRemoteStream] = React.useState<any>(null)
  const mutation = Apollo.useMutation(mutationDoc)

  const callUser = idx(props.navigation.state.params, _ => _.callUser)

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

  const sendSDP = async (sdp: object, type: string) => {
    const parsedSDP = JSON.stringify(sdp)
    await mutation({
      variables: {
        id: idx(props.navigation.state.params, _ => _.chatId),
        callID: idx(props.navigation.state.params, _ => _.callID),
        message: parsedSDP,
        type,
      } as SendRTCMessageVariables,
    }).catch(() => {
      Alert.alert('Error', 'Um erro inesperado aconteceu')
    })
  }

  const hangupCall = async () => {
    await mutation({
      variables: {
        id: idx(props.navigation.state.params, _ => _.chatId),
        callID: idx(props.navigation.state.params, _ => _.callID),
        message: 'HANGUP',
        type: CALL_TYPES.HANGUP,
      } as SendRTCMessageVariables,
    })
      .then(() => {
        pc.close()
        return props.navigation.goBack()
      })
      .catch(() => {
        Alert.alert('Error', 'Um erro inesperado aconteceu')
      })
  }

  const sendCandidate = async (candidate: object) => {
    const parsedCandidate = JSON.stringify(candidate)
    await mutation({
      variables: {
        id: idx(props.navigation.state.params, _ => _.chatId),
        callID: idx(props.navigation.state.params, _ => _.callID),
        message: parsedCandidate,
        type: CALL_TYPES.ICE_CANDIDATE,
      } as SendRTCMessageVariables,
    }).catch(() => {
      Alert.alert('Error', 'Um erro inesperado aconteceu')
    })
  }

  React.useEffect(() => {
    mediaDevices.enumerateDevices().then((sourceInfos: any) => {
      let videoSourceId
      for (let index = 0; index < sourceInfos.length; index++) {
        const sourceInfo = sourceInfos[index]
        if (sourceInfo.kind === 'video' && sourceInfo.facing === (isFront ? 'front' : 'back')) {
          videoSourceId = sourceInfo.id
        }
      }
      mediaDevices
        .getUserMedia({
          audio: true,
          video: {
            mandatory: {
              minWidth: 500,
              minHeight: 300,
              minFrameRate: 30,
            },
            facingMode: isFront ? 'user' : 'environment',
            optional: videoSourceId ? [{ sourceId: videoSourceId }] : [],
          },
        })
        .then((receivedStream: any) => {
          // Got Local Stream!
          setStream(receivedStream)
        })
        .catch((e: any) => {
          console.log('Error While Get The Local Stream', e)
          Alert.alert('Error', 'Error getting the local stream')
        })

      const sdp = idx(props.navigation.state.params, _ => _.sdp)
      const calling = idx(props.navigation.state.params, _ => _.calling)

      // Starts the WebRTC Logic
      if (calling === true) {
        pc.createOffer().then((desc: any) => {
          pc.setLocalDescription(desc).then(() => {
            // Send Offer to the Peer
            sendSDP(desc, CALL_TYPES.DIAL_SDP)
          })
        })
      } else {
        // Receives the sdp and parse
        const remoteDescription = new RTCSessionDescription(JSON.parse(sdp || ''))
        // Stores the remote description
        pc.setRemoteDescription(remoteDescription).then(() => {
          pc.createAnswer().then((answer: any) => {
            pc.setLocalDescription(answer).then(() => {
              // Send Answer to the Peer
              sendSDP(answer, CALL_TYPES.ANSWER_SDP)
            })
          })
        })
      }

      props.data.subscribeToMore({
        document: CallSub,
        onError: e => console.log('Subscription Error: ', e),
        variables: {
          id: props.data.me._id,
        },
        updateQuery: (_, { subscriptionData }) => {
          const { type, message, fromUser } = subscriptionData.data.webRTCMessage
          if (fromUser !== callUser) {
            return
          }
          // Other peer answered
          if (type === CALL_TYPES.ANSWER_SDP) {
            const answerSDP = new RTCSessionDescription(message)
            return pc.setRemoteDescription(answerSDP).then(() => {
              console.log('Connection now should be fine!')
            })
          }
          // Other peer sended a ice candidate
          if (type === CALL_TYPES.ICE_CANDIDATE) {
            const iceCandidate = new RTCIceCandidate(JSON.parse(message))
            return pc.addIceCandidate(iceCandidate)
          }
          // Other peer is Busy
          if (type === CALL_TYPES.BUSY) {
            pc.close()
            Alert.alert('Busy', 'The other peer is on a call right now')
            return props.navigation.goBack()
          }
          // Other peer rejected the call or hangup
          if (type === CALL_TYPES.REJECT || type === CALL_TYPES.HANGUP) {
            pc.close()
            return props.navigation.goBack()
          }
          // Other peer enabled the camera
          if (type === CALL_TYPES.ENABLE_CAMERA) {
            return setPeerVideo(true)
          }
          // Other peer disabled the camera
          if (type === CALL_TYPES.DISABLE_CAMERA) {
            return setPeerVideo(false)
          }
        },
      })

      pc.onicecandidate = (event: any) => {
        // Send Candidate to the other peer
        if (event.candidate) {
          sendCandidate(event.candidate)
        }
      }

      pc.onaddstream = (event: any) => {
        setRemoteStream(event.stream)
      }
    })
  }, [])

  return (
    <Wrapper>
      <StatusBar hidden />
      <LocalVideoContainer streamURL={stream.toURL()} />
      <RemoteVideoContainer streamURL={remoteStream.toURL()} />
      <TextContainer>
        <UserName>{callUser}</UserName>
      </TextContainer>
      <ButtonsContainer>
        <ActionButtons>
          <Icon source={localVideo ? Theme.images.video : Theme.images.videoOff} />
        </ActionButtons>
        <HangupButton onPress={() => hangupCall()}>
          <CallIcon />
        </HangupButton>
        <ActionButtons>
          <Icon source={localMic ? Theme.images.mic : Theme.images.micOff} />
        </ActionButtons>
      </ButtonsContainer>
    </Wrapper>
  )
}

const query = gql`
  query CallScreenQuery {
    me {
      _id
    }
  }
`

export default graphql<Props>(query)(CallScreen)
