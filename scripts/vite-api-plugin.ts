// Serves the Vercel function in api/discord-invite.ts during `npm run dev`, so the
// Join page works locally without the Vercel CLI. Production builds do not use this;
// Vercel runs the file in api/ itself.

import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';

type Handler = (request: Request) => Response | Promise<Response>;

const ROUTE = '/api/discord-invite';
const ENV_KEYS = ['DISCORD_INVITE_CODE', 'ALTCHA_HMAC_SECRET'] as const;

async function readBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks);
}

async function send(res: ServerResponse, response: Response): Promise<void> {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.end(Buffer.from(await response.arrayBuffer()));
}

export function apiDevPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'bgsu-api-dev',
    apply: 'serve',
    configureServer(server) {
      // The function reads process.env, the same as on Vercel. Copy the two values
      // from .env.local so they are there.
      for (const key of ENV_KEYS) {
        const value = env[key];
        if (value !== undefined && process.env[key] === undefined) process.env[key] = value;
      }

      server.middlewares.use(ROUTE, (req, res, next) => {
        (async () => {
          const mod = (await server.ssrLoadModule('/api/discord-invite.ts')) as Record<string, Handler | undefined>;
          const method = (req.method ?? 'GET').toUpperCase();
          const handler = mod[method];
          if (!handler) {
            res.statusCode = 405;
            res.end();
            return;
          }
          const url = new URL(req.originalUrl ?? ROUTE, 'http://localhost');
          const headers = new Headers();
          for (const [key, value] of Object.entries(req.headers)) {
            if (typeof value === 'string') headers.set(key, value);
          }
          const init: RequestInit = { method, headers };
          if (method !== 'GET' && method !== 'HEAD') init.body = new Uint8Array(await readBody(req));
          await send(res, await handler(new Request(url, init)));
        })().catch(next);
      });
    },
  };
}
