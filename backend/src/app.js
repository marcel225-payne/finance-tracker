const express = require('express');
const cors = require('cors');
const authRoutes = require('@/routes/authRoutes');
const categoryRoutes = require('@/routes/categoryRoutes');
const transactionRoutes = require('@/routes/transactionRoutes');
const notificationRoutes = require('@/routes/notificationRoutes'); 
const budgetRoutes = require('@/routes/budgetRoutes');

const app = express();

app.use(cors({
  origin:  [
    'http://localhost:5173',
    'http://localhost:8081',
    'http://10.0.20.78:8081',
  ],// l'URL de ton frontend en dev (Vite)
  credentials: true,
}))
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/notifications', notificationRoutes); 
app.use('/api/budgets', budgetRoutes);

app.get('/', (req, res) => res.json({ message: 'API Finance Tracker opérationnelle' }));

module.exports = app;