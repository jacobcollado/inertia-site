"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

// Lets a detail page (license, invoice, case, etc.) publish a dynamic trailing
// breadcrumb label the static path->title map in client-sidebar-shell can't
// know ahead of time — e.g. "Licenses / ABCD-1234" where the license key only
// exists once the server component has fetched it. SiteHeader reads the
// values; the useSetPage* hooks below write them and clear on unmount so
// navigating away (or to a route that doesn't set one) doesn't leave stale
// content behind.
//
// `subtitle` and `actions` are an escape hatch for pages like the case
// thread, which used to render their own full header row (title, "updated
// X", status badges) inside the page content instead of the shared topbar.
// Publishing them here moves that row into the real topbar; the page itself
// then only needs a back arrow. Most pages only ever set `crumb`.
//
// Split into two contexts deliberately: SETTERS never change identity
// (useState setters are stable), so a page calling useSetPageActions only
// subscribes to the setter context and never re-renders when the VALUES
// context changes. Only SiteHeader reads the values context. Without this
// split, every useSetPage* caller would also subscribe to the values (since
// they'd share one context object), so publishing new content on every
// render (e.g. inline JSX with badges that depend on live state) would
// re-render the publishing component, which recreates that JSX, which
// re-publishes — an infinite loop that only shows up once a page passes a
// non-primitive/unstable `actions` node.
type CrumbValues = { crumb: string | null; subtitle: string | null; actions: ReactNode | null };
type CrumbSetters = {
  setCrumb: (label: string | null) => void;
  setSubtitle: (label: string | null) => void;
  setActions: (node: ReactNode | null) => void;
};

const CrumbValuesContext = createContext<CrumbValues | null>(null);
const CrumbSettersContext = createContext<CrumbSetters | null>(null);

export function PageCrumbProvider({ children }: { children: React.ReactNode }) {
  const [crumb, setCrumb] = useState<string | null>(null);
  const [subtitle, setSubtitle] = useState<string | null>(null);
  const [actions, setActions] = useState<ReactNode | null>(null);

  const values = useMemo(() => ({ crumb, subtitle, actions }), [crumb, subtitle, actions]);
  // setCrumb/setSubtitle/setActions are stable across renders (useState
  // setter identity never changes), so this object's identity is stable too
  // — callers of the useSetPage* hooks below never re-render from it.
  const setters = useMemo(() => ({ setCrumb, setSubtitle, setActions }), []);

  return (
    <CrumbSettersContext.Provider value={setters}>
      <CrumbValuesContext.Provider value={values}>
        {children}
      </CrumbValuesContext.Provider>
    </CrumbSettersContext.Provider>
  );
}

/* Read-only: the current crumb/subtitle/actions. Only SiteHeader should call
   this — anything else subscribes to values that change on every publish. */
export function usePageCrumbValues() {
  const ctx = useContext(CrumbValuesContext);
  if (!ctx) throw new Error("usePageCrumbValues must be used within PageCrumbProvider");
  return ctx;
}

function useCrumbSetters() {
  const ctx = useContext(CrumbSettersContext);
  if (!ctx) throw new Error("useSetPage* hooks must be used within PageCrumbProvider");
  return ctx;
}

/* Sets the trailing crumb label for the lifetime of the calling component,
   clearing it on unmount. Call from a detail view once its data is available. */
export function useSetPageCrumb(label: string | null) {
  const { setCrumb } = useCrumbSetters();
  useEffect(() => {
    setCrumb(label);
    return () => setCrumb(null);
  }, [label, setCrumb]);
}

/* Publishes a subtitle (e.g. "updated Jul 29, 2026") shown next to the
   trailing crumb in the topbar, for pages that need more than a label. */
export function useSetPageSubtitle(label: string | null) {
  const { setSubtitle } = useCrumbSetters();
  useEffect(() => {
    setSubtitle(label);
    return () => setSubtitle(null);
  }, [label, setSubtitle]);
}

/* Publishes right-aligned topbar content (badges, a menu, etc.) for the
   lifetime of the calling component. `node` is typically inline JSX whose
   reference changes every render of the caller — that's fine here since this
   hook (via the setters-only context) never causes the caller itself to
   re-render as a result of publishing. */
export function useSetPageActions(node: ReactNode) {
  const { setActions } = useCrumbSetters();
  // No dependency array: this re-runs on every render of the caller, always
  // publishing the latest `node` — deliberately, since `node` is typically
  // inline JSX whose reference is unstable and can't be diffed meaningfully.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setActions(node);
  });
  useEffect(() => {
    return () => setActions(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
