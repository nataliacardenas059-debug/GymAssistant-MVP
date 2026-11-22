import { useEffect, useState } from 'react';
import { obtenerAforo } from './authService';

export default function MiAforo() {
  const [aforo, setAforo] = useState(null);
  const [error, setError] = useState('');
  const CAPACIDAD = 30;

  useEffect(() => {
    let activo = true;
    const cargar = async () => {
      try { const datos = await obtenerAforo(); if (activo) { setAforo(datos); setError(''); } }
      catch (e) { if (activo) setError(e.message || 'No fue posible consultar el aforo.'); }
    };
    cargar();
    const intervalo = setInterval(cargar, 10000);
    return () => { activo = false; clearInterval(intervalo); };
  }, []);

  const total = aforo?.total ?? 0;
  const capacidad = aforo?.capacidad || CAPACIDAD;
  const disponibles = Math.max(0, capacidad - total);
  const porcentaje = Math.min(100, (total / capacidad) * 100);
  const nivel = porcentaje >= 90 ? 'alto' : porcentaje >= 65 ? 'medio' : 'bajo';

  return <section className="mi-aforo-panel">
    <div className="mi-aforo-hero"><div><span className="mi-aforo-eyebrow">INFORMACIÓN EN TIEMPO REAL</span><h2>Estado del gimnasio</h2><p>Consulta la ocupación actual antes de dirigirte a entrenar.</p></div><div className="mi-aforo-hero-icon"><i className="bi bi-people-fill"></i></div></div>
    {error && <div className="alert alert-danger">{error}</div>}
    {!aforo && !error ? <div className="acc-card">Consultando el aforo...</div> : <>
      <div className="mi-aforo-metricas">
        <article className="mi-aforo-metrica"><span className="mi-aforo-icono azul"><i className="bi bi-person-standing"></i></span><div><small>Personas dentro</small><strong>{total}</strong><span>Ocupación actual</span></div></article>
        <article className="mi-aforo-metrica"><span className="mi-aforo-icono verde"><i className="bi bi-door-open"></i></span><div><small>Espacios disponibles</small><strong>{disponibles}</strong><span>De {capacidad} espacios</span></div></article>
        <article className="mi-aforo-metrica"><span className="mi-aforo-icono naranja"><i className="bi bi-building"></i></span><div><small>Capacidad máxima</small><strong>{capacidad}</strong><span>Capacidad configurada</span></div></article>
      </div>
      <article className="mi-aforo-progreso"><div className="mi-aforo-progreso-top"><div><small>NIVEL DE OCUPACIÓN</small><h3>Así está el gimnasio ahora</h3></div><strong>{porcentaje.toFixed(0)}%</strong></div><div className="progress" role="progressbar" aria-label="Porcentaje de ocupación" aria-valuenow={porcentaje} aria-valuemin="0" aria-valuemax="100"><div className={`progress-bar aforo-${nivel}`} style={{width:`${porcentaje}%`}}></div></div><div className="mi-aforo-leyenda"><span><i className="punto-verde"></i>Disponibilidad {nivel === 'bajo' ? 'alta' : nivel === 'medio' ? 'moderada' : 'limitada'}</span><span>Actualización automática cada 10 segundos</span></div></article>
      <div className="mi-aforo-nota"><i className="bi bi-info-circle-fill"></i><p>El aforo se actualiza automáticamente con los registros de entrada y salida realizados en recepción.</p></div>
    </>}
  </section>;
}
