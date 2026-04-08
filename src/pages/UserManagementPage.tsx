import { useState, useEffect, FormEvent } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import app from '../lib/firebase';

interface NewUser {
  email: string;
  password: string;
  role: 'admin' | 'vendedor';
  displayName: string;
}

interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  disabled: boolean;
  customClaims: Record<string, any>;
  lastSignIn: string | null;
  createdAt: string | null;
}

export function UserManagementPage() {
  const [newUser, setNewUser] = useState<NewUser>({
    email: '',
    password: '',
    role: 'vendedor',
    displayName: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Estado para usuarios activos
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'vendedor'>('vendedor');
  const [savingUser, setSavingUser] = useState(false);
  const [userMessage, setUserMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const functions_instance = getFunctions(app);

  // Cargar lista de usuarios al montar
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const listFn = httpsCallable(functions_instance, 'listUsers');
      const result = await listFn({});
      const data = result.data as { users: AuthUser[] };
      setUsers(data.users);
    } catch (error: any) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const createUser = httpsCallable(functions_instance, 'createUser');
      const result = await createUser(newUser);
      const data = result.data as any;

      setMessage({ type: 'success', text: data.message || `Usuario ${newUser.email} creado exitosamente` });
      setNewUser({ email: '', password: '', role: 'vendedor', displayName: '' });
      loadUsers(); // Recargar lista
    } catch (error: any) {
      console.error('Error creando usuario:', error);
      setMessage({ type: 'error', text: error.message || 'Error al crear usuario. Intenta de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (user: AuthUser) => {
    setEditingUser(user.uid);
    setEditName(user.displayName);
    setEditRole(user.customClaims?.admin ? 'admin' : 'vendedor');
    setUserMessage(null);
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setEditName('');
    setUserMessage(null);
  };

  const saveUser = async (user: AuthUser) => {
    setSavingUser(true);
    setUserMessage(null);
    try {
      // Actualizar displayName si cambió
      if (editName !== user.displayName) {
        const updateNameFn = httpsCallable(functions_instance, 'updateUserDisplayName');
        await updateNameFn({ email: user.email, displayName: editName });
      }

      // Actualizar rol si cambió
      const currentRole = user.customClaims?.admin ? 'admin' : 'vendedor';
      if (editRole !== currentRole) {
        const updateRoleFn = httpsCallable(functions_instance, 'updateUserRole');
        await updateRoleFn({ uid: user.uid, role: editRole });
      }

      setUserMessage({ type: 'success', text: `Usuario ${user.email} actualizado` });
      setEditingUser(null);
      loadUsers(); // Recargar lista
    } catch (error: any) {
      console.error('Error actualizando usuario:', error);
      setUserMessage({ type: 'error', text: error.message || 'Error al actualizar' });
    } finally {
      setSavingUser(false);
    }
  };

  const getRoleBadge = (claims: Record<string, any>) => {
    if (claims?.admin) {
      return (
        <span className="inline-block px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-400 text-xs font-semibold">
          ADMIN
        </span>
      );
    }
    if (claims?.vendedor) {
      return (
        <span className="inline-block px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-semibold">
          VENDEDOR
        </span>
      );
    }
    return (
      <span className="inline-block px-2 py-0.5 rounded-lg bg-slate-500/20 text-slate-400 text-xs font-semibold">
        SIN ROL
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Gestión de Usuarios</h1>
          <p className="text-slate-400">Crea y administra cuentas de acceso al CRM</p>
        </div>

        {/* Usuarios Activos */}
        <Card className="backdrop-blur-xl bg-white/5 border border-white/10 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Usuarios Activos</h2>
            <Button onClick={loadUsers} variant="secondary" className="text-xs px-3 py-1">
              {loadingUsers ? 'Cargando...' : '🔄 Recargar'}
            </Button>
          </div>

          {userMessage && (
            <div className={`p-3 rounded-xl border mb-4 ${
              userMessage.type === 'success'
                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              <p className="text-sm">{userMessage.text}</p>
            </div>
          )}

          {loadingUsers ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
              <p className="text-slate-400 text-sm">Cargando usuarios...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-3 text-slate-400 font-medium">Nombre</th>
                    <th className="text-left py-3 px-3 text-slate-400 font-medium">Email</th>
                    <th className="text-left py-3 px-3 text-slate-400 font-medium">Rol</th>
                    <th className="text-left py-3 px-3 text-slate-400 font-medium">Último acceso</th>
                    <th className="text-right py-3 px-3 text-slate-400 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.uid} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3">
                        {editingUser === u.uid ? (
                          <Input
                            type="text"
                            value={editName}
                            onChange={(v) => setEditName(v)}
                            className="bg-slate-800/50 border-slate-700/50 text-white text-sm py-1"
                          />
                        ) : (
                          <span className={`font-medium ${u.displayName ? 'text-white' : 'text-slate-500 italic'}`}>
                            {u.displayName || '(sin nombre)'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-300">{u.email}</td>
                      <td className="py-3 px-3">
                        {editingUser === u.uid ? (
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value as 'admin' | 'vendedor')}
                            className="px-2 py-1 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white text-xs"
                          >
                            <option value="vendedor">Vendedor</option>
                            <option value="admin">Administrador</option>
                          </select>
                        ) : (
                          getRoleBadge(u.customClaims)
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-xs">
                        {u.lastSignIn ? new Date(u.lastSignIn).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Nunca'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {editingUser === u.uid ? (
                          <div className="flex gap-2 justify-end">
                            <Button
                              onClick={() => saveUser(u)}
                              disabled={savingUser}
                              className="text-xs px-3 py-1 bg-green-600 hover:bg-green-700 text-white"
                            >
                              {savingUser ? '...' : 'Guardar'}
                            </Button>
                            <Button
                              onClick={cancelEdit}
                              variant="secondary"
                              className="text-xs px-3 py-1"
                            >
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => startEdit(u)}
                            variant="secondary"
                            className="text-xs px-3 py-1"
                          >
                            ✏️ Editar
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

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
                  onChange={(value) => setNewUser({ ...newUser, displayName: value })}
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
                  onChange={(value) => setNewUser({ ...newUser, email: value })}
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
                  onChange={(value) => setNewUser({ ...newUser, password: value })}
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
  );
}
