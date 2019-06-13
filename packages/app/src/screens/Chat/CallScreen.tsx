import * as React from 'react'
import { SafeAreaView, Dimensions, Alert, ActivityIndicator } from 'react-native'
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  getUserMedia,
  MediaStreamTrack,
  SourceInfo,
  MediaStream,
} from 'react-native-webrtc'
// import InCallManager from 'react-native-incall-manager';
import * as Apollo from 'react-apollo-hooks'
import { graphql, GraphqlQueryControls } from 'react-apollo'
import styled from 'styled-components/native'
import Theme from '../../config/Theme'
import idx from 'idx'
import { NavigationInjectedProps } from 'react-navigation'
import gql from 'graphql-tag'
import { CallScreenQuery_me } from './__generated__/CallScreenQuery'
import { CALL_TYPES, gravatarURL } from '../../config/utils'
import { SendRTCMessageVariables } from './__generated__/SendRTCMessage'
import { StyledComponentClass } from 'styled-components'
import { iceServers } from '../../config/config'

const { width, height } = Dimensions.get('window')
const HEIGHT_SMALL_VIDEO = Math.round(height * 0.2)
const WIDTH_SMALL_VIDEO = (HEIGHT_SMALL_VIDEO * 9) / 16

const PeerVideoPlaceHolder = styled.View`
  position: absolute;
  background-color: ${({ theme }) => theme.colors.primary};
  width: ${width};
  height: ${height};
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  align-items: center;
  justify-content: center;
`

const LocalVideoPlaceHolder = styled.View`
  position: absolute;
  background-color: black;
  width: ${WIDTH_SMALL_VIDEO};
  height: ${HEIGHT_SMALL_VIDEO};
  right: 20;
  top: 50;
  border-radius: 5;
  z-index: 1000;
`

const PeerVideo = styled(RTCView)`
  position: absolute;
  background-color: black;
  width: ${width};
  height: ${height};
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  align-items: center;
  justify-content: center;
`

const LocalVideo: StyledComponentClass<any, any> = styled(RTCView).attrs({
  mirror: true,
})`
  position: absolute;
  background-color: black;
  width: ${WIDTH_SMALL_VIDEO};
  height: ${HEIGHT_SMALL_VIDEO};
  right: 20;
  top: 40;
  border-radius: 5;
  z-index: 1000;
`

const Wrapper = styled(SafeAreaView)`
  flex: 1;
  background-color: black;
`

const ButtonsContainer = styled.View`
  position: absolute;
  left: 30;
  right: 30;
  bottom: 30;
  width: ${width - 60};
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`

const ActionButtons = styled.TouchableOpacity`
  width: 60;
  height: 60;
  border-radius: ${60 / 2};
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
  background-color: red;
  align-items: center;
  justify-content: center;
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

const ChatifyText = styled.Text`
  font-family: 'Rubik';
  color: white;
  font-size: 20;
  margin-top: -20;
  margin-bottom: 20;
`

const AlignAtCenter = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.primary};
  align-items: center;
  justify-content: center;
`

const UserProfile = styled.Image`
  width: 100;
  height: 100;
  border-radius: 10;
`

const WrapperImageAndName = styled.View`
  width: ${width - 40};
  align-items: center;
  justify-content: center;
`

const ChatifyState = styled.Text`
  font-family: 'Rubik';
  color: white;
  font-size: 20;
  text-align: center;
  margin-top: 20;
  width: ${width - 80};
`

const ChatifyUser = styled.Text`
  font-family: 'Rubik';
  color: white;
  font-size: 16;
  text-align: center;
  margin-top: 10;
  width: ${width - 80};
  margin-bottom: 20;
`

interface Params {
  calling: boolean
  sdp: string
  chatId: string
  callUser: string
  callUserEmail: string
  callID: string
}

interface Data extends GraphqlQueryControls {
  me: CallScreenQuery_me
}

interface Props extends NavigationInjectedProps<Params> {
  data: Data
}

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
`

const CallScreen = (props: Props) => {
  const { loading, error } = props.data
  const [localVideo, setLocalVideo] = React.useState(true)
  const [localMic, setLocalMic] = React.useState(true)
  const [peerVideo, setPeerVideo] = React.useState(true)
  const [stream, setStream] = React.useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = React.useState<any>(null)
  const [callState, setCallState] = React.useState<'Ringing' | 'Connecting' | 'Connected'>(
    'Ringing',
  )
  const mutation = Apollo.useMutation(mutationDoc)

  const pc = new RTCPeerConnection({
    iceServers,
  })

  const sendSDP = async (sdp: object, type: string) => {
    const parsedSDP = JSON.stringify(sdp)
    await mutation({
      variables: {
        id: idx(props.navigation.state.params, _ => _.chatId),
        callID: idx(props.navigation.state.params, _ => _.callID),
        message: parsedSDP,
        type,
      } as SendRTCMessageVariables,
    })
      .then(() => console.log('MANDOU SDP'))
      .catch(() => {
        Alert.alert('Error', 'An Unexpected Error Occurred')
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
        Alert.alert('Error', 'An Unexpected Error Occurred')
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
      Alert.alert('Error', 'An Unexpected Error Occurred')
    })
  }

  React.useEffect(() => {
    if (!loading && !error) {
      MediaStreamTrack.getSources((sourceInfos: SourceInfo[]) => {
        console.log('MediaStreamTrack.getSources', sourceInfos)
        let videoSourceId
        for (let i = 0; i < sourceInfos.length; i++) {
          const sourceInfo = sourceInfos[i]
          if (sourceInfo.kind === 'video' && sourceInfo.facing === 'front') {
            videoSourceId = sourceInfo.id
          }
        }
        getUserMedia(
          {
            audio: true,
            video: {
              mandatory: {
                minWidth: 1280,
                minHeight: 720,
                minFrameRate: 30,
              },
              facingMode: 'user',
              optional: videoSourceId ? [{ sourceId: videoSourceId }] : [],
            },
          },
          (receivedStream: any) => {
            setStream(receivedStream)
            pc.addStream(receivedStream)
          },
          e => {
            console.log('Oops, we getting error', e)
          },
        )

        setTimeout(() => {
          const sdp = idx(props.navigation.state.params, _ => _.sdp)
          const calling = idx(props.navigation.state.params, _ => _.calling)

          // Starts the WebRTC Logic
          if (calling === true) {
            pc.createOffer(
              desc => {
                pc.setLocalDescription(
                  desc,
                  () => {
                    sendSDP(desc, CALL_TYPES.DIAL_SDP)
                  },
                  e => console.log(e),
                )
              },
              e => console.log(e),
            )
          } else {
            // Receives the sdp and parse
            const remoteDescription = new RTCSessionDescription(JSON.parse(sdp || ''))

            pc.setRemoteDescription(
              remoteDescription,
              () => {
                pc.createAnswer(
                  answer => {
                    pc.setLocalDescription(
                      answer,
                      () => {
                        setCallState('Connecting')
                        sendSDP(answer, CALL_TYPES.ANSWER_SDP)
                      },
                      e => console.log(e),
                    )
                  },
                  e => console.log(e),
                )
              },
              e => console.log(e),
            )
          }
          props.data.subscribeToMore({
            document: CallSub,
            onError: e => console.log('Subscription Error: ', e),
            variables: {
              id: props.data.me._id,
            },
            updateQuery: (_, { subscriptionData }) => {
              const { type, message } = subscriptionData.data.webRTCMessage
              console.log(subscriptionData.data.webRTCMessage)
              // Other peer answered
              if (type === CALL_TYPES.ANSWER_SDP) {
                if (props.navigation.getParam('calling')) setCallState('Connecting')
                const answerSDP = new RTCSessionDescription(JSON.parse(message))
                return pc.setRemoteDescription(answerSDP, () => {
                  setCallState('Connecting')
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
              console.log('SEND CANDIDATE')
              sendCandidate(event.candidate)
            }
          }

          pc.oniceconnectionstatechange = () => {
            console.log('Ice Connection State', pc.iceConnectionState)
          }
        }, 2000)
      })
    }
  }, [loading])

  const muteMicrophone = () => {
    console.log(pc)
    console.log(pc.getLocalStreams())
    if (!stream) {
      return
    }

    stream.getAudioTracks().forEach(track => {
      console.log('Track', track)
      setLocalMic(!localMic)
      track.enabled = !localMic
    })
  }

  const sendVideoState = async (videoState: boolean) => {
    await mutation({
      variables: {
        id: idx(props.navigation.state.params, _ => _.chatId),
        callID: idx(props.navigation.state.params, _ => _.callID),
        message: 'Change Camera State',
        type: videoState ? CALL_TYPES.ENABLE_CAMERA : CALL_TYPES.DISABLE_CAMERA,
      } as SendRTCMessageVariables,
    })
      .then(() => console.log('MANDOU SDP'))
      .catch(() => {
        Alert.alert('Error', 'An Unexpected Error Occurred')
      })
  }

  const muteVideo = () => {
    console.log(pc)
    if (!stream) {
      return
    }

    stream.getVideoTracks().forEach(track => {
      setLocalVideo(!localVideo)
      sendVideoState(!localVideo)
      track.enabled = !localVideo
    })
  }

  pc.onaddstream = (event: any) => {
    setCallState('Connected')
    setRemoteStream(event.stream)
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

  return (
    <Wrapper>
      {!remoteStream || !peerVideo ? (
        <PeerVideoPlaceHolder>
          <WrapperImageAndName>
            <UserProfile
              source={{ uri: gravatarURL(props.navigation.getParam('callUserEmail')) }}
            />
            <ChatifyState>{peerVideo ? callState : `Video Disabled`}</ChatifyState>
            <ChatifyUser>{props.navigation.getParam('callUser')}</ChatifyUser>
          </WrapperImageAndName>
        </PeerVideoPlaceHolder>
      ) : (
        <PeerVideo mirror streamURL={remoteStream.toURL()} />
      )}
      {!stream || !localVideo ? (
        <LocalVideoPlaceHolder />
      ) : (
        <LocalVideo mirror streamURL={stream.toURL()} />
      )}
      <ButtonsContainer>
        <ActionButtons onPress={() => muteVideo()}>
          <Icon source={localVideo ? Theme.images.video : Theme.images.videoOff} />
        </ActionButtons>
        <HangupButton onPress={() => hangupCall()}>
          <CallIcon />
        </HangupButton>
        <ActionButtons onPress={() => muteMicrophone()}>
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
