import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFinance } from "@/context/FinanceContext";
import ProgressBar from "@/components/ProgressBar";
import TransactionRow from "@/components/TransactionRow";
import { colors, radius, spacing, typography, formatFCFA } from "@/constants/theme";

export default function DashboardScreen({ navigation }) {
  const { totals, spendingByCategory, monthTransactions, getCategoryById, notifications } = useFinance();
  
  const unreadCount = notifications.filter((n) => !n.read).length;

  const recent = monthTransactions.slice(0, 3);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={typography.h2}>Tableau de bord</Text>
          <Pressable onPress={() => navigation.navigate("Notifications")} style={{ position: "relative" }}>
              <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
               <View style={styles.notifBadge} />
               {unreadCount > 0 && <View style={styles.notifBadge} />}
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
  top: -2,
  right: -2,
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: colors.danger,

},
});