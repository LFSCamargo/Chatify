import chatModel, { Chat } from './chatModel'
import userModel from '../user/userModel'
import * as R from 'ramda';
import { GraphQLContext } from '../../graphqlTypes'
import { SUBSCRIPTION_TRIGGERS } from '../../constants/const'

interface ChatQuery {
  _id: string
}

interface SendMessage {
  _id: string
  message: string
}

interface SendRTCMessage {
  _id: string
  message: string
  type: string
  callID: string
}

interface ChatQueryPerUser {
  chatWith: string
}

interface AddConversation {
  otherUser: string
}

interface Connection {
  search?: string
  limit?: number
  after?: number
}

export default {
  Chat: {
    users: async ({ users }: Chat, args, context) =>
      await Promise.all(users.map(async (value, index): Promise<any> => await userModel.findOne({ _id: value }))),
    messages: async ({ messages }: Chat, args, context) =>
      await Promise.all(
        messages.map(async (value, index) => {
          return {
            message: value.message,
            user: await userModel.findOne({ _id: value.user }),
            _id: value._id,
            createdAt: value.createdAt,
          }
        }),
      ),
  },
  Mutation: {
    addConversation: async (root, { otherUser }: AddConversation, { user }: GraphQLContext) => {
      if (!user) {
        throw new Error('You are not authenticated')
      }

      const findChat = await chatModel.findOne({
        users: [user._id, otherUser]
      })

      if (findChat) {
        return {
          chat: findChat,
        };
      }

      const chat = new chatModel({
        users: [user._id, otherUser],
      })

      await chat.save()

      const { _id } = chat

      return {
        chat: await chatModel.findOne({ _id }),
      }
    },
    sendWebRTCMessage: async (_, { _id, callID, message, type }: SendRTCMessage, { user, pubsub}: GraphQLContext) => {
      if (!user) {
        throw new Error('You are not authenticated');
      }

      const chat = await chatModel.findOne({ _id })

      if (!chat) {
        throw new Error('This chat does not exists');
      }

      if (!R.includes(user._id.toString(), chat.users)) {
        throw new Error('You dont belong to this chat');
      }
      
      pubsub.publish(SUBSCRIPTION_TRIGGERS.WEBRTC_MESSAGE, {
        fromUser: user._id,
        chat,
        callID,
        type,
        message,
      });

      return {
        message: 'Message sent',
      }
    },
    sendMessage: async (root, { _id, message }: SendMessage, { user, pubsub }: GraphQLContext) => {
      if (!user) {
        throw new Error('You are not authenticated')
      }

      const chat = await chatModel.findOne({ _id })

      const { messages } = chat

      const newMessages = [
        ...messages,
        {
          user: user._id,
          message,
          createdAt: new Date(),
        },
      ]

      await chat.update({
        updatedAt: new Date(),
        messages: newMessages,
        lastMessage: message,
      })

      const afterMutateChat = await chatModel.findOne({ _id })

      pubsub.publish(SUBSCRIPTION_TRIGGERS.MESSAGE_RECEIVED, {
        fromUser: user._id,
        chat: await chatModel.findOne({ _id }),
        notificationMessage: `${user.name}: ${message}`,
      })

      return {
        chat: await chatModel.findOne({ _id }),
      }
    },
  },
  Query: {
    chats: async (root, { search, after, limit }: Connection, { user }: GraphQLContext) => {
      if (!user) {
        throw new Error('You are not authenticated')
      }

      const args = {
          users: { $in : [user._id]},
        }

      if (!after) {
        const edges = await chatModel.find(args).sort({ updatedAt: -1 })
        const count = await chatModel
          .find(args)
          .limit(limit)
          .count().sort({ updatedAt: -1 })
        return {
          count,
          edges,
        }
      }

      const edges = await chatModel
        .find(args)
        .limit(limit)
        .skip(after).sort({ updatedAt: -1 })
      const count = await chatModel
        .find(args)
        .limit(limit)
        .skip(after).sort({ updatedAt: -1 })
        .count()
      return {
        count,
        edges,
      }
    },
    chat: async (root, { _id }: ChatQuery, { user }: GraphQLContext) => {
      if (!user) {
        throw new Error('You are not authenticated')
      }

      const chat = await chatModel.findOne({ _id })

      return chat
    },
    chatWithUsers: async (root, { chatWith }: ChatQueryPerUser, { user }: GraphQLContext) => {
      if (!user) {
        throw new Error('You are not authenticated')
      }

      const chat = await chatModel.findOne({
        users: [chatWith, user],
      })

      return chat
    },
  },
}
