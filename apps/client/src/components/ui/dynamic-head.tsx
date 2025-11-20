import { useEffect, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { currentUserAtom } from '@/features/user/atoms/current-user-atom';

// Global variable to store the base app name
let globalAppName = 'Docmost';

// Function to get the current app name (used by other components)
export function getCurrentAppName(): string {
  return globalAppName;
}

export function DynamicHead() {
  const currentUser = useAtomValue(currentUserAtom);
  const workspace = currentUser?.workspace;
  const titleObserverRef = useRef<MutationObserver | null>(null);

  const workspaceName = workspace?.name || 'Docmost';
  const workspaceLogo = workspace?.logo;

  // Update global app name
  useEffect(() => {
    globalAppName = workspaceName;
  }, [workspaceName]);

  useEffect(() => {
    // Function to update title
    const updateTitle = () => {
      const currentTitle = document.title;
      // If title contains " - Docmost" or " - [workspace name]", replace the app name part
      const titleParts = currentTitle.split(' - ');
      if (titleParts.length > 1) {
        // Keep the page-specific part, replace the app name
        titleParts[titleParts.length - 1] = workspaceName;
        document.title = titleParts.join(' - ');
      } else {
        // If no page-specific part, just set the workspace name
        document.title = workspaceName;
      }
    };

    // Initial update
    updateTitle();

    // Create a MutationObserver to watch for title changes
    titleObserverRef.current = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.target.nodeName === 'TITLE') {
          // Title was changed, update it with our workspace name
          setTimeout(updateTitle, 0);
        }
      });
    });

    // Start observing
    const titleElement = document.querySelector('title');
    if (titleElement) {
      titleObserverRef.current.observe(titleElement, {
        childList: true,
        subtree: true,
      });
    }

    // Also observe the head for new title elements
    titleObserverRef.current.observe(document.head, {
      childList: true,
      subtree: true,
    });

    return () => {
      if (titleObserverRef.current) {
        titleObserverRef.current.disconnect();
      }
    };
  }, [workspaceName]);

  useEffect(() => {
    // Update favicon dynamically
    if (workspaceLogo) {
      const updateFavicon = (selector: string, sizes?: string) => {
        let favicon = document.querySelector(selector) as HTMLLinkElement;
        const timestamp = new Date().getTime();
        const newHref = `${workspaceLogo}?t=${timestamp}`;

        if (favicon) {
          favicon.href = newHref;
        } else {
          favicon = document.createElement('link');
          favicon.rel = 'icon';
          favicon.type = 'image/png';
          if (sizes) favicon.sizes = sizes;
          favicon.href = newHref;
          document.head.appendChild(favicon);
        }
      };

      // Update all favicon variants
      updateFavicon('link[rel="icon"][sizes="16x16"]', '16x16');
      updateFavicon('link[rel="icon"][sizes="32x32"]', '32x32');
      updateFavicon('link[rel="icon"]:not([sizes])');
      updateFavicon('link[rel="shortcut icon"]');
    }
  }, [workspaceLogo]);

  useEffect(() => {
    // Update Apple mobile web app title
    let appleMeta = document.querySelector('meta[name="apple-mobile-web-app-title"]') as HTMLMetaElement;
    if (appleMeta) {
      appleMeta.content = workspaceName;
    } else {
      appleMeta = document.createElement('meta');
      appleMeta.name = 'apple-mobile-web-app-title';
      appleMeta.content = workspaceName;
      document.head.appendChild(appleMeta);
    }
  }, [workspaceName]);

  return null;
}
