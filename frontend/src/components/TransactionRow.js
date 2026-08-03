import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, formatFCFA } from "@/constants/theme";

// onDelete est optionnel : si non fourni, aucune icône poubelle n'est affichée
// (le composant reste donc utilisable ailleurs dans l'app sans rien casser)
export default function TransactionRow({ transaction, category, onDelete }) {
  const isIncome = transaction.type === "income";
  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: (category?.color || colors.black) + "22" }]}>
        <Ionicons name={category?.icon || "pricetag-outline"} size={18} color={category?.color || colors.black} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{transaction.description || category?.name}</Text>
        <Text style={styles.subtitle}>{category?.name}</Text>
      </View>
      <Text style={[styles.amount, { color: isIncome ? colors.income : colors.expense }]}>
        {isIncome ? "+" : "-"}
        {formatFCFA(Math.abs(transaction.amount)).replace(" FCFA", "")}
      </Text>

      {/* Bouton de suppression, affiché uniquement si onDelete est passé en prop */}
      {onDelete && (
        <Pressable onPress={onDelete} style={styles.deleteBtn} hitSlop={8}>
          <Ionicons name="trash-outline" size={18} color={colors.textSecondary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.sm },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  title: { fontSize: 15, fontWeight: "600", color: colors.textPrimary },
  subtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  amount: { fontSize: 15, fontWeight: "700" },
  // Style du bouton poubelle
  deleteBtn: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
});