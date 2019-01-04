import { withFilter, PubSub } from 'apollo-server'
import userResolvers from './modules/user/userResolvers';
import chatResolvers from './modules/chat/chatResolvers'
import { Chat } from './modules/chat/chatModel';
import { GraphQLContext } from './graphqlTypes';
import { SUBSCRIPTION_TRIGGERS } from './constants/const'

interface MessageReceived {
  chat: Chat
  notificationMessage: string
  fromUser: string
}

interface MessageReceivedArgs {
  yourUser: string
}

export default {
  Subscription: {
    messageReceived: {
      resolve: (obj: MessageReceived) => obj,
      subscribe: withFilter(
        (root, args, { pubsub }: GraphQLContext) => pubsub.asyncIterator(SUBSCRIPTION_TRIGGERS.MESSAGE_RECEIVED),
        (obj: MessageReceived, args: MessageReceivedArgs) => {
          // @ts-ignore
          return obj.fromUser.toString() !== args.yourUser && obj.chat.users.includes(args.yourUser)
        },
      ),
    },
  },
  Chat: {
    ...chatResolvers.Chat
  },
	Query: {
    ...userResolvers.Query,
    ...chatResolvers.Query,
	},
	Mutation: {
    ...userResolvers.Mutation,
    ...chatResolvers.Mutation,
	},
};
