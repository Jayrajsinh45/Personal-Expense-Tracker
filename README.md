# Expense Tracker Pro - Jayrajsinh Barad

A dedicated mobile application for tracking salary, expenses, savings, and SIPs locally on your device.

## Features
- **Fixed Authentication**: Secure login restricted to authorized email and password.
- **SQLite Storage**: All data is stored locally on your device's storage.
- **Dynamic Tracking**: Real-time balance and total calculations for Salary, SIP, Savings, and Expenses.
- **PDF Generation**: Generate and share monthly financial reports.
- **Daily Entry**: Easy interface to add daily transactions with categories and notes.

## Prerequisites
- **Node.js** (LTS version)
- **Expo Go** app installed on your Android/iOS device for testing.
- **Git** (optional)

## Installation

1. Create a new directory and initialize the project:
    mkdir ExpenseTracker
    cd ExpenseTracker

2. Install dependencies:
    npm install expo-sqlite expo-print expo-sharing @react-navigation/native @react-navigation/stack @react-native-community/datetimepicker react-native-safe-area-context react-native-screens react-native-gesture-handler date-fns

3. Copy the files:
   Create the directory structure `src/database`, `src/screens`, `src/utils` and place the provided code into the respective files.

## Configuration & Login
The app uses fixed credentials as per your requirement:
- **Email**: `jayrajsinhbarad0906@gmail.com`
- **Password**: `090601`

## How to Run

1. Start the development server:
    npx expo start

2. Open the **Expo Go** app on your phone.
3. Scan the QR code displayed in your terminal.
4. Log in using the credentials above.

## Project Structure
- `App.js`: Navigation and app lifecycle.
- `src/database/db.js`: SQLite logic for creating tables and performing CRUD operations.
- `src/screens/DashboardScreen.js`: Main UI showing financial summary.
- `src/screens/AddTransactionScreen.js`: Form for entering new financial data.
- `src/screens/ReportsScreen.js`: PDF generation logic and sharing.
- `src/utils/constants.js`: Configuration for login and transaction categories.

## Troubleshooting
- **Database Issues**: If you make schema changes, you may need to clear app data or change the database version name in `db.js`.
- **PDF Sharing**: Ensure you have a PDF viewer or sharing app (WhatsApp, Drive) installed on your device to handle the generated file.
