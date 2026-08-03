import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system"; // 
import * as Sharing from "expo-sharing"; // 
import { useFinance } from "@/context/FinanceContext";
import CategoryChip from "@/components/CategoryChip";
import TransactionRow from "@/components/TransactionRow";
import { colors, spacing, radius } from "@/constants/theme";

// Noms des mois en français, utilisés pour regrouper et labelliser l'export CSV
const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

// Filtres de période proposés en haut de l'écran (scroll horizontal)
const PERIODS = ["Semaine", "Mois", "Année", "Personnalisé"];

// Indique si une date (string) tombe dans la période sélectionnée.
function isWithinPeriod(dateStr, period) {
  const date = new Date(dateStr);
  const now = new Date();

  if (period === "Semaine") {
    // Différence en jours entre maintenant et la date de la transaction
    const diff = (now - date) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }
  if (period === "Mois") {
    // Même mois ET même année que maintenant
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  }
  if (period === "Année") {
    // Même année que maintenant
    return date.getFullYear() === now.getFullYear();
  }
  // "Personnalisé" (ou toute autre valeur) : aucun filtre, on garde tout
  return true;
}

// Transforme une date en libellé lisible pour les en-têtes de groupe :
// "Aujourd'hui", "Hier", ou "12 juillet" pour les dates plus anciennes.
function formatDayLabel(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  // Compare deux dates en ignorant l'heure (uniquement jour/mois/année)
  const sameDay = (a, b) => a.toDateString() === b.toDateString();

  if (sameDay(date, now)) return "Aujourd'hui";
  if (sameDay(date, yesterday)) return "Hier";
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "long" });
}

// Échappe une valeur pour un champ CSV (entoure de guillemets si elle contient une virgule/guillemet)
function escapeCsvValue(value) {
  const str = String(value ?? "");
  return str.includes(",") || str.includes('"') || str.includes("\n")
    ? `"${str.replace(/"/g, '""')}"`
    : str;
}

// Construit le contenu CSV complet : TOUTES les transactions, triées chronologiquement
// (année croissante, puis mois croissant), avec un sous-total par mois.
function buildCSV(transactions, categories) {
  const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));

  const rows = [["Année", "Mois", "Date", "Catégorie", "Type", "Description", "Montant (FCFA)"]];

  let currentGroupKey = null;
  let currentGroupLabel = "";
  let monthIncome = 0;
  let monthExpense = 0;

  const flushMonthSubtotal = () => {
    if (currentGroupKey === null) return;
    rows.push(["", "", "", "", "", `Total ${currentGroupLabel}`, String(monthIncome - monthExpense)]);
    rows.push([]); // ligne vide de séparation entre les mois
  };

  sorted.forEach((t) => {
    const d = new Date(t.date);
    const year = d.getFullYear();
    const monthIndex = d.getMonth();
    const groupKey = `${year}-${monthIndex}`;
    const groupLabel = `${MONTH_NAMES[monthIndex]} ${year}`;

    // Nouveau mois rencontré : on clôture le sous-total du mois précédent
    if (currentGroupKey !== null && groupKey !== currentGroupKey) {
      flushMonthSubtotal();
      monthIncome = 0;
      monthExpense = 0;
    }

    const cat = categories.find((c) => c.id === t.categoryId);
    const amountSigned = t.type === "income" ? t.amount : -t.amount;

    rows.push([
      String(year),
      MONTH_NAMES[monthIndex],
      d.toLocaleDateString("fr-FR"),
      cat?.name || "",
      t.type === "income" ? "Revenu" : "Dépense",
      t.description || "",
      String(amountSigned),
    ]);

    if (t.type === "income") monthIncome += Number(t.amount);
    else monthExpense += Number(t.amount);

    currentGroupKey = groupKey;
    currentGroupLabel = groupLabel;
  });

  flushMonthSubtotal(); // sous-total du tout dernier mois

  return rows.map((row) => row.map(escapeCsvValue).join(",")).join("\n");
}

export default function TransactionsScreen({ navigation }) {
  // Données globales issues du contexte : liste des transactions, catégories,
  // un helper pour retrouver une catégorie à partir de son id, et la suppression.
  const { transactions, categories, getCategoryById, deleteTransaction, refreshData } = useFinance(); // 🆕 refreshData

  // Filtre de période actif ("Semaine", "Mois", "Année", "Personnalisé")
  const [period, setPeriod] = useState("Mois");

  // Filtre de catégorie actif (id de catégorie, ou "Toutes catégories")
  const [categoryFilter, setCategoryFilter] = useState("Toutes catégories");

  // Liste des transactions après application des deux filtres, triée
  // de la plus récente à la plus ancienne.
  // useMemo évite de refiltrer/trier à chaque rendu si rien n'a changé.
  const filtered = useMemo(() => {
    return transactions
      .filter((t) => isWithinPeriod(t.date, period))
      .filter((t) => categoryFilter === "Toutes catégories" || t.categoryId === categoryFilter)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, period, categoryFilter]);

  // Regroupe les transactions filtrées par jour ("Aujourd'hui", "Hier", ...)
  // pour l'affichage en sections dans la liste.
  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach((t) => {
      const key = formatDayLabel(t.date);
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });
    return groups;
  }, [filtered]);

  // Total net (revenus - dépenses) sur la sélection actuelle.
  // Non affiché dans ce composant pour l'instant, mais prêt à être utilisé.
  const total = filtered.reduce((sum, t) => sum + (t.type === "income" ? t.amount : -t.amount), 0);

  // Déclenche une confirmation avant de supprimer une transaction
  const handleDeleteTransaction = (transaction) => {
    Alert.alert(
      "Supprimer la transaction",
      `Voulez-vous vraiment supprimer "${transaction.description || "cette transaction"}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => deleteTransaction(transaction.id),
        },
      ]
    );
  };

  // Génère le fichier CSV — recharge D'ABORD les données depuis l'API pour garantir
  // que l'export reflète exactement l'état actuel de la base, pas juste ce qui est en mémoire
  const [exporting, setExporting] = useState(false);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const { transactions: freshTransactions, categories: freshCategories } = await refreshData();

      if (freshTransactions.length === 0) {
        Alert.alert("Aucune donnée", "Tu n'as encore aucune transaction à exporter.");
        return;
      }

      const csvContent = buildCSV(freshTransactions, freshCategories);
      const fileName = `transactions_${Date.now()}.csv`;

      if (Platform.OS === "web") {
        // Sur le web, expo-file-system / expo-sharing ne fonctionnent pas (API mobiles uniquement).
        // On déclenche un téléchargement classique du navigateur via un Blob.
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // Mobile (iOS/Android via Expo Go ou build) : écrit le fichier puis ouvre le partage natif
        const fileUri = FileSystem.documentDirectory + fileName;

        await FileSystem.writeAsStringAsync(fileUri, csvContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(fileUri, {
            mimeType: "text/csv",
            dialogTitle: "Exporter mes transactions",
            UTI: "public.comma-separated-values-text",
          });
        } else {
          Alert.alert("Export réussi", `Fichier enregistré : ${fileUri}`);
        }
      }
    } catch (err) {
      // Distingue une erreur réseau (rechargement échoué) d'une erreur d'écriture/partage du fichier
      Alert.alert("Erreur", "Impossible de récupérer tes transactions depuis le serveur ou de générer le fichier.");
    } finally {
      setExporting(false);
    }
  };

  return (
    //  seule la zone sécurisée du haut est appliquée
    // utile car cet écran n'a pas de contenu collé en bas à protéger
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* En-tête : titre + lien d'export */}
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
        <Pressable onPress={handleExportCSV} disabled={exporting}>
          <Text style={styles.exportLink}>{exporting ? "Export en cours..." : "Exporter CSV"}</Text>
        </Pressable>
      </View>

      {/* Ligne de filtres "période" — scroll horizontal, une chip par période */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.periodRow}
      >
        {PERIODS.map((p) => (
          <CategoryChip key={p} label={p} selected={period === p} onPress={() => setPeriod(p)} />
        ))}
      </ScrollView>

      {/* Ligne de filtres "catégorie" — "Toutes catégories" + une chip par catégorie */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.periodRow}
      >
        <CategoryChip
          label="Toutes catégories"
          selected={categoryFilter === "Toutes catégories"}
          onPress={() => setCategoryFilter("Toutes catégories")}
        />
        {categories.map((c) => (
          <CategoryChip key={c.id} label={c.name} selected={categoryFilter === c.id} onPress={() => setCategoryFilter(c.id)} />
        ))}
      </ScrollView>

      {/* Liste des transactions groupées par jour */}
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {Object.keys(grouped).length === 0 ? (
          // Aucun résultat pour les filtres actuels
          <Text style={styles.empty}>Aucune transaction sur cette période.</Text>
        ) : (
          // Une section par jour : libellé du jour + carte contenant les transactions du jour
          Object.entries(grouped).map(([day, items]) => (
            <View key={day} style={{ marginBottom: spacing.md }}>
              <Text style={styles.dayLabel}>{day}</Text>
              <View style={styles.card}>
                {items.map((t) => (
                  // onDelete affiche une icône poubelle directement sur la ligne
                  <TransactionRow
                    key={t.id}
                    transaction={t}
                    category={getCategoryById(t.categoryId)}
                    onDelete={() => handleDeleteTransaction(t)}
                  />
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles du composant
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  title: { fontSize: 20, fontWeight: "700", color: colors.textPrimary },
  exportLink: { fontSize: 13, color: "#3E7BFA", fontWeight: "600" },
  // flexGrow: 0 empêche le ScrollView horizontal de s'étirer sur toute la hauteur disponible (surtout sur web)
  filterScroll: { flexGrow: 0 },
  periodRow: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xs }, // ligne de chips horizontale
  list: { padding: spacing.lg, paddingBottom: 140 }, // grande marge basse pour ne pas passer sous la tab bar
  dayLabel: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.xs, fontWeight: "600" },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  empty: { textAlign: "center", color: colors.textSecondary, marginTop: spacing.xl },
});