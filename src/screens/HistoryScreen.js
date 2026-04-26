import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Platform, StatusBar } from 'react-native';
import { getAllTransactions, deleteTransaction } from '../database/db';
import { format } from 'date-fns';
import ScreenHeader from '../components/ScreenHeader';

export default function HistoryScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => loadTransactions());
    return unsubscribe;
  }, [navigation]);

  const loadTransactions = () => setTransactions(getAllTransactions());

  const handleDelete = (id) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this transaction?')) {
        deleteTransaction(id);
        loadTransactions();
      }
    } else {
      Alert.alert('Delete Record', 'Are you sure you want to delete this transaction?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => { deleteTransaction(id); loadTransactions(); } }
      ]);
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'Salary': return '#10B981';
      case 'Expense': return '#EF4444';
      case 'Saving': return '#3B82F6';
      case 'SIP': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.badge, { backgroundColor: getTypeColor(item.type) + '15' }]}>
          <Text style={[styles.badgeText, { color: getTypeColor(item.type) }]}>{item.type}</Text>
        </View>
        <Text style={[styles.amount, { color: getTypeColor(item.type) }]}>{item.type === 'Expense' ? '-' : '+'}₹{item.amount.toLocaleString()}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.date}>{format(new Date(item.date), 'EEEE, dd MMMM yyyy')}</Text>
        {item.note ? <Text style={styles.note}>"{item.note}"</Text> : null}
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => navigation.navigate('AddTransaction', { editItem: item })}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(item.id)}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: '#F8F9FE' }}
      contentContainerStyle={styles.listContent}
      data={transactions}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      showsVerticalScrollIndicator={true}
      ListHeaderComponent={
        <>
          <StatusBar barStyle="dark-content" backgroundColor="#F8F9FE" />
          <ScreenHeader title="History" navigation={navigation} />
          <View style={styles.header}>
            <Text style={styles.subtitle}>{transactions.length} total records found</Text>
          </View>
        </>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📂</Text>
          <Text style={styles.emptyText}>No records found yet.</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 25, paddingBottom: 10, backgroundColor: '#F8F9FE' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1E293B' },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 4, fontWeight: '500' },
  listContent: { padding: 20, paddingTop: 10, paddingBottom: 120 },
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  amount: { fontSize: 18, fontWeight: 'bold' },
  cardBody: { marginBottom: 20 },
  category: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  date: { fontSize: 12, color: '#94A3B8', marginTop: 4, fontWeight: '500' },
  note: { fontSize: 12, color: '#64748B', marginTop: 8, fontStyle: 'italic', backgroundColor: '#F8F9FE', padding: 8, borderRadius: 8 },
  cardActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 15, gap: 12 },
  actionBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  editBtn: { backgroundColor: '#EEF2FF' },
  editText: { color: '#4338CA', fontSize: 13, fontWeight: 'bold' },
  deleteBtn: { backgroundColor: '#FEF2F2' },
  deleteText: { color: '#EF4444', fontSize: 13, fontWeight: 'bold' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  emptyIcon: { fontSize: 60, marginBottom: 20 },
  emptyText: { color: '#64748B', fontSize: 16, fontWeight: '600' },

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
