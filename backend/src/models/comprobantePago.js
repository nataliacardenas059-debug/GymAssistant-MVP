const mongoose = require('mongoose');
const comprobantePagoSchema = new mongoose.Schema({
  personaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Persona', required: true, index: true },
  nombre_archivo: { type: String, required: true, trim: true },
  tipo_mime: { type: String, required: true, enum: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'] },
  contenido: { type: String, required: true },
  observacion: { type: String, trim: true, maxlength: 500, default: '' },
  estado: { type: String, enum: ['pendiente', 'revisado'], default: 'pendiente' }
}, { timestamps: true });
module.exports = mongoose.model('ComprobantePago', comprobantePagoSchema, 'comprobantes_pago');
