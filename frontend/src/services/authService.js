import api from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Appelle POST /api/auth/login, sauvegarde le token JWT reçu, renvoie l'utilisateur
export async function loginRequest(email, password) {
  const response = await api.post("/auth/login", { email, password });
  const { token, user } = response.data;
  await AsyncStorage.setItem("token", token);
  return user;
}

// Appelle POST /api/auth/signup, sauvegarde le token JWT reçu (connexion automatique), renvoie l'utilisateur
export async function signupRequest(name, email, password) {
  const response = await api.post("/auth/signup", { name, email, password });
  const { token, user } = response.data;
  if (token) {
    await AsyncStorage.setItem("token", token);
  }
  return user;
}

// Supprime le token local (déconnexion)
export async function logoutRequest() {
  await AsyncStorage.removeItem("token");
}
// demande l'envoi d'un code de vérification par email
export async function forgotPasswordRequest(email) {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
}
 
//  vérifie le code saisi, renvoie un resetToken temporaire si valide
export async function verifyResetCodeRequest(email, code) {
  const response = await api.post("/auth/verify-reset-code", { email, code });
  return response.data; // { resetToken }
}
 
// envoie le nouveau mot de passe avec le resetToken pour finaliser la réinitialisation
export async function resetPasswordRequest(resetToken, newPassword) {
  const response = await api.post("/auth/reset-password", { resetToken, newPassword });
  return response.data;
}