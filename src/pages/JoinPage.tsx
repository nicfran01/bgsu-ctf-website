import 'altcha';
import type {} from 'altcha/types/react';
import { useEffect, useRef, useState } from 'react';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import styles from './JoinPage.module.css';

// The Vercel function in api/discord-invite.ts. A build for GitHub Pages has no
// functions, so it sets VITE_INVITE_API_URL to the full address of the Vercel copy.
const INVITE_API: string = import.meta.env.VITE_INVITE_API_URL || `${import.meta.env.BASE_URL}api/discord-invite`;

type Status =
  | { kind: 'waiting' }
  | { kind: 'loading' }
  | { kind: 'ready'; url: string }
  | { kind: 'error'; message: string };

async function fetchInvite(payload: string): Promise<string> {
  let response: Response;
  try {
    response = await fetch(INVITE_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ altcha: payload }),
    });
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }
  const body = (await response.json().catch(() => null)) as { url?: unknown; error?: unknown } | null;
  if (response.ok && typeof body?.url === 'string') return body.url;
  throw new Error(typeof body?.error === 'string' ? body.error : `The server returned ${response.status}.`);
}

export function JoinPage() {
  useDocumentTitle('Join the Discord');
  const widgetRef = useRef<HTMLElement>(null);
  const [status, setStatus] = useState<Status>({ kind: 'waiting' });

  useEffect(() => {
    const widget = widgetRef.current;
    if (!widget) return;
    const onVerified = (e: Event) => {
      const { payload } = (e as CustomEvent<{ payload: string }>).detail;
      setStatus({ kind: 'loading' });
      fetchInvite(payload).then(
        (url) => setStatus({ kind: 'ready', url }),
        (err: unknown) => setStatus({ kind: 'error', message: err instanceof Error ? err.message : String(err) }),
      );
    };
    widget.addEventListener('verified', onVerified);
    return () => widget.removeEventListener('verified', onVerified);
  }, []);

  const reset = () => {
    setStatus({ kind: 'waiting' });
    (widgetRef.current as HTMLElementTagNameMap['altcha-widget'] | null)?.reset();
  };

  return (
    <div className="container page">
      <h1 className="page-title">Join the Discord</h1>
      <p className="page-lead">
        Check the box below to get an invite link to the club's Discord server. Your browser solves a short puzzle
        first, which takes a few seconds and keeps spam bots out of the server.
      </p>

      <div className={styles.panel}>
        {status.kind !== 'ready' && (
          <altcha-widget ref={widgetRef} challenge={INVITE_API} className={styles.widget} />
        )}

        <div aria-live="polite">
          {status.kind === 'loading' && <p className={styles.note}>Getting the invite link...</p>}
          {status.kind === 'ready' && (
            <>
              <a className={`button ${styles.big}`} href={status.url} target="_blank" rel="noopener noreferrer">
                Open the Discord invite
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
              <p className={styles.note}>Please do not repost this link. Send people to this page instead.</p>
            </>
          )}
          {status.kind === 'error' && (
            <>
              <p className={styles.error} role="alert">
                {status.message}
              </p>
              <button type="button" className="button button-secondary" onClick={reset}>
                Try again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
