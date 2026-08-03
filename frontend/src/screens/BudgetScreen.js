import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFinance } from "@/context/FinanceContext";
import ProgressBar from "@/components/ProgressBar";
import { colors, spacing, radius, formatFCFA } from "@/constants/theme";

export default function BudgetScreen({ navigation }) {
  // 🆕 deleteBudget ET deleteCategory récupérés depuis le contexte
  const { spendingByCategory, deleteBudget, deleteCategory } = useFinance();
  const overBudget = spendingByCategory.filter((c) => c.budget && c.spent > c.budget);

  // 🆕 Propose maintenant un choix : retirer seulement le budget, ou supprimer toute la catégorie
  const handleDeleteBudget = (cat) => {
    Alert.alert(
      "Que veux-tu supprimer ?",
      `Pour "${cat.name}", tu peux retirer uniquement le budget (la catégorie et ses transactions restent), ou supprimer toute la catégorie (ses transactions seront aussi supprimées).`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Budget seulement",
          onPress: () => deleteBudget(cat.id),
        },
        {
          text: "Toute la catégorie",
          style: "destructive",
          onPress: () => deleteCategory(cat.id),
        },
      ]
    );
  };

  // 🆕 Pour une catégorie SANS budget : pas de choix "budget seulement" possible (il n'y en a pas),
  // donc simple confirmation avant suppression de la catégorie entière
  const handleDeleteCategoryOnly = (cat) => {
    Alert.alert(
      "Supprimer la catégorie",
      `"${cat.name}" n'a pas de budget défini. La supprimer retirera aussi toutes ses transactions. Continuer ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => deleteCategory(cat.id),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Budgets mensuels</Text>
        <Pressable onPress={() => navigation.navigate("AddBudget")} style={styles.addRow}>
          <Ionicons name="add" size={18} color={colors.textPrimary} />
          <Text style={styles.addText}>Ajouter</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {overBudget.length > 0 && (
          <View style={styles.warningBanner}>
            <Ionicons name="warning-outline" size={16} color={colors.danger} />
            <Text style={styles.warningText}>
              {overBudget.length} catégorie{overBudget.length > 1 ? "s" : ""} dépasse
              {overBudget.length > 1 ? "nt" : ""} son budget ce mois-ci
            </Text>
          </View>
        )}

        {spendingByCategory.map((cat) => {
          const isOver = cat.budget && cat.spent > cat.budget;
          return (
            <View key={cat.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.catNameRow}>
                  <View style={[styles.dot, { backgroundColor: cat.color }]} />
                  <Text style={styles.catName}>{cat.name}</Text>
                </View>
                <View style={styles.headerRight}>
                  <Text style={styles.catAmount}>
                    {formatFCFA(cat.spent).replace(" FCFA", "")} / {cat.budget ? formatFCFA(cat.budget).replace(" FCFA", "") : "—"}
                  </Text>
                  {/* 🆕 Avec budget : crayon + poubelle (choix budget/catégorie). Sans budget : juste poubelle (supprime la catégorie) */}
                  {cat.budget ? (
                    <>
                      <Pressable
                        onPress={() => navigation.navigate("AddBudget", { categoryId: cat.id })}
                        style={styles.editBtn}
                        hitSlop={8}
                      >
                        <Ionicons name="pencil-outline" size={16} color={colors.textSecondary} />
                      </Pressable>
                      <Pressable onPress={() => handleDeleteBudget(cat)} style={styles.deleteBtn} hitSlop={8}>
                        <Ionicons name="trash-outline" size={16} color={colors.textSecondary} />
                      </Pressable>
                    </>
                  ) : (
                    <Pressable onPress={() => handleDeleteCategoryOnly(cat)} style={styles.deleteBtn} hitSlop={8}>
                      <Ionicons name="trash-outline" size={16} color={colors.textSecondary} />
                    </Pressable>
                  )}
                </View>
              </View>
              {cat.budget ? (
                <>
                  <ProgressBar value={cat.spent} max={cat.budget} color={isOver ? colors.danger : cat.color} />
                  {isOver && (
                    <Text style={styles.overText}>
                      Budget dépassé de {formatFCFA(cat.spent - cat.budget)}
                    </Text>
                  )}
                </>
              ) : (
                <Text style={styles.noBudget}>Aucun budget défini pour cette catégorie</Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

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
  addRow: { flexDirection: "row", alignItems: "center" },
  addText: { marginLeft: 2, fontSize: 14, fontWeight: "600", color: colors.textPrimary },
  scroll: { padding: spacing.lg, paddingBottom: 140 },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDEDEB",
    padding: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  warningText: { marginLeft: spacing.xs, color: colors.danger, fontSize: 13, flex: 1 },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xs },
  catNameRow: { flexDirection: "row", alignItems: "center" },
  // Regroupe le montant et l'icône poubelle à droite de la carte
  headerRight: { flexDirection: "row", alignItems: "center" },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  catName: { fontSize: 14, fontWeight: "600", color: colors.textPrimary },
  catAmount: { fontSize: 13, color: colors.textSecondary },
  overText: { color: colors.danger, fontSize: 12, marginTop: spacing.xs },
  noBudget: { color: colors.textMuted, fontSize: 12, marginTop: spacing.xs },
  // Styles des boutons modifier / supprimer
  editBtn: { marginLeft: spacing.sm },
  deleteBtn: { marginLeft: spacing.sm },
});