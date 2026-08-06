const nodemailer = require('nodemailer');
require('dotenv').config();

// 🆕 Diagnostic temporaire — à retirer une fois le problème résolu
console.log("=== DIAGNOSTIC MAILER ===");
console.log("GMAIL_USER:", JSON.stringify(process.env.GMAIL_USER));
console.log("GMAIL_APP_PASSWORD length:", process.env.GMAIL_APP_PASSWORD ? process.env.GMAIL_APP_PASSWORD.length : "undefined (variable absente)");
console.log("==========================");

// Transporteur Gmail — utilise un "mot de passe d'application", PAS ton mot de passe Gmail habituel
// (voir les instructions pour le générer : myaccount.google.com/apppasswords)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// 🆕 Vérifie la connexion SMTP dès le démarrage du serveur (avant même qu'un utilisateur clique sur quoi que ce soit)
transporter.verify((err, success) => {
  if (err) {
    console.log("❌ Connexion Gmail ÉCHOUÉE au démarrage :", err.message);
  } else {
    console.log("✅ Connexion Gmail réussie, prêt à envoyer des emails");
  }
});

// Envoie l'email contenant le code de vérification à 6 chiffres
async function sendResetCodeEmail(toEmail, code) {
  try {
    const info = await transporter.sendMail({
      from: `"Finance Tracker" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: 'Code de vérification — Réinitialisation du mot de passe',
      text: `Ton code de vérification est : ${code}\n\nCe code expire dans 10 minutes. Si tu n'es pas à l'origine de cette demande, ignore cet email.`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
          <h2>Réinitialisation de mot de passe</h2>
          <p>Voici ton code de vérification :</p>
          <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px;">${code}</p>
          <p>Ce code expire dans <strong>10 minutes</strong>.</p>
          <p style="color: #888; font-size: 13px;">Si tu n'es pas à l'origine de cette demande, ignore simplement cet email.</p>
        </div>
      `,
    });
    console.log("✅ Email envoyé avec succès :", info.messageId); // 🆕
  } catch (err) {
    console.log("❌ Erreur lors de l'envoi de l'email :", err.message); // 🆕 log explicite de l'erreur réelle
    throw err;
  }
}

module.exports = { sendResetCodeEmail };