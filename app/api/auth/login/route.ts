import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password, recordarme } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email y contraseña requeridos' },
        { status: 400 }
      );
    }

    // Buscar usuario por email
    const usuariosRef = collection(db, 'usuarios');
    const q = query(usuariosRef, where('email', '==', email.toLowerCase()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Obtener usuario
    const usuarioDoc = querySnapshot.docs[0];
    const usuario = usuarioDoc.data();

    // Verificar si está activo
    if (!usuario.activo) {
      return NextResponse.json(
        { success: false, error: 'Usuario desactivado' },
        { status: 403 }
      );
    }

    // Verificar contraseña
    const passwordValido = await bcrypt.compare(password, usuario.password);

    if (!passwordValido) {
      // Registrar intento fallido
      await addDoc(collection(db, 'logs_acceso'), {
        usuario_id: usuarioDoc.id,
        email: usuario.email,
        fecha: new Date().toISOString(),
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        navegador: request.headers.get('user-agent') || 'unknown',
        exito: false,
        motivo: 'Contraseña incorrecta'
      });

      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Login exitoso - Actualizar último acceso
    await updateDoc(doc(db, 'usuarios', usuarioDoc.id), {
      ultimo_acceso: new Date().toISOString()
    });

    // Registrar acceso exitoso
    await addDoc(collection(db, 'logs_acceso'), {
      usuario_id: usuarioDoc.id,
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol,
      fecha: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      navegador: request.headers.get('user-agent') || 'unknown',
      exito: true
    });

    // Crear respuesta exitosa
    const response = NextResponse.json({
      success: true,
      usuario: {
        id: usuarioDoc.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol
      }
    });

    // Duración de la cookie según "recordarme"
    const duracion = recordarme
      ? 60 * 60 * 24 * 30  // 30 días
      : 60 * 60 * 24;       // 1 día

    // Establecer cookie de autenticación
    response.cookies.set('sofrut-auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: duracion,
      path: '/'
    });

    // Establecer cookie con datos del usuario (para mostrar en UI)
    response.cookies.set('sofrut-user', JSON.stringify({
      id: usuarioDoc.id,
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol
    }), {
      httpOnly: false, // Accesible desde JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: duracion,
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { success: false, error: 'Error del servidor' },
      { status: 500 }
    );
  }
}
