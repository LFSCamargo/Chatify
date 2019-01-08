import * as React from 'react'
import { AsyncStorage, StatusBar, View } from 'react-native'
import { ThemeProvider } from 'styled-components'
import { createRouter } from './config/Router'
import { ApolloProvider } from 'react-apollo'
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks'

import Theme from './config/Theme'
import client from './config/client'

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
    <ApolloProvider client={client}>
      <ApolloHooksProvider client={client}>
        <ThemeProvider theme={Theme}>
          <View style={{ flex: 1 }}>
            <StatusBar barStyle="light-content" backgroundColor={Theme.colors.primary} />
            <Router />
          </View>
        </ThemeProvider>
      </ApolloHooksProvider>
    </ApolloProvider>
  )
}

export default App
