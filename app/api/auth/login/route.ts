import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    // Verificar contraseña
    const correctPassword = process.env.NEXT_PUBLIC_APP_PASSWORD || 'sofrut2025';

    if (password === correctPassword) {
      // Crear respuesta exitosa
      const response = NextResponse.json({ success: true });

      // Establecer cookie de autenticación (válida por 7 días)
      response.cookies.set('sofrut-auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 días
        path: '/'
      });

      return response;
    } else {
      return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
