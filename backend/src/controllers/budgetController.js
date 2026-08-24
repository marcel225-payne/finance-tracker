const { Budget, Category, sequelize } = require('@/models');

exports.getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.findAll({ where: { UserId: req.userId } });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.setBudget = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { categoryId, limit, period, alertThreshold } = req.body;

    // Vérifie que la catégorie appartient bien à l'utilisateur
    const category = await Category.findOne({
      where: { id: categoryId, UserId: req.userId },
      transaction: t,
    });

    if (!category) {
      await t.rollback();
      return res.status(404).json({ error: 'Catégorie introuvable' });
    }

    // Cherche un budget existant pour cette catégorie + utilisateur
    let budget = await Budget.findOne({
      where: { UserId: req.userId, CategoryId: categoryId },
      transaction: t,
    });

    if (budget) {
      // Existe déjà -> on met juste à jour le montant
      budget.limit = limit;
      budget.period = period || budget.period;
      await budget.save({ transaction: t });
    } else {
      // N'existe pas -> on crée
      budget = await Budget.create(
        {
          UserId: req.userId,
          CategoryId: categoryId,
          limit,
          period: period || 'monthly',
        },
        { transaction: t }
      );
    }

    // Synchronise le champ budget de la catégorie
    category.budget = limit;
     if (alertThreshold != null) category.alertThreshold = alertThreshold;
    await category.save({ transaction: t });

    await t.commit();
    res.json(budget);
  } catch (err) {
    await t.rollback();
    res.status(400).json({ error: err.message });
  }
};

exports.deleteBudget = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;

    const budget = await Budget.findOne({
      where: { id, UserId: req.userId },
      transaction: t,
    });

    if (!budget) {
      await t.rollback();
      return res.status(404).json({ error: 'Budget introuvable' });
    }

    const category = await Category.findOne({
      where: { id: budget.CategoryId, UserId: req.userId },
      transaction: t,
    });

    await budget.destroy({ transaction: t });

    if (category) {
      category.budget = null;
      await category.save({ transaction: t });
    }

    await t.commit();
    res.json({ message: 'Budget supprimé' });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
};