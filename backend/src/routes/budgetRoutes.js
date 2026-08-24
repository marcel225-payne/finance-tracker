const express = require('express');
const router = express.Router();
const auth = require('@/middleware/auth');
const budgetController = require('@/controllers/budgetController');
const { getBudgets, setBudget, deleteBudget } = require('@/controllers/budgetController');

router.use(auth);
router.get('/', getBudgets);
router.post('/', setBudget);
router.delete('/api/budgets/:id', auth,budgetController.deleteBudget);
router.delete('/:id', deleteBudget);

module.exports = router;