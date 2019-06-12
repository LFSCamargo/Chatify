declare module 'react-native-in-app-notification' {
  import { ImageSourcePropType } from 'react-native'
  import { ReactNode, ReactChildren, ComponentClass } from 'react'

  interface NotificationProps {
    closeInterval?: number
    openCloseDuration?: number
    height?: number
    backgroundColour?: string
    iconApp?: ImageSourcePropType
    notificationBodyComponent?: ReactNode | Function
  }

  interface ShowNotificationParams {
    title?: string
    message?: string
    onPress?: () => void
    icon?: ImageSourcePropType
    vibrate?: boolean
  }

  function ShowNotificationFn(params: ShowNotificationParams): void

  interface ShowNotificationProps {
    showNotification: (params: ShowNotificationParams) => void
  }

  const Notification: ComponentClass<NotificationProps>

  const InAppNotificationProvider: ComponentClass<NotificationProps>

  function withInAppNotification<T>(
    WrappedComponent: React.ComponentType<T & ShowNotificationProps>,
  ): React.ComponentClass<T>
}

declare module 'react-native-webrtc' {
  import { ComponentClass } from 'react'

  type RTCIceConnectionState = 'new' | 'checking' | 'connected' | 'completed' | 'failed' | 'disconnected' | 'closed'
  type RTCIceGatheringState = 'new' | 'gathering' | 'complete'
  type RTCSignalingState =
    | 'stable'
    | 'have-local-offer'
    | 'have-remote-offer'
    | 'have-local-pranswer'
    | 'have-remote-pranswer'
    | 'closed'

  interface IceServers {
    username?: string
    url?: string
    credential?: string
  }

  interface RTCConfig {
    iceServers?: IceServers[]
    bundlePolicy?: RTCBundlePolicy
    certificates?: RTCCertificate[]
    iceCandidatePoolSize?: number
    iceTransportPolicy?: RTCIceTransportPolicy
    peerIdentity?: string
    rtcpMuxPolicy?: RTCRtcpMuxPolicy
  }

  interface SessionDescription {
    sdp: string
    type: string
  }

  class RTCSessionDescription {
    constructor(info: any)
    toJSON(): SessionDescription
  }

  interface IceCandidate {
    candidate: string
    sdpMLineIndex: number
    sdpMid: string
  }

  class RTCIceCandidate {
    constructor(info: any)
    toJSON(): IceCandidate
  }

  class MediaStream extends EventTarget {
    constructor(id: any, reactTag: any)
    addTrack(track: MediaStreamTrack): void
    removeTrack(track: MediaStreamTrack): void
    getTracks(): MediaStreamTrack[]
    getTrackById(trackId: any): MediaStreamTrack
    getAudioTracks(): MediaStreamTrack[]
    getVideoTracks(): MediaStreamTrack[]
    clone(): Promise<void>
    toURL(): string
    release(): void
  }

  export interface SourceInfo {
    id: string
    label: string
    facing: string
    kind: string
  }

  interface MediaStreamTrackType {
    _switchCamera: () => void
    applyConstraints: () => Promise<void>
    clone: () => Promise<void>
    getCapabilities: () => Promise<void>
    getConstraints: () => Promise<void>
    getSettings: () => Promise<void>
    getSources: (success: (sources: SourceInfo[]) => any) => any
  }

  export const MediaStreamTrack: MediaStreamTrackType

  // class MediaStreamTrack extends EventTarget {
  //   constructor(info: any)
  // }

  interface EventTarget {}

  interface GetUserMediaOPTS {
    audio: boolean
    video: {
      mandatory: {
        minWidth: number
        minHeight: number
        minFrameRate: number
      }
      facingMode: 'user' | 'environment'
      optional: any
    }
  }

  function getUserMedia(
    constraints: GetUserMediaOPTS,
    successCallback: (stream: MediaStream) => any,
    errorCallback: (e: Error) => any,
  ): void

  class MediaDevices extends EventTarget {
    ondevicechange: Function
    enumerateDevices(): any
    getUserMedia(constraints): Promise<any>
  }

  const mediaDevices: MediaDevices

  class RTCPeerConnection {
    localDescription: RTCSessionDescription
    remoteDescription: RTCSessionDescription
    signalingState: RTCSignalingState = 'stable'
    iceGatheringState: RTCIceGatheringState = 'new'
    iceConnectionState: RTCIceConnectionState = 'new'
    onconnectionstatechange: Function
    onicecandidate: Function
    onicecandidateerror: Function
    oniceconnectionstatechange: Function
    onicegatheringstatechange: Function
    onnegotiationneeded: Function
    onsignalingstatechange: Function
    onaddstream: Function
    onremovestream: Function
    _peerConnectionId: number
    _localStreams: MediaStream[] = []
    _remoteStreams: MediaStream[] = []
    _subscriptions: any[]
    _dataChannelIds: Set
    constructor(configuration: RTCConfig)
    createOffer(callback?: (sdp: RTCSessionDescription) => any, error?: (error: any) => any): void
    createAnswer(callback?: (sdp: RTCSessionDescription) => any, error?: (error: any) => any): void
    setLocalDescription(
      sessionDescription: RTCSessionDescription,
      callback?: () => any,
      error?: (error: any) => any,
    ): Promise<void>
    setRemoteDescription(
      sessionDescription: RTCSessionDescription,
      callback?: () => any,
      error?: (error: any) => any,
    ): Promise<void>
    addIceCandidate(candidate: RTCIceCandidate): any
    close(): void
    addStream(stream: MediaStream): void
    removeStream(stream: MediaStream): void
    setConfiguration(configuration: any): void
    getStats(track: any): any
    getLocalStreams(): MediaStreamTrack[]
    getRemoteStreams(): MediaStreamTrack[]
    getTrack(streamReactTag: any, trackId: any): MediaStreamTrack
    _unregisterEvents(): void
    _unregisterEvents(): void
    createDataChannel(label: string, dataChannelDict?: RTCDataChannelInit)
  }

  class RTCDataChannel extends EventTarget {
    constructor(peerConnectionId: number, label: string, dataChannelDict: RTCDataChannelInit)
    send(data: string | ArrayBuffer | ArrayBufferView): void
    close(): void
    _unregisterEvents(): void
    _registerEvents(): void
  }

  interface RTCViewProps {
    mirror?: boolean
    objectFit?: 'contain' | 'cover'
    streamURL?: string
    zOrder?: number
  }

  const RTCView: ComponentClass<RTCViewProps>

  interface PermissionDescriptor {
    name: string
  }

  type ValidPermissions = 'camera' | 'microphone'

  interface PermissionsResult {
    DENIED: 'denied'
    GRANTED: 'granted'
    PROMPT: 'prompt'
  }

  class Permissions {
    RESULT: PermissionsResult
    VALID_PERMISSIONS: ValidPermissions[]
    _lastReq: Promise<any>
    _requestPermissionAndroid(perm: any): Promise<'granted' | 'denied' | 'prompt'>
    _validatePermissionDescriptior(permissionDesc: PermissionDescriptor)
    query(permissionDesc: PermissionDescriptor): Promise<'granted' | 'denied' | 'prompt'>
    request(permissionDesc: PermissionDescriptor): Promise<any>
  }

  const permissions: Permissions
}
