'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CambiarPasswordPage() {
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setExito(false);

    // Validaciones
    if (nuevaPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/cambiar-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nuevaPassword })
      });

      const data = await response.json();

      if (data.success) {
        setExito(true);
        setNuevaPassword('');
        setConfirmarPassword('');
        // Redirigir después de 2 segundos
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setError(data.error || 'Error al cambiar contraseña');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400
                     hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al inicio</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
            <KeyRound className="w-8 h-8 text-green-600 dark:text-green-500" />
            <span>Cambiar Contraseña</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Actualiza tu contraseña de acceso
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="nuevaPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Nueva Contraseña
              </label>
              <input
                id="nuevaPassword"
                type="password"
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                placeholder="Introduce tu nueva contraseña"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-green-500 focus:border-transparent
                         disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || exito}
                required
                autoFocus
                minLength={6}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Mínimo 6 caracteres
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmarPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Confirmar Nueva Contraseña
              </label>
              <input
                id="confirmarPassword"
                type="password"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                placeholder="Repite tu nueva contraseña"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-green-500 focus:border-transparent
                         disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || exito}
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                            text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {exito && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800
                            text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
                Contraseña actualizada correctamente. Redirigiendo...
              </div>
            )}

            <button
              type="submit"
              disabled={loading || exito}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4
                       rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Actualizando...' : exito ? 'Contraseña Actualizada' : 'Actualizar Contraseña'}
            </button>
          </form>
        </div>

        {/* Información de seguridad */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800
                      text-blue-800 dark:text-blue-300 px-4 py-3 rounded-lg text-sm">
          <p className="font-medium mb-2">Consejos de seguridad:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Usa una contraseña única que no utilices en otros sitios</li>
            <li>Combina letras, números y símbolos para mayor seguridad</li>
            <li>No compartas tu contraseña con nadie</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
