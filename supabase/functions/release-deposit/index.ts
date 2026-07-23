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

  const { bookingId, claimDamage, damageAmount } = await req.json();

  const { data: booking } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .eq("owner_id", user.id)
    .single();

  if (!booking) {
    return jsonResponse({ error: "Booking not found or unauthorized" }, 404);
  }

  if (!booking.stripe_deposit_intent_id) {
    return jsonResponse({ message: "No deposit to release" });
  }

  if (claimDamage && damageAmount > 0) {
    // Capture portion of deposit for damages
    const captureAmount = Math.min(
      Math.round(damageAmount * 100),
      Math.round(booking.deposit_amount * 100)
    );
    await stripe.paymentIntents.capture(booking.stripe_deposit_intent_id, {
      amount_to_capture: captureAmount,
    });
  } else {
    // Cancel deposit authorization — returns funds to renter
    await stripe.paymentIntents.cancel(booking.stripe_deposit_intent_id);
  }

  await supabase.from("bookings").update({
    booking_status: "completed",
  }).eq("id", bookingId);

  return jsonResponse({ success: true });
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
