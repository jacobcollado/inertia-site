// TEMPORARY: public sign-ups are closed. Flip to true to reopen.
//
// Gates the UI only: hides the "Create account" tab on /login and the
// account-creation CTAs in the dashboard header, forces the signin tab even
// on ?tab=signup, and refuses a signup submission if one is somehow reached.
//
// This is NOT a security control. supabase.auth.signUp() can still be called
// directly, and Google OAuth creates an account on first sign-in regardless
// of anything in the client bundle. To actually close registration, also
// disable it in Supabase:
//   Authentication > Providers > Email  > "Allow new users to sign up" (off)
//   Authentication > Providers > Google > same setting
export const SIGNUPS_ENABLED = false;
