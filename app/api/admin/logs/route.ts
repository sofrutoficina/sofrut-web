import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore';
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

    // Obtener últimos 100 logs de acceso
    const logsRef = collection(db, 'logs_acceso');
    const q = query(logsRef, orderBy('fecha', 'desc'), limit(100));
    const querySnapshot = await getDocs(q);

    const logs = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        usuario_id: data.usuario_id,
        email: data.email,
        nombre: data.nombre || 'Desconocido',
        rol: data.rol || 'usuario',
        fecha: data.fecha,
        ip: data.ip,
        navegador: data.navegador,
        exito: data.exito,
        tipo: data.tipo || 'login',
        motivo: data.motivo || null
      };
    });

    return NextResponse.json({
      success: true,
      logs
    });
  } catch (error) {
    console.error('Error obteniendo logs:', error);
    return NextResponse.json(
      { success: false, error: 'Error del servidor' },
      { status: 500 }
    );
  }
}
