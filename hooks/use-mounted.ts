import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// False on the server and through hydration, true on the client after that.
// For decoration that should stay out of the server HTML: rendering it only
// once mounted keeps the markup the page ships (what crawlers and agents read
// without JavaScript) mostly words. Nothing to hydrate means no mismatch.
export function useMounted(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
