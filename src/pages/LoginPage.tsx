import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Si el usuario ya está autenticado, redirigir al dashboard
  useEffect(() => {
    if (user) {
      console.log('👤 Usuario ya autenticado, redirigiendo...');
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('🔐 Intentando login con:', email);

    try {
      console.log('🔥 Llamando a login()...');
      await login(email, password);
      console.log('✅ Login exitoso!');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('❌ Error en login:', err);
      if (err.code === 'auth/invalid-credential') {
        setError('Email o contraseña incorrectos');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Demasiados intentos fallidos. Intenta más tarde.');
      } else {
        setError('Error al iniciar sesión. Intenta de nuevo.');
      }
      console.log('Error code:', err.code);
      console.log('Error message:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-4">
      {/* Contenedor del login */}
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex">
          
          {/* Panel Izquierdo - Branding */}
          <div className="hidden md:flex md:w-2/5 bg-primary p-12 flex-col justify-between">
            <div>
              {/* Logo */}
              <img 
                src="/Logos/Logo 3.png" 
                alt="Originarsa" 
                className="h-24 mb-6"
              />
              
              {/* Línea decorativa */}
              <div className="w-16 h-1 bg-secondary mb-8"></div>
              
              {/* Texto de bienvenida */}
              <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                Bienvenido de vuelta
              </h1>
              <p className="text-gray-300 text-lg">
                Plataforma para gestión de leads comerciales B2C
              </p>
            </div>

            {/* Footer del panel */}
            <div className="text-gray-400 text-sm">
              <p>© 2025 Originarsa</p>
              <p className="mt-1">Sistema de Gestión de Clientes</p>
            </div>
          </div>

          {/* Panel Derecho - Formulario */}
          <div className="w-full md:w-3/5 p-12 flex flex-col justify-center">
            {/* Header Mobile - Logo visible solo en móvil */}
            <div className="md:hidden mb-8 text-center">
              <img 
                src="/Logos/Logo 3.png" 
                alt="Originarsa" 
                className="h-12 mx-auto mb-4"
              />
              <h2 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h2>
            </div>

            {/* Título Desktop */}
            <div className="hidden md:block mb-8">
              <h2 className="text-3xl font-bold text-primary mb-2">Iniciar sesión</h2>
              <p className="text-gray-400">Ingresa a tu cuenta para continuar</p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-red-600 text-sm flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Correo electrónico
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="tu@email.com"
                  required
                  disabled={loading}
                  className=""
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contraseña
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  disabled={loading}
                  className=""
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-secondary hover:bg-secondary-hover text-white font-semibold py-3.5 rounded-lg transition-all duration-200 text-base"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Iniciando sesión...
                  </span>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                ¿Problemas para acceder?{' '}
                <button className="text-secondary hover:underline font-medium">
                  Contacta soporte
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
  );
}
