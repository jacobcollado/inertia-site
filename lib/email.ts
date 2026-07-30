// Thin wrapper over Resend's HTTP API — no SDK dependency, matches the
// pattern already used in app/api/contact and app/api/inquiry. Silently
// no-ops if RESEND_API_KEY isn't configured, so notification sends never
// throw and block the action they're attached to.
export async function sendEmail({ to, subject, text }: { to: string; subject: string; text: string }) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.log("[email] RESEND_API_KEY not set, skipping send:", { to, subject });
    return { skipped: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Inertia <hello@byinertia.com>",
      to: [to],
      subject,
      text,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[email] Resend send failed:", res.status, body);
    return { error: `Send failed (${res.status})` };
  }

  return { success: true };
}
