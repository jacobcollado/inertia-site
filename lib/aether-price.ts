// What Aether costs, in one place for the page, the buy buttons and
// llms.txt. The SMS add-on is its own Stripe price (STRIPE_PRICE_LIFETIME_SMS
// is the license with it, at AETHER_PRICE + SMS_PRICE): change that price in
// Stripe first, then this number, or the page and checkout disagree.
export const AETHER_PRICE = 125;
export const SMS_PRICE = 10;
