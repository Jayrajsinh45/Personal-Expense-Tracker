import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Modal, FlatList, Platform, StatusBar
} from 'react-native';
import { getAllTransactions } from '../database/db';
import { format } from 'date-fns';
import { CATEGORIES, TRANSACTION_TYPES } from '../utils/constants';
import ScreenHeader from '../components/ScreenHeader';

const MONTHS = ['All', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const currentYear = new Date().getFullYear();
const YEARS = ['All', ...Array.from({ length: 5 }, (_, i) => String(currentYear - i))];
const ALL_TYPES = ['All', ...TRANSACTION_TYPES.map(t => t.value)];
const ALL_CATEGORIES = ['All', ...CATEGORIES];

function Dropdown({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={dd.wrap}>
      <Text style={dd.label}>{label}</Text>
      <TouchableOpacity style={dd.selector} onPress={() => setOpen(true)} activeOpacity={0.8}>
        <Text style={dd.value} numberOfLines={1}>{value}</Text>
        <Text style={dd.arrow}>▾</Text>
      </TouchableOpacity>
      <Modal transparent animationType="fade" visible={open} onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={dd.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={dd.sheet}>
            <View style={dd.header}>
              <Text style={dd.sheetTitle}>Select {label}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}><Text style={dd.closeX}>✕</Text></TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[dd.option, item === value && dd.optionActive]}
                  onPress={() => { onChange(item); setOpen(false); }}
                >
                  <Text style={[dd.optionText, item === value && dd.optionTextActive]}>{item}</Text>
                  {item === value && <Text style={dd.check}>✓</Text>}
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingBottom: 30 }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

export default function ReportsScreen({ route, navigation }) {
  const initialType = route?.params?.filterType || 'All';
  const [allTransactions, setAllTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState(initialType);

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      const params = navigation.getState()?.routes?.find(r => r.name === 'Reports')?.params;
      if (params?.filterType) setSelectedType(params.filterType);
      loadData();
    });
    return unsub;
  }, [navigation]);

  useEffect(() => { applyFilters(); }, [allTransactions, selectedYear, selectedMonth, selectedCategory, selectedType]);

  const loadData = () => setAllTransactions(getAllTransactions());

  const applyFilters = () => {
    let data = [...allTransactions];
    if (selectedYear !== 'All') data = data.filter(t => new Date(t.date).getFullYear() === parseInt(selectedYear));
    if (selectedMonth !== 'All') {
      const idx = MONTHS.indexOf(selectedMonth);
      data = data.filter(t => new Date(t.date).getMonth() + 1 === idx);
    }
    if (selectedType !== 'All') data = data.filter(t => t.type === selectedType);
    if (selectedCategory !== 'All') data = data.filter(t => t.category === selectedCategory);
    setFiltered(data);
  };

  const summary = filtered.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + t.amount;
    return acc;
  }, {});

  const netBalance = (summary.Salary || 0) - ((summary.Expense || 0) + (summary.Saving || 0) + (summary.SIP || 0));

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: '#F8F9FE' }}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={true}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FE" />
      <ScreenHeader title="Reports" navigation={navigation} />
      
      <View style={styles.body}>

        {/* Analysis Button */}
        <TouchableOpacity 
          style={styles.analysisBtn} 
          onPress={() => navigation.navigate('Analysis')}
          activeOpacity={0.85}
        >
          <View style={styles.analysisBtnLeft}>
            <Text style={{ fontSize: 22 }}>📊</Text>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.analysisBtnTitle}>Monthly Analysis</Text>
              <Text style={styles.analysisBtnSub}>View graphs & day-wise breakdown</Text>
            </View>
          </View>
          <Text style={styles.analysisBtnArrow}>→</Text>
        </TouchableOpacity>

        <View style={styles.filterCard}>
          <View style={styles.filterRow}>
            <Dropdown label="Year" value={selectedYear} options={YEARS} onChange={setSelectedYear} />
            <Dropdown label="Month" value={selectedMonth} options={MONTHS} onChange={setSelectedMonth} />
          </View>
          <View style={[styles.filterRow, { marginTop: 15 }]}>
            <Dropdown label="Type" value={selectedType} options={ALL_TYPES} onChange={setSelectedType} />
            <Dropdown label="Category" value={selectedCategory} options={ALL_CATEGORIES} onChange={setSelectedCategory} />
          </View>
        </View>

        <View style={styles.summaryGrid}>
          {[
            { label: 'Salary', color: '#10B981', icon: '💰', bg: '#D1FAE5' },
            { label: 'Expense', color: '#EF4444', icon: '📉', bg: '#FEE2E2' },
            { label: 'Saving', color: '#3B82F6', icon: '🏦', bg: '#DBEAFE' },
            { label: 'SIP', color: '#8B5CF6', icon: '📈', bg: '#EDE9FE' },
          ].map(({ label, color, icon, bg }) => (
            <View key={label} style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <View style={[styles.iconBox, { backgroundColor: bg }]}>
                  <Text>{icon}</Text>
                </View>
                <Text style={styles.summaryLabel}>{label}</Text>
              </View>
              <Text style={[styles.summaryAmount, { color }]}>₹{(summary[label] || 0).toLocaleString('en-IN')}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.netCard, { backgroundColor: netBalance >= 0 ? '#10B981' : '#EF4444' }]}>
          <View>
            <Text style={styles.netLabel}>Net Balance</Text>
            <Text style={styles.netRecords}>{filtered.length} records filtered</Text>
          </View>
          <Text style={styles.netAmount}>
            ₹{netBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Transactions</Text>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={styles.emptyText}>No records found</Text>
          </View>
        ) : filtered.map((item) => (
          <View key={item.id} style={styles.row}>
            <View style={[styles.badge, { backgroundColor: (item.type === 'Salary' ? '#10B981' : item.type === 'Expense' ? '#EF4444' : item.type === 'Saving' ? '#3B82F6' : '#8B5CF6') + '15' }]}>
              <Text style={[styles.badgeText, { color: (item.type === 'Salary' ? '#10B981' : item.type === 'Expense' ? '#EF4444' : item.type === 'Saving' ? '#3B82F6' : '#8B5CF6') }]}>{item.type[0]}</Text>
            </View>
            <View style={styles.rowMid}>
              <Text style={styles.rowCategory}>{item.category}</Text>
              <Text style={styles.rowDate}>{format(new Date(item.date), 'dd MMM yyyy')}</Text>
            </View>
            <Text style={[styles.rowAmount, { color: (item.type === 'Salary' ? '#10B981' : item.type === 'Expense' ? '#EF4444' : item.type === 'Saving' ? '#3B82F6' : '#8B5CF6') }]}>
              {item.type === 'Expense' ? '-' : '+'}₹{item.amount.toLocaleString('en-IN')}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const dd = StyleSheet.create({
  wrap:  { flex: 1, marginHorizontal: 6 },
  label: { fontSize: 11, color: '#64748B', marginBottom: 6, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  selector: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#F8F9FE', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  value: { fontSize: 13, color: '#1E293B', fontWeight: '600', flex: 1 },
  arrow: { fontSize: 12, color: '#94A3B8', marginLeft: 4 },
  overlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'center', padding: 20 },
  sheet:   { backgroundColor: '#fff', borderRadius: 25, overflow: 'hidden', maxHeight: '70%' },
  header:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  sheetTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  closeX:     { fontSize: 20, color: '#94A3B8', padding: 5 },
  option:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 25, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#F8F9FE' },
  optionActive: { backgroundColor: '#EEF2FF' },
  optionText:   { fontSize: 16, color: '#475569' },
  optionTextActive: { color: '#4338CA', fontWeight: 'bold' },
  check:        { fontSize: 16, color: '#4338CA', fontWeight: 'bold' },
});

const styles = StyleSheet.create({
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#1E293B', marginBottom: 20 },
  filterCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 20, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
  filterRow: { flexDirection: 'row' },
  body: { padding: 20, paddingTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 15, marginTop: 10 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 10 },
  summaryCard: {
    width: '48%', backgroundColor: '#fff', borderRadius: 20, padding: 15, marginBottom: 15,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10,
  },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconBox: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  summaryLabel:  { fontSize: 13, color: '#64748B', fontWeight: '600' },
  summaryAmount: { fontSize: 17, fontWeight: 'bold' },
  netCard: {
    borderRadius: 24, padding: 25, marginBottom: 25,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    elevation: 8, shadowColor: '#4338CA', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 15,
  },
  netLabel:    { fontSize: 14, fontWeight: '700', color: '#fff', opacity: 0.9 },
  netRecords:  { fontSize: 11, color: '#fff', opacity: 0.8, marginTop: 2, fontWeight: '500' },
  netAmount:   { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  row: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20,
    padding: 15, marginBottom: 12, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 5,
  },
  badge:     { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  badgeText: { fontSize: 14, fontWeight: 'bold' },
  rowMid:    { flex: 1 },
  rowCategory: { fontSize: 15, fontWeight: 'bold', color: '#1E293B' },
  rowDate:     { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  rowAmount:   { fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  empty:     { alignItems: 'center', marginTop: 40 },
  emptyIcon: { fontSize: 50, marginBottom: 15 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#475569' },

  analysisBtn: {
    backgroundColor: '#4338CA', borderRadius: 20, padding: 18, marginBottom: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    elevation: 8, shadowColor: '#4338CA', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15,
  },
  analysisBtnLeft: { flexDirection: 'row', alignItems: 'center' },
  analysisBtnTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  analysisBtnSub: { fontSize: 11, color: '#E0E7FF', marginTop: 2 },
  analysisBtnArrow: { fontSize: 20, color: '#fff', fontWeight: 'bold' },
});

