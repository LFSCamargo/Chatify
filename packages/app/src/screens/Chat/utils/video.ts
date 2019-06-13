import { RTCPeerConnection, RTCSessionDescription } from 'react-native-webrtc'

export const createOffer = (pc: RTCPeerConnection): Promise<RTCSessionDescription> =>
  new Promise((resolve, reject) => {
    pc.createOffer(
      sdp => {
        resolve(sdp)
      },
      e => {
        reject(e)
      },
    )
  })

export const createAnswer = (pc: RTCPeerConnection): Promise<RTCSessionDescription> =>
  new Promise((resolve, reject) => {
    pc.createAnswer(
      sdp => {
        resolve(sdp)
      },
      e => {
        reject(e)
      },
    )
  })
