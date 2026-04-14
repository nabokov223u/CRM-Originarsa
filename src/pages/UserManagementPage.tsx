import { useState, useEffect, FormEvent } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Users, RefreshCw, Pencil, X, Check, UserPlus, Shield, ShoppingBag, Info } from 'lucide-react';
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
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'vendedor'>('vendedor');
  const [savingUser, setSavingUser] = useState(false);
  const [userMessage, setUserMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const functions_instance = getFunctions(app);

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
      setShowCreateForm(false);
      loadUsers();
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
      if (editName !== user.displayName) {
        const updateNameFn = httpsCallable(functions_instance, 'updateUserDisplayName');
        await updateNameFn({ email: user.email, displayName: editName });
      }
      const currentRole = user.customClaims?.admin ? 'admin' : 'vendedor';
      if (editRole !== currentRole) {
        const updateRoleFn = httpsCallable(functions_instance, 'updateUserRole');
        await updateRoleFn({ uid: user.uid, role: editRole });
      }
      setUserMessage({ type: 'success', text: `Usuario ${user.email} actualizado` });
      setEditingUser(null);
      loadUsers();
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
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200 text-xs font-semibold">
          <Shield className="w-3 h-3" />
          Admin
        </span>
      );
    }
    if (claims?.vendedor) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20 text-xs font-semibold">
          <ShoppingBag className="w-3 h-3" />
          Vendedor
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-200 text-xs font-semibold">
        Sin rol
      </span>
    );
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-primary">Equipo</h2>
            <p className="text-sm text-gray-400">Gestiona los accesos y roles de tu equipo</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadUsers}
            disabled={loadingUsers}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loadingUsers ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-secondary hover:bg-secondary-hover text-white shadow-sm hover:shadow-md transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {(userMessage || message) && (
        <div className={`flex items-center gap-2 p-3.5 rounded-lg border text-sm ${
          (userMessage || message)!.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {(userMessage || message)!.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <X className="w-4 h-4 shrink-0" />}
          {(userMessage || message)!.text}
        </div>
      )}

      {/* Create User Form (collapsible) */}
      {showCreateForm && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Crear Nuevo Usuario</h3>
            <button onClick={() => setShowCreateForm(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Nombre Completo</label>
                <input
                  type="text"
                  value={newUser.displayName}
                  onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })}
                  placeholder="Juan Pérez"
                  required
                  disabled={loading}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="usuario@originarsa.com"
                  required
                  disabled={loading}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Contraseña</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  disabled={loading}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Rol</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'vendedor' })}
                  disabled={loading}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-white focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all disabled:opacity-50"
                >
                  <option value="vendedor">Vendedor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6 pt-5 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-primary hover:bg-primary-hover text-white shadow-sm transition-all disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {loading ? 'Creando...' : 'Crear Usuario'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-5 py-2.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-primary text-sm">Usuarios Activos</h3>
            <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {users.length}
            </span>
          </div>
        </div>

        {loadingUsers ? (
          <div className="flex flex-col items-center justify-center py-16">
            <RefreshCw className="w-6 h-6 text-slate-300 animate-spin mb-3" />
            <p className="text-sm text-slate-400">Cargando usuarios...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Usuario</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rol</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Último acceso</th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.uid} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      {editingUser === u.uid ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="border border-secondary/40 rounded-lg px-3 py-1.5 text-sm text-slate-700 focus:ring-2 focus:ring-secondary/30 focus:border-secondary w-full max-w-[200px]"
                          autoFocus
                        />
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                            {getInitials(u.displayName)}
                          </div>
                          <span className={`font-medium ${u.displayName ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                            {u.displayName || 'Sin nombre'}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{u.email}</td>
                    <td className="px-6 py-4">
                      {editingUser === u.uid ? (
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value as 'admin' | 'vendedor')}
                          className="border border-secondary/40 rounded-lg px-2.5 py-1.5 text-sm text-slate-700 bg-white focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
                        >
                          <option value="vendedor">Vendedor</option>
                          <option value="admin">Administrador</option>
                        </select>
                      ) : (
                        getRoleBadge(u.customClaims)
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {u.lastSignIn ? new Date(u.lastSignIn).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Nunca'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editingUser === u.uid ? (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => saveUser(u)}
                            disabled={savingUser}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary hover:bg-secondary-hover text-white transition-all disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            {savingUser ? '...' : 'Guardar'}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                          >
                            <X className="w-3.5 h-3.5" />
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(u)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Editar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-500">
          {users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Roles Info */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-4 h-4 text-slate-400" />
          <h3 className="font-semibold text-slate-700 text-sm">Permisos por Rol</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-3.5 rounded-lg bg-violet-50/50 border border-violet-100">
            <Shield className="w-4 h-4 text-violet-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-violet-700 mb-0.5">Administrador</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Acceso total: Dashboard, Leads, Clientes, Informes y Gestión de Usuarios
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3.5 rounded-lg bg-secondary/5 border border-secondary/10">
            <ShoppingBag className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-secondary mb-0.5">Vendedor</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Acceso a Dashboard y Leads. Puede ver estadísticas y gestionar prospectos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
