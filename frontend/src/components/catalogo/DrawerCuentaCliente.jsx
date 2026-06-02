import { useState } from 'react';
import { User, Mail, Phone, MapPin, Lock, History, LogOut, Check, ShoppingBag, Eye, EyeOff } from 'lucide-react';

export default function DrawerCuentaCliente({
  isOpen,
  onClose,
  clienteAuth,
  onReorder
}) {
  const { cliente, loading, pedidos, registrar, iniciarSesion, cerrarSesion, actualizarPerfil } = clienteAuth;
  const [activeTab, setActiveTab] = useState('login'); // login | register
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Formulario Auth
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Formulario Perfil
  const [editNombre, setEditNombre] = useState(cliente?.nombre || '');
  const [editTelefono, setEditTelefono] = useState(cliente?.telefono || '');
  const [editDireccion, setEditDireccion] = useState(cliente?.direccion || '');

  // Resetear estados al cambiar de pestaña
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setAuthError(null);
    setEmail('');
    setPassword('');
    setNombre('');
    setTelefono('');
    setDireccion('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setSubmitting(true);
    try {
      await iniciarSesion(email, password);
      setIsEditingProfile(false);
    } catch (err) {
      setAuthError(err.message === 'Invalid login credentials' 
        ? 'Correo o contraseña incorrectos.' 
        : err.message || 'Error al iniciar sesión.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setSubmitting(true);
    try {
      await registrar({ email, password, nombre, telefono, direccion });
      setAuthError(null);
      // Auto login o indicar verificación
      setActiveTab('login');
      setAuthError('¡Registro exitoso! Por favor inicia sesión con tu cuenta.');
    } catch (err) {
      setAuthError(err.message || 'Error al registrar la cuenta.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProfileSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setSubmitting(true);
    try {
      await actualizarPerfil({
        nombre: editNombre,
        telefono: editTelefono,
        direccion: editDireccion
      });
      setIsEditingProfile(false);
    } catch (err) {
      setAuthError('Error al actualizar datos de entrega.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = () => {
    setEditNombre(cliente?.nombre || '');
    setEditTelefono(cliente?.telefono || '');
    setEditDireccion(cliente?.direccion || '');
    setIsEditingProfile(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Fondo Opaco */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white border-l border-[#e5e5e5] shadow-2xl flex flex-col justify-between animate-reveal h-full">
          
          {/* Cabecera del Drawer */}
          <div className="px-6 py-6 border-b border-[#e5e5e5] flex items-center justify-between bg-[#fafafa]">
            <div className="flex items-center gap-3">
              <User size={20} className="text-[#1a1a1a]" />
              <h2 className="font-serif text-xl font-bold text-[#1a1a1a]">
                {cliente ? 'Mi Cuenta' : 'Portal de Clientes'}
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl border border-[#e5e5e5] hover:bg-[#fafafa] text-xs font-medium transition-all"
            >
              Cerrar
            </button>
          </div>

          {/* Contenido Principal */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-none">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <svg className="animate-spin h-6 w-6 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : cliente ? (
              /* ================== VISTA LOGUEADO ================== */
              <div className="space-y-6">
                {/* Perfil del Cliente */}
                <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center text-lg font-bold font-serif italic">
                      {cliente.nombre ? cliente.nombre.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-base text-neutral-900" style={{ color: '#1a1a1a' }}>{cliente.nombre}</h3>
                      <p className="text-xs text-neutral-500 flex items-center gap-1.5 mt-0.5">
                        <Mail size={12} /> {cliente.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Formulario / Información de Entrega */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-[#1a1a1a] uppercase tracking-wider">Datos de Entrega</h3>
                    {!isEditingProfile && (
                      <button 
                        onClick={handleStartEdit}
                        className="text-xs text-black font-semibold hover:underline"
                      >
                        Editar datos
                      </button>
                    )}
                  </div>

                  {isEditingProfile ? (
                    <form onSubmit={handleUpdateProfileSubmit} className="space-y-3.5 bg-[#fafafa] p-4 rounded-2xl border border-[#e5e5e5]/80 animate-reveal">
                      <div className="space-y-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-neutral-600">Nombre Completo</label>
                          <input 
                            type="text" 
                            required
                            value={editNombre}
                            onChange={(e) => setEditNombre(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-[#e5e5e5] rounded-xl text-base md:text-sm text-[#1a1a1a] focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-neutral-600">Teléfono Móvil</label>
                          <input 
                            type="tel" 
                            required
                            value={editTelefono}
                            onChange={(e) => setEditTelefono(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-[#e5e5e5] rounded-xl text-base md:text-sm text-[#1a1a1a] focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-neutral-600">Dirección de Entrega</label>
                          <textarea 
                            rows="2"
                            required
                            value={editDireccion}
                            onChange={(e) => setEditDireccion(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-[#e5e5e5] rounded-xl text-base md:text-sm text-[#1a1a1a] focus:outline-none focus:border-black focus:ring-1 focus:ring-black resize-none"
                            placeholder="Calle, Número, Distrito / Ciudad"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end pt-2">
                        <button 
                          type="button" 
                          onClick={() => setIsEditingProfile(false)}
                          className="px-3.5 py-2 rounded-xl border border-[#e5e5e5] hover:bg-white text-xs font-medium"
                        >
                          Cancelar
                        </button>
                        <button 
                          type="submit" 
                          disabled={submitting}
                          className="px-3.5 py-2 rounded-xl bg-black text-white hover:bg-black/90 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {submitting ? <span>Guardando...</span> : <span>Guardar Cambios</span>}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-2.5 text-sm bg-[#fafafa] p-4 rounded-2xl border border-neutral-100">
                      <div className="flex items-start gap-2.5">
                        <Phone size={14} className="text-neutral-400 mt-1 shrink-0" />
                        <div>
                          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Teléfono de contacto</p>
                          <p className="text-xs font-medium text-[#1a1a1a] mt-0.5">{cliente.telefono || 'Sin registrar'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5 pt-2 border-t border-[#e5e5e5]/40">
                        <MapPin size={14} className="text-neutral-400 mt-1 shrink-0" />
                        <div>
                          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Dirección de entrega</p>
                          <p className="text-xs font-medium text-[#1a1a1a] mt-0.5">{cliente.direccion || 'Sin registrar'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Historial de Pedidos */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2">
                    <History size={16} className="text-[#1a1a1a]" />
                    <h3 className="text-sm font-bold text-[#1a1a1a] uppercase tracking-wider">Historial de Pedidos</h3>
                  </div>

                  {pedidos.length === 0 ? (
                    <div className="text-center py-8 bg-[#fafafa] rounded-2xl border border-neutral-100/50 space-y-2">
                      <p className="text-xs text-neutral-400">Aún no has realizado ningún pedido.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pedidos.map((pedido) => (
                        <div 
                          key={pedido.id} 
                          className="p-4 bg-white rounded-xl border border-neutral-200/70 shadow-xs hover:border-neutral-300 transition-all space-y-3"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-mono text-xs font-bold text-black">{pedido.id}</p>
                              <p className="text-[10px] text-neutral-400 mt-0.5">
                                {new Date(pedido.fecha).toLocaleDateString('es-ES', { 
                                  day: '2-digit', 
                                  month: 'short', 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                            <span className="font-semibold text-xs font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg border border-emerald-100">
                              Enviado
                            </span>
                          </div>

                          <div className="text-xs text-neutral-600 space-y-1 bg-neutral-50 p-2.5 rounded-lg">
                            {pedido.productos.map((prod, pIdx) => (
                              <div key={pIdx} className="flex justify-between">
                                <span className="font-medium">{prod.cantidad}x {prod.nombre}</span>
                                <span className="font-mono text-neutral-500">${(prod.precio * prod.cantidad).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <div className="text-xs font-semibold text-neutral-500">
                              Total: <span className="font-bold text-black font-mono text-sm">${pedido.total.toFixed(2)}</span>
                            </div>
                            <button
                              onClick={() => onReorder(pedido.productos)}
                              className="text-[11px] font-bold text-black border border-black hover:bg-black hover:text-white px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 active:scale-95"
                            >
                              <ShoppingBag size={12} />
                              <span>Reordenar</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ================== VISTA INVITADO (LOGIN/REGISTER) ================== */
              <div className="space-y-6">
                
                {/* Selector de Pestañas (Tabs) */}
                <div className="flex p-1 bg-neutral-100 rounded-xl border border-neutral-200/30">
                  <button
                    onClick={() => handleTabChange('login')}
                    className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg transition-all ${
                      activeTab === 'login' 
                        ? 'bg-white text-black shadow-sm' 
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => handleTabChange('register')}
                    className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg transition-all ${
                      activeTab === 'register' 
                        ? 'bg-white text-black shadow-sm' 
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    Crear Cuenta
                  </button>
                </div>

                {authError && (
                  <div className={`p-3.5 border rounded-xl text-xs text-center leading-relaxed animate-reveal ${
                    authError.includes('exitoso') 
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                      : 'bg-red-50 border-red-100 text-red-600'
                  }`}>
                    {authError}
                  </div>
                )}

                {activeTab === 'login' ? (
                  /* Formulario Iniciar Sesión */
                  <form onSubmit={handleLoginSubmit} className="space-y-4 animate-reveal">
                    <div className="space-y-3.5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[#1a1a1a]">Correo electrónico</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={15} />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="nombre@ejemplo.com"
                            className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-transparent rounded-xl text-base md:text-sm text-[#1a1a1a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all hover:border-[#e5e5e5]"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[#1a1a1a]">Contraseña</label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={15} />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-12 py-3 bg-neutral-50 border border-transparent rounded-xl text-base md:text-sm text-[#1a1a1a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all hover:border-[#e5e5e5]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black focus:outline-none"
                          >
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 bg-black text-white rounded-xl text-xs font-bold hover:bg-black/90 active:scale-[0.98] transition-all disabled:opacity-50 mt-2 shadow-md shadow-black/5"
                    >
                      {submitting ? 'Ingresando...' : 'Entrar a la Cuenta'}
                    </button>
                  </form>
                ) : (
                  /* Formulario Registrarse */
                  <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-reveal">
                    <div className="space-y-3.5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[#1a1a1a]">Nombre Completo</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={15} />
                          <input
                            type="text"
                            required
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Tu nombre y apellido"
                            className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-transparent rounded-xl text-base md:text-sm text-[#1a1a1a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all hover:border-[#e5e5e5]"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[#1a1a1a]">Correo electrónico</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={15} />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="nombre@ejemplo.com"
                            className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-transparent rounded-xl text-base md:text-sm text-[#1a1a1a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all hover:border-[#e5e5e5]"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[#1a1a1a]">Contraseña</label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={15} />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            minLength={6}
                            className="w-full pl-10 pr-12 py-3 bg-neutral-50 border border-transparent rounded-xl text-base md:text-sm text-[#1a1a1a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all hover:border-[#e5e5e5]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a1a1aa] hover:text-[#1a1a1a] transition-colors focus:outline-none"
                          >
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 pt-1.5 border-t border-neutral-100">
                        <label className="text-xs font-semibold text-[#1a1a1a]">Teléfono de entrega</label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={15} />
                          <input
                            type="tel"
                            required
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                            placeholder="Ej. +51 999 999 999"
                            className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-transparent rounded-xl text-base md:text-sm text-[#1a1a1a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all hover:border-[#e5e5e5]"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[#1a1a1a]">Dirección de Entrega</label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-3.5 text-neutral-400" size={15} />
                          <textarea
                            rows="2"
                            required
                            value={direccion}
                            onChange={(e) => setDireccion(e.target.value)}
                            placeholder="Calle, Edificio, Referencia..."
                            className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-transparent rounded-xl text-base md:text-sm text-[#1a1a1a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all hover:border-[#e5e5e5] resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 bg-black text-white rounded-xl text-xs font-bold hover:bg-black/90 active:scale-[0.98] transition-all disabled:opacity-50 mt-2 shadow-md shadow-black/5"
                    >
                      {submitting ? 'Registrando...' : 'Crear Cuenta'}
                    </button>
                  </form>
                )}

              </div>
            )}
          </div>

          {/* Pie del Drawer (Solo logueado) */}
          {cliente && (
            <div className="p-6 border-t border-[#e5e5e5] bg-[#fafafa]">
              <button
                onClick={cerrarSesion}
                className="w-full py-3 border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 hover:border-red-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <LogOut size={14} />
                Cerrar Sesión
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
