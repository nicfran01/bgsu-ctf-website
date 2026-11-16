// Vercel function that hands out the Discord invite after an ALTCHA check.
//
// GET  returns a signed proof-of-work challenge for the widget on the Join page.
// POST takes the solved payload ({ "altcha": "<base64>" }) and, if it checks out,
//      returns { "url": "https://discord.gg/<code>" }.
//
// The invite code only lives in the DISCORD_INVITE_CODE environment variable, so it
// never appears in the repository or in the JavaScript sent to the browser.
// ALTCHA_HMAC_SECRET signs the challenges; any long random string works.

import { createChallenge, randomInt, verifySolution, type Challenge, type Solution } from 'altcha-lib';
import { deriveKey } from 'altcha-lib/algorithms/pbkdf2';

// A challenge must be solved and sent back within this many seconds.
const CHALLENGE_LIFETIME_SECONDS = 10 * 60;

// The work a browser does to pass. Higher numbers cost bots more and make phones wait
// longer. These values take about 1 to 3 seconds on a recent phone.
const COST = 5_000;
const COUNTER_MIN = 5_000;
const COUNTER_MAX = 10_000;

// The Join page can be served from another origin (the GitHub Pages copy of the site),
// so the endpoint allows any origin. That gives nothing away: a script that skips the
// browser still has to solve the challenge.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: { ...CORS_HEADERS, 'Cache-Control': 'no-store' },
  });
}

interface Settings {
  inviteCode: string;
  signatureSecret: string;
  keySignatureSecret: string;
}

function readSettings(): Settings | null {
  const inviteCode = process.env.DISCORD_INVITE_CODE?.trim() ?? '';
  const secret = process.env.ALTCHA_HMAC_SECRET?.trim() ?? '';
  if (!/^[A-Za-z0-9-]+$/.test(inviteCode) || secret.length < 32) return null;
  return {
    inviteCode,
    signatureSecret: secret,
    // A second secret for the derived-key signature, kept separate from the first.
    keySignatureSecret: `${secret}:key`,
  };
}

function notConfigured(): Response {
  console.error('discord-invite: set DISCORD_INVITE_CODE and ALTCHA_HMAC_SECRET (32 or more characters).');
  return json({ error: 'The invite is not set up on this server yet.' }, 503);
}

export function OPTIONS(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(): Promise<Response> {
  const settings = readSettings();
  if (!settings) return notConfigured();
  const challenge = await createChallenge({
    algorithm: 'PBKDF2/SHA-256',
    cost: COST,
    counter: randomInt(COUNTER_MAX, COUNTER_MIN),
    deriveKey,
    expiresAt: Math.floor(Date.now() / 1000) + CHALLENGE_LIFETIME_SECONDS,
    hmacSignatureSecret: settings.signatureSecret,
    hmacKeySignatureSecret: settings.keySignatureSecret,
  });
  return json(challenge);
}

function parsePayload(value: unknown): { challenge: Challenge; solution: Solution } | null {
  if (typeof value !== 'string' || value.length > 10_000) return null;
  try {
    const parsed: unknown = JSON.parse(atob(value));
    if (typeof parsed !== 'object' || parsed === null) return null;
    if (!('challenge' in parsed) || !('solution' in parsed)) return null;
    return parsed as { challenge: Challenge; solution: Solution };
  } catch {
    return null;
  }
}

export async function POST(request: Request): Promise<Response> {
  const settings = readSettings();
  if (!settings) return notConfigured();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'The request body is not JSON.' }, 400);
  }
  const payload = parsePayload((body as { altcha?: unknown } | null)?.altcha);
  if (!payload) return json({ error: 'The verification is missing or unreadable. Reload the page and try again.' }, 400);

  let verified = false;
  let expired = false;
  try {
    const result = await verifySolution({
      challenge: payload.challenge,
      solution: payload.solution,
      deriveKey,
      hmacSignatureSecret: settings.signatureSecret,
      hmacKeySignatureSecret: settings.keySignatureSecret,
    });
    verified = result.verified;
    expired = result.expired;
  } catch {
    verified = false;
  }

  if (!verified) {
    const error = expired
      ? 'The verification expired. Check the box again.'
      : 'The verification failed. Reload the page and try again.';
    return json({ error }, 403);
  }
  return json({ url: `https://discord.gg/${settings.inviteCode}` });
}
