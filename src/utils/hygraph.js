import { GraphQLClient } from 'graphql-request';

export const hygraph = new GraphQLClient(process.env.HYGRAPH_URL, {
  headers: {
    Authorization: `Bearer ${process.env.HYGRAPH_TOKEN}`,
  },
});