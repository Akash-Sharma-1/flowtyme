/** Vite `base` without trailing slash (React Router basename). */
export const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined;

/** True when built for https://akash-sharma-1.github.io/flowtyme/ */
export const isGitHubPages =
  import.meta.env.PROD && import.meta.env.BASE_URL !== '/' && import.meta.env.BASE_URL !== '';

const REPO_SETUP_URL = 'https://github.com/Akash-Sharma-1/flowtyme#quick-start';

/** Dashboard in local dev; setup guide on static GitHub Pages (no backend). */
export function appEntryHref(): string {
  return isGitHubPages ? REPO_SETUP_URL : '/dashboard';
}

export function isExternalAppEntry(href: string): boolean {
  return href.startsWith('http');
}
