import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { nuevaPassword } = await request.json();

    if (!nuevaPassword || nuevaPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Verificar que el usuario está autenticado
    const authCookie = request.cookies.get('sofrut-auth');
    const userCookie = request.cookies.get('sofrut-user');

    if (!authCookie || authCookie.value !== 'authenticated' || !userCookie) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Obtener datos del usuario de la cookie
    let userData;
    try {
      userData = JSON.parse(userCookie.value);
    } catch (e) {
      return NextResponse.json(
        { success: false, error: 'Cookie inválida' },
        { status: 401 }
      );
    }

    // Buscar usuario en Firestore por email
    const usuariosRef = collection(db, 'usuarios');
    const q = query(usuariosRef, where('email', '==', userData.email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const usuarioDoc = querySnapshot.docs[0];

    // Hashear nueva contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(nuevaPassword, saltRounds);

    // Actualizar contraseña en Firestore
    await updateDoc(doc(db, 'usuarios', usuarioDoc.id), {
      password: passwordHash,
      password_actualizada_en: new Date().toISOString()
    });

    // Registrar cambio en logs
    await addDoc(collection(db, 'logs_acceso'), {
      usuario_id: usuarioDoc.id,
      email: userData.email,
      nombre: userData.nombre,
      rol: userData.rol,
      fecha: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      navegador: request.headers.get('user-agent') || 'unknown',
      exito: true,
      tipo: 'cambio_password'
    });

    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    return NextResponse.json(
      { success: false, error: 'Error del servidor' },
      { status: 500 }
    );
  }
}
