import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFinance } from "@/context/FinanceContext";
import ProgressBar from "@/components/ProgressBar";
import TransactionRow from "@/components/TransactionRow";
import { colors, radius, spacing, typography, formatFCFA } from "@/constants/theme";

export default function DashboardScreen({ navigation }) {
  const {
    totals,
    spendingByCategory,
    monthTransactions,
    getCategoryById,
    notifications,
    user, // 🆕
    justLoggedIn, // 🆕
    clearJustLoggedIn, // 🆕
  } = useFinance();

  const unreadCount = notifications.filter((n) => !n.read).length;
  const recent = monthTransactions.slice(0, 3);

  // 🆕 Contrôle l'affichage de la fenêtre de bienvenue
  const [showWelcome, setShowWelcome] = useState(false);

  // 🆕 Dès que justLoggedIn passe à true (juste après une connexion), affiche la fenêtre,
  // puis réinitialise l'indicateur pour qu'elle ne réapparaisse pas au prochain passage sur cet écran
  useEffect(() => {
    if (justLoggedIn) {
      setShowWelcome(true);
      clearJustLoggedIn();
    }
  }, [justLoggedIn]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={typography.h2}>Tableau de bord</Text>
          <Pressable onPress={() => navigation.navigate("Notifications")} style={{ position: "relative" }}>
            <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
            {unreadCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
              </View>
            )}
          </Pressable>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Solde du mois</Text>
          <Text style={styles.balanceValue}>{formatFCFA(totals.balance)}</Text>
          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <Ionicons name="arrow-up" size={14} color={colors.success} />
              <Text style={[styles.balanceItemText, { color: colors.success }]}>
                {formatFCFA(totals.income)}
              </Text>
            </View>
            <View style={styles.balanceItem}>
              <Ionicons name="arrow-down" size={14} color={colors.danger} />
              <Text style={[styles.balanceItemText, { color: colors.danger }]}>
                {formatFCFA(totals.expense)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Dépenses par catégorie</Text>
          <Text style={styles.sectionAction}>Ce mois</Text>
        </View>

        <View style={styles.card}>
          {spendingByCategory.map((cat) => (
            <View key={cat.id} style={{ marginBottom: spacing.md }}>
              <View style={styles.catRow}>
                <Text style={styles.catName}>{cat.name}</Text>
                <Text style={styles.catAmount}>
                  {formatFCFA(cat.spent).replace(" FCFA", "")} / {formatFCFA(cat.budget || 0).replace(" FCFA", "")}
                </Text>
              </View>
              <ProgressBar value={cat.spent} max={cat.budget || 1} color={cat.color} />
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transactions récentes</Text>
          <Pressable onPress={() => navigation.navigate("TransactionsTab")}>
            <Text style={styles.sectionAction}>Tout voir</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          {recent.map((t) => (
            <TransactionRow key={t.id} transaction={t} category={getCategoryById(t.categoryId)} />
          ))}
        </View>
      </ScrollView>

      {/* 🆕 Fenêtre de bienvenue, affichée juste après une connexion réussie */}
      <Modal visible={showWelcome} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons name="happy-outline" size={56} color={colors.success} />
            <Text style={styles.modalTitle}>Bienvenue {user?.name} !</Text>
            <Text style={styles.modalSubtitle}>Content de te revoir sur Finance Tracker.</Text>
            <Pressable style={styles.modalButton} onPress={() => setShowWelcome(false)}>
              <Text style={styles.modalButtonText}>Continuer</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: 120 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md },
  balanceCard: {
    backgroundColor: colors.inputBg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  balanceLabel: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.xs },
  balanceValue: { fontSize: 30, fontWeight: "700", color: colors.textPrimary },
  balanceRow: { flexDirection: "row", marginTop: spacing.sm },
  balanceItem: { flexDirection: "row", alignItems: "center", marginRight: spacing.lg },
  balanceItemText: { marginLeft: 4, fontSize: 13, fontWeight: "600" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: colors.textPrimary },
  sectionAction: { fontSize: 13, color: "#3E7BFA", fontWeight: "600" },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  catName: { fontSize: 14, fontWeight: "600", color: colors.textPrimary },
  catAmount: { fontSize: 13, color: colors.textSecondary },
  notifBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  notifBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "700",
  },
  // 🆕 Styles de la fenêtre de bienvenue
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    width: "100%",
    maxWidth: 360,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  modalButton: {
    backgroundColor: colors.black,
    borderRadius: radius.pill,
    paddingVertical: 12,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
});