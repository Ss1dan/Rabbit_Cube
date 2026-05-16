const express = require('express');
const router = express.Router();
const controller = require('../controllers/booking.controller');
const authJwt = require('../middlewares/authJwt');

router.post('/', authJwt.verifyToken, controller.createBooking);
router.get('/active', authJwt.verifyToken, controller.getActiveBooking);

module.exports = router;