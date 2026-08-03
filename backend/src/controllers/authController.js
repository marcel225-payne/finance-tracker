const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('@/models');

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token, // 
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    //  Message  si l'email existe déjà (contrainte unique Sequelize)
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Cet email est déjà utilisé.' });
    }
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Mot de passe incorrect' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};