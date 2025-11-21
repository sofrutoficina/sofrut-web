import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const authCookie = request.cookies.get('sofrut-auth');
    const userCookie = request.cookies.get('sofrut-user');

    if (!authCookie || authCookie.value !== 'authenticated' || !userCookie) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Verificar que sea administrador
    let userData;
    try {
      userData = JSON.parse(userCookie.value);
    } catch (e) {
      return NextResponse.json(
        { success: false, error: 'Cookie inválida' },
        { status: 401 }
      );
    }

    if (userData.rol !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 403 }
      );
    }

    // Obtener datos del nuevo usuario
    const { email, password, nombre, rol } = await request.json();

    // Validaciones
    if (!email || !password || !nombre) {
      return NextResponse.json(
        { success: false, error: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Verificar que el email no exista
    const usuariosRef = collection(db, 'usuarios');
    const q = query(usuariosRef, where('email', '==', email.toLowerCase()));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return NextResponse.json(
        { success: false, error: 'El email ya está registrado' },
        { status: 409 }
      );
    }

    // Hashear contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Crear nuevo usuario
    const nuevoUsuario = {
      email: email.toLowerCase(),
      password: passwordHash,
      nombre,
      rol: rol || 'usuario',
      activo: true,
      creado_en: new Date().toISOString(),
      ultimo_acceso: null
    };

    const docRef = await addDoc(collection(db, 'usuarios'), nuevoUsuario);

    return NextResponse.json({
      success: true,
      message: 'Usuario creado correctamente',
      usuario: {
        id: docRef.id,
        email: nuevoUsuario.email,
        nombre: nuevoUsuario.nombre,
        rol: nuevoUsuario.rol
      }
    });
  } catch (error) {
    console.error('Error creando usuario:', error);
    return NextResponse.json(
      { success: false, error: 'Error del servidor' },
      { status: 500 }
    );
  }
}
