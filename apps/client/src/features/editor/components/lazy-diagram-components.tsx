import { lazy, Suspense } from 'react';
import { Loader } from '@mantine/core';

// Lazy load heavy diagram components
export const LazyExcalidrawMenu = lazy(() => import('./excalidraw/excalidraw-menu'));
export const LazyDrawioMenu = lazy(() => import('./drawio/drawio-menu'));
export const LazyMermaidComponent = lazy(() => import('./mermaid/mermaid-component'));

// Wrapper components with loading fallback
export function ExcalidrawMenuLazy(props: any) {
  return (
    <Suspense fallback={<Loader size="sm" />}>
      <LazyExcalidrawMenu {...props} />
    </Suspense>
  );
}

export function DrawioMenuLazy(props: any) {
  return (
    <Suspense fallback={<Loader size="sm" />}>
      <LazyDrawioMenu {...props} />
    </Suspense>
  );
}
