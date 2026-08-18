import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { colors, radius, spacing } from "@/constants/theme";

export default function CategoryChip({ label, selected, onPress, accent = colors.black, dashed }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        dashed && styles.dashed,
        selected && { backgroundColor: accent, borderColor: accent },
      ]}
    >
      <Text style={[styles.text, selected && { color: colors.white }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    // Empêche le chip de s'étirer verticalement dans une rangée horizontale
    // (c'était la cause de la forme ovale/circulaire)
    alignSelf: "flex-start",
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8, // légèrement réduit pour une pilule plus fine
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.chipBg,
    borderWidth: 1,
    borderColor: colors.chipBg,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  dashed: {
    borderStyle: "dashed",
    borderColor: colors.textMuted,
    backgroundColor: "transparent",
  },
  text: {
    fontSize: 13, // légèrement réduit pour rester net dans la pilule
    color: colors.textPrimary,
    fontWeight: "600", // un peu plus marqué pour la lisibilité
  },
});