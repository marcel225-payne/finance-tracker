const express = require('express');
const cors = require('cors');
const authRoutes = require('@/routes/authRoutes');
const categoryRoutes = require('@/routes/categoryRoutes');
const transactionRoutes = require('@/routes/transactionRoutes');
const notificationRoutes = require('@/routes/notificationRoutes'); // 🆕

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/notifications', notificationRoutes); // 🆕

app.get('/', (req, res) => res.json({ message: 'API Finance Tracker opérationnelle' }));

module.exports = app;