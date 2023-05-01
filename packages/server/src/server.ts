import { ApolloServer, PubSub } from 'apollo-server';
import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import graphqlTypes from './graphqlTypes';
import resolvers from './resolvers';
import { getUser } from './auth/authMethods';
import { MongoError } from 'mongodb';

dotenv.config();

mongoose.Types.ObjectId.prototype.valueOf = function() {
  return this.toString();
};

const pubsub = new PubSub();

const server = new ApolloServer({
  resolvers,
  typeDefs: graphqlTypes,
  // @ts-ignore
  context: async ({ req, connection }) => {
    if (connection) {
      return {
        ...connection.context,
        pubsub,
      };
    } else {
      // check from req
      const token = req.headers.authorization ? req.headers.authorization : '';
      const user = await getUser(token);
      return {
        user,
        pubsub,
      };
    }
  },
});

mongoose.connect(process.env.MONGO || '', {}, (err: MongoError) => {
  if (err) {
    console.log('Error: ', err);
    process.exit(1);
  }
  console.log(`Connected to mongodb at: ${process.env.MONGO}`);

  server.listen(process.env.PORT).then(({ url, subscriptionsUrl }) => {
    console.log(`🚀 Apollo server ready on ${url}`);
    console.log(`🚀 Subscriptions ready at ${subscriptionsUrl}`);
    console.log(`⚡️ Playground exposed on /graphql`);
  });
});
