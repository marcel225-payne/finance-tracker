const express = require('express');
const router = express.Router();
const auth = require('@/middleware/auth');
const {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} = require('@/controllers/notificationController');

// 🔒 Toutes les routes ci-dessous nécessitent d'être connecté
router.use(auth);

router.get('/', getNotifications);
router.post('/', createNotification);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);
router.delete('/', clearAllNotifications);

module.exports = router;