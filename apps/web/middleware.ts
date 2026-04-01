import { NextResponse, type NextRequest } from 'next/server';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';

const PROTECTED_PATHS = ['/ds-mentors'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isApiProtected = pathname.startsWith('/api/airtable');
  const isPageProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));

  if (!isApiProtected && !isPageProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return isApiProtected
      ? NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await verifySessionToken(token);
    return NextResponse.next();
  } catch {
    return isApiProtected
      ? NextResponse.json({ error: 'Session invalide' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/ds-mentors/:path*', '/api/airtable/:path*'],
};

