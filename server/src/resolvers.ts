import { withFilter, PubSub } from 'apollo-server'
import * as R from 'ramda';
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

interface RTCMessage {
  fromUser: string;
  chat: Chat;
  callID: string;
  type: string;
  message: string;
}

interface MessageReceivedArgs {
  yourUser: string
}

export default {
  Subscription: {
    webRTCMessage: {
      resolve: (obj: RTCMessage) => obj,
      subscribe: withFilter(
        (_, args, { pubsub }: GraphQLContext) => pubsub.asyncIterator(SUBSCRIPTION_TRIGGERS.WEBRTC_MESSAGE),
        (obj: RTCMessage, args: MessageReceivedArgs): any => {
          return obj.fromUser.toString() !== args.yourUser && R.includes(args.yourUser, obj.chat.users);
        }
      )
    },
    messageReceived: {
      resolve: (obj: MessageReceived) => obj,
      subscribe: withFilter(
        (root, args, { pubsub }: GraphQLContext) => pubsub.asyncIterator(SUBSCRIPTION_TRIGGERS.MESSAGE_RECEIVED),
        (obj: MessageReceived, args: MessageReceivedArgs) => {
          return obj.fromUser.toString() !== args.yourUser && R.includes(args.yourUser, obj.chat.users);
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
