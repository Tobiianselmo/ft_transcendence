 

import { FastifyRequest, FastifyReply } from "fastify";

export async function verifyCsrf(request: FastifyRequest, reply: FastifyReply) {
  if (['OPTIONS'].includes(request.method)) return;

  const csrfCookie = request.cookies['csrf_token'];
  const csrfHeader = request.headers['x-csrf-token'];

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return reply.status(403).send({ message: 'CSRF validation failed' });
  }
}

export const verifyToken = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
};
