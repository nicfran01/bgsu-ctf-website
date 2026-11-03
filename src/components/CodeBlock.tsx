import { useRef, useState, type ComponentPropsWithoutRef, type ReactElement } from 'react';
import styles from './CodeBlock.module.css';

type PreProps = ComponentPropsWithoutRef<'pre'> & { children?: ReactElement<{ className?: string }> };

export function CodeBlock({ children, ...props }: PreProps) {
  const ref = useRef<HTMLPreElement>(null);
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const language = /language-([\w+-]+)/.exec(children?.props.className ?? '')?.[1];

  async function copy() {
    const text = ref.current?.textContent ?? '';
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      ok = copyWithSelection(text);
    }
    setStatus(ok ? 'copied' : 'failed');
    window.setTimeout(() => setStatus('idle'), 2000);
  }

  return (
    <div className={styles.block}>
      <div className={styles.bar}>
        <span className={styles.lang}>{language ?? 'code'}</span>
        <button type="button" className={styles.copy} onClick={copy}>
          {status === 'copied' ? 'Copied' : status === 'failed' ? 'Copy failed' : 'Copy'}
        </button>
        <span className="visually-hidden" aria-live="polite">
          {status === 'copied' ? 'Code copied to clipboard' : status === 'failed' ? 'Could not copy the code' : ''}
        </span>
      </div>
      <pre ref={ref} {...props} className={styles.pre} tabIndex={0}>
        {children}
      </pre>
    </div>
  );
}

// Fallback for browsers that block the async clipboard API.
function copyWithSelection(text: string): boolean {
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    area.remove();
  }
}
