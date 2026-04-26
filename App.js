import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Platform, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { initDatabase } from './src/database/db';
import { setupNotifications } from './src/utils/notifications';

import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AddTransactionScreen from './src/screens/AddTransactionScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AnalysisScreen from './src/screens/AnalysisScreen';

// Disable native screens on web to fix scrolling issues
if (Platform.OS === 'web') {
  enableScreens(false);
}

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const CustomTabBarButton = ({ children, onPress }) => (
  <View style={{ top: -20, justifyContent: 'center', alignItems: 'center' }}>
    <TouchableOpacity
      style={{
        width: 60, height: 60, borderRadius: 30, backgroundColor: '#4338CA',
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#4338CA', shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4, shadowRadius: 15, elevation: 10
      }}
      onPress={onPress}
    >
      <Text style={{ fontSize: 32, color: '#fff', fontWeight: '300', marginTop: -2 }}>+</Text>
    </TouchableOpacity>
  </View>
);

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          height: Platform.OS === 'ios' ? 90 : 70,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          position: 'absolute',
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 0.05,
          shadowRadius: 20,
          borderTopWidth: 0,
        },
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginBottom: Platform.OS === 'ios' ? 0 : 10 },
        tabBarActiveTintColor: '#4338CA',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarIcon: ({ color, size }) => {
          let icon;
          if (route.name === 'Home') icon = '🏠';
          else if (route.name === 'History') icon = '📜';
          else if (route.name === 'Reports') icon = '📊';
          else if (route.name === 'Profile') icon = '👤';
          return <Text style={{ fontSize: 20, color }}>{icon}</Text>;
        },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen 
        name="AddButton" 
        component={View} 
        options={{
          tabBarButton: (props) => (
            <CustomTabBarButton {...props} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('AddTransaction');
          },
        })}
      />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    initDatabase();
    setupNotifications();
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FE' }} edges={['top', 'left', 'right']}>
        <NavigationContainer>
          <Stack.Navigator 
            initialRouteName="Login"
            screenOptions={{
              cardStyle: { backgroundColor: '#F8F9FE' },
              headerStyle: { backgroundColor: '#F8F9FE', elevation: 0, shadowOpacity: 0 },
              headerTintColor: '#1E293B',
              headerTitleStyle: { fontWeight: 'bold' },
              headerBackTitleVisible: false,
            }}
          >
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="MainTabs" 
              component={MainTabs} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="AddTransaction" 
              component={AddTransactionScreen} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="Analysis" 
              component={AnalysisScreen} 
              options={{ headerShown: false }} 
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
