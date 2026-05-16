const express = require('express');
const router = express.Router();
const controller = require('../controllers/user.controller');
const authJwt = require('../middlewares/authJwt');
const upload = require('../middlewares/upload');

router.get('/profile', authJwt.verifyToken, controller.getProfile);
router.put('/profile', authJwt.verifyToken, upload, controller.updateProfile);
router.get('/bookings/history', authJwt.verifyToken, controller.getBookingHistory);
router.put('/bookings/:id/cancel', authJwt.verifyToken, controller.cancelBooking);
router.post('/confirm-email-change', controller.confirmEmailChange);
router.post('/confirm-password-change', controller.confirmPasswordChange);

module.exports = router;