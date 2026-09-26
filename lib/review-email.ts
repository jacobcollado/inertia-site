/* The review request, sent a week after an Aether purchase by the
 * /api/cron/review-requests job. Same shell as the license and setup emails
 * so it reads as part of one sequence.
 *
 * It asks for a reply rather than linking to a form: a reply is one tap on a
 * phone, lands in hello@byinertia.com, and is already in the buyer's own
 * words, which is what the reviews on /aether need. */

export function renderReviewEmail() {
  const logoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/inertia-wordmark-white.png`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://byinertia.com";
  const reviewMailto = "mailto:hello@byinertia.com?subject=My%20Aether%20review";
  const supportUrl = `${siteUrl}/dashboard`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  @media only screen and (max-width:420px) {
    .cta-cell { display:block !important; width:100% !important; padding:0 0 10px 0 !important; }
    .cta-cell a { display:block !important; text-align:center !important; }
  }
</style>
</head>
<body class="body" style="margin:0;padding:0;background-color:#e8e8e8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#e8e8e8" style="background-color:#e8e8e8;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;">

        <!-- Logo -->
        <tr><td align="center" style="padding-bottom:32px;">
          <img src="${logoUrl}" alt="Inertia" width="126" height="45" style="display:block;width:126px;height:45px;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;">
        </td></tr>

        <!-- Card -->
        <tr><td bgcolor="#f0f0f0" style="background-color:#f0f0f0;border:1px solid #e1e1e1;border-radius:6px;padding:32px 28px;">

          <p style="margin:0 0 6px;font-size:13px;font-weight:400;letter-spacing:-0.01em;color:#6e6e6e;">Aether by Inertia</p>
          <h1 style="margin:0 0 12px;font-size:24px;font-weight:400;letter-spacing:-0.04em;line-height:1.2;color:#121212;">How's Aether working out?</h1>
          <p style="margin:0 0 12px;font-size:13px;color:#6e6e6e;line-height:1.6;letter-spacing:-0.01em;">You've had Aether for about a week. If it's been good to you, would you reply with a sentence or two about it? We're a small studio, and a few honest words from a real store help other brands decide more than anything we could write.</p>
          <p style="margin:0 0 24px;font-size:13px;color:#6e6e6e;line-height:1.6;letter-spacing:-0.01em;">Tell us if we can show your store name and logo next to it. If something isn't right yet, reply with that instead and we'll fix it.</p>

          <!-- CTA -->
          <table cellpadding="0" cellspacing="0" style="margin-top:4px;">
            <tr>
              <td class="cta-cell">
                <a href="${reviewMailto}" style="display:inline-block;border-radius:6px;background-color:#121212;padding:11px 22px;font-size:13px;font-weight:500;letter-spacing:-0.01em;color:#ffffff;text-decoration:none;white-space:nowrap;">Write a quick review</a>
              </td>
              <td class="cta-cell" style="padding-left:10px;">
                <a href="${supportUrl}" style="display:inline-block;border:1px solid #e1e1e1;border-radius:6px;padding:10px 18px;font-size:13px;font-weight:500;letter-spacing:-0.01em;color:#121212;text-decoration:none;white-space:nowrap;">Get support</a>
              </td>
            </tr>
          </table>

          <p style="margin:24px 0 0;font-size:12px;color:#8c8c8c;line-height:1.5;letter-spacing:-0.01em;">Replying to this email works too. It comes straight to us.</p>

        </td></tr>

        <!-- Footer -->
        <tr><td align="center" style="padding-top:28px;">
          <p style="margin:0;font-size:12px;color:#8c8c8c;letter-spacing:-0.01em;">This is the only time we'll ask. Inertia</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    "How's Aether working out?",
    "You've had Aether for about a week. If it's been good to you, would you reply with a sentence or two about it? We're a small studio, and a few honest words from a real store help other brands decide more than anything we could write.",
    "Tell us if we can show your store name and logo next to it. If something isn't right yet, reply with that instead and we'll fix it.",
    `Need help? ${supportUrl}`,
    "This is the only time we'll ask.",
    "Inertia",
  ].join("\n\n");

  return { subject: "How's Aether working out?", html, text };
}
