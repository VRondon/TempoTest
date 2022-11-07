import path from 'path';

// GraphQL
import { buildTypeDefsAndResolvers } from 'type-graphql';
import { GraphQLUpload } from 'graphql-upload';
import { makeExecutableSchema } from '@graphql-tools/schema';

export async function generateSchema() {
  const { typeDefs, resolvers } = await buildTypeDefsAndResolvers({
    resolvers: [path.join(__dirname, '**/*.{query,mutation,resolver}.{js,ts}')],
  });
  const schema = makeExecutableSchema({
    typeDefs: `
      scalar Upload

      type File {
        filename: String!
        mimetype: String!
        encoding: String!
      }
      ${typeDefs}
    `,
    resolvers: {
      ...resolvers,
      Upload: GraphQLUpload,
    },
  });
  return schema;
}
