'use client';

import { useState, useEffect } from 'react';
import { Users, Shield, Activity, ArrowLeft, CheckCircle, XCircle, Clock, UserPlus, X, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TableSkeleton } from '@/components/Skeleton';

interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: string;
  activo: boolean;
  creado_en: string;
  ultimo_acceso: string | null;
}

interface LogAcceso {
  id: string;
  usuario_id: string;
  email: string;
  nombre: string;
  rol: string;
  fecha: string;
  ip: string;
  navegador: string;
  exito: boolean;
  tipo?: string;
  motivo?: string;
}

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [logs, setLogs] = useState<LogAcceso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vistaActiva, setVistaActiva] = useState<'usuarios' | 'logs'>('usuarios');
  const router = useRouter();

  // Estados para crear usuario
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    email: '',
    password: '',
    nombre: '',
    rol: 'usuario'
  });
  const [creandoUsuario, setCreandoUsuario] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);

  // Paginación
  const [paginaUsuarios, setPaginaUsuarios] = useState(1);
  const [paginaLogs, setPaginaLogs] = useState(1);
  const itemsPorPagina = 10;

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');

      // Cargar usuarios
      const usuariosRes = await fetch('/api/admin/usuarios');
      const usuariosData = await usuariosRes.json();

      if (!usuariosData.success) {
        if (usuariosData.error === 'No autorizado') {
          setError('Acceso denegado: Solo administradores');
          return;
        }
        throw new Error(usuariosData.error);
      }

      setUsuarios(usuariosData.usuarios);

      // Cargar logs
      const logsRes = await fetch('/api/admin/logs');
      const logsData = await logsRes.json();

      if (logsData.success) {
        setLogs(logsData.logs);
      }
    } catch (err) {
      setError('Error cargando datos: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return 'Nunca';
    const d = new Date(fecha);
    return d.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calcular items paginados
  const usuariosPaginados = usuarios.slice(
    (paginaUsuarios - 1) * itemsPorPagina,
    paginaUsuarios * itemsPorPagina
  );

  const logsPaginados = logs.slice(
    (paginaLogs - 1) * itemsPorPagina,
    paginaLogs * itemsPorPagina
  );

  const totalPaginasUsuarios = Math.ceil(usuarios.length / itemsPorPagina);
  const totalPaginasLogs = Math.ceil(logs.length / itemsPorPagina);

  const Paginacion = ({
    paginaActual,
    totalPaginas,
    onCambiarPagina
  }: {
    paginaActual: number;
    totalPaginas: number;
    onCambiarPagina: (pagina: number) => void;
  }) => {
    if (totalPaginas <= 1) return null;

    return (
      <div className="flex items-center justify-between px-6 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Página {paginaActual} de {totalPaginas}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onCambiarPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
            className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300
                     hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors flex items-center space-x-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>
          <button
            onClick={() => onCambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
            className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300
                     hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors flex items-center space-x-1"
          >
            <span>Siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorFormulario('');

    // Validaciones
    if (!nuevoUsuario.email || !nuevoUsuario.password || !nuevoUsuario.nombre) {
      setErrorFormulario('Todos los campos son obligatorios');
      return;
    }

    if (nuevoUsuario.password.length < 6) {
      setErrorFormulario('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setCreandoUsuario(true);

    try {
      const response = await fetch('/api/admin/crear-usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoUsuario)
      });

      const data = await response.json();

      if (data.success) {
        // Resetear formulario
        setNuevoUsuario({
          email: '',
          password: '',
          nombre: '',
          rol: 'usuario'
        });
        setMostrarPassword(false);
        setMostrarFormulario(false);
        // Recargar usuarios
        cargarDatos();
      } else {
        setErrorFormulario(data.error || 'Error al crear usuario');
      }
    } catch (err) {
      setErrorFormulario('Error de conexión');
    } finally {
      setCreandoUsuario(false);
    }
  };

  if (error && error.includes('Acceso denegado')) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-2xl mx-auto text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Acceso Denegado
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Esta página es solo para administradores
          </p>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400
                     hover:text-blue-700 dark:hover:text-blue-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al inicio</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
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
            <Shield className="w-8 h-8 text-green-600 dark:text-green-500" />
            <span>Gestión de Usuarios</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Panel de administración
          </p>
        </div>

        {/* Tabs y botón crear usuario */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setVistaActiva('usuarios')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                vistaActiva === 'usuarios'
                  ? 'bg-green-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Usuarios ({usuarios.length})</span>
            </button>
            <button
              onClick={() => setVistaActiva('logs')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                vistaActiva === 'logs'
                  ? 'bg-green-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Logs de Acceso ({logs.length})</span>
            </button>
          </div>

          {vistaActiva === 'usuarios' && (
            <button
              onClick={() => setMostrarFormulario(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium bg-blue-600 text-white
                       hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Nuevo Usuario</span>
            </button>
          )}
        </div>

        {loading ? (
          <TableSkeleton rows={5} columns={vistaActiva === 'usuarios' ? 6 : 6} />
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                        text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : (
          <>
            {/* Vista de Usuarios */}
            {vistaActiva === 'usuarios' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Usuario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Rol
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Último Acceso
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Creado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {usuariosPaginados.map((usuario) => (
                        <tr key={usuario.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {usuario.nombre}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {usuario.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              usuario.rol === 'admin'
                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                            }`}>
                              {usuario.rol}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {usuario.activo ? (
                              <span className="inline-flex items-center space-x-1 text-green-600 dark:text-green-400">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-xs font-medium">Activo</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 text-red-600 dark:text-red-400">
                                <XCircle className="w-4 h-4" />
                                <span className="text-xs font-medium">Inactivo</span>
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {formatearFecha(usuario.ultimo_acceso)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {formatearFecha(usuario.creado_en)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Paginacion
                  paginaActual={paginaUsuarios}
                  totalPaginas={totalPaginasUsuarios}
                  onCambiarPagina={setPaginaUsuarios}
                />
              </div>
            )}

            {/* Vista de Logs */}
            {vistaActiva === 'logs' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Usuario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          IP
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {logsPaginados.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2 text-sm text-gray-900 dark:text-white">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span>{formatearFecha(log.fecha)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {log.nombre}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {log.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {log.tipo === 'cambio_password' ? 'Cambio Password' : 'Login'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {log.exito ? (
                              <span className="inline-flex items-center space-x-1 text-green-600 dark:text-green-400">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-xs font-medium">Exitoso</span>
                              </span>
                            ) : (
                              <div>
                                <span className="inline-flex items-center space-x-1 text-red-600 dark:text-red-400">
                                  <XCircle className="w-4 h-4" />
                                  <span className="text-xs font-medium">Fallido</span>
                                </span>
                                {log.motivo && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {log.motivo}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {log.ip}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Paginacion
                  paginaActual={paginaLogs}
                  totalPaginas={totalPaginasLogs}
                  onCambiarPagina={setPaginaLogs}
                />
              </div>
            )}
          </>
        )}

        {/* Modal Crear Usuario */}
        {mostrarFormulario && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                  <span>Nuevo Usuario</span>
                </h3>
                <button
                  onClick={() => {
                    setMostrarFormulario(false);
                    setErrorFormulario('');
                    setMostrarPassword(false);
                    setNuevoUsuario({
                      email: '',
                      password: '',
                      nombre: '',
                      rol: 'usuario'
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Formulario */}
              <form onSubmit={handleCrearUsuario} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={nuevoUsuario.nombre}
                    onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nombre del usuario"
                    disabled={creandoUsuario}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={nuevoUsuario.email}
                    onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="correo@ejemplo.com"
                    disabled={creandoUsuario}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={mostrarPassword ? 'text' : 'password'}
                      value={nuevoUsuario.password}
                      onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Mínimo 6 caracteres"
                      disabled={creandoUsuario}
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarPassword(!mostrarPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600
                               dark:hover:text-gray-300 transition-colors"
                      disabled={creandoUsuario}
                    >
                      {mostrarPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rol
                  </label>
                  <select
                    value={nuevoUsuario.rol}
                    onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={creandoUsuario}
                  >
                    <option value="usuario">Usuario</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                {errorFormulario && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                                text-red-600 dark:text-red-400 px-3 py-2 rounded-lg text-sm">
                    {errorFormulario}
                  </div>
                )}

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarFormulario(false);
                      setErrorFormulario('');
                      setMostrarPassword(false);
                      setNuevoUsuario({
                        email: '',
                        password: '',
                        nombre: '',
                        rol: 'usuario'
                      });
                    }}
                    disabled={creandoUsuario}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700
                             transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creandoUsuario}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                             transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creandoUsuario ? 'Creando...' : 'Crear Usuario'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
