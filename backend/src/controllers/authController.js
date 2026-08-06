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
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
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

// Étape 1 (version simplifiée) : vérifie juste si l'email existe en base
exports.checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "Aucun compte associé à cet email." });
    }

    res.json({ exists: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Étape 2 (version simplifiée) : change directement le mot de passe (hashé), sans code de vérification
exports.resetPasswordSimple = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "Aucun compte associé à cet email." });
    }

    // Vérifie que le nouveau mot de passe n'est pas identique à l'ancien
    // (bcrypt.compare est le seul moyen de comparer, puisque l'ancien est stocké hashé, jamais en clair)
    const isSameAsOld = await bcrypt.compare(newPassword, user.password);
    if (isSameAsOld) {
      return res.status(400).json({
        error: "Ce mot de passe correspond à ton ancien mot de passe. Choisis-en un différent.",
      });
    }

    // 🔒 Hachage bcrypt, exactement comme à l'inscription
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save(); // ✅ écrit en base de données

    res.json({ message: 'Mot de passe modifié avec succès.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};