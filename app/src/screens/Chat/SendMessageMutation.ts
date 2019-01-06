import gql from 'graphql-tag'
import { SendMessageMutation } from './__generated__/SendMessageMutation'

export interface MutationResult {
  data: SendMessageMutation
}

export default gql`
  mutation SendMessageMutation($id: String!, $message: String!) {
    sendMessage(_id: $id, message: $message) {
      chat {
        users {
          _id
          name
          email
        }
        messages {
          _id
          user {
            _id
            name
            email
          }
          message
          createdAt
        }
      }
    }
  }
`
