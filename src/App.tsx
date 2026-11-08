import { lazy, Suspense } from 'react';
import { HashRouter, Route, Routes } from 'react-router';
import { ContentErrorScreen } from './components/ContentErrorScreen';
import { Layout } from './components/Layout';
import { contentIssues } from './lib/content/load';
import { ChallengesPage } from './pages/ChallengesPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PlatformsPage } from './pages/PlatformsPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { ToolsPage } from './pages/ToolsPage';

// Pages that render markdown load the markdown renderer and syntax
// highlighter on demand, so the list pages stay small.
const ChallengeDetailPage = lazy(() => import('./pages/ChallengeDetailPage').then((m) => ({ default: m.ChallengeDetailPage })));
const ToolDetailPage = lazy(() => import('./pages/ToolDetailPage').then((m) => ({ default: m.ToolDetailPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));

export function App() {
  if (contentIssues.length) return <ContentErrorScreen issues={contentIssues} />;
  return (
    <HashRouter>
      <Suspense fallback={<div className="container page" aria-busy="true" />}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="challenges" element={<ChallengesPage />} />
            <Route path="challenges/:slug" element={<ChallengeDetailPage />} />
            <Route path="tools" element={<ToolsPage />} />
            <Route path="tools/:slug" element={<ToolDetailPage />} />
            <Route path="platforms" element={<PlatformsPage />} />
            <Route path="resources" element={<ResourcesPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
