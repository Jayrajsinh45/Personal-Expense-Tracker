import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { initDatabase } from './src/database/db';

import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AddTransactionScreen from './src/screens/AddTransactionScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ReportsScreen from './src/screens/ReportsScreen';

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: '#4F46E5' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Dashboard" 
          component={DashboardScreen} 
          options={{ title: 'Financial Overview', headerLeft: () => null }}
        />
        <Stack.Screen 
          name="AddTransaction" 
          component={AddTransactionScreen} 
          options={{ title: 'Add Record' }} 
        />
        <Stack.Screen 
          name="History" 
          component={HistoryScreen} 
          options={{ title: 'Transaction History' }} 
        />
        <Stack.Screen 
          name="Reports" 
          component={ReportsScreen} 
          options={{ title: 'Monthly Reports' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
