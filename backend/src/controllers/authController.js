const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('@/models');
const { sendResetCodeEmail } = require('@/config/mailer');

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

//  génère un code à 6 chiffres, l'enregistre avec une expiration de 10 min, et l'envoie par email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
 
    // Pour ne pas révéler si un email existe en base ou non (sécurité), on répond pareil dans tous les cas
    if (!user) {
      return res.json({ message: 'Si ce compte existe, un code a été envoyé par email.' });
    }
 
    const code = String(Math.floor(100000 + Math.random() * 900000)); // code à 6 chiffres
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // valide 10 minutes
 
    user.resetCode = code;
    user.resetCodeExpiry = expiry;
    await user.save();
 
    await sendResetCodeEmail(user.email, code);
 
    res.json({ message: 'Si ce compte existe, un code a été envoyé par email.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
 
// Étape 2 : vérifie le code saisi, et si valide, délivre un token temporaire de réinitialisation
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ where: { email } });
 
    if (!user || !user.resetCode || !user.resetCodeExpiry) {
      return res.status(400).json({ error: 'Code invalide ou expiré.' });
    }
    if (user.resetCode !== code) {
      return res.status(400).json({ error: 'Code incorrect.' });
    }
    if (new Date() > new Date(user.resetCodeExpiry)) {
      return res.status(400).json({ error: "Ce code a expiré, merci d'en redemander un." });
    }
 
    // Token temporaire (10 min) prouvant que le code a bien été vérifié — nécessaire pour l'étape suivante
    const resetToken = jwt.sign({ id: user.id, purpose: 'password_reset' }, process.env.JWT_SECRET, {
      expiresIn: '10m',
    });
 
    res.json({ resetToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
 
// Étape 3 : vérifie le token temporaire (preuve que le code a été validé) et enregistre le nouveau mot de passe
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
 
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ error: 'Session expirée, merci de recommencer.' });
    }
    if (decoded.purpose !== 'password_reset') {
      return res.status(401).json({ error: 'Token invalide.' });
    }
 
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé.' });
 
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetCode = null;
    user.resetCodeExpiry = null;
    await user.save();
 
    res.json({ message: 'Mot de passe réinitialisé avec succès.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};