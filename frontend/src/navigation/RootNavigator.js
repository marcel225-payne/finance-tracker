import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFinance } from "@/context/FinanceContext";
import LoginScreen from "@/screens/LoginScreen";
import SignupScreen from "@/screens/SignupScreen";
import ForgotPasswordScreen from "@/screens/ForgotPasswordScreen";
import ResetPasswordScreen from "@/screens/ResetPasswordScreen";
import MainTabs from "./MainTabs";
import NewTransactionScreen from "@/screens/NewTransactionScreen";
import NewCategoryScreen from "@/screens/NewCategoryScreen";
import AddBudgetScreen from "@/screens/AddBudgetScreen";
import NotificationsScreen from "@/screens/NotificationsScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user } = useFinance();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Group>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          {/* 🆕 VerifyResetCode retiré — plus de code à vérifier dans la version simplifiée */}
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </Stack.Group>
      ) : (
        <Stack.Group>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Group screenOptions={{ presentation: "modal" }}>
            <Stack.Screen name="NewTransaction" component={NewTransactionScreen} />
            <Stack.Screen name="NewCategory" component={NewCategoryScreen} />
            <Stack.Screen name="AddBudget" component={AddBudgetScreen} />
          </Stack.Group>
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}