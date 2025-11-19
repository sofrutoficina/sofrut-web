/**
 * API Route para servir datos de salidas
 * GET /api/datos/salidas
 */

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'salidas.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error leyendo salidas:', error);
    return NextResponse.json(
      { error: 'Error cargando datos de salidas' },
      { status: 500 }
    );
  }
}
