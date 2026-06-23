import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { LAUNCH_TARGET } from '@/lib/config' // 👈 TAMBAHKAN IMPORT INI

export function middleware(request: NextRequest) {
  const now = Date.now();
  const { pathname } = request.nextUrl;

  // 1. Jika pendaftaran BELUM BUKA
  if (now < LAUNCH_TARGET) { // 👈 SEKARANG MENGGUNAKAN IMPORT
    
    if (pathname.startsWith('/registration')) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('error', 'not_open');
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith('/api/submit')) {
      return NextResponse.json(
        { status: 'error', message: 'Akses Ditolak: Registrasi belum dibuka.' },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/registration', 
    '/registration/:path*', 
    '/api/submit/:path*'
  ],
}
