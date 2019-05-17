import { GRAPHQL_URI, SUBSCRIPTIONS_URI } from './config'
import { AsyncStorage } from 'react-native'
import { ApolloClient } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { setContext } from 'apollo-link-context'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { WebSocketLink } from 'apollo-link-ws'
import { split, ApolloLink } from 'apollo-client-preset'
import { getMainDefinition } from 'apollo-utilities'
import { withClientState } from 'apollo-link-state'

const wsLink = new WebSocketLink({
  uri: SUBSCRIPTIONS_URI,
  options: {
    reconnect: true,
  },
})

const httpLink = createHttpLink({
  uri: GRAPHQL_URI,
})

const authLink = setContext(async (_, { headers }) => {
  return {
    headers: {
      ...headers,
      Authorization: await AsyncStorage.getItem('token'),
    },
  }
})

const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' && operation === 'subscription'
  },
  wsLink,
  httpLink,
)

const cache = new InMemoryCache()

const stateLink = withClientState({
  cache,
  resolvers: {
    Mutation: {
      updateNetworkStatus: (_, { isConnected }, { cache }) => {
        const data = {
          networkStatus: {
            __typename: 'NetworkStatus',
            isConnected,
          },
        }
        cache.writeData({ data })
        return null
      },
    },
  },
})

const client = new ApolloClient({
  link: ApolloLink.from([stateLink, authLink.concat(link)]),
  cache,
})

export default client
