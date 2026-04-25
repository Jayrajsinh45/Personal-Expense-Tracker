import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { getTransactionsByMonth } from '../database/db';
import { format } from 'date-fns';

export default function ReportsScreen() {
  const [loading, setLoading] = useState(false);
  
  const generatePDF = async () => {
    const now = new Date();
    const monthStr = format(now, 'yyyy-MM');
    const monthName = format(now, 'MMMM yyyy');
    
    setLoading(true);
    const data = getTransactionsByMonth(monthStr);

    if (data.length === 0) {
      setLoading(false);
      Alert.alert('No Data', `No transactions found for ${monthName}`);
      return;
    }

    let totalSalary = 0, totalExp = 0, totalSaving = 0, totalSIP = 0;
    
    const tableRows = data.map(item => {
      if (item.type === 'Salary') totalSalary += item.amount;
      if (item.type === 'Expense') totalExp += item.amount;
      if (item.type === 'Saving') totalSaving += item.amount;
      if (item.type === 'SIP') totalSIP += item.amount;

      return `
        <tr>
          <td>${format(new Date(item.date), 'dd/MM/yyyy')}</td>
          <td>${item.type}</td>
          <td>${item.category}</td>
          <td>₹${item.amount.toLocaleString()}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 20px; }
            h1 { color: #4F46E5; text-align: center; }
            h2 { color: #374151; border-bottom: 2px solid #4F46E5; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #D1D5DB; padding: 12px; text-align: left; }
            th { backgroundColor: #F3F4F6; }
            .summary { margin-top: 30px; padding: 20px; background: #F9FAFB; border-radius: 10px; }
            .total { font-weight: bold; font-size: 1.2em; }
          </style>
        </head>
        <body>
          <h1>Expense Tracker Monthly Report</h1>
          <h2>Report for ${monthName}</h2>
          
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <div class="summary">
            <h3>Summary</h3>
            <p>Total Salary: <strong>₹${totalSalary.toLocaleString()}</strong></p>
            <p>Total Expenses: <strong>₹${totalExp.toLocaleString()}</strong></p>
            <p>Total Savings: <strong>₹${totalSaving.toLocaleString()}</strong></p>
            <p>Total SIPs: <strong>₹${totalSIP.toLocaleString()}</strong></p>
            <hr />
            <p class="total">Net Balance: ₹${(totalSalary - (totalExp + totalSaving + totalSIP)).toLocaleString()}</p>
          </div>
          <p style="text-align: center; color: #9CA3AF; margin-top: 40px;">Generated for Jayrajsinh Barad</p>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      setLoading(false);
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.infoBox}>
        <Text style={styles.title}>Generate Report</Text>
        <Text style={styles.description}>
          This will generate a professional PDF report for the current month ({format(new Date(), 'MMMM yyyy')}) including all your salary, expenses, savings, and SIPs.
        </Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#4F46E5" />
        ) : (
          <TouchableOpacity style={styles.btn} onPress={generatePDF}>
            <Text style={styles.btnText}>Create & Share PDF</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 20, justifyContent: 'center' },
  infoBox: { backgroundColor: '#fff', padding: 30, borderRadius: 20, elevation: 5 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: 15 },
  description: { fontSize: 16, color: '#4B5563', textAlign: 'center', marginBottom: 30, lineHeight: 24 },
  btn: { backgroundColor: '#4F46E5', padding: 18, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
