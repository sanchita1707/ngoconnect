const express = require('express');
const router = express.Router();
const { getNGOs, getNGOById } = require('../controllers/ngoController');

router.get('/', getNGOs);
router.get('/:id', getNGOById);

module.exports = router;
