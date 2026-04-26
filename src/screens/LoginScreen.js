import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  Alert, Image, ActivityIndicator, StatusBar, KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_CONFIG } from '../utils/constants';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => { checkLoginState(); }, []);

  const checkLoginState = async () => {
    try {
      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
      if (isLoggedIn === 'true') navigation.replace('MainTabs');
      else setIsCheckingAuth(false);
    } catch (e) { setIsCheckingAuth(false); }
  };

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Required', 'Please enter both email and password.'); return; }
    setIsLoggingIn(true);
    setTimeout(async () => {
      if (email.toLowerCase() === AUTH_CONFIG.EMAIL && password === AUTH_CONFIG.PASSWORD) {
        try { await AsyncStorage.setItem('isLoggedIn', 'true'); navigation.replace('MainTabs'); } 
        catch (e) { Alert.alert('Error', 'Failed to save login session.'); setIsLoggingIn(false); }
      } else { Alert.alert('Access Denied', 'Invalid email or password.'); setIsLoggingIn(false); }
    }, 800);
  };

  if (isCheckingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4338CA" />
      </View>
    );
  }

  const Content = (
    <View style={{ flex: 1 }}>
      <View style={styles.headerCurve} />
      <View style={styles.logoSection}>
        <View style={styles.logoCircle}>
          <Image source={require('../../assets/images/icon.png')} style={styles.logo} resizeMode="contain" />
        </View>
        <Text style={styles.appName}>Expensify</Text>
        <Text style={styles.appTagline}>Smart Financial Management</Text>
      </View>

      <View style={styles.authCard}>
        <Text style={styles.cardHeader}>Welcome Back</Text>
        <Text style={styles.cardSubHeader}>Sign in to continue managing your expenses</Text>

        <View style={styles.inputBox}>
          <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
          <TextInput style={styles.input} placeholder="example@mail.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#CBD5E1" />
        </View>

        <View style={styles.inputBox}>
          <Text style={styles.inputLabel}>PASSWORD</Text>
          <TextInput style={styles.input} placeholder="••••••••" secureTextEntry value={password} onChangeText={setPassword} placeholderTextColor="#CBD5E1" />
        </View>

        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={isLoggingIn}>
          {isLoggingIn ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginBtnText}>Sign In Now</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.forgotBtn}><Text style={styles.forgotText}>Forgot Password?</Text></TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Secure Login Powered by Expensify</Text>
        <Text style={styles.copyright}>© 2026 Jayrajsinh Barad</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: '#F8F9FE' }}>
      <StatusBar barStyle="light-content" backgroundColor="#4338CA" />
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {Content}
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FE' },
  headerCurve: { position: 'absolute', top: 0, left: 0, right: 0, height: 300, backgroundColor: '#4338CA', borderBottomLeftRadius: 100, borderBottomRightRadius: 100, transform: [{ scaleX: 1.2 }] },
  logoSection: { alignItems: 'center', marginTop: 60, marginBottom: 40 },
  logoCircle: { width: 90, height: 90, backgroundColor: '#fff', borderRadius: 30, padding: 15, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 15 },
  logo: { width: '100%', height: '100%' },
  appName: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginTop: 15 },
  appTagline: { fontSize: 14, color: '#E0E7FF', marginTop: 5, fontWeight: '500' },
  authCard: { backgroundColor: '#fff', marginHorizontal: 25, borderRadius: 30, padding: 30, elevation: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.1, shadowRadius: 25 },
  cardHeader: { fontSize: 24, fontWeight: 'bold', color: '#1E293B', textAlign: 'center' },
  cardSubHeader: { fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 8, marginBottom: 30 },
  inputBox: { marginBottom: 20 },
  inputLabel: { fontSize: 11, fontWeight: '800', color: '#94A3B8', marginBottom: 10, letterSpacing: 1 },
  input: { backgroundColor: '#F8F9FE', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 15, padding: 16, fontSize: 15, color: '#1E293B' },
  loginBtn: { backgroundColor: '#4338CA', borderRadius: 18, padding: 20, alignItems: 'center', marginTop: 10, elevation: 8, shadowColor: '#4338CA', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  forgotBtn: { marginTop: 20, alignItems: 'center' },
  forgotText: { color: '#6366F1', fontSize: 14, fontWeight: '600' },
  footer: { marginTop: 40, paddingVertical: 20, alignItems: 'center' },
  footerText: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
  copyright: { fontSize: 11, color: '#CBD5E1', marginTop: 5 },
});
