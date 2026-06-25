import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FeatureProvider, useFeatures, useFeature } from './src/FeatureContext';
import { getUser } from './src/api';
import { COLORS } from './src/config';

import LoginScreen, { OTPScreen } from './src/screens/LoginScreen';
import CGUScreen                  from './src/screens/CGUScreen';
import HomeScreen                 from './src/screens/HomeScreen';
import ProductScreen              from './src/screens/ProductScreen';
import OrdersScreen               from './src/screens/OrdersScreen';
import ProfileScreen              from './src/screens/ProfileScreen';
import CashbackScreen             from './src/screens/CashbackScreen';
import CashWorkScreen             from './src/screens/CashWorkScreen';
import ExternalPayScreen          from './src/screens/ExternalPayScreen';
import SupplierDashboard          from './src/screens/SupplierDashboard';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

function TabIcon({ icon, color }) {
  return <Text style={{ fontSize: 22, color }}>{icon}</Text>;
}

function MainTabs() {
  const cashbackEnabled = useFeature('cashback_system');
  return (
    <Tab.Navigator screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textLight,
      tabBarStyle: { borderTopColor: COLORS.border, paddingBottom: 6, height: 60 },
    }}>
      <Tab.Screen name="Accueil" component={HomeScreen}
        options={{ tabBarIcon: ({ color }) => <TabIcon icon="🏠" color={color}/>, tabBarLabel: 'Accueil' }}/>
      <Tab.Screen name="Commandes" component={OrdersScreen}
        options={{ tabBarIcon: ({ color }) => <TabIcon icon="📦" color={color}/>, tabBarLabel: 'Commandes' }}/>
      {cashbackEnabled && (
        <Tab.Screen name="Cashback" component={CashbackScreen}
          options={{ tabBarIcon: ({ color }) => <TabIcon icon="💰" color={color}/>, tabBarLabel: 'Cashback' }}/>
      )}
      <Tab.Screen name="Profil" component={ProfileScreen}
        options={{ tabBarIcon: ({ color }) => <TabIcon icon="👤" color={color}/>, tabBarLabel: 'Profil' }}/>
    </Tab.Navigator>
  );
}

function AppNavigator({ user }) {
  const { features, loaded } = useFeatures();
  if (!loaded) return <View style={st.loading}><ActivityIndicator size="large" color={COLORS.primary}/></View>;
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen}/>
          <Stack.Screen name="OTP"   component={OTPScreen}/>
          <Stack.Screen name="CGU"   component={CGUScreen}/>
        </>
      ) : (
        <>
          <Stack.Screen name="Main"         component={MainTabs}/>
          <Stack.Screen name="Product"      component={ProductScreen}/>
          <Stack.Screen name="SupplierDash" component={SupplierDashboard}/>
          {features.cash_work_system && (
            <Stack.Screen name="CashWork" component={CashWorkScreen}/>
          )}
          {features.external_payment_escrow && (
            <Stack.Screen name="ExternalPay" component={ExternalPayScreen}/>
          )}
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getUser().then(u => { setUser(u); setLoading(false); }); }, []);

  if (loading) return <View style={st.loading}><ActivityIndicator size="large" color={COLORS.primary}/></View>;

  return (
    <SafeAreaProvider>
      <FeatureProvider>
        <NavigationContainer>
          <AppNavigator user={user}/>
        </NavigationContainer>
      </FeatureProvider>
    </SafeAreaProvider>
  );
}

const st = StyleSheet.create({
  loading: { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:COLORS.white },
});
