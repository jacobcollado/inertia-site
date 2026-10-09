// The route a visitor came from. document.referrer only covers full page
// loads, so SiteShell records each client-side route here as well.

let current: string | null = null;
let previous: string | null = null;

export function recordPath(pathname: string) {
  if (pathname === current) return;
  previous = current;
  current = pathname;
}

// The path before `here`. A page's effects run before SiteShell's, so on a
// client navigation `current` may still be the route being left.
export function previousPath(here: string): string | null {
  if (current !== null) return current !== here ? current : previous;
  // First page of the visit: fall back to a same-origin referrer.
  try {
    const ref = new URL(document.referrer);
    return ref.origin === window.location.origin ? ref.pathname : null;
  } catch {
    return null;
  }
}
