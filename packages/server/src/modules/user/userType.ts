import { gql } from 'apollo-server';

export default gql`
  type User {
    _id: String
    name: String
    email: String
    active: Boolean
  }

  type AuthenticationOutput {
    token: String
  }

  type UserConnectionOutput {
    count: Int
    edges: [User]
  }
`;
