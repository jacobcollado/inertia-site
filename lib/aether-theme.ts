/* The theme build new licenses are issued against.
 *
 * Path is relative to the "client-files" Supabase Storage bucket. Bumping a
 * release means uploading the new zip and changing this one line: the Stripe
 * webhook stamps it onto every license it creates, and the portal turns it
 * into a signed download URL.
 *
 * Existing licenses keep the path they were sold with. Pointing past buyers at
 * a newer build is a deliberate migration (an UPDATE over the licenses table),
 * not a side effect of changing this constant.
 */
export const CURRENT_THEME_FILE = "theme/aether-v1.6.zip";
