import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FE" />
      
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

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
      </ScrollView>

      {/* Custom Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('History')}>
          <Text style={styles.navIcon}>📜</Text>
          <Text style={styles.navLabel}>History</Text>
        </TouchableOpacity>
        
        <View style={styles.fabContainer}>
          <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddTransaction')}>
            <Text style={styles.fabIcon}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Reports')}>
          <Text style={styles.navIcon}>📊</Text>
          <Text style={styles.navLabel}>Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, styles.activeNavIcon]}>👤</Text>
          <Text style={[styles.navLabel, styles.activeNavLabel]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FE' },
  headerBackground: {
    backgroundColor: '#DCD6FF', // Soft lavender
    height: 250,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
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
  
  scrollView: { flex: 1, marginTop: 260, ...Platform.select({ web: { overflowY: 'auto' } }) },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, flexGrow: 1 },
  
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

  bottomNav: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    height: 80, paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    borderTopLeftRadius: 30, borderTopRightRadius: 30,
    elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.05, shadowRadius: 20,
  },
  navItem: { alignItems: 'center', justifyContent: 'center', width: 60 },
  navIcon: { fontSize: 22, color: '#94A3B8', marginBottom: 4 },
  navLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '600' },
  activeNavIcon: { color: '#4338CA' },
  activeNavLabel: { color: '#4338CA', fontWeight: 'bold' },
  fabContainer: { position: 'relative', top: -25, alignItems: 'center', justifyContent: 'center' },
  fab: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: '#4338CA',
    alignItems: 'center', justifyContent: 'center',
    elevation: 10, shadowColor: '#4338CA', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 15,
  },
  fabIcon: { fontSize: 32, color: '#fff', fontWeight: '300', marginTop: -2 },
});
