import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: NextRequest) {
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

    // Obtener todos los usuarios
    const usuariosRef = collection(db, 'usuarios');
    const q = query(usuariosRef, orderBy('creado_en', 'desc'));
    const querySnapshot = await getDocs(q);

    const usuarios = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        nombre: data.nombre,
        rol: data.rol,
        activo: data.activo,
        creado_en: data.creado_en,
        ultimo_acceso: data.ultimo_acceso || null
      };
    });

    return NextResponse.json({
      success: true,
      usuarios
    });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    return NextResponse.json(
      { success: false, error: 'Error del servidor' },
      { status: 500 }
    );
  }
}
