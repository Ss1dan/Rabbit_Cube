const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth.controller');
const verifySignUp = require('../middlewares/verifySignUp');

router.post('/signup', [verifySignUp.checkDuplicateUsernameOrEmail, verifySignUp.checkRolesExisted], controller.signup);
router.post('/signin', controller.signin);
router.post('/confirm', controller.confirmEmail);
router.post('/google', controller.googleAuth);
router.post('/forgot', controller.forgotPassword);
router.post('/reset', controller.resetPassword);

module.exports = router;