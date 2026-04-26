import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  RefreshControl, StatusBar, Platform, FlatList
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { getFinancialSummary, getAllTransactions } from '../database/db';
import { format } from 'date-fns';

export default function DashboardScreen({ navigation }) {
  const [summary, setSummary] = useState({ Salary: 0, Expense: 0, Saving: 0, SIP: 0 });
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();

  const loadData = () => {
    setSummary(getFinancialSummary());
    setTransactions(getAllTransactions().slice(0, 5)); // Get recent 5
  };

  useEffect(() => { if (isFocused) loadData(); }, [isFocused]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
    setRefreshing(false);
  };

  const balance = summary.Salary - (summary.Expense + summary.Saving + summary.SIP);

  const getTypeColor = (type) => {
    switch (type) {
      case 'Salary': return '#10B981';
      case 'Expense': return '#EF4444';
      case 'Saving': return '#3B82F6';
      case 'SIP': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: '#F8F9FE' }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4338CA" />}
      showsVerticalScrollIndicator={true}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FE" />
        {/* Header matching Dribbble */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hi, Jayrajsinh 👋</Text>
            <Text style={styles.subGreeting}>Welcome back to your wallet</Text>
          </View>
          <TouchableOpacity style={styles.bellBtn}>
            <Text style={{ fontSize: 20 }}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* This Month Spend */}
        <View style={styles.spendSection}>
          <Text style={styles.spendLabel}>This Month Spend</Text>
          <Text style={styles.spendAmount}>₹{summary.Expense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
        </View>

        {/* Wallet Card */}
        <View style={styles.walletCard}>
          <View style={styles.walletLeft}>
            <View style={styles.walletIconBox}>
              <Text style={{ fontSize: 22 }}>💳</Text>
            </View>
            <View>
              <Text style={styles.walletName}>Total Balance</Text>
              <Text style={styles.walletAccount}>Available Funds</Text>
            </View>
          </View>
          <Text style={styles.walletBalance}>₹{balance.toLocaleString('en-IN')}</Text>
        </View>

        {/* Quick Summary Grid */}
        <View style={styles.grid}>
          {[
            { title: 'Income', typeParam: 'Salary', amount: summary.Salary, icon: '⬇️', color: '#10B981', bg: '#D1FAE5' },
            { title: 'Expense', typeParam: 'Expense', amount: summary.Expense, icon: '⬆️', color: '#EF4444', bg: '#FEE2E2' },
            { title: 'Investment', typeParam: 'SIP', amount: summary.SIP, icon: '↗️', color: '#8B5CF6', bg: '#EDE9FE' },
          ].map((item, idx) => (
            <TouchableOpacity key={idx} style={styles.miniCard} onPress={() => navigation.navigate('Reports', { filterType: item.typeParam })}>
              <View style={[styles.miniIconBox, { backgroundColor: item.bg }]}>
                <Text style={{ fontSize: 14 }}>{item.icon}</Text>
              </View>
              <View>
                <Text style={styles.miniLabel}>{item.title}</Text>
                <Text style={[styles.miniAmount, { color: item.color }]}>₹{item.amount.toLocaleString()}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Transactions */}
        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {transactions.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No recent transactions.</Text>
          </View>
        ) : (
          transactions.map((item) => (
            <View key={item.id} style={styles.txRow}>
              <View style={[styles.txIconBox, { backgroundColor: getTypeColor(item.type) + '15' }]}>
                <Text style={{ fontSize: 18 }}>{item.type === 'Salary' ? '💰' : item.type === 'Expense' ? '🍔' : '🏦'}</Text>
              </View>
              <View style={styles.txMid}>
                <Text style={styles.txCategory}>{item.category}</Text>
                <Text style={styles.txDate}>{format(new Date(item.date), 'dd MMM, hh:mm a')}</Text>
              </View>
              <Text style={[styles.txAmount, { color: getTypeColor(item.type) }]}>
                {item.type === 'Expense' ? '-' : '+'}₹{item.amount.toLocaleString()}
              </Text>
            </View>
          ))
        )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  greeting: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  subGreeting: { fontSize: 13, color: '#64748B', marginTop: 4 },
  bellBtn: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 2, shadowColor: '#000', shadowOffset: {width:0,height:2}, shadowOpacity: 0.05 },

  spendSection: { alignItems: 'center', marginBottom: 30 },
  spendLabel: { fontSize: 14, color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  spendAmount: { fontSize: 42, fontWeight: '900', color: '#1E293B', marginTop: 8 },

  walletCard: {
    backgroundColor: '#fff', borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    elevation: 8, shadowColor: '#4338CA', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, marginBottom: 20,
    borderWidth: 1, borderColor: '#F1F5F9'
  },
  walletLeft: { flexDirection: 'row', alignItems: 'center' },
  walletIconBox: { width: 50, height: 50, borderRadius: 16, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  walletName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  walletAccount: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  walletBalance: { fontSize: 18, fontWeight: '800', color: '#4338CA' },

  grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  miniCard: {
    backgroundColor: '#fff', width: '31%', borderRadius: 16, padding: 10, paddingVertical: 15, alignItems: 'center',
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10,
  },
  miniIconBox: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  miniLabel: { fontSize: 11, color: '#64748B', fontWeight: '600', textAlign: 'center' },
  miniAmount: { fontSize: 13, fontWeight: 'bold', marginTop: 2, textAlign: 'center' },

  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  seeAll: { fontSize: 13, color: '#4338CA', fontWeight: 'bold' },

  txRow: {
    backgroundColor: '#fff', borderRadius: 20, padding: 15, flexDirection: 'row', alignItems: 'center', marginBottom: 12,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 5,
  },
  txIconBox: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  txMid: { flex: 1 },
  txCategory: { fontSize: 15, fontWeight: 'bold', color: '#1E293B' },
  txDate: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
  txAmount: { fontSize: 16, fontWeight: 'bold' },

  empty: { alignItems: 'center', padding: 20 },
  emptyText: { color: '#94A3B8' },
});
