import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

Deno.serve(async (req: Request) => {
  const { userId, title, body, data }: NotificationPayload = await req.json();

  const { data: profile } = await supabase
    .from('profiles')
    .select('expo_push_token')
    .eq('id', userId)
    .single();

  if (!profile?.expo_push_token) {
    return new Response(JSON.stringify({ sent: false, reason: 'no_token' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      to: profile.expo_push_token,
      title,
      body,
      data: data ?? {},
      sound: 'default',
    }),
  });

  const result = await response.json();
  return new Response(JSON.stringify({ sent: true, result }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
