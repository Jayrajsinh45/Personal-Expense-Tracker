import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';

export default function ScreenHeader({ title, navigation, showBack = true }) {
  return (
    <View style={styles.header}>
      {showBack ? (
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
      <Text style={styles.title}>{title}</Text>
      <View style={styles.placeholder} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 15,
    paddingBottom: 15,
    backgroundColor: '#F8F9FE',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 5,
  },
  backArrow: { fontSize: 20, color: '#1E293B', fontWeight: 'bold' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  placeholder: { width: 40 },
});
