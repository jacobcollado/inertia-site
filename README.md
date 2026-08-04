# Inertia

Source for [byinertia.com](https://byinertia.com), a design agency site with
a client portal (project tracking, invoices, files) and
[Aether](app/aether), a product it ships with its own license checkout and
activation flow.

This is the code actually running in production. It's public for reference,
not intended to be cloned and self-hosted. The client portal is tied to a
live Supabase project and real client data, so there's no local setup here.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript + Turbopack
- [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [Supabase](https://supabase.com) — auth, Postgres, storage
- [Stripe](https://stripe.com) — checkout and license fulfillment
- [PostHog](https://posthog.com) — analytics

## License

All rights reserved. This repository is public for reference only; it is not
licensed for reuse, redistribution, or self-hosting.
