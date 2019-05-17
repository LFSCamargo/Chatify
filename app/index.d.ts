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

  export function ShowNotificationFn(params: ShowNotificationParams): void

  export interface ShowNotificationProps {
    showNotification: (params: ShowNotificationParams) => void
  }

  export const Notification: ComponentClass<NotificationProps>

  export const InAppNotificationProvider: ComponentClass<NotificationProps>

  export function withInAppNotification<T>(
    WrappedComponent: React.ComponentType<T & ShowNotificationProps>,
  ): React.ComponentClass<T>
}
