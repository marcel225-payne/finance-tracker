import React, { useState } from "react";
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import TextField from "@/components/TextField";
import Button from "@/components/Button";
import { colors, spacing, typography } from "@/constants/theme";
import { forgotPasswordRequest } from "@/services/authService";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("Merci de renseigner ton email.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await forgotPasswordRequest(email.trim().toLowerCase());
      // On avance à l'écran de vérification quoi qu'il arrive (le backend ne révèle jamais
      // si l'email existe ou non, pour des raisons de sécurité)
      navigation.navigate("VerifyResetCode", { email: email.trim().toLowerCase() });
    } catch (err) {
      setError(err.response?.data?.error || "Une erreur est survenue. Réessaie.");
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

          <Text style={typography.h1}>Mot de passe oublié</Text>
          <Text style={styles.subtitle}>
            Indique ton email, on t'envoie un code de vérification pour réinitialiser ton mot de passe.
          </Text>

          <View style={{ marginTop: spacing.xl }}>
            <TextField
              label="Email"
              placeholder="vous@exemple.com"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (error) setError("");
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button title="Envoyer le code" onPress={handleSubmit} loading={loading} style={{ marginTop: spacing.sm }} />
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