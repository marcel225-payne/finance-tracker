import React from "react";
import { View, StyleSheet } from "react-native";
import { colors, radius } from "@/constants/theme";

export default function ProgressBar({ value, max, color }) {
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  const barColor = color || (pct >= 1 ? colors.danger : colors.success);
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: barColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    backgroundColor: "#EFEEEB",
    borderRadius: radius.pill,
    overflow: "hidden",
    width: "100%",
  },
  fill: {
    height: "100%",
    borderRadius: radius.pill,
  },
});
