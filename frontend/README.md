# Finance Tracker (React Native / Expo)

App mobile de suivi de finances personnelles (revenus/dépenses/budgets), basée sur
tes maquettes : Connexion, Inscription, Tableau de bord, Nouvelle transaction,
Transactions, Nouvelle catégorie, Budgets mensuels, Profil.

## Démarrer le projet

Prérequis : Node.js 18+ et l'app **Expo Go** sur ton téléphone (iOS/Android).

```bash
cd finance-tracker
npm install
npx expo start
```

Scanne le QR code affiché avec l'app Expo Go (Android) ou l'appareil photo (iOS).

## Structure du projet

```
App.js                        Point d'entrée
src/
  context/FinanceContext.js   État global : auth, transactions, catégories, budgets
                               (persisté avec AsyncStorage)
  navigation/
    RootNavigator.js          Stack racine : Auth (Login/Signup) vs App
    MainTabs.js                Barre d'onglets : Accueil, Transactions, +, Budget, Profil
  screens/
    LoginScreen.js
    SignupScreen.js
    DashboardScreen.js
    TransactionsScreen.js
    NewTransactionScreen.js    (dépense/revenu, avec bascule de couleur)
    NewCategoryScreen.js
    BudgetScreen.js
    AddBudgetScreen.js
    ProfileScreen.js
  components/                 Button, TextField, CategoryChip, ProgressBar, TransactionRow
  theme/theme.js               Couleurs, espacements, typographie, formatFCFA()
```

## Fonctionnalités incluses

- Connexion / Inscription (validation basique, pas de vrai backend — état local)
- Tableau de bord : solde du mois, revenus/dépenses, dépenses par catégorie
  avec barres de progression, transactions récentes
- Ajout de transaction (dépense en noir, revenu en vert) avec choix de catégorie,
  date du jour et description
- Liste des transactions avec filtres période (Semaine/Mois/Année) et catégorie,
  groupées par jour
- Création de catégorie personnalisée (nom, type, icône, couleur, budget optionnel)
- Budgets mensuels par catégorie avec alerte visuelle de dépassement
- Profil avec déconnexion

Les données sont sauvegardées localement sur l'appareil (AsyncStorage) : elles
persistent entre les redémarrages de l'app, mais il n'y a pas encore de backend/API.

## Prochaines étapes possibles

- Brancher une vraie API (auth + stockage cloud) au lieu du state local
- Export CSV réel des transactions
- Graphiques (ex. `victory-native` ou `react-native-svg-charts`)
- Édition/suppression de transactions existantes
