/**
 * Endpoint para actualizar datos en Firestore
 * Llamado por el backend FastAPI después de procesar decisiones
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tipo, datos } = body;

    // Validar tipo
    if (!tipo || (tipo !== 'entradas' && tipo !== 'salidas')) {
      return NextResponse.json(
        { error: 'Tipo inválido. Debe ser "entradas" o "salidas"' },
        { status: 400 }
      );
    }

    // Validar datos
    if (!datos || !Array.isArray(datos)) {
      return NextResponse.json(
        { error: 'Datos inválidos. Debe ser un array de registros' },
        { status: 400 }
      );
    }

    // Actualizar Firestore usando batch writes
    const batch = writeBatch(db);
    const collectionName = tipo;

    // Borrar todos los documentos existentes de la colección
    // (Para esto necesitamos primero obtener todos los IDs)
    // Alternativa: usar el timestamp como ID para evitar duplicados

    let contador = 0;
    for (const registro of datos) {
      // Generar ID único basado en datos clave
      const idDoc = tipo === 'entradas'
        ? `${registro.Fecha}_${registro.Proveedor}_${registro.Especie}_${registro.Variedad}_${contador}`
        : `${registro.Fecha}_${registro.Cliente}_${registro.Especie}_${registro.Variedad}_${contador}`;

      const docRef = doc(collection(db, collectionName), idDoc);

      batch.set(docRef, {
        ...registro,
        _fecha_carga: new Date().toISOString(),
        _archivo_origen: 'procesador_v1.6'
      }, { merge: true });

      contador++;

      // Firestore limita batch a 500 operaciones
      if (contador % 500 === 0) {
        await batch.commit();
        // Crear nuevo batch
        const newBatch = writeBatch(db);
      }
    }

    // Commit final
    if (contador % 500 !== 0) {
      await batch.commit();
    }

    return NextResponse.json({
      exitoso: true,
      mensaje: `${contador} registros actualizados en ${tipo}`,
      tipo,
      total_registros: contador
    });

  } catch (error: any) {
    console.error('Error actualizando Firestore:', error);
    return NextResponse.json(
      { error: 'Error actualizando Firestore: ' + error.message },
      { status: 500 }
    );
  }
}
