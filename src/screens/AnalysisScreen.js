import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, StatusBar, Dimensions
} from 'react-native';
import { getAllTransactions } from '../database/db';
import ScreenHeader from '../components/ScreenHeader';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - 80;

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const TYPE_COLORS = {
  Salary: '#10B981',
  Expense: '#EF4444',
  Saving: '#3B82F6',
  SIP: '#8B5CF6',
};

const CATEGORY_COLORS = [
  '#4338CA', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#6366F1', '#14B8A6',
  '#E11D48', '#0EA5E9', '#84CC16', '#D946EF', '#FB923C',
];

export default function AnalysisScreen({ route, navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setTransactions(getAllTransactions());
  }, []);

  const filteredTx = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  }, [transactions, currentMonth, currentYear]);

  // Day-wise data
  const dayWiseData = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      income: 0,
      expense: 0,
    }));
    filteredTx.forEach(t => {
      const day = new Date(t.date).getDate();
      if (t.type === 'Salary') days[day - 1].income += t.amount;
      else days[day - 1].expense += t.amount;
    });
    return days;
  }, [filteredTx, currentYear, currentMonth]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const map = {};
    filteredTx.forEach(t => {
      if (!map[t.category]) map[t.category] = 0;
      map[t.category] += t.amount;
    });
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
    const total = sorted.reduce((s, [, v]) => s + v, 0);
    return sorted.map(([name, amount], idx) => ({
      name, amount,
      percentage: total > 0 ? (amount / total * 100) : 0,
      color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
    }));
  }, [filteredTx]);

  // Type breakdown
  const typeData = useMemo(() => {
    const map = { Salary: 0, Expense: 0, Saving: 0, SIP: 0 };
    filteredTx.forEach(t => { map[t.type] = (map[t.type] || 0) + t.amount; });
    return map;
  }, [filteredTx]);

  const totalSpent = typeData.Expense + typeData.Saving + typeData.SIP;
  const maxDayValue = Math.max(...dayWiseData.map(d => Math.max(d.income, d.expense)), 1);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  return (
    <View style={{ height: Platform.OS === 'web' ? '100vh' : Dimensions.get('window').height, width: '100%', backgroundColor: '#F8F9FE', overflow: 'hidden' }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: '#F8F9FE', ...Platform.select({ web: { overflowY: 'auto' } }) }}
        contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
        showsVerticalScrollIndicator={true}
      >
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FE" />
      <ScreenHeader title="Analysis" navigation={navigation} />

      <View style={{ paddingHorizontal: 20 }}>
        {/* Month Selector */}
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={prevMonth} style={styles.arrowBtn}>
            <Text style={styles.arrowText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthText}>{MONTH_NAMES[currentMonth]} {currentYear}</Text>
          <TouchableOpacity onPress={nextMonth} style={styles.arrowBtn}>
            <Text style={styles.arrowText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          {[
            { label: 'Income', value: typeData.Salary, color: '#10B981', icon: '💰' },
            { label: 'Spent', value: totalSpent, color: '#EF4444', icon: '💸' },
          ].map((item, i) => (
            <View key={i} style={[styles.summaryCard, { borderTopColor: item.color, borderTopWidth: 4 }]}>
              <Text style={{ fontSize: 20 }}>{item.icon}</Text>
              <Text style={styles.summaryLabel}>{item.label}</Text>
              <Text style={[styles.summaryValue, { color: item.color }]}>
                ₹{item.value.toLocaleString('en-IN')}
              </Text>
            </View>
          ))}
        </View>

        {/* Day-wise Bar Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Daily Spending Overview</Text>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.legendText}>Income</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.legendText}>Expense</Text>
            </View>
          </View>

          <View style={{ height: 170, overflow: 'hidden' }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} nestedScrollEnabled={true}>
              <View style={styles.barChartContainer}>
                {dayWiseData.map((d, idx) => {
                  const incomeH = (d.income / maxDayValue) * 120;
                  const expenseH = (d.expense / maxDayValue) * 120;
                  const hasData = d.income > 0 || d.expense > 0;
                  return (
                    <View key={idx} style={styles.barGroup}>
                      <View style={styles.barPair}>
                        <View style={[styles.bar, { height: Math.max(incomeH, hasData ? 4 : 0), backgroundColor: '#10B981' }]} />
                        <View style={[styles.bar, { height: Math.max(expenseH, hasData ? 4 : 0), backgroundColor: '#EF4444' }]} />
                      </View>
                      <Text style={styles.barLabel}>{d.day}</Text>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Type Breakdown */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Type Breakdown</Text>
          {Object.entries(typeData).map(([type, amount]) => {
            const total = Object.values(typeData).reduce((s, v) => s + v, 0);
            const pct = total > 0 ? (amount / total * 100) : 0;
            return (
              <View key={type} style={styles.breakdownRow}>
                <View style={styles.breakdownLeft}>
                  <View style={[styles.breakdownDot, { backgroundColor: TYPE_COLORS[type] }]} />
                  <Text style={styles.breakdownLabel}>{type}</Text>
                </View>
                <View style={styles.breakdownBarBg}>
                  <View style={[styles.breakdownBarFill, { width: `${pct}%`, backgroundColor: TYPE_COLORS[type] }]} />
                </View>
                <Text style={[styles.breakdownValue, { color: TYPE_COLORS[type] }]}>
                  ₹{amount.toLocaleString('en-IN')}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Category Breakdown */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Category Breakdown</Text>
          {categoryData.length === 0 ? (
            <View style={styles.emptyChart}>
              <Text style={styles.emptyIcon}>📂</Text>
              <Text style={styles.emptyText}>No data for this month</Text>
            </View>
          ) : (
            categoryData.map((cat, idx) => (
              <View key={idx} style={styles.catRow}>
                <View style={styles.catLeft}>
                  <View style={[styles.catColorBox, { backgroundColor: cat.color }]} />
                  <View>
                    <Text style={styles.catName}>{cat.name}</Text>
                    <Text style={styles.catPct}>{cat.percentage.toFixed(1)}%</Text>
                  </View>
                </View>
                <Text style={styles.catAmount}>₹{cat.amount.toLocaleString('en-IN')}</Text>
              </View>
            ))
          )}
        </View>

        {/* Top Spending Days */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>🔥 Top Spending Days</Text>
          {dayWiseData
            .filter(d => d.expense > 0)
            .sort((a, b) => b.expense - a.expense)
            .slice(0, 5)
            .map((d, idx) => (
              <View key={idx} style={styles.topDayRow}>
                <View style={styles.topDayRank}>
                  <Text style={styles.topDayRankText}>#{idx + 1}</Text>
                </View>
                <Text style={styles.topDayLabel}>
                  {MONTH_NAMES[currentMonth].slice(0, 3)} {d.day}
                </Text>
                <View style={styles.topDayBarBg}>
                  <View style={[styles.topDayBarFill, {
                    width: `${(d.expense / Math.max(...dayWiseData.map(x => x.expense), 1)) * 100}%`
                  }]} />
                </View>
                <Text style={styles.topDayAmount}>₹{d.expense.toLocaleString('en-IN')}</Text>
              </View>
            ))
          }
          {dayWiseData.filter(d => d.expense > 0).length === 0 && (
            <View style={styles.emptyChart}>
              <Text style={styles.emptyText}>No expenses this month</Text>
            </View>
          )}
        </View>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  monthSelector: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: 20, padding: 8, marginBottom: 20,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.04, shadowRadius: 8,
  },
  arrowBtn: {
    width: 40, height: 40, borderRadius: 14, backgroundColor: '#F8F9FE',
    alignItems: 'center', justifyContent: 'center',
  },
  arrowText: { fontSize: 24, color: '#4338CA', fontWeight: 'bold' },
  monthText: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },

  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  summaryCard: {
    width: '48%', backgroundColor: '#fff', borderRadius: 20, padding: 18, alignItems: 'center',
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10,
  },
  summaryLabel: { fontSize: 12, color: '#64748B', fontWeight: '600', marginTop: 8 },
  summaryValue: { fontSize: 20, fontWeight: 'bold', marginTop: 4 },

  chartCard: {
    backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 20,
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10,
  },
  chartTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 15 },

  legend: { flexDirection: 'row', marginBottom: 15, gap: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendText: { fontSize: 12, color: '#64748B', fontWeight: '600' },

  barChartContainer: { flexDirection: 'row', alignItems: 'flex-end', height: 150, paddingTop: 10 },
  barGroup: { alignItems: 'center', marginRight: 4, width: 22 },
  barPair: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  bar: { width: 8, borderRadius: 4, minHeight: 0 },
  barLabel: { fontSize: 8, color: '#94A3B8', marginTop: 4, fontWeight: '600' },

  breakdownRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  breakdownLeft: { flexDirection: 'row', alignItems: 'center', width: 80 },
  breakdownDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  breakdownLabel: { fontSize: 12, color: '#475569', fontWeight: '600' },
  breakdownBarBg: {
    flex: 1, height: 10, backgroundColor: '#F1F5F9', borderRadius: 5, marginHorizontal: 10, overflow: 'hidden',
  },
  breakdownBarFill: { height: '100%', borderRadius: 5 },
  breakdownValue: { fontSize: 13, fontWeight: 'bold', width: 90, textAlign: 'right' },

  catRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F8F9FE',
  },
  catLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  catColorBox: { width: 12, height: 12, borderRadius: 4, marginRight: 12 },
  catName: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  catPct: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  catAmount: { fontSize: 14, fontWeight: 'bold', color: '#1E293B' },

  topDayRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  topDayRank: {
    width: 28, height: 28, borderRadius: 8, backgroundColor: '#FEF2F2',
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  topDayRankText: { fontSize: 11, fontWeight: 'bold', color: '#EF4444' },
  topDayLabel: { fontSize: 13, color: '#475569', fontWeight: '600', width: 55 },
  topDayBarBg: {
    flex: 1, height: 8, backgroundColor: '#FEE2E2', borderRadius: 4, marginHorizontal: 8, overflow: 'hidden',
  },
  topDayBarFill: { height: '100%', backgroundColor: '#EF4444', borderRadius: 4 },
  topDayAmount: { fontSize: 13, fontWeight: 'bold', color: '#EF4444', width: 80, textAlign: 'right' },

  emptyChart: { alignItems: 'center', paddingVertical: 30 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 14, color: '#94A3B8', fontWeight: '500' },
});

