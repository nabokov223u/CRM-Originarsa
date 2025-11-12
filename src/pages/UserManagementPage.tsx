import { useState, FormEvent } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Layout } from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import app from '../lib/firebase';

interface NewUser {
  email: string;
  password: string;
  role: 'admin' | 'vendedor';
  displayName: string;
}

export function UserManagementPage() {
  const { user } = useAuth();
  const [newUser, setNewUser] = useState<NewUser>({
    email: '',
    password: '',
    role: 'vendedor',
    displayName: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Llamar a la Cloud Function para crear usuario
      const functions = getFunctions(app);
      const createUser = httpsCallable(functions, 'createUser');
      
      const result = await createUser(newUser);
      const data = result.data as any;

      setMessage({ type: 'success', text: data.message || `Usuario ${newUser.email} creado exitosamente` });
      
      // Limpiar formulario
      setNewUser({
        email: '',
        password: '',
        role: 'vendedor',
        displayName: ''
      });
    } catch (error: any) {
      console.error('Error creando usuario:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Error al crear usuario. Intenta de nuevo.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Gestión de Usuarios</h1>
          <p className="text-slate-400">Crea y administra cuentas de acceso al CRM</p>
        </div>

        {/* Formulario de crear usuario */}
        <Card className="backdrop-blur-xl bg-white/5 border border-white/10 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Crear Nuevo Usuario</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
              <div className={`p-4 rounded-xl border ${
                message.type === 'success' 
                  ? 'bg-green-500/10 border-green-500/20 text-green-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                <p className="text-sm">{message.text}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nombre Completo
                </label>
                <Input
                  type="text"
                  value={newUser.displayName}
                  onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })}
                  placeholder="Juan Pérez"
                  required
                  disabled={loading}
                  className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="usuario@originarsa.com"
                  required
                  disabled={loading}
                  className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Contraseña
                </label>
                <Input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  disabled={loading}
                  className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Rol
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'vendedor' })}
                  disabled={loading}
                  className="w-full px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="vendedor">Vendedor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold"
              >
                {loading ? 'Creando...' : 'Crear Usuario'}
              </Button>
              
              <p className="text-sm text-slate-500">
                El usuario recibirá las credenciales por email
              </p>
            </div>
          </form>
        </Card>

        {/* Información de roles */}
        <Card className="backdrop-blur-xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Permisos por Rol</h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-24 flex-shrink-0">
                <span className="inline-block px-3 py-1 rounded-lg bg-purple-500/20 text-purple-400 text-xs font-semibold">
                  ADMIN
                </span>
              </div>
              <div>
                <p className="text-slate-300 text-sm">
                  Acceso total al sistema: Dashboard, Leads, Clientes, Solicitudes y Gestión de Usuarios
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-24 flex-shrink-0">
                <span className="inline-block px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-semibold">
                  VENDEDOR
                </span>
              </div>
              <div>
                <p className="text-slate-300 text-sm">
                  Acceso a Dashboard y Leads. Puede ver estadísticas y gestionar prospectos.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
