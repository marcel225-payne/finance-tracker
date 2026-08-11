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

//Étape 1 (simplifiée) : vérifie si l'email existe en base
export async function checkEmailRequest(email) {
  const response = await api.post("/auth/check-email", { email });
  return response.data;
}

// Étape 2 (simplifiée) : change directement le mot de passe
export async function resetPasswordRequest(email, newPassword) {
  const response = await api.post("/auth/reset-password", { email, newPassword });
  return response.data;
}