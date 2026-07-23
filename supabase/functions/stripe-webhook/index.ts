import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SIGNING_SECRET") ?? "";

serve(async (req) => {
  const body = await req.text();
  const signature = req.headers.get("Stripe-Signature") ?? "";

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  switch (event.type) {
    case "payment_intent.payment_failed": {
      const pi = event.data.object as Stripe.PaymentIntent;
      const bookingId = pi.metadata.booking_id;
      if (bookingId) {
        await supabase.from("bookings").update({
          payment_status: "failed",
          booking_status: "cancelled",
        }).eq("id", bookingId);
      }
      break;
    }

    case "charge.dispute.created": {
      const dispute = event.data.object as Stripe.Dispute;
      const charge = await stripe.charges.retrieve(dispute.charge as string);
      const pi = await stripe.paymentIntents.retrieve(charge.payment_intent as string);
      const bookingId = pi.metadata.booking_id;
      if (bookingId) {
        await supabase.from("bookings").update({
          booking_status: "disputed",
        }).eq("id", bookingId);
        // Notify both parties via messages
        const { data: booking } = await supabase
          .from("bookings")
          .select("renter_id, owner_id")
          .eq("id", bookingId)
          .single();
        if (booking) {
          const disputeMessage = "A payment dispute has been opened on this booking. Our team will be in touch within 48 hours.";
          await supabase.from("messages").insert({
            booking_id: bookingId,
            sender_id: booking.owner_id,
            content: disputeMessage,
          });
        }
      }
      break;
    }

    case "payment_intent.requires_action":
    case "payment_intent.processing":
      // Handled client-side
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
