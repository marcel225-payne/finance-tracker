import api from "./api";

// Récupère toutes les transactions de l'utilisateur connecté
export const fetchTransactions = async () => {
  const res = await api.get("/transactions");
  return res.data;
};

// Crée une nouvelle transaction
export const createTransactionRequest = async (transaction) => {
  const res = await api.post("/transactions", transaction);
  return res.data;
};

// Supprime une transaction
export const deleteTransactionRequest = async (transactionId) => {
  const res = await api.delete(`/transactions/${transactionId}`);
  return res.data;
};