import { PubSub, gql } from 'apollo-server';
import userTypes from './modules/user/userType';
import chatTypes from './modules/chat/chatType';
import { User } from './modules/user/userModel';

export interface GraphQLContext {
  user: User,
  pubsub: PubSub,
}

const graphqlTypes = gql`
  type MessageReceivedSubscription {
    chat: Chat
    notificationMessage: String
  }

  type Subscription {
    messageReceived(yourUser: String!): MessageReceivedSubscription
  }

  type Mutation {
    register(name: String, email: String, password: String): AuthenticationOutput
    login(email: String, password: String): AuthenticationOutput

    # Chat
    sendMessage(_id: String!, message: String!): ChatMutationOutput
    addConversation(otherUser: String!): ChatMutationOutput
  }

  type Query {
    me: User
    user(_id: String): User
    users(search: String, first: Int, after: Int): UserConnectionOutput

    # Chat
    chats(search: String, first: Int, after: Int, location: [Float]): ChatConnectionOutput
    chat(_id: String!): Chat
    chatWithUsers(chatWith: String!): Chat
  }
`;

export default [graphqlTypes, userTypes, chatTypes];
