import { Link } from 'react-router';
import { useDocumentTitle } from '../lib/useDocumentTitle';

export function NotFoundPage() {
  useDocumentTitle('Page not found');
  return (
    <div className="container page">
      <h1 className="page-title">Page not found</h1>
      <p className="page-lead">
        Nothing lives at this address. Try the <Link to="/challenges">challenge list</Link> or the{' '}
        <Link to="/tools">tool list</Link>.
      </p>
    </div>
  );
}
