import { Platform } from 'react-native';

let db = null;

if (Platform.OS !== 'web') {
  const SQLite = require('expo-sqlite');
  db = SQLite.openDatabaseSync('expenseTracker.db');
}

export const initDatabase = () => {
  if (Platform.OS === 'web') {
    const data = localStorage.getItem('transactions');
    if (!data) {
      localStorage.setItem('transactions', JSON.stringify([]));
    }
    return;
  }

  db.execSync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL, 
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      note TEXT
    );
  `);
};

export const addTransaction = (type, category, amount, date, note) => {
  if (Platform.OS === 'web') {
    const data = JSON.parse(localStorage.getItem('transactions') || '[]');
    const newTransaction = {
      id: Date.now(),
      type,
      category,
      amount,
      date,
      note
    };
    data.push(newTransaction);
    localStorage.setItem('transactions', JSON.stringify(data));
    return;
  }

  return db.runSync(
    'INSERT INTO transactions (type, category, amount, date, note) VALUES (?, ?, ?, ?, ?)',
    [type, category, amount, date, note]
  );
};

export const updateTransaction = (id, type, category, amount, date, note) => {
  if (Platform.OS === 'web') {
    const data = JSON.parse(localStorage.getItem('transactions') || '[]');
    const index = data.findIndex(t => t.id === id);
    if (index !== -1) {
      data[index] = { id, type, category, amount, date, note };
      localStorage.setItem('transactions', JSON.stringify(data));
    }
    return;
  }

  return db.runSync(
    'UPDATE transactions SET type = ?, category = ?, amount = ?, date = ?, note = ? WHERE id = ?',
    [type, category, amount, date, note, id]
  );
};

export const getAllTransactions = () => {
  if (Platform.OS === 'web') {
    const data = JSON.parse(localStorage.getItem('transactions') || '[]');
    return data.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  return db.getAllSync('SELECT * FROM transactions ORDER BY date DESC');
};

export const getTransactionsByMonth = (monthStr) => {
  // monthStr format: "YYYY-MM"
  if (Platform.OS === 'web') {
    const data = JSON.parse(localStorage.getItem('transactions') || '[]');
    return data
      .filter(t => t.date.startsWith(monthStr))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  return db.getAllSync(
    "SELECT * FROM transactions WHERE strftime('%Y-%m', date) = ? ORDER BY date DESC",
    [monthStr]
  );
};

export const getFinancialSummary = () => {
  const summary = {
    Salary: 0,
    Expense: 0,
    Saving: 0,
    SIP: 0
  };

  if (Platform.OS === 'web') {
    const data = JSON.parse(localStorage.getItem('transactions') || '[]');
    data.forEach(row => {
      if (summary.hasOwnProperty(row.type)) {
        summary[row.type] += row.amount;
      }
    });
    return summary;
  }

  const rows = db.getAllSync('SELECT type, SUM(amount) as total FROM transactions GROUP BY type');
  
  rows.forEach(row => {
    if (summary.hasOwnProperty(row.type)) {
      summary[row.type] = row.total;
    }
  });
  
  return summary;
};

export const deleteTransaction = (id) => {
  if (Platform.OS === 'web') {
    const data = JSON.parse(localStorage.getItem('transactions') || '[]');
    const newData = data.filter(t => t.id !== id);
    localStorage.setItem('transactions', JSON.stringify(newData));
    return;
  }

  return db.runSync('DELETE FROM transactions WHERE id = ?', [id]);
};
