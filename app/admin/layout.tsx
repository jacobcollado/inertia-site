import Script from "next/script";
import { AdminSidebarShell } from "./admin-sidebar-shell";

const SET_THEME_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("admin-theme");
    var dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (dark) document.documentElement.classList.add("admin-dark");
  } catch (e) {}
})();
`;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script id="set-admin-theme" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: SET_THEME_SCRIPT }} />
      <AdminSidebarShell>{children}</AdminSidebarShell>
    </>
  );
}
