const { Notification } = require('@/models');

// GET /api/notifications — renvoie uniquement les notifications de l'utilisateur connecté
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { UserId: req.userId },
      order: [['createdAt', 'DESC']],
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/notifications — crée une notification pour l'utilisateur connecté
exports.createNotification = async (req, res) => {
  try {
    const { type, title, message, categoryId, monthKey } = req.body;
    const notification = await Notification.create({
      type,
      title,
      message,
      categoryId: categoryId || null,
      monthKey: monthKey || null,
      UserId: req.userId, // 🔒 rattache automatiquement à l'utilisateur connecté
    });
    res.status(201).json(notification);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PATCH /api/notifications/:id/read — marque une notification comme lue
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({ where: { id: req.params.id, UserId: req.userId } });
    if (!notification) return res.status(404).json({ error: 'Notification non trouvée' });

    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PATCH /api/notifications/read-all — marque toutes les notifications comme lues
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.update({ read: true }, { where: { UserId: req.userId } });
    res.json({ message: 'Toutes les notifications ont été marquées comme lues.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/notifications/:id — supprime une notification
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({ where: { id: req.params.id, UserId: req.userId } });
    if (!notification) return res.status(404).json({ error: 'Notification non trouvée' });

    await notification.destroy();
    res.json({ message: 'Notification supprimée' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/notifications — supprime toutes les notifications de l'utilisateur connecté
exports.clearAllNotifications = async (req, res) => {
  try {
    await Notification.destroy({ where: { UserId: req.userId } });
    res.json({ message: 'Toutes les notifications ont été supprimées.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};