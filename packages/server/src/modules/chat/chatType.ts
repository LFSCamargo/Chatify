import { gql } from 'apollo-server';

export default gql`
  type Message {
    _id: String
    user: User
    message: String
    createdAt: String
  }
  type Chat {
    _id: String
    messages: [Message]
    users: [User]
    lastMessage: String
    createdAt: String
    updatedAt: String
  }
  type ChatMutationOutput {
    chat: Chat
  }
  type ChatConnectionOutput {
    count: Int
    totalItems: Int
    edges: [Chat]
  }
`;
