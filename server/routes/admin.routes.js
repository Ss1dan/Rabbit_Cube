const express = require('express');
const router = express.Router();
const controller = require('../controllers/admin.controller');
const authJwt = require('../middlewares/authJwt');

router.use(authJwt.verifyToken, authJwt.isAdmin);

// Пользователи
router.get('/users', controller.getAllUsers);
router.post('/users', controller.addUser);
router.put('/users/role', controller.updateUserRole);
router.delete('/users/:id', controller.deleteUser);
router.get('/all-users', controller.getAllUsersFull);

// Кухня
router.post('/kitchen', controller.addKitchenItem);
router.put('/kitchen/:id', controller.updateKitchenItem);
router.delete('/kitchen/:id', controller.deleteKitchenItem);
router.get('/kitchen', controller.getKitchenItems);

// Компьютеры
router.get('/computers', controller.getComputers);
router.put('/computers/:id', controller.updateComputer);
router.get('/computers-paginated', controller.getComputersPaginated);
router.get('/all-computers', controller.getAllComputersFull);

// Брони
router.post('/booking', controller.createBookingForUser);
router.put('/booking/:id/cancel', controller.cancelAnyBooking);
router.post('/activate-booking', controller.activateBooking);
router.get('/pending-bookings', controller.getPendingBookings);
router.get('/active-bookings', controller.getActiveBookings);

module.exports = router;