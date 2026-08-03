const express = require('express');
const router = express.Router();
const auth = require('@/middleware/auth');
const {
  getTransactions,
  createTransaction,
  deleteTransaction,
} = require('@/controllers/transactionController');

// Toutes les routes ci-dessous nécessitent d'être connecté (vérifie le token JWT)
router.use(auth);

router.get('/', getTransactions);
router.post('/', createTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;