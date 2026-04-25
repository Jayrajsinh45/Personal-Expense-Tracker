import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ScrollView, useWindowDimensions
} from 'react-native';
import { getAllTransactions } from '../database/db';
import { format } from 'date-fns';
import { CATEGORIES, TRANSACTION_TYPES } from '../utils/constants';

const MONTHS = [
  'All', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const currentYear = new Date().getFullYear();
const YEARS = ['All', ...Array.from({ length: 5 }, (_, i) => String(currentYear - i))];

export default function ReportsScreen({ navigation }) {
  const [allTransactions, setAllTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    applyFilters();
  }, [allTransactions, selectedYear, selectedMonth, selectedCategory, selectedType]);

  const loadData = () => {
    const data = getAllTransactions();
    setAllTransactions(data);
  };

  const applyFilters = () => {
    let data = [...allTransactions];

    if (selectedYear !== 'All') {
      data = data.filter(t => new Date(t.date).getFullYear() === parseInt(selectedYear));
    }
    if (selectedMonth !== 'All') {
      const monthIndex = MONTHS.indexOf(selectedMonth); // 1-based (Jan=1)
      data = data.filter(t => new Date(t.date).getMonth() + 1 === monthIndex);
    }
    if (selectedCategory !== 'All') {
      data = data.filter(t => t.category === selectedCategory);
    }
    if (selectedType !== 'All') {
      data = data.filter(t => t.type === selectedType);
    }

    setFiltered(data);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Salary': return '#10B981';
      case 'Expense': return '#EF4444';
      case 'Saving': return '#3B82F6';
      case 'SIP': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const summary = filtered.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + t.amount;
    return acc;
  }, {});

  const netBalance = (summary.Salary || 0) - ((summary.Expense || 0) + (summary.Saving || 0) + (summary.SIP || 0));

  const FilterChip = ({ label, selected, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, selected && styles.chipActive]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView stickyHeaderIndices={[0]}>

        {/* Filters Panel */}
        <View style={styles.filtersPanel}>
          <Text style={styles.filterLabel}>Year</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {YEARS.map(y => (
              <FilterChip key={y} label={y} selected={selectedYear === y} onPress={() => setSelectedYear(y)} />
            ))}
          </ScrollView>

          <Text style={styles.filterLabel}>Month</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {MONTHS.map(m => (
              <FilterChip key={m} label={m} selected={selectedMonth === m} onPress={() => setSelectedMonth(m)} />
            ))}
          </ScrollView>

          <Text style={styles.filterLabel}>Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {['All', ...TRANSACTION_TYPES.map(t => t.value)].map(t => (
              <FilterChip key={t} label={t} selected={selectedType === t} onPress={() => setSelectedType(t)} />
            ))}
          </ScrollView>

          <Text style={styles.filterLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {['All', ...CATEGORIES].map(c => (
              <FilterChip key={c} label={c} selected={selectedCategory === c} onPress={() => setSelectedCategory(c)} />
            ))}
          </ScrollView>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          {[
            { label: 'Salary', color: '#10B981' },
            { label: 'Expense', color: '#EF4444' },
            { label: 'Saving', color: '#3B82F6' },
            { label: 'SIP', color: '#8B5CF6' },
          ].map(({ label, color }) => (
            <View key={label} style={[styles.summaryCard, { borderTopColor: color }]}>
              <Text style={styles.summaryCardLabel}>{label}</Text>
              <Text style={[styles.summaryCardAmount, { color }]}>
                ₹{(summary[label] || 0).toLocaleString('en-IN')}
              </Text>
            </View>
          ))}
        </View>

        {/* Net Balance */}
        <View style={[styles.netCard, { backgroundColor: netBalance >= 0 ? '#ECFDF5' : '#FEF2F2' }]}>
          <Text style={styles.netLabel}>Net Balance ({filtered.length} records)</Text>
          <Text style={[styles.netAmount, { color: netBalance >= 0 ? '#10B981' : '#EF4444' }]}>
            ₹{netBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </Text>
        </View>

        {/* Transaction List */}
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No records match the selected filters.</Text>
          </View>
        ) : (
          filtered.map((item) => (
            <View key={item.id} style={styles.row}>
              <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) + '20' }]}>
                <Text style={[styles.typeText, { color: getTypeColor(item.type) }]}>{item.type}</Text>
              </View>
              <View style={styles.rowMid}>
                <Text style={styles.rowCategory}>{item.category}</Text>
                <Text style={styles.rowDate}>{format(new Date(item.date), 'dd MMM yyyy')}</Text>
                {item.note ? <Text style={styles.rowNote}>{item.note}</Text> : null}
              </View>
              <Text style={[styles.rowAmount, { color: getTypeColor(item.type) }]}>
                {item.type === 'Expense' ? '-' : '+'}₹{item.amount.toLocaleString('en-IN')}
              </Text>
            </View>
          ))
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },

  filtersPanel: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterLabel: { fontSize: 11, fontWeight: '700', color: '#6B7280', marginTop: 8, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  chipRow: { flexDirection: 'row' },
  chip: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20, backgroundColor: '#F3F4F6',
    marginRight: 8, marginBottom: 4,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  chipActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  chipText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  chipTextActive: { color: '#fff' },

  summaryRow: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 10, paddingTop: 15,
    justifyContent: 'space-between',
  },
  summaryCard: {
    width: '48%', backgroundColor: '#fff',
    borderRadius: 12, padding: 14,
    marginBottom: 10, elevation: 2,
    borderTopWidth: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3,
  },
  summaryCardLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  summaryCardAmount: { fontSize: 16, fontWeight: 'bold' },

  netCard: {
    marginHorizontal: 10, marginBottom: 12,
    borderRadius: 12, padding: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3,
  },
  netLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },
  netAmount: { fontSize: 18, fontWeight: 'bold' },

  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', marginHorizontal: 10,
    marginBottom: 8, borderRadius: 12, padding: 13,
    elevation: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 2,
  },
  typeBadge: {
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
    marginRight: 10, alignSelf: 'flex-start',
  },
  typeText: { fontSize: 11, fontWeight: '700' },
  rowMid: { flex: 1 },
  rowCategory: { fontSize: 14, fontWeight: '600', color: '#111827' },
  rowDate: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  rowNote: { fontSize: 11, color: '#9CA3AF', fontStyle: 'italic', marginTop: 2 },
  rowAmount: { fontSize: 15, fontWeight: 'bold', marginLeft: 8 },

  empty: { alignItems: 'center', paddingTop: 50 },
  emptyText: { color: '#9CA3AF', fontSize: 15 },
});
