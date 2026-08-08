// supabase/functions/send-beta-welcome/index.ts
import * as postmark from "npm:postmark";

const client = new postmark.ServerClient(Deno.env.get("POSTMARK_TOKEN")!);
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET")!;

Deno.serve(async (req) => {
  // Verify the request actually came from your Supabase webhook
  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = await req.json();
  const record = payload.record; // Supabase sends { type, table, record, old_record }

  try {
    await client.sendEmailWithTemplate({
      From: "team@yourapp.com",
      To: record.email,
      TemplateAlias: "beta-welcome",
      TemplateModel: {
        name: record.name ?? "there",
        report_url: "https://toolshare.bitcrafttech.com/bug-report",
        beta_round: record.beta_round,
      },
      MessageStream: "outbound",
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Postmark send failed:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});