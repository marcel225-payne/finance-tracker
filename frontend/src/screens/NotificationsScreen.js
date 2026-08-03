import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFinance } from "@/context/FinanceContext";
import { colors, radius, spacing, typography } from "@/constants/theme";

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

// Icône + couleur associées à chaque type de notification
const NOTIF_CONFIG = {
  category_added: { icon: "pricetag", bg: "#E8F5E9", color: colors.success },
  category_deleted: { icon: "trash", bg: "#FFEBEE", color: colors.danger },
  transaction_added: { icon: "swap-horizontal", bg: "#E8F5E9", color: colors.success },
  transaction_deleted: { icon: "trash", bg: "#FFEBEE", color: colors.danger },
  budget_created: { icon: "wallet", bg: "#E8F5E9", color: colors.success },
  budget_updated: { icon: "create", bg: "#FFF8E1", color: "#F5A524" },
  budget_deleted: { icon: "trash", bg: "#FFEBEE", color: colors.danger },
  budget_exceeded: { icon: "alert-circle", bg: "#FFEBEE", color: colors.danger },
};
const DEFAULT_CONFIG = { icon: "notifications", bg: "#EEF2FF", color: "#3E7BFA" };

export default function NotificationsScreen({ navigation }) {
  // deleteNotification récupéré depuis le contexte
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } = useFinance();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={typography.h2}>Notifications</Text>
        <Pressable onPress={markAllNotificationsAsRead}>
          <Text style={styles.markAll}>Tout lire</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <Text style={styles.emptyText}>Aucune notification pour le moment</Text>
        ) : (
          notifications.map((notif) => {
            // Sélectionne l'icône/couleur selon le type de notification
            const config = NOTIF_CONFIG[notif.type] || DEFAULT_CONFIG;
            return (
              <View
                key={notif.id}
                style={[styles.notifCard, !notif.read && styles.notifCardUnread]}
              >
                <Pressable
                  onPress={() => markNotificationAsRead(notif.id)}
                  style={styles.notifContent}
                >
                  <View style={[styles.iconWrap, { backgroundColor: config.bg }]}>
                    <Ionicons name={config.icon} size={20} color={config.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.notifTitle}>{notif.title}</Text>
                    <Text style={styles.notifSubtitle}>{notif.message}</Text>
                    <Text style={styles.notifDate}>{formatDate(notif.date)}</Text>
                  </View>
                  {!notif.read && <View style={styles.unreadDot} />}
                </Pressable>

                <Pressable
                  onPress={() => deleteNotification(notif.id)}
                  style={styles.deleteBtn}
                  hitSlop={8}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.textSecondary} />
                </Pressable>
              </View>
            );
          })
        )}
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
    paddingVertical: spacing.md,
  },
  markAll: { fontSize: 13, color: "#3E7BFA", fontWeight: "600" },
  scroll: { padding: spacing.lg, paddingBottom: 120 },
  emptyText: { textAlign: "center", color: colors.textSecondary, marginTop: spacing.xl },
  notifCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notifCardUnread: {
    borderColor: "#3E7BFA",
    backgroundColor: "#F5F9FF",
  },
  // Style pour la zone cliquable (contenu de la notification)
  notifContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  notifTitle: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  notifSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  notifDate: { fontSize: 11, color: colors.textSecondary, marginTop: 4 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3E7BFA",
    marginLeft: spacing.sm,
  },
  //Style du bouton poubelle
  deleteBtn: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
});