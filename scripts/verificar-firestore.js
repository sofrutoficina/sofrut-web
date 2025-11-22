/**
 * Script de verificación de conexión a Firestore
 * Verifica que podemos leer los datos subidos
 */

require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, limit } = require('firebase/firestore');

// Configuración de Firebase desde variables de entorno
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function verificarFirestore() {
  console.log('================================================================================');
  console.log('VERIFICACIÓN DE FIRESTORE - SOFRUT WEB');
  console.log('================================================================================\n');

  // Inicializar Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  console.log('✅ Firebase inicializado correctamente');
  console.log(`   Proyecto: ${firebaseConfig.projectId}\n`);

  // Verificar colección de salidas
  console.log('📊 Verificando colección "salidas"...');
  const salidasRef = collection(db, 'salidas');
  const salidasSnapshot = await getDocs(salidasRef);
  console.log(`   ✅ ${salidasSnapshot.size} documentos encontrados`);

  if (salidasSnapshot.size > 0) {
    const primerDoc = salidasSnapshot.docs[0].data();
    console.log('   📄 Ejemplo de documento:');
    console.log(`      Cliente: ${primerDoc.Cliente}`);
    console.log(`      Fecha: ${primerDoc.Fecha}`);
    console.log(`      Especie: ${primerDoc.Especie}`);
    console.log(`      Peso Neto: ${primerDoc['Peso Neto']} kg`);
  }

  console.log('');

  // Verificar colección de entradas
  console.log('📊 Verificando colección "entradas"...');
  const entradasRef = collection(db, 'entradas');
  const entradasSnapshot = await getDocs(entradasRef);
  console.log(`   ✅ ${entradasSnapshot.size} documentos encontrados`);

  if (entradasSnapshot.size > 0) {
    const primerDoc = entradasSnapshot.docs[0].data();
    console.log('   📄 Ejemplo de documento:');
    console.log(`      Proveedor: ${primerDoc.Proveedor || primerDoc.Cliente}`);
    console.log(`      Fecha: ${primerDoc.Fecha}`);
    console.log(`      Especie: ${primerDoc.Especie}`);
    console.log(`      Kg Neto: ${primerDoc['Kg Neto'] || primerDoc['Peso Neto']} kg`);
  }

  console.log('\n================================================================================');
  console.log('RESUMEN:');
  console.log('--------------------------------------------------------------------------------');
  console.log(`✅ Salidas: ${salidasSnapshot.size} registros`);
  console.log(`✅ Entradas: ${entradasSnapshot.size} registros`);
  console.log(`✅ Total: ${salidasSnapshot.size + entradasSnapshot.size} registros`);
  console.log('================================================================================\n');
  console.log('✨ Firestore está funcionando correctamente!');
}

verificarFirestore().catch(error => {
  console.error('\n❌ Error verificando Firestore:', error);
  process.exit(1);
});
