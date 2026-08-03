const express = require('express');
const router = express.Router();
const auth = require('@/middleware/auth');
const {
  getCategories,
  createCategory,
  updateCategoryBudget,
  deleteCategoryBudget,
  deleteCategory,
} = require('@/controllers/categoryController');

// Toutes les routes ci-dessous nécessitent d'être connecté (vérifie le token JWT)
router.use(auth);

router.get('/', getCategories);
router.post('/', createCategory);
router.patch('/:id/budget', updateCategoryBudget);
router.delete('/:id/budget', deleteCategoryBudget);
router.delete('/:id', deleteCategory);

module.exports = router;