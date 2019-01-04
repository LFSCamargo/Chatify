import { ApolloServer, PubSub } from 'apollo-server';
import * as mongoose from 'mongoose';
import { MONGO, PORT } from './config';
import graphqlTypes from './graphqlTypes';
import resolvers from './resolvers';
import { getUser } from './auth/authMethods';

const pubsub = new PubSub()

const server = new ApolloServer({
  resolvers,
  typeDefs: graphqlTypes,
  context: async ({ req, connection }) => {
    if (connection) {
      return {
        ...connection.context,
        pubsub,
      }
    } else {
      // check from req
      const token = req.headers.authorization ? req.headers.authorization : ''
      const user = await getUser(token)
      return {
        user,
        pubsub,
      }
    }
  },
});


mongoose.connect(MONGO, {}, err => {
	if (err) {
		console.log('Error: ', err);
		process.exit(1);
	}
  console.log(`Connected to mongodb at: ${MONGO}`);

  server.listen(PORT).then(({ url, subscriptionsUrl }) => {
    console.log(`🚀 Apollo server ready on ${url}`)
    console.log(`🚀 Subscriptions ready at ${subscriptionsUrl}`);
    console.log(`⚡️ Playground exposed on /graphql`)
  })
})
