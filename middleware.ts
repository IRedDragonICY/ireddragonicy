import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only handle the root entry; avoid loops and static assets
  if (pathname === '/') {
    const visited = request.cookies.get('visited');
    if (!visited) {
      // Do not redirect if explicitly marked as boot complete
      const booted = request.cookies.get('hasBooted')?.value === '1';
      if (!booted) {
        const url = request.nextUrl.clone();
        url.pathname = '/terminal';
        const res = NextResponse.redirect(url);
        res.cookies.set('visited', '1', {
          path: '/',
          maxAge: 60 * 60 * 24 * 365, // 1 year
          sameSite: 'lax'
        });
        return res;
      }
    }
  }

  // Set the cookie if user lands on /terminal directly without visiting /
  if (pathname.startsWith('/terminal')) {
    const visited = request.cookies.get('visited');
    if (!visited) {
      const res = NextResponse.next();
      res.cookies.set('visited', '1', {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax'
      });
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/terminal',
  ],
};


