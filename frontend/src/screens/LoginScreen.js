import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFinance } from "@/context/FinanceContext";
import TextField from "@/components/TextField";
import Button from "@/components/Button";
import { colors, spacing, typography } from "@/constants/theme";

export default function LoginScreen({ navigation }) {
  // Récupère la fonction signIn depuis le contexte global (maintenant connectée au backend)
  const { signIn } = useFinance();

  // États locaux
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🆕 Validation et soumission — appel réel au backend via signIn (async)
  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await signIn({ email: email.trim().toLowerCase(), password });
      // Pas besoin de naviguer manuellement : RootNavigator bascule automatiquement
      // vers "Main" dès que `user` est défini dans le contexte
    } catch (err) {
      // 🆕 Affiche le message d'erreur renvoyé par le backend (ex: "Mot de passe incorrect")
      setError(err.response?.data?.error || "Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  // Réinitialise l'erreur lors de la saisie
  const handleChange = (setter) => (text) => {
    setter(text);
    if (error) setError("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Titre & Sous-titre */}
          <Text style={typography.h1}>Finance Tracker</Text>
          <Text style={styles.subtitle}>
            Suivez vos revenus et dépenses simplement
          </Text>

          {/* Formulaire */}
          <View style={{ marginTop: spacing.xl }}>
            <TextField
              label="Email"
              placeholder="vous@exemple.com"
              value={email}
              onChangeText={handleChange(setEmail)}
              keyboardType="email-address"
              autoCapitalize="none" // Empêche la majuscule automatique sur l'email
              autoCorrect={false}
            />
            <TextField
              label="Mot de passe"
              placeholder="••••••••"
              value={password}
              onChangeText={handleChange(setPassword)}
              secureTextEntry
            />
          </View>

          {/* Affichage d'erreur */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Bouton de validation */}
          <Button
            title="Se connecter"
            onPress={handleSubmit}
            loading={loading}
            style={{ marginTop: spacing.sm }}
          />
              {/* Lien vers le flux de récupération de mot de passe */}
          <Pressable onPress={() => navigation.navigate("ForgotPassword")} style={styles.forgotRow}>
            <Text style={styles.link}>Mot de passe oublié ?</Text>
          </Pressable>
 
          {/* Affichage d'erreur */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Lien d'inscription */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Pas encore de compte ? </Text>
            <Pressable onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.link}>Créer un compte</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, padding: spacing.lg, justifyContent: "center" },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  errorText: {
    color: colors.danger, // Utilise la couleur issue de ton thème
    fontSize: 13,
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.lg,
  },
  footerText: { color: colors.textSecondary, fontSize: 14 },
  link: { color: colors.income || "#3E7BFA", fontSize: 14, fontWeight: "600" },
});