import { Injectable } from '@angular/core';
import { StoreService } from './store.service';
import { CollectionName } from '../models/bank.models';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  generateId(prefix: string, length: number, collection: CollectionName, store: StoreService): string {
    const items = store.getAll<any>(collection) || [];
    let maxNum = 0;
    items.forEach(item => {
      const idField = Object.keys(item).find(
        k => k.toLowerCase().includes('id') && typeof item[k] === 'string' && item[k].startsWith(prefix)
      );
      if (idField) {
        const numPart = parseInt(item[idField].replace(prefix, ''), 10);
        if (!isNaN(numPart) && numPart > maxNum) maxNum = numPart;
      }
    });
    const nextNum = maxNum + 1;
    return prefix + String(nextNum).padStart(length, '0');
  }

  generateUserId(role: 'CUSTOMER' | 'ADMIN', store: StoreService): string {
    const prefix = role === 'CUSTOMER' ? 'U' : 'S';
    return this.generateId(prefix, 4, 'users', store);
  }

  generateAccountId(type: 'SAVINGS' | 'CURRENT', store: StoreService): string {
    const typeChar = type === 'SAVINGS' ? 'S' : 'C';
    return this.generateId('ACC' + typeChar, 6, 'accounts', store);
  }

  generateCardId(type: 'DEBIT' | 'CREDIT', store: StoreService): string {
    const prefix = type === 'DEBIT' ? 'DCARD' : 'CCARD';
    return this.generateId(prefix, 4, 'cards', store);
  }

  generateTransactionId(store: StoreService): string {
    return this.generateId('TXN', 5, 'transactions', store);
  }

  generateLoanId(store: StoreService): string {
    return this.generateId('LOAN', 4, 'loans', store);
  }

  generateScheduleId(store: StoreService): string {
    return this.generateId('SP', 3, 'scheduledPayments', store);
  }

  generateAuditId(store: StoreService): string {
    return this.generateId('AUD', 3, 'auditLogs', store);
  }

  generateCardNumber(): string {
    let num = '4532';
    for (let i = 0; i < 12; i++) {
      num += Math.floor(Math.random() * 10);
    }
    return num;
  }

  formatCardNumber(num: string): string {
    if (!num) return '';
    return num.replace(/(.{4})/g, '$1 ').trim();
  }

  maskCardNumber(num: string): string {
    if (!num) return '';
    const clean = num.replace(/\s/g, '');
    return '•••• •••• •••• ' + clean.slice(-4);
  }

  formatCurrency(amount: number): string {
    return '₹' + Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  formatCurrencyShort(amount: number): string {
    const val = Number(amount || 0);
    if (val >= 10000000) return '₹' + (val / 10000000).toFixed(2) + ' Cr';
    if (val >= 100000) return '₹' + (val / 100000).toFixed(2) + ' L';
    if (val >= 1000) return '₹' + (val / 1000).toFixed(1) + 'K';
    return this.formatCurrency(val);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatDateTime(dateStr: string): string {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  getRelativeTime(dateStr: string): string {
    if (!dateStr) return '-';
    const now = new Date();
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
    return this.formatDate(dateStr);
  }

  todayISO(): string {
    return new Date().toISOString().split('T')[0];
  }

  nowISO(): string {
    return new Date().toISOString();
  }

  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'securebank_salt_2024');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  randomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  generateCVV(): string {
    return String(this.randomInt(100, 999));
  }

  calculateEMI(principal: number, annualRate: number, tenureMonths: number): number {
    const monthlyRate = annualRate / 12 / 100;
    if (monthlyRate === 0) return principal / tenureMonths;
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)
      / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    return Math.round(emi);
  }

  generateEMISchedule(principal: number, annualRate: number, tenureMonths: number, startDate: string) {
    const monthlyRate = annualRate / 12 / 100;
    const emi = this.calculateEMI(principal, annualRate, tenureMonths);
    let balance = principal;
    const schedule: any[] = [];
    const start = new Date(startDate);

    for (let i = 1; i <= tenureMonths; i++) {
      const interest = Math.round(balance * monthlyRate);
      const principalPart = emi - interest;
      balance = Math.max(0, balance - principalPart);

      const payDate = new Date(start);
      payDate.setMonth(payDate.getMonth() + i);

      schedule.push({
        month: i,
        date: payDate.toISOString().split('T')[0],
        amount: emi,
        principal: principalPart,
        interest: interest,
        balance: Math.round(balance),
        status: 'UPCOMING'
      });
    }
    return schedule;
  }

  exportToPDF(title?: string): void {
    const originalTitle = document.title;
    document.title = title || 'ILPBank Statement';
    window.print();
    document.title = originalTitle;
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getStatusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      'ACTIVE': 'success', 'APPROVED': 'success', 'COMPLETED': 'success', 'PAID': 'success', 'DISBURSED': 'success',
      'PENDING': 'warning', 'WAITING': 'warning', 'UNDER_REVIEW': 'warning', 'SUBMITTED': 'warning', 'UPCOMING': 'info',
      'FROZEN': 'info', 'DORMANT': 'info', 'PAUSED': 'info',
      'REJECTED': 'error', 'FAILED': 'error', 'BLOCKED': 'error', 'CLOSED': 'error', 'CANCELLED': 'error', 'INACTIVE': 'error',
      'CREDIT': 'success', 'DEBIT': 'error'
    };
    return map[status] || 'secondary';
  }

  getTransactionIconInfo(category: string): { icon: string; class: string } {
    const map: Record<string, { icon: string; class: string }> = {
      'DEPOSIT': { icon: 'south_west', class: 'success' },
      'CASH_DEPOSIT': { icon: 'south_west', class: 'success' },
      'CHEQUE_DEPOSIT': { icon: 'south_west', class: 'success' },
      'ONLINE_DEPOSIT': { icon: 'south_west', class: 'success' },
      'WITHDRAWAL': { icon: 'north_east', class: 'error' },
      'CASH_WITHDRAWAL': { icon: 'north_east', class: 'error' },
      'ATM_WITHDRAWAL': { icon: 'north_east', class: 'error' },
      'ONLINE_WITHDRAWAL': { icon: 'north_east', class: 'error' },
      'TRANSFER': { icon: 'swap_horiz', class: 'primary' },
      'OWN_TRANSFER': { icon: 'swap_horiz', class: 'primary' },
      'SAME_BANK_TRANSFER': { icon: 'swap_horiz', class: 'primary' },
      'EMI': { icon: 'event_repeat', class: 'warning' },
      'CARD_PAYMENT': { icon: 'credit_card', class: 'secondary' },
      'ONLINE_TRANSACTION': { icon: 'language', class: 'info' },
    };
    return map[category] || { icon: 'receipt_long', class: 'secondary' };
  }
}
