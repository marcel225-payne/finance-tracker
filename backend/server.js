require('module-alias/register'); 

require('dotenv').config();
const app = require('@/app');
const { sequelize } = require('@/models');

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Base de données synchronisée');
    app.listen(PORT, () => console.log(`🚀 Serveur démarré sur le port ${PORT}`));
  })
  .catch((err) => console.error('❌ Erreur de connexion DB:', err));