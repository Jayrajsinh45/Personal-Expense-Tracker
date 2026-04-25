import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { getAllTransactions, deleteTransaction } from '../database/db';
import { format } from 'date-fns';

export default function HistoryScreen() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = () => {
    const data = getAllTransactions();
    setTransactions(data);
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deleteTransaction(id);
            loadTransactions();
          }
        }
      ]
    );
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
    <View style={styles.itemCard}>
      <View style={styles.itemMain}>
        <View>
          <Text style={styles.itemCategory}>{item.category}</Text>
          <Text style={styles.itemDate}>{format(new Date(item.date), 'dd MMM yyyy')}</Text>
          {item.note ? <Text style={styles.itemNote}>{item.note}</Text> : null}
        </View>
        <View style={styles.itemRight}>
          <Text style={[styles.itemAmount, { color: getTypeColor(item.type) }]}>
            {item.type === 'Expense' ? '-' : '+'}₹{item.amount.toLocaleString()}
          </Text>
          <Text style={[styles.itemType, { color: getTypeColor(item.type) }]}>{item.type}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.deleteBtn} 
        onPress={() => handleDelete(item.id)}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {transactions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No records found yet.</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 15 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
  },
  itemMain: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  itemCategory: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  itemDate: { fontSize: 12, color: '#6B7280' },
  itemNote: { fontSize: 13, color: '#4B5563', marginTop: 4, fontStyle: 'italic' },
  itemRight: { alignItems: 'flex-end' },
  itemAmount: { fontSize: 16, fontWeight: 'bold' },
  itemType: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
  deleteBtn: { alignSelf: 'flex-end', paddingVertical: 5, paddingHorizontal: 10 },
  deleteText: { color: '#EF4444', fontSize: 12, fontWeight: '600' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#9CA3AF', fontSize: 16 }
});
