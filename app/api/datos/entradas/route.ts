/**
 * API Route para servir datos de entradas
 * GET /api/datos/entradas
 */

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'entradas.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error leyendo entradas:', error);
    return NextResponse.json(
      { error: 'Error cargando datos de entradas' },
      { status: 500 }
    );
  }
}
