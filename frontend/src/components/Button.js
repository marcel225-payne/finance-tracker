import React from "react";
import { Pressable, Text, StyleSheet, ActivityIndicator } from "react-native";
import { colors, radius } from "@/constants/theme";

export default function Button({ title, onPress, variant = "dark", disabled, loading, style }) {
  const isDark = variant === "dark";
  const isGreen = variant === "green";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isDark && styles.dark,
        isGreen && styles.green,
        variant === "outline" && styles.outline,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" ? colors.black : colors.white} />
      ) : (
        <Text
          style={[
            styles.text,
            variant === "outline" && { color: colors.textPrimary },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  dark: { backgroundColor: colors.black },
  green: { backgroundColor: colors.success },
  outline: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  text: { color: colors.white, fontSize: 16, fontWeight: "600" },
});
