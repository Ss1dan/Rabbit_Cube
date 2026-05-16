const express = require('express');
const router = express.Router();
const controller = require('../controllers/computer.controller');

router.get('/', controller.getAllComputers);
router.get('/:id', controller.getComputerById);
router.get('/occupied/slot', controller.getOccupiedForSlot);

module.exports = router;