/**
 * Script para crear el usuario administrador inicial
 *
 * IMPORTANTE: Ejecutar solo UNA VEZ
 *
 * Uso:
 *   node scripts/crear-usuario-admin.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, query, where, getDocs } = require('firebase/firestore');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function crearUsuarioAdmin() {
  console.log('🔧 Creando usuario administrador...\n');

  const email = 'sofrutoficina@gmail.com';
  const password = 'sofrut2025';
  const nombre = 'Administrador';

  try {
    // Verificar si ya existe
    const usuariosRef = collection(db, 'usuarios');
    const q = query(usuariosRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      console.log('⚠️  El usuario administrador ya existe.');
      console.log('   Email:', email);
      process.exit(0);
    }

    // Hashear contraseña
    console.log('🔐 Hasheando contraseña...');
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Crear usuario
    console.log('💾 Guardando en Firestore...');
    const nuevoUsuario = {
      email,
      password: passwordHash,
      nombre,
      rol: 'admin',
      activo: true,
      creado_en: new Date().toISOString(),
      ultimo_acceso: null
    };

    await addDoc(collection(db, 'usuarios'), nuevoUsuario);

    console.log('\n✅ Usuario administrador creado correctamente!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:      ', email);
    console.log('🔑 Contraseña: ', password);
    console.log('👤 Nombre:     ', nombre);
    console.log('🛡️  Rol:        admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('💡 Guarda estas credenciales en un lugar seguro.');
    console.log('💡 Cambia la contraseña desde la web después del primer login.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creando usuario:', error);
    process.exit(1);
  }
}

crearUsuarioAdmin();
