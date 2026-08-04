import React, { useState } from "react";
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import TextField from "@/components/TextField";
import Button from "@/components/Button";
import { colors, spacing, typography } from "@/constants/theme";
import { resetPasswordRequest } from "@/services/authService";

export default function ResetPasswordScreen({ navigation, route }) {
  const { resetToken } = route.params;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      await resetPasswordRequest(resetToken, password);
      // Remet la pile de navigation à zéro sur l'écran Login (empêche de revenir en arrière vers le flux de reset)
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch (err) {
      setError(err.response?.data?.error || "Impossible de réinitialiser le mot de passe. Recommence depuis le début.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => navigation.goBack()} style={styles.back} hitSlop={10}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </Pressable>

          <Text style={typography.h1}>Nouveau mot de passe</Text>
          <Text style={styles.subtitle}>Choisis un nouveau mot de passe pour ton compte.</Text>

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
            title="Réinitialiser le mot de passe"
            onPress={handleSubmit}
            loading={loading}
            style={{ marginTop: spacing.sm }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, padding: spacing.lg },
  back: { marginBottom: spacing.md },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs },
  errorText: { color: colors.danger, fontSize: 13, marginTop: spacing.sm },
});