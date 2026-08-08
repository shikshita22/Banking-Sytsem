export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF' | 'LOAN_OFFICER' | 'CSR' | 'CUSTOMER';

export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  dateOfBirth: string;
  address: string;
  pan?: string;
  aadhaar?: string;
  passport?: string;
  createdAt: string;
  status: string;
}

export interface Account {
  accountId: string;
  userId: string;
  accountType: 'SAVINGS' | 'CURRENT';
  balance: number;
  availableBalance: number;
  minBalance: number;
  ifsc: string;
  branch: string;
  openingDate: string;
  status: string;
  nominee: string;
}

export interface Transaction {
  transactionId: string;
  accountId: string;
  transactionType: 'CREDIT' | 'DEBIT';
  category: string;
  amount: number;
  balance: number;
  description: string;
  referenceId: string;
  date: string;
  time: string;
  status: string;
  toAccount: string;
  fromAccount: string;
}

export interface Session {
  userId: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  email: string;
  loginAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  timestamp: string;
  read: boolean;
}

export interface Card {
  cardId: string;
  accountId: string;
  userId: string;
  cardNumber: string;
  cardType: 'DEBIT' | 'CREDIT';
  expiryDate: string;
  cvv: string;
  pin: string;
  isBlocked: boolean;
  status?: string;
  atmEnabled: boolean;
  onlineEnabled: boolean;
  dailyLimit: number;
  creditLimit: number;
  outstandingBalance: number;
  minimumDue: number;
  dueDate: string;
}

export interface Loan {
  loanId: string;
  userId: string;
  accountId: string;
  loanType: string;
  amount: number;
  interestRate: number;
  tenureMonths: number;
  emiAmount: number;
  status: string;
  appliedDate: string;
  disbursedDate?: string;
}

export interface ScheduledPayment {
  id: string;
  userId: string;
  accountId: string;
  payeeName: string;
  payeeAccount: string;
  amount: number;
  frequency: string;
  nextExecution: string;
  status: string;
  category: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
}

export interface Complaint {
  complaintId: string;
  userId: string;
  category: string;
  subject: string;
  description: string;
  status: string;
  resolution?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt?: string;
}

export type CollectionName =
  | 'users'
  | 'accounts'
  | 'cards'
  | 'transactions'
  | 'loans'
  | 'scheduledPayments'
  | 'auditLogs'
  | 'notifications'
  | 'complaints';
