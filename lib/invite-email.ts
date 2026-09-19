/* The account-setup email, matching the license email's shell so the two
 * messages read as one sequence.
 *
 * Sent through Resend from hello@byinertia.com rather than by Supabase's
 * inviteUserByEmail. Supabase's built-in mailer sends from a shared Supabase
 * domain with no SPF/DKIM alignment to byinertia.com, which reliably lands in
 * spam; the license email reaches the inbox because it comes from the
 * verified domain, so the invite goes the same way. */

export type InviteEmailInput = {
  actionLink: string;
};

export function renderInviteEmail({ actionLink }: InviteEmailInput) {
  const logoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/inertia-wordmark-white.png`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://byinertia.com";
  const docsUrl = `${siteUrl}/aether/docs`;

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
          <h1 style="margin:0 0 12px;font-size:24px;font-weight:400;letter-spacing:-0.04em;line-height:1.2;color:#121212;">Finish setting up</h1>
          <p style="margin:0 0 24px;font-size:13px;color:#6e6e6e;line-height:1.6;letter-spacing:-0.01em;">Choose a password and your account is ready. Your license key, receipt, and theme downloads are already waiting inside.</p>

          <!-- CTA -->
          <table cellpadding="0" cellspacing="0" style="margin-top:4px;">
            <tr>
              <td class="cta-cell">
                <a href="${actionLink}" style="display:inline-block;border-radius:6px;background-color:#121212;padding:11px 22px;font-size:13px;font-weight:500;letter-spacing:-0.01em;color:#ffffff;text-decoration:none;white-space:nowrap;">Choose a password</a>
              </td>
              <td class="cta-cell" style="padding-left:10px;">
                <a href="${docsUrl}" style="display:inline-block;border:1px solid #e1e1e1;border-radius:6px;padding:10px 18px;font-size:13px;font-weight:500;letter-spacing:-0.01em;color:#121212;text-decoration:none;white-space:nowrap;">Read the docs</a>
              </td>
            </tr>
          </table>

          <p style="margin:24px 0 0;font-size:12px;color:#8c8c8c;line-height:1.5;letter-spacing:-0.01em;">This link expires in 24 hours. If it stops working, you can request a fresh one from the sign-in page.</p>

        </td></tr>

        <!-- Footer -->
        <tr><td align="center" style="padding-top:28px;">
          <p style="margin:0;font-size:12px;color:#8c8c8c;letter-spacing:-0.01em;">Didn't buy Aether? You can ignore this email. Inertia</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    "Finish setting up your Inertia account.",
    "Choose a password and your account is ready. Your license key, receipt, and theme downloads are already waiting inside.",
    actionLink,
    "This link expires in 24 hours. If it stops working, you can request a fresh one from the sign-in page.",
    `Installation guide: ${docsUrl}`,
    "Didn't buy Aether? You can ignore this email.",
    "Inertia",
  ].join("\n\n");

  return { subject: "Finish setting up your Inertia account", html, text };
}
