import { useEffect } from 'react';
import { siteConfig } from '../site.config';

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${siteConfig.clubName}` : siteConfig.clubName;
  }, [title]);
}
