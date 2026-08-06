import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { loginRequest, signupRequest, logoutRequest } from "../services/authService";
import {
  fetchCategories,
  createCategoryRequest,
  updateCategoryBudgetRequest,
  deleteCategoryBudgetRequest,
  deleteCategoryRequest,
} from "../services/categoryService";
import {
  fetchTransactions,
  createTransactionRequest,
  deleteTransactionRequest,
} from "../services/transactionService";

// Création du contexte React (valeur par défaut null, sera remplie par le Provider)
const FinanceContext = createContext(null);

// Clé utilisée pour retenir QUI est connecté (juste les infos de session, léger)
const AUTH_STORAGE_KEY = "finance_tracker_auth_v1";
// Les notifications restent stockées localement (pas de table côté backend) — une clé par utilisateur
const notifStorageKey = (userId) => `finance_tracker_notifications_${userId}`;

// Génère un identifiant aléatoire court, utilisé uniquement pour les notifications locales
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// 🆕 Convertit une catégorie reçue du backend au format attendu par le frontend
function mapCategoryFromApi(c) {
  return {
    id: c.id,
    name: c.name,
    type: c.type,
    icon: c.icon,
    color: c.color,
    budget: c.budget,
    alertThreshold: c.alertThreshold,
  };
}

// 🆕 Convertit une transaction reçue du backend au format attendu par le frontend
// (le backend renvoie "CategoryId", le frontend attend "categoryId")
function mapTransactionFromApi(t) {
  return {
    id: t.id,
    type: t.type,
    amount: t.amount,
    description: t.description,
    date: t.date,
    categoryId: t.CategoryId,
  };
}

export function FinanceProvider({ children }) {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  // hydrated : évite d'agir avant que la session précédente ait fini d'être vérifiée
  const [hydrated, setHydrated] = useState(false);
  // 🆕 dataLoading : true pendant qu'on récupère les catégories/transactions depuis le backend
  const [dataLoading, setDataLoading] = useState(false);
  // 🆕 Vrai juste après une connexion réussie — permet d'afficher un message de bienvenue une seule fois
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  // 🆕 Charge les catégories + transactions de l'utilisateur connecté DEPUIS LE BACKEND
  const loadUserData = async () => {
    setDataLoading(true);
    try {
      const [rawCategories, rawTransactions] = await Promise.all([
        fetchCategories(),
        fetchTransactions(),
      ]);
      setCategories(rawCategories.map(mapCategoryFromApi));
      setTransactions(rawTransactions.map(mapTransactionFromApi));
    } catch (e) {
      // Si le backend est injoignable ou renvoie une erreur, on part sur des listes vides
      // plutôt que de laisser d'anciennes données affichées
      setCategories([]);
      setTransactions([]);
    } finally {
      setDataLoading(false);
    }
  };

  // Charge les notifications locales propres à un utilisateur (le backend n'a pas cette table)
  const loadUserNotifications = async (userId) => {
    try {
      const raw = await AsyncStorage.getItem(notifStorageKey(userId));
      setNotifications(raw ? JSON.parse(raw) : []);
    } catch (e) {
      setNotifications([]);
    }
  };

  // Au montage : vérifie si un utilisateur était déjà connecté (session précédente),
  // puis charge SES données depuis le backend + SES notifications locales
  useEffect(() => {
    (async () => {
      try {
        const rawAuth = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (rawAuth) {
          const savedUser = JSON.parse(rawAuth);
          if (savedUser?.id) {
            setUser(savedUser);
            await Promise.all([loadUserData(), loadUserNotifications(savedUser.id)]);
          }
        }
      } catch (e) {
        // Session corrompue ou illisible : on ignore, l'utilisateur devra simplement se reconnecter
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  // Sauvegarde les infos de session dès que l'utilisateur change (connexion/déconnexion)
  useEffect(() => {
    if (!hydrated) return;
    if (user) {
      AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user)).catch(() => {});
    } else {
      AsyncStorage.removeItem(AUTH_STORAGE_KEY).catch(() => {});
    }
  }, [user, hydrated]);

  // Sauvegarde les notifications localement, sous la clé propre à l'utilisateur connecté
  useEffect(() => {
    if (!hydrated || !user?.id) return;
    AsyncStorage.setItem(notifStorageKey(user.id), JSON.stringify(notifications)).catch(() => {});
  }, [notifications, hydrated, user?.id]);

  // Inscription : appelle POST /api/auth/signup, puis charge les données (vides pour un nouveau compte)
  const signUp = async ({ name, email, password }) => {
    const newUser = await signupRequest(name, email, password);
    setUser(newUser);
    await Promise.all([loadUserData(), loadUserNotifications(newUser.id)]);
    return newUser;
  };

  // Connexion : appelle POST /api/auth/login, puis recharge les données propres à CE compte
  const signIn = async ({ email, password }) => {
    const loggedUser = await loginRequest(email, password);
    setUser(loggedUser);
    setJustLoggedIn(true); // 🆕 déclenche la fenêtre de bienvenue sur le Dashboard
    await Promise.all([loadUserData(), loadUserNotifications(loggedUser.id)]);
    return loggedUser;
  };

  // 🆕 Réinitialise l'indicateur — appelé par le Dashboard une fois la fenêtre affichée
  const clearJustLoggedIn = () => setJustLoggedIn(false);

  // Déconnexion : supprime le token JWT stocké localement et vide l'affichage
  const signOut = async () => {
    await logoutRequest();
    setUser(null);
    setCategories([]);
    setTransactions([]);
    setNotifications([]);
  };

  // 🆕 Recharge catégories + transactions DEPUIS LE BACKEND et renvoie les données fraîches
  // (utile quand un écran a besoin d'être certain d'avoir les toutes dernières données,
  // par exemple juste avant un export CSV, plutôt que de se fier à ce qui est déjà en mémoire)
  const refreshData = async () => {
    const [rawCategories, rawTransactions] = await Promise.all([
      fetchCategories(),
      fetchTransactions(),
    ]);
    const freshCategories = rawCategories.map(mapCategoryFromApi);
    const freshTransactions = rawTransactions.map(mapTransactionFromApi);
    setCategories(freshCategories);
    setTransactions(freshTransactions);
    return { categories: freshCategories, transactions: freshTransactions };
  };

  // Ajoute une notification générique — utilisée par toutes les actions ci-dessous
  const addNotification = (notif) => {
    const newNotif = {
      id: uid(),
      date: new Date().toISOString(),
      read: false,
      ...notif,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    return newNotif;
  };

  const markNotificationAsRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // 🆕 Ajoute une catégorie — appelle le backend, puis met à jour l'état local avec la réponse serveur
  const addCategory = async (category) => {
    try {
      const created = await createCategoryRequest(category);
      const newCategory = mapCategoryFromApi(created);
      setCategories((prev) => [...prev, newCategory]);
      addNotification({
        type: "category_added",
        title: "Nouvelle catégorie",
        message: `La catégorie "${newCategory.name}" a été ajoutée`,
      });
      return newCategory;
    } catch (err) {
      Alert.alert("Erreur", "Impossible d'ajouter la catégorie. Vérifie ta connexion.");
      throw err;
    }
  };

  // 🆕 Supprime une catégorie — appelle le backend (qui supprime aussi ses transactions), puis met à jour l'état local
  const deleteCategory = async (categoryId) => {
    const cat = categories.find((c) => c.id === categoryId);
    try {
      await deleteCategoryRequest(categoryId);
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      setTransactions((prev) => prev.filter((t) => t.categoryId !== categoryId));
      addNotification({
        type: "category_deleted",
        title: "Catégorie supprimée",
        message: `La catégorie "${cat?.name || "inconnue"}" et ses transactions ont été supprimées`,
      });
    } catch (err) {
      Alert.alert("Erreur", "Impossible de supprimer la catégorie. Vérifie ta connexion.");
    }
  };

  // 🆕 Ajoute une transaction — appelle le backend, puis met à jour l'état local avec la réponse serveur
  const addTransaction = async (transaction) => {
    try {
      const created = await createTransactionRequest(transaction);
      const newTransaction = mapTransactionFromApi(created);
      setTransactions((prev) => [newTransaction, ...prev]);
      const cat = categories.find((c) => c.id === newTransaction.categoryId);
      addNotification({
        type: "transaction_added",
        title: newTransaction.type === "income" ? "Revenu ajouté" : "Dépense ajoutée",
        message: `${newTransaction.description || cat?.name || "Transaction"} — ${newTransaction.amount} FCFA`,
      });
      return newTransaction;
    } catch (err) {
      Alert.alert("Erreur", "Impossible d'ajouter la transaction. Vérifie ta connexion.");
      throw err;
    }
  };

  // 🆕 Supprime une transaction — appelle le backend, puis met à jour l'état local
  const deleteTransaction = async (transactionId) => {
    const t = transactions.find((tr) => tr.id === transactionId);
    try {
      await deleteTransactionRequest(transactionId);
      setTransactions((prev) => prev.filter((tr) => tr.id !== transactionId));
      addNotification({
        type: "transaction_deleted",
        title: "Transaction supprimée",
        message: `${t?.description || "Une transaction"} a été supprimée`,
      });
    } catch (err) {
      Alert.alert("Erreur", "Impossible de supprimer la transaction. Vérifie ta connexion.");
    }
  };

  // 🆕 Crée ou modifie le budget d'une catégorie — appelle le backend, puis met à jour l'état local
  const setCategoryBudget = async (categoryId, budget, threshold) => {
    const cat = categories.find((c) => c.id === categoryId);
    const isUpdate = !!(cat && cat.budget);
    try {
      const updated = await updateCategoryBudgetRequest(categoryId, budget, threshold);
      setCategories((prev) =>
        prev.map((c) => (c.id === categoryId ? mapCategoryFromApi(updated) : c))
      );
      addNotification({
        type: isUpdate ? "budget_updated" : "budget_created",
        title: isUpdate ? "Budget modifié" : "Nouveau budget",
        message: `Le budget de "${cat?.name || "cette catégorie"}" est maintenant de ${budget} FCFA`,
      });
    } catch (err) {
      Alert.alert("Erreur", "Impossible d'enregistrer le budget. Vérifie ta connexion.");
      throw err; // 🆕 relance l'erreur pour que l'écran appelant (AddBudgetScreen) reste sur place
    }
  };

  // 🆕 Retire le budget d'une catégorie — appelle le backend, puis met à jour l'état local
  const deleteBudget = async (categoryId) => {
    const cat = categories.find((c) => c.id === categoryId);
    try {
      const updated = await deleteCategoryBudgetRequest(categoryId);
      setCategories((prev) =>
        prev.map((c) => (c.id === categoryId ? mapCategoryFromApi(updated) : c))
      );
      addNotification({
        type: "budget_deleted",
        title: "Budget supprimé",
        message: `Le budget de "${cat?.name || "cette catégorie"}" a été retiré`,
      });
    } catch (err) {
      Alert.alert("Erreur", "Impossible de supprimer le budget. Vérifie ta connexion.");
    }
  };

  // Filtre les catégories par type — recalculé seulement si `categories` change (optimisation useMemo)
  const expenseCategories = useMemo(() => categories.filter((c) => c.type === "expense"), [categories]);
  const incomeCategories = useMemo(() => categories.filter((c) => c.type === "income"), [categories]);

  // Génère la clé du mois courant au format "AAAA-MM" (ex: "2026-07"), calculée une seule fois
  const currentMonthKey = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  // Filtre les transactions pour ne garder que celles du mois en cours
  const monthTransactions = useMemo(
    () => transactions.filter((t) => t.date && String(t.date).startsWith(currentMonthKey)),
    [transactions, currentMonthKey]
  );

  // Calcule les totaux du mois : revenus, dépenses, solde (revenus - dépenses)
  const totals = useMemo(() => {
    const income = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    return { income, expense, balance: income - expense };
  }, [monthTransactions]);

  // Pour chaque catégorie de dépense, calcule combien a été dépensé ce mois-ci dedans
  const spendingByCategory = useMemo(() => {
    return expenseCategories.map((cat) => {
      const spent = monthTransactions
        .filter((t) => t.type === "expense" && t.categoryId === cat.id)
        .reduce((sum, t) => sum + Number(t.amount), 0);
      return { ...cat, spent };
    });
  }, [expenseCategories, monthTransactions]);

  // Détecte automatiquement les dépassements de budget et génère une notification (une seule fois par catégorie/mois)
  useEffect(() => {
    if (!hydrated) return;

    spendingByCategory.forEach((cat) => {
      if (!cat.budget) return;

      if (cat.spent > cat.budget) {
        const alreadyNotified = notifications.some(
          (n) => n.type === "budget_exceeded" && n.categoryId === cat.id && n.monthKey === currentMonthKey
        );

        if (!alreadyNotified) {
          addNotification({
            type: "budget_exceeded",
            title: "Budget dépassé",
            message: `Tu as dépassé le budget de "${cat.name}" (${cat.spent} / ${cat.budget} FCFA)`,
            categoryId: cat.id,
            monthKey: currentMonthKey,
          });
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spendingByCategory, hydrated]);

  // Retrouve une catégorie complète à partir de son id (utile pour afficher icône/couleur/nom)
  const getCategoryById = (id) => categories.find((c) => c.id === id);

  const value = {
    user,
    signUp,
    signIn,
    signOut,
    categories,
    expenseCategories,
    incomeCategories,
    addCategory,
    deleteCategory,
    transactions,
    addTransaction,
    deleteTransaction,
    setCategoryBudget,
    deleteBudget,
    totals,
    spendingByCategory,
    getCategoryById,
    monthTransactions,
    dataLoading,
    refreshData,
    justLoggedIn, // 🆕
    clearJustLoggedIn, // 🆕
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used within FinanceProvider");
  return ctx;
}