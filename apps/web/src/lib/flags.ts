/**
 * Build-time feature flags.
 *
 * These are plain module constants, not env vars, so they tree-shake and
 * are obvious in a diff. Flip one and rebuild.
 */

/**
 * Online payments (Stripe card + Cash App Pay).
 *
 * OFF for the cash-only pilot. The entire payment implementation is kept
 * intact — the Stripe Edge Functions in supabase/functions, the
 * PaymentStep card/Elements UI, createPaymentIntent/confirmBooking in the
 * payment repository — it is only disconnected from the booking flow:
 * every booking is created as an `in_person` (pay-on-pickup) request that
 * the owner approves manually.
 *
 * To turn payments back on:
 *   1. Deploy the Edge Functions (`supabase functions deploy …`) and set
 *      STRIPE_SECRET_KEY + SUPABASE_SERVICE_ROLE_KEY as function secrets.
 *   2. Register the Stripe webhook endpoint (stripe-webhook function).
 *   3. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY for the web app.
 *   4. Flip this to `true`.
 * No UI code needs to be rewritten — the payment-method picker and the
 * Stripe step come back on their own.
 */
export const ONLINE_PAYMENTS_ENABLED = false;
