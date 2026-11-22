import { useState } from 'react';
import { useAuth } from './AuthContext';
import { registrarSalida, actualizarPerfil, cambiarPassword } from './authService';
import MiMembresia from './MiMembresia';
import MiAforo from './MiAforo';
import MisIngresos from './MisIngresos';
import ComprobantesPago from '../../components/ComprobantesPago';
import RecursosEntrenamiento from '../../components/RecursosEntrenamiento';
import './acceso.css';

const SECCIONES = [
  { id: 'inicio', etiqueta: 'Inicio', icono: 'bi-house-door' },
  { id: 'membresia', etiqueta: 'Mi Membresía', icono: 'bi-credit-card' },
  { id: 'aforo', etiqueta: 'Aforo', icono: 'bi-people' },
  { id: 'ingresos', etiqueta: 'Mis Ingresos', icono: 'bi-clipboard-data' },
  { id: 'comprobantes', etiqueta: 'Comprobantes', icono: 'bi-receipt' },
  { id: 'rutinas', etiqueta: 'Rutinas y máquinas', icono: 'bi-activity' },
  { id: 'perfil', etiqueta: 'Mi perfil', icono: 'bi-person-circle' },
];

export default function UsuarioPage() {
  const { usuario, salir, entrar } = useAuth();
  const [seccion, setSeccion] = useState('inicio');
  const [oscuro, setOscuro] = useState(false);
  const [recargar, setRecargar] = useState(0);
  const [perfilNombre, setPerfilNombre] = useState(usuario.nombre || '');
  const [perfilCorreo, setPerfilCorreo] = useState(usuario.correo || '');
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [mensajePerfil, setMensajePerfil] = useState('');
  const [errorPerfil, setErrorPerfil] = useState('');
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);

  async function guardarPerfil(evento) {
    evento.preventDefault();
    setMensajePerfil('');
    setErrorPerfil('');
    setGuardandoPerfil(true);
    try {
      const resultado = await actualizarPerfil({ nombre_completo: perfilNombre, correo: perfilCorreo });
      entrar({ ...usuario, nombre: resultado.usuario.nombre, correo: resultado.usuario.correo });
      setMensajePerfil('Tus datos se actualizaron correctamente.');
    } catch (error) {
      setErrorPerfil(error.message);
    } finally {
      setGuardandoPerfil(false);
    }
  }

  async function guardarPassword(evento) {
    evento.preventDefault();
    setMensajePerfil('');
    setErrorPerfil('');
    if (passwordNueva.length < 8) return setErrorPerfil('La nueva contraseña debe tener al menos 8 caracteres.');
    setGuardandoPerfil(true);
    try {
      const resultado = await cambiarPassword(passwordActual, passwordNueva);
      setMensajePerfil(resultado.mensaje);
      setPasswordActual('');
      setPasswordNueva('');
    } catch (error) {
      setErrorPerfil(error.message);
    } finally {
      setGuardandoPerfil(false);
    }
  }

  async function handleSalida() {
    try {
      const res = await registrarSalida();
      alert(res.mensaje || 'Salida registrada');
      setRecargar((n) => n + 1);
    } catch (error) {
      alert(error.message || 'No fue posible registrar la salida.');
    }
  }

  return (
    <div className={`acc-layout ${oscuro ? 'acc-oscuro' : ''}`}>
      <aside className="acc-sidebar">
        <h2 className="acc-brand"><i className="bi bi-heart-pulse-fill" aria-hidden="true"></i><span>GymAssistant</span></h2>

        {SECCIONES.map((s) => (
          <button
            key={s.id}
            className={`acc-nav-btn ${seccion === s.id ? 'activo' : ''}`}
            onClick={() => setSeccion(s.id)}
          >
            <i className={`bi ${s.icono}`} aria-hidden="true"></i>
            <span>{s.etiqueta}</span>
          </button>
        ))}

        <button className="acc-nav-btn" onClick={() => setOscuro((v) => !v)} aria-label={oscuro ? 'Activar modo claro' : 'Activar modo oscuro'}>
          <i className={`bi ${oscuro ? 'bi-sun' : 'bi-moon-stars'}`} aria-hidden="true"></i>
          <span>{oscuro ? 'Modo claro' : 'Modo oscuro'}</span>
        </button>

        <div className="acc-logout">
          <button className="acc-btn-logout" onClick={salir}>
            <i className="bi bi-box-arrow-right me-2" aria-hidden="true"></i>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="acc-main">
        <header className="acc-top">
          <h1>Mi Cuenta</h1>
          <p>
            {usuario.nombre}
            {usuario.tipoPersona && (
              <span className="acc-badge">{usuario.tipoPersona}</span>
            )}
          </p>
        </header>

        {seccion === 'inicio' && (
          <section className="acc-seccion">
            <div className="acc-welcome acc-welcome-v2">
              <div className="acc-welcome-copy"><span className="acc-welcome-kicker">TU ESPACIO FITNESS</span><h2>¡Hola, {usuario.nombre}!</h2>
              <p>Tu próximo entrenamiento empieza con un buen plan. Consulta tus servicios y mantén tu información al día.</p><button className="acc-btn-secondary" onClick={() => setSeccion('rutinas')}>Explorar rutinas <i className="bi bi-arrow-right ms-2"></i></button></div><div className="acc-welcome-art"><i className="bi bi-heart-pulse-fill"></i><span>MUÉVETE A TU RITMO</span></div></div>
            <div className="acc-home-grid"><button className="acc-home-tile" onClick={() => setSeccion('membresia')}><i className="bi bi-credit-card"></i><strong>Mi membresía</strong><span>Consulta tu estado y vigencia</span></button><button className="acc-home-tile" onClick={() => setSeccion('comprobantes')}><i className="bi bi-file-earmark-arrow-up"></i><strong>Comprobantes</strong><span>Sube el soporte de tu pago</span></button><button className="acc-home-tile" onClick={() => setSeccion('rutinas')}><i className="bi bi-activity"></i><strong>Rutinas y máquinas</strong><span>Encuentra ideas para entrenar</span></button><button className="acc-home-tile" onClick={() => setSeccion('perfil')}><i className="bi bi-person-vcard"></i><strong>Mis datos</strong><span>{usuario.tipoPersona || 'Usuario'} · {usuario.correo}</span></button></div><div className="acc-home-footer"><div><strong>¿Terminaste tu sesión?</strong><span>Recuerda registrar tu salida al abandonar el gimnasio.</span></div><button className="btn btn-outline-primary" onClick={handleSalida}><i className="bi bi-box-arrow-right me-2"></i>Registrar salida</button></div>
          </section>
        )}

        {seccion === 'membresia' && (
          <section className="acc-seccion">
            <h2>Mi Membresía</h2>
            <MiMembresia usuarioId={usuario.id} />
          </section>
        )}

        {seccion === 'comprobantes' && <section className="acc-seccion"><h2>Comprobantes de pago</h2><ComprobantesPago /></section>}

        {seccion === 'rutinas' && <section className="acc-seccion"><h2>Rutinas y uso de máquinas</h2><RecursosEntrenamiento /></section>}

        {seccion === 'aforo' && (
          <section className="acc-seccion">
            <h2>Aforo Actual</h2>
            <MiAforo />
          </section>
        )}

        {seccion === 'ingresos' && (
          <section className="acc-seccion">
            <h2>Mis Ingresos</h2>
            <MisIngresos usuarioId={usuario.id} recargar={recargar} />
          </section>
        )}

        {seccion === 'perfil' && (
          <section className="acc-seccion">
            <h2>Mi perfil</h2>
            {mensajePerfil && <div className="alert alert-success">{mensajePerfil}</div>}
            {errorPerfil && <div className="alert alert-danger">{errorPerfil}</div>}
            <div className="row g-4">
              <div className="col-12 col-lg-6">
                <div className="acc-card">
                  <h3>Datos personales</h3>
                  <form onSubmit={guardarPerfil} className="d-grid gap-3">
                    <div><label className="form-label">Nombre completo</label><input className="form-control" value={perfilNombre} onChange={(e) => setPerfilNombre(e.target.value)} required /></div>
                    <div><label className="form-label">Correo institucional</label><input type="email" className="form-control" value={perfilCorreo} onChange={(e) => setPerfilCorreo(e.target.value)} required /></div>
                    <div><label className="form-label">Número de documento</label><input className="form-control" value={usuario.numeroDocumento || ''} disabled /></div>
                    <button className="btn btn-primary" disabled={guardandoPerfil}>Guardar perfil</button>
                  </form>
                </div>
              </div>
              <div className="col-12 col-lg-6">
                <div className="acc-card">
                  <h3>Seguridad</h3>
                  <form onSubmit={guardarPassword} className="d-grid gap-3">
                    <div><label className="form-label">Contraseña actual</label><input type="password" className="form-control" value={passwordActual} onChange={(e) => setPasswordActual(e.target.value)} required /></div>
                    <div><label className="form-label">Nueva contraseña</label><input type="password" className="form-control" minLength="8" value={passwordNueva} onChange={(e) => setPasswordNueva(e.target.value)} required /><div className="form-text">Usa al menos 8 caracteres.</div></div>
                    <button className="btn btn-outline-primary" disabled={guardandoPerfil}>Cambiar contraseña</button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
