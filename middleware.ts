import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Obtener cookie de autenticación
  const authCookie = request.cookies.get('sofrut-auth');
  const isAuthenticated = authCookie?.value === 'authenticated';

  // Rutas públicas que no requieren autenticación
  const isLoginPage = request.nextUrl.pathname === '/login';
  const isAuthAPI = request.nextUrl.pathname.startsWith('/api/auth');

  // Si está en login o API de auth, permitir acceso
  if (isLoginPage || isAuthAPI) {
    return NextResponse.next();
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Si está autenticado, permitir acceso
  return NextResponse.next();
}

// Configurar qué rutas proteger
export const config = {
  matcher: [
    /*
     * Proteger todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
