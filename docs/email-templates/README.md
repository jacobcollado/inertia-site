# Supabase auth email templates

Paste these into **Supabase dashboard → Authentication → Emails**, one per tab.
They are not read by the app at runtime; Supabase stores and sends them.

Palette matches the transactional emails in `lib/license-email.ts` and
`lib/invite-email.ts`:

| role | value |
|---|---|
| page background | `#e8e8e8` |
| card | `#f0f0f0` |
| border | `#e1e1e1` |
| heading / ink | `#121212` |
| body text | `#6e6e6e` |
| faint footer | `#8c8c8c` |
| primary button | `#121212` fill, `#ffffff` text |

Authored **light on purpose**. Gmail iOS inverts light emails into dark
cleanly; authoring dark makes it invert them into light, which is what made
the earlier dark templates render wrong.

Logo is the white wordmark in Supabase storage
(`assets/inertia-wordmark-white.png`, 252x90), displayed at 126x45, matching
the transactional emails. It is white on transparency, so it reads correctly
once a client inverts the light background to dark, and is faint in clients
that render the light design as authored.

## Supabase template variables

- `{{ .ConfirmationURL }}` - the action link (confirm, invite, recovery)
- `{{ .Email }}` - recipient address
- `{{ .SiteURL }}` - configured site URL
- `{{ .Token }}` - 6 digit OTP, if you use code-based flows

## Files

| file | Supabase tab |
|---|---|
| `confirm-signup.html` | Confirm signup |
| `invite.html` | Invite user |
| `magic-link.html` | Magic Link |
| `reset-password.html` | Reset Password |
| `password-changed.html` | (custom / Send Email hook) |

## Note on deliverability

These still send through Supabase's mailer, which sends from a Supabase domain
with no SPF/DKIM alignment to byinertia.com, so they can land in spam
regardless of markup. The purchase flow works around this by generating the
link with `generateLink` and sending via Resend from `hello@byinertia.com`
(see `app/api/claim-purchase/route.ts`). The durable fix is configuring custom
SMTP in Supabase to point at Resend, under Project Settings → Auth → SMTP.
