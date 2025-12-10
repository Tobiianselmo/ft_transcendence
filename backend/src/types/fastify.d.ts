 

import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      user_id: number;
      display_name: string;
    };
  }
}

import '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      user_id: number;
      display_name: string;
    };
    user: {
      user_id: number;
      display_name: string;
    };
  }
}