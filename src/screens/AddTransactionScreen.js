import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, 
  ScrollView, Alert, Platform, StatusBar, KeyboardAvoidingView 
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addTransaction, updateTransaction } from '../database/db';
import { CATEGORIES, TRANSACTION_TYPES } from '../utils/constants';
import { format } from 'date-fns';

export default function AddTransactionScreen({ route, navigation }) {
  const editItem = route.params?.editItem;
  const [type, setType] = useState(editItem?.type || 'Expense');
  const [category, setCategory] = useState(editItem?.category || CATEGORIES[0]);
  const [amount, setAmount] = useState(editItem?.amount?.toString() || '');
  const [date, setDate] = useState(editItem ? new Date(editItem.date) : new Date());
  const [note, setNote] = useState(editItem?.note || '');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (editItem) navigation.setOptions({ title: 'Edit Record' });
  }, [editItem]);

  const handleSave = () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    const numAmount = parseFloat(amount);
    if (editItem) updateTransaction(editItem.id, type, category, numAmount, date.toISOString(), note);
    else addTransaction(type, category, numAmount, date.toISOString(), note);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FE" />
      <View style={styles.topSection}>
        <Text style={styles.title}>{editItem ? 'Edit' : 'Add'} Entry</Text>
        <Text style={styles.subtitle}>Enter the transaction details below</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.formCard}>
            <Text style={styles.label}>Transaction Type</Text>
            <View style={styles.typeSelector}>
              {TRANSACTION_TYPES.map((t) => (
                <TouchableOpacity 
                  key={t.value} 
                  style={[styles.typeOption, type === t.value && { backgroundColor: t.color, borderColor: t.color }]} 
                  onPress={() => setType(t.value)}
                >
                  <Text style={[styles.typeText, type === t.value && styles.typeTextActive]}>{t.value}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Amount (₹)</Text>
            <TextInput style={styles.amountInput} placeholder="0.00" keyboardType="numeric" value={amount} onChangeText={setAmount} placeholderTextColor="#CBD5E1" />

            <Text style={styles.label}>Select Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity key={cat} style={[styles.catChip, category === cat && styles.catChipActive]} onPress={() => setCategory(cat)}>
                  <Text style={[styles.catText, category === cat && styles.catTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Date</Text>
            <TouchableOpacity style={styles.datePicker} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateText}>{format(date, 'EEEE, dd MMMM yyyy')}</Text>
              <Text style={{ fontSize: 18 }}>📅</Text>
            </TouchableOpacity>
            {showDatePicker && <DateTimePicker value={date} mode="date" display="default" onChange={(e, d) => { setShowDatePicker(Platform.OS === 'ios'); if (d) setDate(d); }} />}

            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput style={styles.noteInput} placeholder="What was this for?" value={note} onChangeText={setNote} multiline numberOfLines={3} placeholderTextColor="#CBD5E1" />
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>{editItem ? 'Update Entry' : 'Save Transaction'}</Text>
          </TouchableOpacity>
          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FE' }, // Match Dribbble Light Lavender
  topSection: { padding: 25, paddingTop: 40, backgroundColor: '#F8F9FE' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1E293B' },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 4, fontWeight: '500' },
  scrollView: { flex: 1, ...Platform.select({ web: { overflowY: 'auto' } }) },
  scrollContent: { padding: 20, paddingTop: 0, flexGrow: 1 },
  formCard: {
    backgroundColor: '#fff', borderRadius: 25, padding: 25, elevation: 5,
    shadowColor: '#4338CA', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, marginBottom: 25,
    borderWidth: 1, borderColor: '#F1F5F9'
  },
  label: { fontSize: 11, fontWeight: '800', color: '#94A3B8', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  typeSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 25 },
  typeOption: { flex: 1, minWidth: '45%', paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0', alignItems: 'center' },
  typeText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  typeTextActive: { color: '#fff' },
  amountInput: { fontSize: 32, fontWeight: 'bold', color: '#1E293B', paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: '#F1F5F9', marginBottom: 25 },
  categoryScroll: { flexDirection: 'row', marginBottom: 25 },
  catChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F8F9FE', marginRight: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  catChipActive: { backgroundColor: '#4338CA', borderColor: '#4338CA' },
  catText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  catTextActive: { color: '#fff', fontWeight: 'bold' },
  datePicker: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8F9FE', padding: 16, borderRadius: 15, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 25 },
  dateText: { fontSize: 15, color: '#1E293B', fontWeight: '600' },
  noteInput: { backgroundColor: '#F8F9FE', borderRadius: 15, padding: 16, fontSize: 15, color: '#1E293B', borderWidth: 1, borderColor: '#E2E8F0', textAlignVertical: 'top', minHeight: 80 },
  saveBtn: { backgroundColor: '#4338CA', padding: 20, borderRadius: 20, alignItems: 'center', elevation: 8, shadowColor: '#4338CA', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
