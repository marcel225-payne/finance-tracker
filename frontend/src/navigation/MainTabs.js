import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import DashboardScreen from "@/screens/DashboardScreen";
import TransactionsScreen from "@/screens/TransactionsScreen";
import BudgetScreen from "@/screens/BudgetScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import { useFinance } from "@/context/FinanceContext";
import { colors } from "@/constants/theme";

const Tab = createBottomTabNavigator();

function initials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function AddButton({ navigation }) {
  return (
    <Pressable style={styles.addButton} onPress={() => navigation.navigate("NewTransaction")}>
      <Ionicons name="add" size={26} color={colors.white} />
    </Pressable>
  );
}

function ProfileIcon({ color }) {
  const { user } = useFinance();
  return (
    <View style={[styles.profileDot, { borderColor: color }]}>
      <Text style={styles.profileDotText}>{initials(user?.name)}</Text>
    </View>
  );
}

export default function MainTabs({ navigation: rootNavigation }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.black,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="TransactionsTab"
        component={TransactionsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="menu-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="AddTab"
        component={DashboardScreen}
        options={{
          tabBarIcon: () => null,
          tabBarButton: () => <AddButton navigation={rootNavigation} />,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            rootNavigation.navigate("NewTransaction");
          },
        }}
      />
      <Tab.Screen
        name="BudgetTab"
        component={BudgetScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="pie-chart-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <ProfileIcon color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 70,
    paddingBottom: 14,
    paddingTop: 10,
    borderTopColor: colors.border,
  },
  addButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.black,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    top: -6,
  },
  profileDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  profileDotText: { fontSize: 10, fontWeight: "700", color: colors.textPrimary },
});
