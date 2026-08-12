import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Prefix match, so '/bookings' also covers '/bookings/[id]/chat'.
// NOTE: this listed '/post-tool' until 2026-07-20 — a route that has never
// existed. The listing form is '/add-tool', so it was reachable signed-out
// and only failed at submit time.
const PROTECTED_PATHS = [
  '/bookings',
  '/booking',
  '/my-listings',
  '/add-tool',
  '/profile',
  '/favorites',
  '/messages',
  // Bug reports are for signed-in pilot testers, so we know who filed them.
  '/bug-report',
];

export async function middleware(request: NextRequest) {
  // The /test route is the design-system showcase — kept for local
  // development but never exposed to pilot users. `next start` sets
  // NODE_ENV=production, `next dev` sets development, so this hides it in the
  // deployed build without deleting the page.
  if (
    process.env.NODE_ENV === 'production' &&
    request.nextUrl.pathname.startsWith('/test')
  ) {
    // Cloned from nextUrl rather than built from request.url: behind Cloud Run
    // the latter carries the container's bind address, not the public origin.
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = '/';
    homeUrl.search = '';
    return NextResponse.redirect(homeUrl);
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isProtected = PROTECTED_PATHS.some((p) =>
    request.nextUrl.pathname.startsWith(p),
  );

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
};
