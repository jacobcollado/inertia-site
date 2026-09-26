/* The install request, sent by the Stripe webhook right after the license
 * email, so Inertia can install Aether for the buyer. Same shell as the
 * license and review emails so it reads as part of one sequence.
 *
 * It asks for a reply rather than linking to a form, like the review email:
 * a reply is one tap on a phone and lands in hello@byinertia.com. The button
 * opens a reply with both fields already laid out, so the buyer only fills in
 * two blanks. Pure function of env: no Resend call, safe to render for
 * preview. */

export function renderSetupEmail() {
  const logoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/inertia-wordmark-white.png`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://byinertia.com";
  const docsUrl = `${siteUrl}/aether/docs`;
  const replyMailto =
    "mailto:hello@byinertia.com" +
    `?subject=${encodeURIComponent("Aether install details")}` +
    `&body=${encodeURIComponent("Store address: .myshopify.com\nCollaborator request code: ")}`;

  const step = (n: number, title: string, body: string) => `
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#e6e6e6;border:1px solid #e1e1e1;border-radius:6px;margin-bottom:10px;">
            <tr>
              <td valign="top" width="28" style="padding:16px 0 16px 18px;font-size:13px;color:#8c8c8c;letter-spacing:-0.01em;">${n}</td>
              <td style="padding:16px 18px 16px 6px;">
                <p style="margin:0 0 4px;font-size:14px;font-weight:500;letter-spacing:-0.02em;color:#121212;">${title}</p>
                <p style="margin:0;font-size:13px;color:#6e6e6e;line-height:1.6;letter-spacing:-0.01em;">${body}</p>
              </td>
            </tr>
          </table>`;

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

          <p style="margin:0 0 6px;font-size:13px;font-weight:400;letter-spacing:-0.01em;color:#6e6e6e;">Aether setup</p>
          <h1 style="margin:0 0 12px;font-size:24px;font-weight:400;letter-spacing:-0.04em;line-height:1.2;color:#121212;">Let's get Aether on your store</h1>
          <p style="margin:0 0 24px;font-size:13px;color:#6e6e6e;line-height:1.6;letter-spacing:-0.01em;">We install Aether for you, usually the same day. To start, reply to this email with two things from your Shopify admin.</p>

          ${step(1, "Your .myshopify.com address", `Go to <strong style="color:#121212;">Settings → Domains</strong>. It looks like <span style="color:#121212;">yourstore.myshopify.com</span>.`)}
          ${step(2, "Your collaborator request code", `Go to <strong style="color:#121212;">Settings → Users → Security</strong>. The 4-digit code is under Collaborators.`)}

          <p style="margin:18px 0 24px;font-size:13px;color:#6e6e6e;line-height:1.6;letter-spacing:-0.01em;">With these, we send a request to work on your store. Tap accept when it arrives and we take it from there. Your current theme stays live until you choose to publish Aether.</p>

          <!-- CTA -->
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td class="cta-cell">
                <a href="${replyMailto}" style="display:inline-block;border-radius:6px;background-color:#121212;padding:11px 22px;font-size:13px;font-weight:500;letter-spacing:-0.01em;color:#ffffff;text-decoration:none;white-space:nowrap;">Reply with your details</a>
              </td>
              <td class="cta-cell" style="padding-left:10px;">
                <a href="${docsUrl}" style="display:inline-block;border:1px solid #e1e1e1;border-radius:6px;padding:10px 18px;font-size:13px;font-weight:500;letter-spacing:-0.01em;color:#121212;text-decoration:none;white-space:nowrap;">Install it myself</a>
              </td>
            </tr>
          </table>

          <p style="margin:24px 0 0;font-size:12px;color:#8c8c8c;line-height:1.5;letter-spacing:-0.01em;">Replying to this email works too. It comes straight to us.</p>

        </td></tr>

        <!-- Footer -->
        <tr><td align="center" style="padding-top:28px;">
          <p style="margin:0;font-size:12px;color:#8c8c8c;letter-spacing:-0.01em;">Your license key is in the email just before this one. Inertia</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    "Let's get Aether on your store",
    "We install Aether for you, usually the same day. To start, reply to this email with two things from your Shopify admin.",
    "1. Your .myshopify.com address\nGo to Settings → Domains. It looks like yourstore.myshopify.com.",
    "2. Your collaborator request code\nGo to Settings → Users → Security. The 4-digit code is under Collaborators.",
    "With these, we send a request to work on your store. Tap accept when it arrives and we take it from there. Your current theme stays live until you choose to publish Aether.",
    `Rather install it yourself? The guide walks through it: ${docsUrl}`,
    "Your license key is in the email just before this one.",
    "Inertia",
  ].join("\n\n");

  return { subject: "Let's get Aether on your store", html, text };
}
