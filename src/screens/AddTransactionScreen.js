import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addTransaction, updateTransaction } from '../database/db';
import { TRANSACTION_TYPES, CATEGORIES } from '../utils/constants';
import { format } from 'date-fns';

export default function AddTransactionScreen({ route, navigation }) {
  const editItem = route.params?.editItem;

  const [type, setType] = useState(editItem ? editItem.type : 'Expense');
  const [category, setCategory] = useState(editItem ? editItem.category : 'Others');
  const [amount, setAmount] = useState(editItem ? String(editItem.amount) : '');
  const [note, setNote] = useState(editItem ? (editItem.note || '') : '');
  const [date, setDate] = useState(editItem ? new Date(editItem.date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSave = () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      if (Platform.OS === 'web') {
        window.alert('Please enter a valid amount');
      } else {
        Alert.alert('Invalid Input', 'Please enter a valid amount');
      }
      return;
    }

    try {
      if (editItem) {
        updateTransaction(
          editItem.id,
          type,
          category,
          parseFloat(amount),
          date.toISOString(),
          note
        );
      } else {
        addTransaction(
          type,
          category,
          parseFloat(amount),
          date.toISOString(),
          note
        );
      }

      if (Platform.OS === 'web') {
        window.alert(editItem ? 'Record updated successfully' : 'Record added successfully');
        navigation.goBack();
      } else {
        Alert.alert('Success', editItem ? 'Record updated successfully' : 'Record added successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert('Failed to save transaction');
      } else {
        Alert.alert('Error', 'Failed to save transaction');
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Transaction Type</Text>
        <View style={styles.typeContainer}>
          {TRANSACTION_TYPES.map((t) => (
            <TouchableOpacity
              key={t.value}
              style={[
                styles.typeButton,
                type === t.value && { backgroundColor: t.color, borderColor: t.color }
              ]}
              onPress={() => setType(t.value)}
            >
              <Text style={[styles.typeButtonText, type === t.value && { color: '#fff' }]}>
                {t.value}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Amount (₹)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.catButton,
                category === cat && styles.catButtonActive
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.catText, category === cat && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Date</Text>
        <TouchableOpacity 
          style={styles.input} 
          onPress={() => setShowDatePicker(true)}
        >
          <Text>{format(date, 'PPP')}</Text>
        </TouchableOpacity>

        {showDatePicker && Platform.OS !== 'web' && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}
        {showDatePicker && Platform.OS === 'web' && (
          <input
            type="date"
            style={{ marginTop: 10, padding: 10 }}
            value={date.toISOString().split('T')[0]}
            onChange={(event) => {
              setShowDatePicker(false);
              if (event.target.value) setDate(new Date(event.target.value));
            }}
          />
        )}

        <Text style={styles.label}>Note (Optional)</Text>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          placeholder="What was this for?"
          value={note}
          onChangeText={setNote}
          multiline
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Transaction</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  form: { padding: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 15 },
  typeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  typeButtonText: { fontWeight: '500', color: '#4B5563' },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  catButtonActive: { backgroundColor: '#4F46E5' },
  catText: { fontSize: 13, color: '#4B5563' },
  catTextActive: { color: '#fff' },
  saveButton: {
    backgroundColor: '#4F46E5',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
