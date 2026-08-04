import React, { useState } from "react";
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import TextField from "@/components/TextField";
import Button from "@/components/Button";
import { colors, spacing, typography } from "@/constants/theme";
import { verifyResetCodeRequest, forgotPasswordRequest } from "@/services/authService";

export default function VerifyResetCodeScreen({ navigation, route }) {
  const { email } = route.params;

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [resendMessage, setResendMessage] = useState("");

  const handleSubmit = async () => {
    if (!code.trim() || code.trim().length !== 6) {
      setError("Le code doit contenir 6 chiffres.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { resetToken } = await verifyResetCodeRequest(email, code.trim());
      navigation.navigate("ResetPassword", { resetToken });
    } catch (err) {
      setError(err.response?.data?.error || "Code invalide.");
    } finally {
      setLoading(false);
    }
  };

  // Permet de redemander un code si l'utilisateur ne l'a pas reçu ou s'il a expiré
  const handleResend = async () => {
    setResending(true);
    setError("");
    setResendMessage("");
    try {
      await forgotPasswordRequest(email);
      setResendMessage("Un nouveau code a été envoyé.");
    } catch (err) {
      setError("Impossible de renvoyer le code pour le moment.");
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => navigation.goBack()} style={styles.back} hitSlop={10}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </Pressable>

          <Text style={typography.h1}>Vérification</Text>
          <Text style={styles.subtitle}>
            Un code à 6 chiffres a été envoyé à {email}. Il est valable 10 minutes.
          </Text>

          <View style={{ marginTop: spacing.xl }}>
            <TextField
              label="Code de vérification"
              placeholder="123456"
              value={code}
              onChangeText={(v) => {
                setCode(v.replace(/[^0-9]/g, "").slice(0, 6));
                if (error) setError("");
              }}
              keyboardType="number-pad"
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {resendMessage ? <Text style={styles.successText}>{resendMessage}</Text> : null}

          <Button title="Vérifier le code" onPress={handleSubmit} loading={loading} style={{ marginTop: spacing.sm }} />

          <Pressable onPress={handleResend} disabled={resending} style={styles.resendRow}>
            <Text style={styles.link}>{resending ? "Envoi en cours..." : "Renvoyer le code"}</Text>
          </Pressable>
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
  successText: { color: colors.success, fontSize: 13, marginTop: spacing.sm },
  resendRow: { alignItems: "center", marginTop: spacing.lg },
  link: { color: "#3E7BFA", fontSize: 14, fontWeight: "600" },
});