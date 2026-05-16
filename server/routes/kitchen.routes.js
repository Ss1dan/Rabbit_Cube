const express = require('express');
const router = express.Router();
const controller = require('../controllers/kitchen.controller');

router.get('/', controller.getAllItems);

module.exports = router;