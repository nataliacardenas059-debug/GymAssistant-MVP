const ComprobantePago = require('../models/comprobantePago');
const Persona = require('../models/persona');
const MAX_BYTES = 5 * 1024 * 1024;
const TIPOS = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const esRecepcion = (req) => req.usuario?.rol === 'recepcionista';

exports.listar = async (req, res) => {
  try {
    const filtro = esRecepcion(req) ? {} : { personaId: req.usuario._id };
    const docs = await ComprobantePago.find(filtro).populate('personaId', 'nombre_completo numero_documento tipo_persona').select('-contenido').sort({ createdAt: -1 });
    res.json(docs);
  } catch (e) { res.status(500).json({ mensaje: 'No fue posible consultar los comprobantes.' }); }
};

exports.subir = async (req, res) => {
  try {
    const { nombre_archivo, tipo_mime, contenido, observacion = '', personaId } = req.body || {};
    if (!nombre_archivo || !TIPOS.includes(tipo_mime) || typeof contenido !== 'string' || !contenido.startsWith(`data:${tipo_mime};base64,`)) return res.status(400).json({ mensaje: 'Adjunta un PDF o una imagen JPG, PNG o WEBP válida.' });
    const base64 = contenido.split(',')[1] || '';
    const bytes = Buffer.from(base64, 'base64');
    if (!bytes.length || bytes.length > MAX_BYTES) return res.status(400).json({ mensaje: 'El archivo debe pesar máximo 5 MB.' });
    let destinatario = req.usuario._id;
    if (esRecepcion(req) && !personaId) return res.status(400).json({ mensaje: 'Selecciona el estudiante o profesor al que pertenece el comprobante.' });
    if (esRecepcion(req) && personaId) {
      const existe = await Persona.findById(personaId);
      if (!existe || existe.tipo_persona === 'recepcionista') return res.status(404).json({ mensaje: 'Selecciona un usuario válido para asociar el comprobante.' });
      destinatario = existe._id;
    }
    const doc = await ComprobantePago.create({ personaId: destinatario, nombre_archivo: String(nombre_archivo).slice(0, 180), tipo_mime, contenido, observacion: String(observacion).slice(0, 500) });
    res.status(201).json({ mensaje: 'Comprobante cargado correctamente.', comprobante: { _id: doc._id, nombre_archivo: doc.nombre_archivo, tipo_mime: doc.tipo_mime, createdAt: doc.createdAt } });
  } catch (e) { res.status(500).json({ mensaje: 'No fue posible guardar el comprobante.' }); }
};

exports.ver = async (req, res) => {
  try {
    const doc = await ComprobantePago.findById(req.params.id).populate('personaId', 'nombre_completo numero_documento tipo_persona');
    if (!doc) return res.status(404).json({ mensaje: 'Comprobante no encontrado.' });
    if (!esRecepcion(req) && String(doc.personaId?._id) !== String(req.usuario._id)) return res.status(403).json({ mensaje: 'No tienes permiso para ver este comprobante.' });
    res.json({ ...doc.toObject(), contenido: doc.contenido });
  } catch (e) { res.status(400).json({ mensaje: 'Identificador de comprobante inválido.' }); }
};

exports.marcarRevisado = async (req, res) => {
  if (!esRecepcion(req)) return res.status(403).json({ mensaje: 'Solo recepción puede marcar comprobantes como revisados.' });
  try {
    const doc = await ComprobantePago.findByIdAndUpdate(req.params.id, { estado: 'revisado' }, { new: true }).select('-contenido');
    if (!doc) return res.status(404).json({ mensaje: 'Comprobante no encontrado.' });
    res.json({ mensaje: 'Comprobante marcado como revisado.', comprobante: doc });
  } catch (e) { res.status(400).json({ mensaje: 'Identificador inválido.' }); }
};
