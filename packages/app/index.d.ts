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
