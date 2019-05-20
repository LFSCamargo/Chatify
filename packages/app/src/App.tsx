import * as React from 'react'
import { AsyncStorage, StatusBar, View } from 'react-native'
import { ThemeProvider } from 'styled-components'
import { createRouter } from './config/Router'
import { ApolloProvider } from 'react-apollo'
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks'
import { InAppNotificationProvider } from 'react-native-in-app-notification'
import { Provider as ReduxProvider } from 'react-redux'

import Theme from './config/Theme'
import client from './config/client'
import Store from './config/store'

export const UserFocusedContext = React.createContext<any>(null)

if (__DEV__) {
  console.disableYellowBox = true
}

export interface Props {}

const App = () => {
  const [token, setToken] = React.useState('')

  const getToken = async () => {
    const token = await AsyncStorage.getItem('token')

    setToken(token || '')
  }

  React.useEffect(() => {
    getToken()
  }, [])

  const Router = createRouter(token)

  return (
    <ReduxProvider store={Store}>
      <ApolloProvider client={client}>
        <ApolloHooksProvider client={client}>
          <ThemeProvider theme={Theme}>
            <InAppNotificationProvider>
              <View style={{ flex: 1 }}>
                <StatusBar barStyle="light-content" backgroundColor={Theme.colors.primary} />
                <Router />
              </View>
            </InAppNotificationProvider>
          </ThemeProvider>
        </ApolloHooksProvider>
      </ApolloProvider>
    </ReduxProvider>
  )
}

export default App
