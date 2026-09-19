/* The license-key email, kept apart from the webhook that sends it so the
 * same markup can be rendered for preview without sending mail. Pure
 * function of its inputs: no Resend call, no env reads beyond the asset and
 * site URLs the markup embeds. */

export type LicenseEmailInput = {
  key: string;
  tier: string;
  sessionId: string;
};

export function renderLicenseEmail({ key, tier, sessionId }: LicenseEmailInput) {
  const tierLabel = tier === "lifetime" ? "Lifetime" : "Standard";
  const logoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/inertia-wordmark-white.png`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://byinertia.com";

  // Not the success page: whoever opens this has already seen that, and its
  // job is confirming a payment rather than making an account. /claim starts
  // the account setup on arrival, so this click is the only one needed.
  const claimUrl = `${siteUrl}/aether/buy/claim?session_id=${encodeURIComponent(sessionId)}`;

  // The Copy control can't touch the clipboard from an email, so it opens the
  // dashboard key list, where a real copy button exists.
  const copyUrl = `${siteUrl}/dashboard/licenses`;

  // Installation guidance, linked right under the activation steps so someone
  // who gets stuck there has somewhere to go without hunting through the site.
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

          <p style="margin:0 0 6px;font-size:13px;font-weight:400;letter-spacing:-0.01em;color:#6e6e6e;">Aether ${tierLabel}</p>
          <h1 style="margin:0 0 12px;font-size:24px;font-weight:400;letter-spacing:-0.04em;line-height:1.2;color:#121212;">Thanks for your purchase</h1>
          <p style="margin:0 0 24px;font-size:13px;color:#6e6e6e;line-height:1.6;letter-spacing:-0.01em;">We appreciate you choosing Aether. Your license key is below, ready to activate whenever you are.</p>

          <!-- Key box. Mail clients strip JavaScript, so a real clipboard
               button is impossible here; this links to the dashboard, which
               has one. The key stays selectable for manual copying. -->
          <div style="background-color:#e6e6e6;border:1px solid #e1e1e1;border-radius:6px;padding:16px 20px;margin-bottom:28px;">
            <p style="margin:0 0 6px;font-size:12px;letter-spacing:-0.01em;color:#6e6e6e;">License key</p>
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td style="font-family:'Courier New',monospace;font-size:17px;font-weight:500;letter-spacing:0.04em;color:#121212;">${key}</td>
              <td align="right" style="padding-left:12px;">
                <a href="${copyUrl}" title="Copy from your dashboard" style="display:inline-block;border:1px solid #e1e1e1;border-radius:6px;padding:4px 9px;font-size:15px;line-height:1.35;color:#6e6e6e;text-decoration:none;">⧉</a>
              </td>
            </tr></table>
          </div>

          <!-- Steps -->
          <p style="margin:0 0 12px;font-size:13px;color:#6e6e6e;line-height:1.6;letter-spacing:-0.01em;">To activate, install Aether on your Shopify store and enter this key in <strong style="color:#121212;">Theme Settings → License Key</strong>. Your store domain will be assigned automatically on first activation.</p>

          <p style="margin:0;font-size:13px;color:#6e6e6e;line-height:1.6;letter-spacing:-0.01em;">Not sure where to start? The <a href="${docsUrl}" style="color:#121212;text-decoration:underline;">installation guide</a> walks through it step by step.</p>

          <!-- Account recommendation -->
          <div style="border-top:1px solid #e1e1e1;margin-top:28px;padding-top:24px;">
            <p style="margin:0 0 6px;font-size:14px;font-weight:500;letter-spacing:-0.02em;color:#121212;">Set up your account</p>
            <p style="margin:0;font-size:13px;color:#6e6e6e;line-height:1.6;letter-spacing:-0.01em;">Create a free account to keep this key, your receipt, and your theme downloads in one place. It takes a moment and you only need to do it once.</p>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0" style="margin-top:20px;">
              <tr>
                <td class="cta-cell">
                  <a href="${claimUrl}" style="display:inline-block;border-radius:6px;background-color:#121212;padding:11px 22px;font-size:13px;font-weight:500;letter-spacing:-0.01em;color:#ffffff;text-decoration:none;white-space:nowrap;">Create your account</a>
                </td>
                <td class="cta-cell" style="padding-left:10px;">
                  <a href="${docsUrl}" style="display:inline-block;border:1px solid #e1e1e1;border-radius:6px;padding:10px 18px;font-size:13px;font-weight:500;letter-spacing:-0.01em;color:#121212;text-decoration:none;white-space:nowrap;">Read the docs</a>
                </td>
              </tr>
            </table>

            <p style="margin:14px 0 0;font-size:12px;color:#8c8c8c;line-height:1.5;letter-spacing:-0.01em;">Already have an account? <a href="${siteUrl}/login" style="color:#6e6e6e;text-decoration:underline;">Sign in</a> and your license will be waiting.</p>
          </div>

        </td></tr>

        <!-- Footer -->
        <tr><td align="center" style="padding-top:28px;">
          <p style="margin:0;font-size:12px;color:#8c8c8c;letter-spacing:-0.01em;">Reply to this email if you need help. Inertia</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Thanks for your purchase.

We appreciate you choosing Aether ${tierLabel}. Your license key is below, ready to activate whenever you are.\n\nYour license key: ${key}\n\nInstall Aether on your Shopify store and enter this key in Theme Settings → License Key.\n\nNot sure where to start? The installation guide walks through it step by step:\n${docsUrl}\n\nSet up your account\nCreate a free account to keep this key, your receipt, and your theme downloads in one place:\n${claimUrl}\n\nAlready have an account? Sign in at ${siteUrl}/login and your license will be waiting.\n\nInertia`;

  return { subject: "Your Aether license key", html, text };
}
