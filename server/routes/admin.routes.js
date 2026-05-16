const express = require('express');
const router = express.Router();
const controller = require('../controllers/admin.controller');
const authJwt = require('../middlewares/authJwt');

router.use(authJwt.verifyToken, authJwt.isAdmin);

router.get('/users', controller.getAllUsers);
router.post('/booking', controller.createBookingForUser);
router.put('/booking/:id/cancel', controller.cancelAnyBooking);
router.put('/price', controller.updatePrice);
router.put('/kitchen', controller.updateKitchenItem);
router.get('/free-computers', controller.getFreeComputers);

module.exports = router;