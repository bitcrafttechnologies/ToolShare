import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders() });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "") ?? "";
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const { bookingId } = await req.json();
  if (!bookingId) {
    return jsonResponse({ error: "bookingId required" }, 400);
  }

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("*, tools(title), profiles!bookings_renter_id_fkey(stripe_customer_id)")
    .eq("id", bookingId)
    .eq("renter_id", user.id)
    .single();

  if (bookingError || !booking) {
    return jsonResponse({ error: "Booking not found" }, 404);
  }

  if (booking.booking_status !== "pending") {
    return jsonResponse({ error: "Booking already processed" }, 400);
  }

  // Ensure Stripe customer exists
  let customerId = booking.profiles?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
  }

  // Create payment intent for rental amount
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(booking.total_price * 100),
    currency: "usd",
    customer: customerId,
    metadata: {
      booking_id: bookingId,
      tool_title: booking.tools?.title ?? "",
      renter_id: user.id,
    },
    description: `Toolshare rental: ${booking.tools?.title}`,
    automatic_payment_methods: { enabled: true },
  });

  // Create separate authorization for deposit (captured only if damage claimed)
  let depositIntentId = null;
  if (booking.deposit_amount > 0) {
    const depositIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.deposit_amount * 100),
      currency: "usd",
      customer: customerId,
      capture_method: "manual",
      metadata: {
        booking_id: bookingId,
        type: "deposit",
      },
      description: `Toolshare deposit: ${booking.tools?.title}`,
      automatic_payment_methods: { enabled: true },
    });
    depositIntentId = depositIntent.id;
  }

  // Store intent IDs on booking
  await supabase.from("bookings").update({
    stripe_payment_intent_id: paymentIntent.id,
    stripe_deposit_intent_id: depositIntentId,
  }).eq("id", bookingId);

  return jsonResponse({
    clientSecret: paymentIntent.client_secret,
    depositClientSecret: depositIntentId ? null : null, // returned separately if needed
    paymentIntentId: paymentIntent.id,
  });
});

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}
