import { GraphQLClient } from 'graphql-request';

console.log('HYGRAPH_URL:', process.env.HYGRAPH_URL);
console.log('HYGRAPH_TOKEN exists:', !!process.env.HYGRAPH_TOKEN);

export const hygraph = new GraphQLClient(process.env.HYGRAPH_URL, {
  headers: {
    Authorization: `Bearer ${process.env.HYGRAPH_TOKEN}`,
  },
});