import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

//   Remplace par l'adresse IP locale de TON PC (trouvable avec `ipconfig` dans le terminal Windows)
// - Émulateur Android : http://10.0.2.2:5000
// - Simulateur iOS : http://localhost:5000
// - Téléphone physique (Expo Go) : http://172.20.10.8:5000 (ex: http://192.168.1.42:5000)
//const API_URL = "http://192.168.1.64:5000/api";
//const API_URL = "http://192.168.1.66:5000/api";
const API_URL = "http://172.20.10.8:5000/api";
//const API_URL = "http://10.0.20.69:5000/api";
const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Ajoute automatiquement le token JWT à chaque requête si l'utilisateur est connecté
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;