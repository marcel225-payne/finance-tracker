import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFinance } from "../context/FinanceContext";
import { colors, spacing, radius } from "@/constants/theme";

function initials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const MENU = [
  { key: "categories", label: "Catégories personnalisées", icon: "pricetags-outline" },
  { key: "export", label: "Exporter mes données (CSV)", icon: "download-outline" },
  { key: "security", label: "Sécurité et mot de passe", icon: "lock-closed-outline" },
];

export default function ProfileScreen() {
  const { user, signOut } = useFinance();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Profil</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(user?.name)}</Text>
        </View>
        <View>
          <Text style={styles.name}>{user?.name || "Utilisateur"}</Text>
          <Text style={styles.email}>{user?.email || ""}</Text>
        </View>
      </View>

      <View style={styles.menu}>
        {MENU.map((item) => (
          <Pressable key={item.key} style={styles.menuItem}>
            <Ionicons name={item.icon} size={18} color={colors.textPrimary} style={{ marginRight: spacing.sm }} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </Pressable>
        ))}
        <Pressable style={styles.menuItem} onPress={signOut}>
          <Ionicons name="log-out-outline" size={18} color={colors.danger} style={{ marginRight: spacing.sm }} />
          <Text style={[styles.menuLabel, { color: colors.danger }]}>Se déconnecter</Text>
        </Pressable>
      </View>
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
    paddingBottom: spacing.md,
  },
  title: { fontSize: 20, fontWeight: "700", color: colors.textPrimary },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.inputBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  avatarText: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },
  name: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },
  email: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  menu: { marginHorizontal: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuLabel: { flex: 1, fontSize: 14, color: colors.textPrimary },

});
