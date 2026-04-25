import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { getFinancialSummary } from '../database/db';

export default function DashboardScreen({ navigation }) {
  const [summary, setSummary] = useState({ Salary: 0, Expense: 0, Saving: 0, SIP: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();

  const loadData = () => {
    const data = getFinancialSummary();
    setSummary(data);
  };

  useEffect(() => {
    if (isFocused) loadData();
  }, [isFocused]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
    setRefreshing(false);
  };

  const balance = summary.Salary - (summary.Expense + summary.Saving + summary.SIP);

  const SummaryCard = ({ title, amount, color }) => (
    <View style={[styles.card, { borderLeftColor: color, borderLeftWidth: 5 }]}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={[styles.cardAmount, { color }]}>₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.balanceLabel}>Total Available Balance</Text>
        <Text style={styles.balanceAmount}>₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
      </View>

      <View style={styles.grid}>
        <SummaryCard title="Total Salary" amount={summary.Salary} color="#10B981" />
        <SummaryCard title="Total Expenses" amount={summary.Expense} color="#EF4444" />
        <SummaryCard title="Total Savings" amount={summary.Saving} color="#3B82F6" />
        <SummaryCard title="Total SIPs" amount={summary.SIP} color="#8B5CF6" />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => navigation.navigate('AddTransaction')}
        >
          <Text style={styles.actionButtonText}>Add New Record</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.outlineButton]} 
          onPress={() => navigation.navigate('History')}
        >
          <Text style={[styles.actionButtonText, styles.outlineButtonText]}>View History</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.reportButton]} 
          onPress={() => navigation.navigate('Reports')}
        >
          <Text style={styles.actionButtonText}>View Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.logoutButton]} 
          onPress={async () => {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            await AsyncStorage.removeItem('isLoggedIn');
            navigation.replace('Login');
          }}
        >
          <Text style={styles.actionButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    backgroundColor: '#4F46E5',
    padding: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceLabel: { color: '#E0E7FF', fontSize: 16 },
  balanceAmount: { color: '#fff', fontSize: 36, fontWeight: 'bold', marginTop: 5 },
  grid: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: { fontSize: 14, color: '#6B7280', marginBottom: 5 },
  cardAmount: { fontSize: 18, fontWeight: 'bold' },
  actions: { padding: 20 },
  actionButton: {
    backgroundColor: '#4F46E5',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  outlineButton: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#4F46E5' },
  outlineButtonText: { color: '#4F46E5' },
  reportButton: { backgroundColor: '#111827' },
  logoutButton: { backgroundColor: '#EF4444' }
});
