import { Injectable } from '@angular/core';
import {
  CollectionName, User, Account, Card, Transaction,
  Loan, ScheduledPayment, AuditLog, Notification, Complaint
} from '../models/bank.models';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private readonly STORE_PREFIX = 'securebank_';
  private readonly COLLECTIONS: CollectionName[] = [
    'users', 'accounts', 'cards', 'transactions',
    'loans', 'scheduledPayments', 'auditLogs', 'notifications', 'complaints'
  ];

  private getKey(collection: CollectionName): string {
    return this.STORE_PREFIX + collection;
  }

  // --- CRUD Operations ---
  getAll<T>(collection: CollectionName): T[] {
    try {
      const data = localStorage.getItem(this.getKey(collection));
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error(`Store.getAll error for ${collection}:`, e);
      return [];
    }
  }

  setAll<T>(collection: CollectionName, data: T[]): void {
    try {
      localStorage.setItem(this.getKey(collection), JSON.stringify(data));
    } catch (e) {
      console.error(`Store.setAll error for ${collection}:`, e);
    }
  }

  getById<T>(collection: CollectionName, idField: string, id: string): T | null {
    const items = this.getAll<T>(collection);
    return items.find((item: any) => item[idField] === id) || null;
  }

  add<T>(collection: CollectionName, item: T): T {
    const items = this.getAll<T>(collection);
    items.push(item);
    this.setAll(collection, items);
    return item;
  }

  update<T>(collection: CollectionName, idField: string, id: string, updates: Partial<T>): T | null {
    const items = this.getAll<T>(collection);
    const idx = items.findIndex((item: any) => item[idField] === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...updates };
    this.setAll(collection, items);
    return items[idx];
  }

  remove(collection: CollectionName, idField: string, id: string): void {
    let items = this.getAll<any>(collection);
    items = items.filter((item: any) => item[idField] !== id);
    this.setAll(collection, items);
  }

  query<T>(collection: CollectionName, filterFn: (item: T) => boolean): T[] {
    const items = this.getAll<T>(collection);
    return items.filter(filterFn);
  }

  count(collection: CollectionName, filterFn?: (item: any) => boolean): number {
    if (filterFn) return this.query(collection, filterFn).length;
    return this.getAll(collection).length;
  }

  // --- Users ---
  getUserById(userId: string): User | null {
    return this.getById<User>('users', 'userId', userId);
  }

  getUserByEmail(email: string): User | null {
    const users = this.getAll<User>('users');
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  addUser(user: User): User {
    return this.add<User>('users', user);
  }

  updateUser(userId: string, updates: Partial<User>): User | null {
    return this.update<User>('users', 'userId', userId, updates);
  }

  // --- Accounts ---
  getAccountById(accountId: string): Account | null {
    return this.getById<Account>('accounts', 'accountId', accountId);
  }

  getAccountsByUser(userId: string): Account[] {
    if (!userId) return [];
    return this.query<Account>('accounts', a => (a.userId || '').toUpperCase() === userId.toUpperCase());
  }

  addAccount(account: Account): Account {
    return this.add<Account>('accounts', account);
  }

  updateAccount(accountId: string, updates: Partial<Account>): Account | null {
    return this.update<Account>('accounts', 'accountId', accountId, updates);
  }

  // --- Cards ---
  getCardById(cardId: string): Card | null {
    return this.getById<Card>('cards', 'cardId', cardId);
  }

  getCardsByUser(userId: string): Card[] {
    return this.query<Card>('cards', c => c.userId === userId);
  }

  getCardsByAccount(accountId: string): Card[] {
    return this.query<Card>('cards', c => c.accountId === accountId);
  }

  addCard(card: Card): Card {
    return this.add<Card>('cards', card);
  }

  updateCard(cardId: string, updates: Partial<Card>): Card | null {
    return this.update<Card>('cards', 'cardId', cardId, updates);
  }

  // --- Transactions ---
  getTransactionsByAccount(accountId: string): Transaction[] {
    return this.query<Transaction>('transactions', t =>
      t.accountId === accountId || t.toAccount === accountId || t.fromAccount === accountId
    ).sort((a, b) => new Date(b.date + ' ' + (b.time || '')).getTime() - new Date(a.date + ' ' + (a.time || '')).getTime());
  }

  getTransactionsByUser(userId: string): Transaction[] {
    const accounts = this.getAccountsByUser(userId);
    const accountIds = accounts.map(a => a.accountId);
    return this.query<Transaction>('transactions', t =>
      accountIds.includes(t.accountId) || accountIds.includes(t.toAccount) || accountIds.includes(t.fromAccount)
    ).sort((a, b) => new Date(b.date + ' ' + (b.time || '')).getTime() - new Date(a.date + ' ' + (a.time || '')).getTime());
  }

  addTransaction(txn: Transaction): Transaction {
    return this.add<Transaction>('transactions', txn);
  }

  // --- Loans ---
  getLoanById(loanId: string): Loan | null {
    return this.getById<Loan>('loans', 'loanId', loanId);
  }

  getLoansByUser(userId: string): Loan[] {
    return this.query<Loan>('loans', l => l.userId === userId);
  }

  addLoan(loan: Loan): Loan {
    return this.add<Loan>('loans', loan);
  }

  updateLoan(loanId: string, updates: Partial<Loan>): Loan | null {
    return this.update<Loan>('loans', 'loanId', loanId, updates);
  }

  // --- Scheduled Payments ---
  getScheduledByUser(userId: string): ScheduledPayment[] {
    return this.query<ScheduledPayment>('scheduledPayments', s => s.userId === userId);
  }

  addScheduledPayment(sp: ScheduledPayment): ScheduledPayment {
    return this.add<ScheduledPayment>('scheduledPayments', sp);
  }

  updateScheduledPayment(id: string, updates: Partial<ScheduledPayment>): ScheduledPayment | null {
    return this.update<ScheduledPayment>('scheduledPayments', 'id', id, updates);
  }

  removeScheduledPayment(id: string): void {
    this.remove('scheduledPayments', 'id', id);
  }

  // --- Audit Logs ---
  addAuditLog(log: AuditLog): AuditLog {
    return this.add<AuditLog>('auditLogs', log);
  }

  getAuditLogs(): AuditLog[] {
    return this.getAll<AuditLog>('auditLogs').sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  // --- Notifications ---
  getNotificationsByUser(userId: string): Notification[] {
    return this.query<Notification>('notifications', n => n.userId === userId).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  addNotification(notif: Notification): Notification {
    return this.add<Notification>('notifications', notif);
  }

  markNotificationRead(id: string): Notification | null {
    return this.update<Notification>('notifications', 'id', id, { read: true });
  }

  // --- Complaints ---
  addComplaint(complaint: Complaint): Complaint {
    return this.add<Complaint>('complaints', complaint);
  }

  updateComplaint(complaintId: string, updates: Partial<Complaint>): Complaint | null {
    return this.update<Complaint>('complaints', 'complaintId', complaintId, updates);
  }

  getComplaintById(complaintId: string): Complaint | null {
    return this.getById<Complaint>('complaints', 'complaintId', complaintId);
  }

  getComplaintsByUser(userId: string): Complaint[] {
    return this.query<Complaint>('complaints', c => c.userId === userId);
  }

  // --- Initialization Check ---
  isInitialized(): boolean {
    return localStorage.getItem(this.STORE_PREFIX + 'initialized') === 'true';
  }

  markInitialized(): void {
    localStorage.setItem(this.STORE_PREFIX + 'initialized', 'true');
  }

  clearAll(): void {
    this.COLLECTIONS.forEach(c => localStorage.removeItem(this.getKey(c)));
    localStorage.removeItem(this.STORE_PREFIX + 'initialized');
    localStorage.removeItem(this.STORE_PREFIX + 'session');
  }
}
