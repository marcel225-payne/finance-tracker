import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFinance } from "../context/FinanceContext";
import CategoryChip from "../components/CategoryChip";
import Button from "../components/Button";
import { colors, spacing, radius } from "@/constants/theme";

const ICONS = [
  "pricetag-outline",
  "car-outline",
  "film-outline",
  "airplane-outline",
  "medkit-outline",
  "phone-portrait-outline",
  "school-outline",
  "gift-outline",
  "cart-outline",
  "ellipsis-horizontal",
];

const COLORS = ["#1F9254", "#E0483E", "#3E7BFA", "#F5A524", "#C24EAB"];

export default function NewCategoryScreen({ navigation, route }) {
  const { addCategory } = useFinance();
  const initialType = route?.params?.type === "income" ? "income" : "expense";
  const [name, setName] = useState("");
  const [type, setType] = useState(initialType);
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [budget, setBudget] = useState("");

  const handleCreate = () => {
    if (!name.trim()) return;
    addCategory({
      name: name.trim(),
      type,
      icon,
      color,
      budget: type === "expense" && budget ? Number(budget) : null,
    });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Nouvelle catégorie</Text>
        <Ionicons name="ellipsis-horizontal" size={22} color={colors.textPrimary} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.preview}>
          <View style={[styles.previewIcon, { backgroundColor: color + "22" }]}>
            <Ionicons name={icon} size={22} color={color} />
          </View>
          <Text style={styles.previewText}>{name || "Nom de la catégorie"}</Text>
        </View>

        <Text style={styles.label}>Nom</Text>
        <View style={styles.fakeInput}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ex. Santé, Abonnements..."
            placeholderTextColor={colors.textMuted}
            style={{ fontSize: 15, color: colors.textPrimary }}
          />
        </View>

        <Text style={styles.label}>Type</Text>
        <View style={styles.row}>
          <CategoryChip label="Dépense" selected={type === "expense"} onPress={() => setType("expense")} accent={colors.black} />
          <CategoryChip label="Revenu" selected={type === "income"} onPress={() => setType("income")} accent={colors.success} />
        </View>

        <Text style={styles.label}>Icône</Text>
        <View style={styles.iconGrid}>
          {ICONS.map((ic) => (
            <Pressable
              key={ic}
              onPress={() => setIcon(ic)}
              style={[styles.iconOption, icon === ic && styles.iconOptionSelected]}
            >
              <Ionicons name={ic} size={20} color={colors.textPrimary} />
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Couleur</Text>
        <View style={styles.row}>
          {COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotSelected]}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Créer la catégorie" onPress={handleCreate} />
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
  preview: {
    alignItems: "center",
    marginBottom: spacing.lg,
    backgroundColor: colors.inputBg,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
  },
  previewIcon: { width: 48, height: 48, borderRadius: radius.md, alignItems: "center", justifyContent: "center", marginBottom: spacing.xs },
  previewText: { fontSize: 14, color: colors.textSecondary },
  label: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.xs, marginTop: spacing.sm },
  row: { flexDirection: "row", flexWrap: "wrap", marginBottom: spacing.md },
  fakeInput: {
    backgroundColor: colors.inputBg,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 52,
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  iconGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: spacing.md },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.inputBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  iconOptionSelected: { borderWidth: 2, borderColor: colors.black },
  colorDot: { width: 36, height: 36, borderRadius: 18, marginRight: spacing.sm },
  colorDotSelected: { borderWidth: 3, borderColor: colors.textPrimary },
  footer: { padding: spacing.lg },
});
