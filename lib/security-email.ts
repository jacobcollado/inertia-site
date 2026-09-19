/* Security notifications we send ourselves, because Supabase has no template
 * for them. Same shell and palette as the auth templates in
 * docs/email-templates, kept in sync by hand. */

const PAGE = "#e8e8e8";
const CARD = "#f0f0f0";
const BORDER = "#e1e1e1";
const INK = "#121212";
const MUTED = "#6e6e6e";
const FAINT = "#8c8c8c";

function shell({ title, heading, body, footer }: {
  title: string; heading: string; body: string; footer: string;
}) {
  const logoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/inertia-wordmark-white.png`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
</head>
<body style="margin:0; padding:0; background-color:${PAGE}; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${PAGE}" style="background-color:${PAGE}; padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="width:480px; max-width:100%;">

          <tr>
            <td align="center" style="padding-bottom:28px;">
              <img src="${logoUrl}" width="126" height="45" alt="Inertia" style="display:block; width:126px; height:45px; border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic;" />
            </td>
          </tr>

          <tr>
            <td bgcolor="${CARD}" style="background-color:${CARD}; border:1px solid ${BORDER}; border-radius:8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:32px 32px 28px 32px;">
                    <p style="margin:0 0 8px 0; font-size:20px; font-weight:600; letter-spacing:-0.02em; line-height:1.3; color:${INK};">
                      ${heading}
                    </p>
                    <p style="margin:0; font-size:14px; line-height:1.6; color:${MUTED};">
                      ${body}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 8px 0 8px;" align="center">
              <p style="margin:0; font-size:12px; line-height:1.6; color:${FAINT};">
                ${footer}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function renderSignInMethodLinked({ email, provider }: { email: string; provider: string }) {
  const label = provider.charAt(0).toUpperCase() + provider.slice(1);
  return {
    subject: `${label} sign-in was added to your account`,
    html: shell({
      title: "A new sign-in method was added",
      heading: `${label} sign-in was added`,
      body: `You can now sign in to ${email} with ${label}. Your password still works, so you can use either one.`,
      footer: "Didn't do this? Reset your password right away and contact us, since someone else may have access to your account.",
    }),
    text: [
      `${label} sign-in was added.`,
      `You can now sign in to ${email} with ${label}. Your password still works, so you can use either one.`,
      "Didn't do this? Reset your password right away and contact us, since someone else may have access to your account.",
      "Inertia",
    ].join("\n\n"),
  };
}
