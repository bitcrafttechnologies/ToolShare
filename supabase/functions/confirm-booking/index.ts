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

  const { bookingId, paymentIntentId } = await req.json();

  const { data: booking } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .eq("renter_id", user.id)
    .single();

  if (!booking) {
    return jsonResponse({ error: "Booking not found" }, 404);
  }

  // Verify payment with Stripe — never trust client-reported status
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (paymentIntent.status !== "succeeded") {
    return jsonResponse({ error: `Payment not completed: ${paymentIntent.status}` }, 400);
  }

  if (paymentIntent.metadata.booking_id !== bookingId) {
    return jsonResponse({ error: "Payment intent mismatch" }, 400);
  }

  // Confirm the booking — this triggers auto_block_dates trigger
  const { data: updated, error } = await supabase
    .from("bookings")
    .update({
      booking_status: "confirmed",
      payment_status: "captured",
    })
    .eq("id", bookingId)
    .select()
    .single();

  if (error) {
    return jsonResponse({ error: "Failed to confirm booking" }, 500);
  }

  return jsonResponse({ booking: updated });
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
