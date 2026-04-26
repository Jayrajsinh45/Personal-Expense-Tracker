import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenHeader from '../components/ScreenHeader';

export default function ProfileScreen({ navigation }) {
  const handleLogout = async () => {
    await AsyncStorage.removeItem('isLoggedIn');
    navigation.replace('Login');
  };

  const SettingItem = ({ icon, title, isDanger, onPress }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={[styles.iconBox, isDanger && { backgroundColor: '#FEF2F2' }]}>
          <Text style={styles.settingIcon}>{icon}</Text>
        </View>
        <Text style={[styles.settingTitle, isDanger && { color: '#EF4444' }]}>{title}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: '#F8F9FE' }} 
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={true}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FE" />
      <ScreenHeader title="Profile" navigation={navigation} />
      
      {/* Lavender Gradient Header Area */}
      <View style={styles.headerBackground}>
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>JB</Text>
          </View>
          <Text style={styles.userName}>Jayrajsinh Barad</Text>
          <Text style={styles.userEmail}>jayrajsinhbarad0906@gmail.com</Text>
        </View>
      </View>

      <View style={styles.scrollContent}>
        <View style={styles.settingsGroup}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <SettingItem icon="👤" title="Edit Profile" />
            <View style={styles.divider} />
            <SettingItem icon="🔔" title="Notifications" />
            <View style={styles.divider} />
            <SettingItem icon="🛡️" title="Security & Privacy" />
          </View>
        </View>

        <View style={styles.settingsGroup}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <SettingItem icon="💰" title="Currency (INR)" />
            <View style={styles.divider} />
            <SettingItem icon="🎨" title="Appearance" />
          </View>
        </View>

        <View style={[styles.settingsGroup, { marginBottom: 100 }]}>
          <View style={styles.card}>
            <SettingItem icon="🚪" title="Log Out" isDanger={true} onPress={handleLogout} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FE', overflow: 'hidden' },
  headerBackground: {
    backgroundColor: '#DCD6FF', // Soft lavender
    height: 250,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: { alignItems: 'center', marginTop: 40 },
  avatarContainer: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: '#4338CA',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: '#fff',
    elevation: 10, shadowColor: '#4338CA', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15,
  },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#1E293B', marginTop: 15 },
  userEmail: { fontSize: 13, color: '#64748B', marginTop: 4 },
  
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },
  
  settingsGroup: { marginBottom: 25 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#94A3B8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  card: {
    backgroundColor: '#fff', borderRadius: 20,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10,
  },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18 },
  settingLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  settingIcon: { fontSize: 18 },
  settingTitle: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  chevron: { fontSize: 20, color: '#CBD5E1' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 70 },
});
