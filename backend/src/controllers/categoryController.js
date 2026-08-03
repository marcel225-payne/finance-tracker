const { Category, Transaction } = require('@/models');

// GET /api/categories — renvoie uniquement les catégories de l'utilisateur connecté
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({ where: { UserId: req.userId } });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/categories — crée une catégorie pour l'utilisateur connecté
exports.createCategory = async (req, res) => {
  try {
    const { name, type, icon, color } = req.body;
    const category = await Category.create({
      name,
      type,
      icon,
      color,
      UserId: req.userId, // 🔒 rattache automatiquement la catégorie à l'utilisateur connecté
    });
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PATCH /api/categories/:id/budget — définit ou modifie le budget d'une catégorie
exports.updateCategoryBudget = async (req, res) => {
  try {
    const { budget, alertThreshold } = req.body;
    // 🔒 le where inclut UserId : impossible de modifier le budget de la catégorie de quelqu'un d'autre
    const category = await Category.findOne({ where: { id: req.params.id, UserId: req.userId } });
    if (!category) return res.status(404).json({ error: 'Catégorie non trouvée' });

    category.budget = budget;
    if (alertThreshold !== undefined) category.alertThreshold = alertThreshold;
    await category.save();

    res.json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/categories/:id/budget — retire le budget (la catégorie reste)
exports.deleteCategoryBudget = async (req, res) => {
  try {
    const category = await Category.findOne({ where: { id: req.params.id, UserId: req.userId } });
    if (!category) return res.status(404).json({ error: 'Catégorie non trouvée' });

    category.budget = null;
    category.alertThreshold = null;
    await category.save();

    res.json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/categories/:id — supprime la catégorie ET ses transactions liées
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ where: { id: req.params.id, UserId: req.userId } });
    if (!category) return res.status(404).json({ error: 'Catégorie non trouvée' });

    // Supprime d'abord les transactions liées (pas de CASCADE configuré au niveau DB pour ce lien)
    await Transaction.destroy({ where: { CategoryId: category.id, UserId: req.userId } });
    await category.destroy();

    res.json({ message: 'Catégorie et transactions associées supprimées' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};