import type { CSSProperties } from "react";

/* For buyers who already have a theme, most likely from one of the
 * independent fashion theme shops. Built for a short attention span: four
 * contrasts in big type, what they get struck through, what Aether gives
 * under it. The strikes draw across when the section comes in, one after
 * another (.switch-strike in globals.css). One line of reassurance closes
 * it. Sits after the three chapters, before bonuses and price.
 *
 * Keep it honest and unnamed. Every struck line comes from the published
 * product pages of the two leading fashion theme shops, checked 2026-10-07:
 * lifetime licenses up to $349, updates limited to 12 months on some plans,
 * install DIY (or extra), support by email or Instagram DM. Recheck those
 * pages before changing a line, and keep the footnote's date in step. */

const CONTRASTS = [
  { them: "Up to $349 for a lifetime license", us: "$125 once" },
  { them: "Install it yourself", us: "Installed for you, same day" },
  { them: "Updates for 12 months", us: "Updates for life" },
  { them: "Support over Instagram DMs", us: "Real support, your own dashboard" },
];

export function SwitchToAether() {
  return (
    <section className="rise rise-stagger mx-3 sm:mx-auto w-auto sm:w-full max-w-[80rem] py-16 sm:py-24" aria-labelledby="switch-title">
      <p className="mb-4 text-[13px] sm:text-[14px] tracking-tight text-[rgb(var(--muted))]">Already have a theme?</p>
      <h2 id="switch-title" className="text-[clamp(2rem,4.2vw,3.25rem)] font-normal tracking-[-0.035em] leading-[1.08] text-[rgb(var(--fg))] [text-wrap:balance]">
        Other themes stop at the download.
      </h2>

      <ul data-stagger className="mt-12 grid gap-x-16 gap-y-10 sm:mt-16 sm:grid-cols-2 sm:gap-y-14">
        {CONTRASTS.map((c, i) => (
          <li key={c.us}>
            <p className="text-[16px] sm:text-[19px] tracking-tight text-[rgb(var(--muted))]">
              <span className="switch-strike" style={{ "--d": `${500 + i * 260}ms` } as CSSProperties}>
                {c.them}
              </span>
            </p>
            <p className="mt-2 text-[clamp(1.6rem,3vw,2.4rem)] tracking-[-0.03em] leading-[1.1] text-[rgb(var(--fg))]" style={{ fontWeight: 500 }}>
              {c.us}
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-14 text-[15px] sm:text-[17px] tracking-tight text-[rgb(var(--fg))] [text-wrap:pretty]">
        Your current theme stays live until you publish. Switch back in one click.
      </p>
      <p className="mt-2 text-[12px] sm:text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-70">
        Compared with the published terms of popular fashion theme shops, October 2026.
      </p>
    </section>
  );
}
