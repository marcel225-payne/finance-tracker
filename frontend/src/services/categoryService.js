import api from "./api";

// Récupère toutes les catégories de l'utilisateur connecté
export const fetchCategories = async () => {
  const res = await api.get("/categories");
  return res.data;
};

// Crée une nouvelle catégorie
export const createCategoryRequest = async (category) => {
  const res = await api.post("/categories", category);
  return res.data;
};

// Définit ou modifie le budget d'une catégorie
export const updateCategoryBudgetRequest = async (categoryId, budget, alertThreshold) => {
  const res = await api.patch(`/categories/${categoryId}/budget`, { budget, alertThreshold });
  return res.data;
};

// Retire le budget d'une catégorie (la catégorie reste)
export const deleteCategoryBudgetRequest = async (categoryId) => {
  const res = await api.delete(`/categories/${categoryId}/budget`);
  return res.data;
};

// Supprime une catégorie (et ses transactions liées, côté backend)
export const deleteCategoryRequest = async (categoryId) => {
  const res = await api.delete(`/categories/${categoryId}`);
  return res.data;
};