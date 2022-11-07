import fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from 'fastify';

import { ApolloServer } from 'apollo-server-fastify';
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from 'apollo-server-core';

// GraphQL
import { processRequest, UploadOptions } from 'graphql-upload';

// Schema
import { generateSchema } from '~/schema';

// Config
import config from '~/config';

const uploadOptions: UploadOptions = {
  maxFieldSize: config.uploadMaxSize * 1024 * 1024, // Max IN MB
};


export class Server {
  private port: number = config.port;

  constructor(port = config.port) {
    this.port = port;
  }

  private async getSchema() {
    const schema = await generateSchema();
    return schema;
  }

  private fastifyAppClosePlugin(app: FastifyInstance) {
    return {
      async serverWillStart() {
        return {
          async drainServer() {
            await app.close();
          },
        };
      },
    };
  }

  private setupCookies(app: FastifyInstance) {
    try {
      // fastify-secure-session is deprecated and we should use @fastify/secure-session
      // but the later version not supports fastify 3.0 and Apollo requires fastify 3.0
      // Version 4 of @fastify/secure-session support fastify 3.0 but has some bugs with setter
      app.register(require('fastify-secure-session'), {
        cookieName: config.cookie.name,
        key: Buffer.from(config.cookie.key, 'hex'),
        cookie: {
          maxAge: config.cookie.duration,
          domain: config.cookie.domain,
          path: '/',
          httpOnly: true,
          secure: !config.isDev,
        },
      });
    } catch (e) {
      // logger.error(e);
    }
  }

  private enableUploads(app: FastifyInstance) {
    try {
      // app.register(require('fastify-gql-upload'), uploadOptions);
      // Handle all requests that have the `Content-Type` header set as multipart
      app.addContentTypeParser('multipart', (request, payload, done) => {
        request.isMultipart = true;
        done(null, payload);
      });

      // Format the request body to follow graphql-upload's
      app.addHook('preValidation', async function (request, reply) {
        if (!request.isMultipart) {
          return;
        }

        request.body = await processRequest(request.raw, reply.raw, uploadOptions);
      });
    } catch (e) {
      // logger.error(e);
    }
  }

  async run() {
    let schema;
    try {
      schema = await this.getSchema();
    } catch (e) {
      console.log(e)
      // logger.error(e);
    }

    const app = fastify();

    this.enableUploads(app);

    const server = new ApolloServer({
      schema,
      debug: config.env === 'development',
      csrfPrevention: true,
      context: async ({
        request,
        reply,
      }: {
        request: FastifyRequest;
        reply: FastifyReply;
      }) => ({
        request,
        reply,
      }),
      plugins: [
        this.fastifyAppClosePlugin(app),
        ApolloServerPluginDrainHttpServer({ httpServer: app.server }),
        config.isDev ?
          ApolloServerPluginLandingPageLocalDefault({
            embed: true,
            includeCookies: true,
          })
          : ApolloServerPluginLandingPageProductionDefault(),
      ],
    });

    this.setupCookies(app);
    // this.registerRestEndpoints(app);

    await server.start();
    app.register(
      server.createHandler({
        cors: {
          origin: config.corsDomain,
          optionsSuccessStatus: 200,
          credentials: true,
        },
        onHealthCheck: async () => true,
        path: '/api',
      }),
    );

    const listingServer = await app.listen(this.port, '0.0.0.0');
    // logger.log(`GraphQL running and listening at ${listingServer}/api`.green);
  }
}
