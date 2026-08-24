import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFinance } from "@/context/FinanceContext";
import CategoryChip from "@/components/CategoryChip";
import Button from "@/components/Button";
import { colors, spacing, radius, formatFCFA } from "@/constants/theme";

const THRESHOLDS = [80, 90, 100];

// route est récupéré pour lire un éventuel categoryId passé en paramètre de navigation
export default function AddBudgetScreen({ navigation, route }) {
  const { expenseCategories, setCategoryBudget } = useFinance();

  // Si un categoryId est passé en paramètre, on est en mode édition (pas ajout)
  const editingCategoryId = route?.params?.categoryId;
  const isEditMode = !!editingCategoryId;

  const [categoryId, setCategoryId] = useState(editingCategoryId || expenseCategories[0]?.id);
  const [amount, setAmount] = useState("");
  const [threshold, setThreshold] = useState(90);

  // Pré-remplit le montant et le seuil avec les valeurs actuelles de la catégorie en mode édition
  useEffect(() => {
    if (isEditMode) {
      const cat = expenseCategories.find((c) => c.id === editingCategoryId);
      if (cat) {
        setAmount(cat.budget ? String(cat.budget) : "");
        setThreshold(cat.alertThreshold || 90);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedCategory = expenseCategories.find((c) => c.id === categoryId);

  // saving : affiche un loader pendant que l'appel API est en cours
  const [saving, setSaving] = useState(false);

  // handleSave devient async : on attend la réponse du backend avant de quitter l'écran
  const handleSave = async () => {
    const numeric = Number(amount);
    if (!categoryId || !numeric) return;

    setSaving(true);
    try {
      await setCategoryBudget(categoryId, numeric, threshold);
      navigation.goBack(); // on ne quitte l'écran qu'après confirmation que ça a bien été enregistré
    } catch (err) {
      // L'erreur est déjà affichée via Alert dans FinanceContext, on reste juste sur l'écran
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
        {/* Titre dynamique selon le mode */}
        <Text style={styles.headerTitle}>{isEditMode ? "Modifier le budget" : "Ajouter un budget"}</Text>
        <Ionicons name="ellipsis-horizontal" size={22} color={colors.textPrimary} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Catégorie</Text>
        {isEditMode ? (
          // En mode édition, la catégorie est fixe (on modifie LE budget de CETTE catégorie)
          <View style={styles.lockedCategory}>
            <View style={[styles.lockedDot, { backgroundColor: selectedCategory?.color }]} />
            <Text style={styles.lockedCategoryText}>{selectedCategory?.name}</Text>
          </View>
        ) : (
          <View style={styles.row}>
            {expenseCategories.map((cat) => (
              <CategoryChip key={cat.id} label={cat.name} selected={categoryId === cat.id} onPress={() => setCategoryId(cat.id)} />
            ))}
            <CategoryChip label="+ Nouvelle catégorie" dashed onPress={() => navigation.navigate("NewCategory", { type: "expense" })} />
          </View>
        )}

        <Text style={styles.label}>Budget mensuel</Text>
        <View style={styles.amountRow}>
          <TextInput
            value={amount}
            onChangeText={(v) => setAmount(v.replace(/[^0-9]/g, ""))}
            placeholder="0"
            keyboardType="number-pad"
            style={styles.amountInput}
          />
          <Text style={styles.amountSuffix}> FCFA</Text>
        </View>

        <Text style={styles.label}>Période</Text>
        <View style={styles.fakeInput}>
          <Text style={styles.fakeInputText}>Tous les mois (reconduit automatiquement)</Text>
        </View>

        <Text style={styles.label}>Seuil d'alerte visuel</Text>
        <View style={styles.row}>
          {THRESHOLDS.map((t) => (
            <CategoryChip key={t} label={`${t}%`} selected={threshold === t} onPress={() => setThreshold(t)} />
          ))}
        </View>
        <Text style={styles.hint}>
          Une alerte s'affichera quand les dépenses atteignent ce pourcentage du budget.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        {/* 🆕 loading affiche un spinner pendant l'appel API */}
        <Button
          title={isEditMode ? "Enregistrer les modifications" : "Enregistrer le budget"}
          onPress={handleSave}
          loading={saving}
        />
      </View>
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
  label: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.xs, marginTop: spacing.sm },
  row: { flexDirection: "row", flexWrap: "wrap", marginBottom: spacing.md },
  amountRow: { flexDirection: "row", alignItems: "baseline", marginBottom: spacing.md },
  amountInput: { fontSize: 34, fontWeight: "700", color: colors.textPrimary, minWidth: 40, padding: 0 },
  amountSuffix: { fontSize: 18, fontWeight: "600", color: colors.textPrimary, marginLeft: 4 },
  fakeInput: {
    backgroundColor: colors.inputBg,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 52,
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  fakeInputText: { fontSize: 14, color: colors.textPrimary },
  hint: { fontSize: 12, color: colors.textMuted, marginTop: -spacing.xs, marginBottom: spacing.md },
  footer: { padding: spacing.lg },
  // Styles pour l'affichage figé de la catégorie en mode édition
  lockedCategory: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.inputBg,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 44,
    marginBottom: spacing.md,
  },
  lockedDot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.xs },
  lockedCategoryText: { fontSize: 14, fontWeight: "600", color: colors.textPrimary },
});