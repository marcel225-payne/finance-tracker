const { Transaction } = require('@/models');

// GET /api/transactions — renvoie uniquement les transactions de l'utilisateur connecté
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { UserId: req.userId },
      order: [['date', 'DESC']],
    });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/transactions — crée une transaction pour l'utilisateur connecté
exports.createTransaction = async (req, res) => {
  try {
    const { amount, type, description, date, categoryId } = req.body;
    const transaction = await Transaction.create({
      amount,
      type,
      description,
      date: date || new Date(),
      UserId: req.userId, // 🔒 rattache automatiquement à l'utilisateur connecté
      CategoryId: categoryId,
    });
    res.status(201).json(transaction);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/transactions/:id — supprime une transaction (uniquement si elle appartient à l'utilisateur)
exports.deleteTransaction = async (req, res) => {
  try {
    // 🔒 le where inclut UserId : impossible de supprimer la transaction de quelqu'un d'autre
    const transaction = await Transaction.findOne({ where: { id: req.params.id, UserId: req.userId } });
    if (!transaction) return res.status(404).json({ error: 'Transaction non trouvée' });

    await transaction.destroy();
    res.json({ message: 'Transaction supprimée' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};