/// <reference path="fastify-secure-session" />
import {
  RouteHandlerMethod,
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
} from 'fastify';

declare module 'fastify' {
  export interface FastifyRequest {
    isMultipart: boolean;
    session: Session;
  }

  type RequestHandler<Request> = RouteHandlerMethod<
  RawServerDefault,
  RawRequestDefaultExpression<RawServerDefault>,
  RawReplyDefaultExpression<RawServerDefault>,
  Request
  >;
}
