const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  checkEmail,
  resetPasswordSimple,
} = require('@/controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.post('/check-email', checkEmail); // 🆕
router.post('/reset-password', resetPasswordSimple); // 🆕

module.exports = router;