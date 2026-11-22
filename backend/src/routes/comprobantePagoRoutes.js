const router = require('express').Router();
const c = require('../controllers/comprobantePagoController');
router.get('/', c.listar);
router.post('/', c.subir);
router.get('/:id', c.ver);
router.patch('/:id/revisado', c.marcarRevisado);
module.exports = router;
