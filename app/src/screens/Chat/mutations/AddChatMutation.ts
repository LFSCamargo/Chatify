import gql from 'graphql-tag'
import { AddChatMutation } from './__generated__/AddChatMutation'

export interface MutationResult {
  data: AddChatMutation
}

export default gql`
  mutation AddChatMutation($id: String!) {
    addConversation(otherUser: $id) {
      chat {
        updatedAt
        _id
        lastMessage
        users {
          _id
          email
          name
        }
        messages {
          message
          createdAt
          user {
            _id
          }
        }
      }
    }
  }
`
