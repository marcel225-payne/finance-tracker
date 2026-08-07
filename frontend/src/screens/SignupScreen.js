import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFinance } from "../context/FinanceContext";
import TextField from "../components/TextField";
import Button from "../components/Button";
import { colors, spacing, typography } from "@/constants/theme";

// Regex : vrai dès que la chaîne contient au moins un chiffre (0-9)
// Utilisée pour interdire les chiffres dans le nom complet.
const CONTAINS_DIGIT = /\d/;

export default function SignupScreen({ navigation }) {
  // Récupère la fonction signUp depuis le contexte global (maintenant connectée au backend)
  const { signUp } = useFinance();

  // États locaux pour chaque champ du formulaire d'inscription
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState(""); // confirmation du mot de passe

  // État de la case à cocher "conditions d'utilisation"
  const [accepted, setAccepted] = useState(false);

  // Message d'erreur affiché à l'utilisateur (vide = pas d'erreur)
  const [error, setError] = useState("");

  // Indique si la "création de compte" est en cours (affiche un loader sur le bouton)
  const [loading, setLoading] = useState(false);

  // Fonction appelée quand l'utilisateur appuie sur "Créer mon compte".
  // Les validations sont exécutées dans l'ordre, et on s'arrête à la première qui échoue.
  const handleSubmit = async () => {
    setError(""); // on repart d'un état propre à chaque tentative

    // 1) Tous les champs doivent être renseignés
    if (!name || !email || !password || !confirm) {
      setError("Merci de remplir tous les champs.");
      return;
    }

    // 2) Le nom complet ne doit contenir aucun chiffre
    if (CONTAINS_DIGIT.test(name)) {
      setError("Le nom complet ne doit pas contenir de chiffres.");
      return;
    }

    // 3) Le mot de passe doit faire au moins 8 caractères
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    // 4) Le mot de passe et sa confirmation doivent être identiques
    if (password !== confirm) {
      setError("Le mots de passe ne correspondent pas.");
      return;
    }

    // 5) L'utilisateur doit accepter les conditions d'utilisation
    if (!accepted) {
      setError("Merci d'accepter les conditions d'utilisation.");
      return;
    }

    // Toutes les validations sont passées : on crée le compte via le backend
    setLoading(true);

    // Vrai appel API (remplace le setTimeout simulé)
    try {
      await signUp({ name, email, password });
      // Pas besoin de naviguer manuellement : RootNavigator bascule automatiquement
      // vers "Main" dès que `user` est défini dans le contexte
    } catch (err) {
      // Affiche le message d'erreur renvoyé par le backend (ex: "email déjà utilisé")
      setError(err.response?.data?.error || "Erreur lors de la création du compte.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // SafeAreaView : évite que le contenu chevauche l'encoche ou la barre de statut
    <SafeAreaView style={styles.container}>
      {/* KeyboardAvoidingView : remonte le contenu quand le clavier s'affiche (iOS uniquement ici) */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        {/* ScrollView : permet de scroller si le clavier réduit l'espace visible */}
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Bouton retour vers l'écran précédent (Login) */}
          <Pressable onPress={() => navigation.goBack()} style={styles.back} hitSlop={10}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </Pressable>

          {/* Titre + sous-titre */}
          <Text style={typography.h1}>Créer un compte</Text>
          <Text style={styles.subtitle}>Commencez à suivre vos finances en 1 minute</Text>

          {/* Champs de saisie du formulaire */}
          <View style={{ marginTop: spacing.lg }}>
            <TextField label="Nom complet" placeholder="Votre nom" value={name} 
            onChangeText={setName} autoCapitalize="words" />
            <TextField label="Email" placeholder="vous@exemple.com" value={email} 
            onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
            <TextField label="Mot de passe" placeholder="Au moins 8 caractères" value={password} 
            onChangeText={setPassword} secureTextEntry />
            <TextField label="Confirmer le mot de passe" placeholder="••••••••" value={confirm} 
            onChangeText={setConfirm} secureTextEntry />
          </View>

          {/* Case à cocher "conditions d'utilisation" — toute la ligne est cliquable */}
          <Pressable style={styles.checkRow} onPress={() => setAccepted((a) => !a)}>
            <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
              {/* La coche ne s'affiche que si "accepted" est vrai */}
              {accepted ? <Ionicons name="checkmark" size={14} color={colors.white} /> : null}
            </View>
            <Text style={styles.checkLabel}>
              J'accepte les conditions d'utilisation et la politique de confidentialité
            </Text>
          </Pressable>

          {/* Message d'erreur — affiché uniquement si "error" n'est pas vide */}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Bouton principal : lance handleSubmit, affiche un loader pendant "loading" */}
          <Button title="Créer mon compte" onPress={handleSubmit} loading={loading} style={{ marginTop: spacing.sm }} />

          {/* Lien de retour vers l'écran de connexion */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Déjà un compte ? </Text>
            <Pressable onPress={() => navigation.goBack()}>
              <Text style={styles.link}>Se connecter</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Styles du composant
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background }, // Fond de l'écran entier
  scroll: { flexGrow: 1, padding: spacing.lg }, // Marge intérieure du contenu scrollable
  back: { marginBottom: spacing.md }, // Espace sous le bouton retour
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.sm },

  // Ligne contenant la case à cocher + le texte des conditions
  checkRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: spacing.md },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    marginRight: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: { backgroundColor: colors.black, borderColor: colors.black }, // Style quand coché
  checkLabel: { flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 18 },

  error: { color: colors.danger, fontSize: 13, marginBottom: spacing.sm }, // Style du message d'erreur

  // Pied de page avec le lien "Se connecter"
  footer: { flexDirection: "row", justifyContent: "center", marginTop: spacing.lg },
  footerText: { color: colors.textSecondary, fontSize: 14 },
  link: { color: "#3E7BFA", fontSize: 14, fontWeight: "600" },
});