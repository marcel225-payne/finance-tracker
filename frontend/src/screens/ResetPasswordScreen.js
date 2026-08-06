import React, { useState } from "react";
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Pressable, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import TextField from "@/components/TextField";
import Button from "@/components/Button";
import { colors, spacing, radius, typography } from "@/constants/theme";
import { resetPasswordRequest } from "@/services/authService";

export default function ResetPasswordScreen({ navigation, route }) {
  const { email } = route.params;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Contrôle l'affichage de la fenêtre de confirmation
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!password || !confirm) {
      setError("Merci de remplir les deux champs.");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await resetPasswordRequest(email, password);
      setShowSuccess(true); // affiche la fenêtre de succès au lieu de naviguer directement
    } catch (err) {
      setError(err.response?.data?.error || "Impossible de changer le mot de passe. Réessaie.");
    } finally {
      setLoading(false);
    }
  };

  // Ferme la fenêtre et renvoie vers l'écran de connexion
  const handleContinue = () => {
    setShowSuccess(false);
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => navigation.goBack()} style={styles.back} hitSlop={10}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </Pressable>

          <Text style={typography.h1}>Nouveau mot de passe</Text>
          <Text style={styles.subtitle}>Choisis un nouveau mot de passe pour {email}.</Text>

          <View style={{ marginTop: spacing.xl }}>
            <TextField
              label="Nouveau mot de passe"
              placeholder="Au moins 8 caractères"
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (error) setError("");
              }}
              secureTextEntry
            />
            <TextField
              label="Confirmer le mot de passe"
              placeholder="••••••••"
              value={confirm}
              onChangeText={(v) => {
                setConfirm(v);
                if (error) setError("");
              }}
              secureTextEntry
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button
            title="Changer le mot de passe"
            onPress={handleSubmit}
            loading={loading}
            style={{ marginTop: spacing.sm }}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/*Fenêtre de confirmation avec icône verte */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons name="checkmark-circle" size={56} color={colors.success} />
            <Text style={styles.modalTitle}>Mot de passe changé avec succès</Text>
            <Text style={styles.modalSubtitle}>
              Tu peux maintenant te connecter avec ton nouveau mot de passe.
            </Text>
            <Button title="Continuer" onPress={handleContinue} style={{ marginTop: spacing.md, width: "100%" }} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, padding: spacing.lg },
  back: { marginBottom: spacing.md },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs },
  errorText: { color: colors.danger, fontSize: 13, marginTop: spacing.sm },
  // Styles de la fenêtre modale de succès
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
  },
});