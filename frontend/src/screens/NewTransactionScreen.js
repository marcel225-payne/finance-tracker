import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFinance } from "@/context/FinanceContext";
import CategoryChip from "@/components/CategoryChip";
import Button from "@/components/Button";
import { colors, spacing, radius, formatFCFA } from "@/constants/theme";

function todayLabel() {
  const d = new Date();
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

export default function NewTransactionScreen({ navigation }) {
  const { expenseCategories, incomeCategories, addTransaction } = useFinance();
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState(expenseCategories[0]?.id);
  const [description, setDescription] = useState("");

  const categories = type === "expense" ? expenseCategories : incomeCategories;
  const accent = type === "expense" ? colors.black : colors.success;

  const displayAmount = useMemo(() => {
    const n = Number(amount || 0);
    return formatFCFA(n);
  }, [amount]);

  const switchType = (nextType) => {
    setType(nextType);
    const list = nextType === "expense" ? expenseCategories : incomeCategories;
    setCategoryId(list[0]?.id);
  };

  const handleSave = () => {
    const numeric = Number(amount);
    if (!numeric || numeric <= 0 || !categoryId) return;
    addTransaction({
      type,
      amount: numeric,
      categoryId,
      date: new Date().toISOString().slice(0, 10),
      description,
    });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Nouvelle transaction</Text>
          <Ionicons name="ellipsis-horizontal" size={22} color={colors.textPrimary} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.typeRow}>
            <CategoryChip label="Dépense" selected={type === "expense"} onPress={() => switchType("expense")} accent={colors.black} />
            <CategoryChip label="Revenu" selected={type === "income"} onPress={() => switchType("income")} accent={colors.success} />
          </View>

          <Text style={styles.label}>Montant</Text>
          <View style={styles.amountRow}>
            <TextInput
              value={amount}
              onChangeText={(v) => setAmount(v.replace(/[^0-9]/g, ""))}
              placeholder="0"
              keyboardType="number-pad"
              style={[styles.amountInput, { color: type === "income" ? colors.success : colors.textPrimary }]}
            />
            <Text style={[styles.amountSuffix, { color: type === "income" ? colors.success : colors.textPrimary }]}> FCFA</Text>
          </View>

          <Text style={styles.label}>Catégorie</Text>
          <View style={styles.chipsWrap}>
            {categories.map((cat) => (
              <CategoryChip
                key={cat.id}
                label={cat.name}
                selected={categoryId === cat.id}
                onPress={() => setCategoryId(cat.id)}
                accent={accent}
              />
            ))}
            <CategoryChip label="+ Nouvelle catégorie" dashed onPress={() => navigation.navigate("NewCategory", { type })} />
          </View>

          <Text style={styles.label}>Date</Text>
          <View style={styles.fakeInput}>
            <Text style={styles.fakeInputText}>{todayLabel()}</Text>
          </View>

          <Text style={styles.label}>Description</Text>
          <View style={styles.fakeInput}>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Ex. Marché du week-end"
              placeholderTextColor={colors.textMuted}
              style={{ fontSize: 15, color: colors.textPrimary }}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button title="Enregistrer" onPress={handleSave} variant={type === "income" ? "green" : "dark"} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  typeRow: { flexDirection: "row", marginBottom: spacing.lg, marginTop: spacing.xs },
  label: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.xs, marginTop: spacing.sm },
  amountRow: { flexDirection: "row", alignItems: "baseline", marginBottom: spacing.md },
  amountInput: { fontSize: 40, fontWeight: "700", minWidth: 40, padding: 0 },
  amountSuffix: { fontSize: 20, fontWeight: "600", marginLeft: 4 },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", marginBottom: spacing.md },
  fakeInput: {
    backgroundColor: colors.inputBg,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 52,
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  fakeInputText: { fontSize: 15, color: colors.textPrimary },
  footer: { padding: spacing.lg },
});
