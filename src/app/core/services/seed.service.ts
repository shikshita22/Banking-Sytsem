import { Injectable } from '@angular/core';
import { StoreService } from './store.service';
import { UtilsService } from './utils.service';

@Injectable({
  providedIn: 'root'
})
export class SeedService {

  constructor(
    private store: StoreService,
    private utils: UtilsService
  ) {}

  async loadSeedData(): Promise<void> {
    if (this.store.isInitialized()) {
      await this.verifyAndRepairSeedUsers();
      return;
    }

    const hash = (p: string) => this.utils.hashPassword(p);

    // Hash passwords
    const adminHash = await hash('Admin@1234');
    const staffHash = await hash('Staff@1234');
    const loanOfficerHash = await hash('LoanOfficer@123');
    const managerHash = await hash('Manager@1234');
    const csrHash = await hash('Csr@1234');
    const customerHash = await hash('Customer@1234');
    const cust2Hash = await hash('Cust@12345');
    const cust3Hash = await hash('Cust@12346');
    const cust4Hash = await hash('Cust@12347');
    const cust5Hash = await hash('Cust@12348');

    // --- USERS ---
    const users = [
      {
        userId: 'S0001', firstName: 'Rajesh', lastName: 'Kumar',
        email: 'rajesh.kumar@tcs.com', phone: '9876543210',
        password: adminHash, role: 'ADMIN',
        dateOfBirth: '1980-03-15', address: '42 MG Road, Mumbai, Maharashtra 400001',
        pan: 'ABCPK1234E', aadhaar: '234567890123',
        createdAt: '2023-01-01', status: 'ACTIVE'
      },
      {
        userId: 'S0002', firstName: 'Priya', lastName: 'Singh',
        email: 'priya.singh@tcs.com', phone: '9876543211',
        password: staffHash, role: 'STAFF',
        dateOfBirth: '1985-07-22', address: '15 Brigade Road, Bangalore, Karnataka 560001',
        pan: 'DEFPS5678G', aadhaar: '345678901234',
        createdAt: '2023-03-10', status: 'ACTIVE'
      },
      {
        userId: 'S0003', firstName: 'Arun', lastName: 'Bhatia',
        email: 'arun.bhatia@tcs.com', phone: '9876543212',
        password: loanOfficerHash, role: 'LOAN_OFFICER',
        dateOfBirth: '1982-05-14', address: '88 Commercial Street, Bangalore, Karnataka 560001',
        pan: 'GHIAB9012H', aadhaar: '456789012349',
        createdAt: '2023-04-12', status: 'ACTIVE'
      },
      {
        userId: 'S0004', firstName: 'Vikram', lastName: 'Sharma',
        email: 'vikram.sharma@tcs.com', phone: '9876543213',
        password: managerHash, role: 'MANAGER',
        dateOfBirth: '1978-11-20', address: '10 Bandra Kurla Complex, Mumbai, Maharashtra 400051',
        pan: 'JKLSV3456I', aadhaar: '567890123459',
        createdAt: '2023-02-15', status: 'ACTIVE'
      },
      {
        userId: 'S0005', firstName: 'Ananya', lastName: 'Verma',
        email: 'ananya.verma@tcs.com', phone: '9876543214',
        password: csrHash, role: 'CSR',
        dateOfBirth: '1991-08-10', address: '45 Salt Lake, Kolkata, West Bengal 700091',
        pan: 'MNOAV7890J', aadhaar: '678901234569',
        createdAt: '2023-05-01', status: 'ACTIVE'
      },
      {
        userId: 'U0001', firstName: 'Amit', lastName: 'Sharma',
        email: 'amit.sharma@tcs.com', phone: '9123456780',
        password: customerHash, role: 'CUSTOMER',
        dateOfBirth: '1992-11-05', address: '78 Park Street, Kolkata, West Bengal 700016',
        pan: 'GHIAS9012H', aadhaar: '456789012345',
        createdAt: '2023-06-15', status: 'ACTIVE'
      },
      {
        userId: 'U0002', firstName: 'Sneha', lastName: 'Patel',
        email: 'sneha.patel@tcs.com', phone: '8765432190',
        password: cust2Hash, role: 'CUSTOMER',
        dateOfBirth: '1995-02-18', address: '23 Law Garden, Ahmedabad, Gujarat 380006',
        pan: 'JKLSP3456I', aadhaar: '567890123456',
        createdAt: '2023-08-20', status: 'ACTIVE'
      },
      {
        userId: 'U0003', firstName: 'Vikram', lastName: 'Reddy',
        email: 'vikram.reddy@tcs.com', phone: '7654321890',
        password: cust3Hash, role: 'CUSTOMER',
        dateOfBirth: '1988-09-30', address: '56 Jubilee Hills, Hyderabad, Telangana 500033',
        pan: 'MNUVR7890J', aadhaar: '678901234567',
        createdAt: '2024-01-10', status: 'ACTIVE'
      },
      {
        userId: 'U0004', firstName: 'Meera', lastName: 'Nair',
        email: 'meera.nair@tcs.com', phone: '6543219870',
        password: cust4Hash, role: 'CUSTOMER',
        dateOfBirth: '1990-12-12', address: '89 Marine Drive, Kochi, Kerala 682001',
        pan: 'OPQMN1234K', aadhaar: '789012345678',
        createdAt: '2024-03-05', status: 'ACTIVE'
      },
      {
        userId: 'U0005', firstName: 'Arjun', lastName: 'Mehta',
        email: 'arjun.mehta@tcs.com', phone: '9988776655',
        password: cust5Hash, role: 'CUSTOMER',
        dateOfBirth: '1993-06-25', address: '12 Connaught Place, New Delhi 110001',
        pan: 'RSTAM5678L', aadhaar: '890123456789',
        createdAt: '2024-05-18', status: 'FROZEN'
      }
    ];

    // --- ACCOUNTS ---
    const accounts = [
      {
        accountId: 'ACCS000001', userId: 'U0001', accountType: 'SAVINGS',
        balance: 245000, availableBalance: 240000, minBalance: 5000,
        ifsc: 'KBKK0000001', branch: 'Mumbai Main Branch',
        openingDate: '2023-06-15', status: 'ACTIVE', nominee: 'Priya Sharma'
      },
      {
        accountId: 'ACCC000001', userId: 'U0001', accountType: 'CURRENT',
        balance: 520000, availableBalance: 520000, minBalance: 10000,
        ifsc: 'KBKK0000001', branch: 'Mumbai Main Branch',
        openingDate: '2023-09-01', status: 'ACTIVE', nominee: 'Priya Sharma'
      },
      {
        accountId: 'ACCS000002', userId: 'U0002', accountType: 'SAVINGS',
        balance: 178500, availableBalance: 173500, minBalance: 5000,
        ifsc: 'KBKK0000002', branch: 'Ahmedabad City Branch',
        openingDate: '2023-08-20', status: 'ACTIVE', nominee: 'Ravi Patel'
      },
      {
        accountId: 'ACCS000003', userId: 'U0003', accountType: 'SAVINGS',
        balance: 95200, availableBalance: 90200, minBalance: 5000,
        ifsc: 'KBKK0000003', branch: 'Hyderabad Tech Park Branch',
        openingDate: '2024-01-10', status: 'ACTIVE', nominee: 'Lakshmi Reddy'
      },
      {
        accountId: 'ACCC000002', userId: 'U0003', accountType: 'CURRENT',
        balance: 750000, availableBalance: 750000, minBalance: 10000,
        ifsc: 'KBKK0000003', branch: 'Hyderabad Tech Park Branch',
        openingDate: '2024-02-15', status: 'ACTIVE', nominee: 'Lakshmi Reddy'
      },
      {
        accountId: 'ACCS000004', userId: 'U0004', accountType: 'SAVINGS',
        balance: 312800, availableBalance: 307800, minBalance: 5000,
        ifsc: 'KBKK0000004', branch: 'Kochi Marine Branch',
        openingDate: '2024-03-05', status: 'ACTIVE', nominee: 'Suresh Nair'
      },
      {
        accountId: 'ACCS000005', userId: 'U0005', accountType: 'SAVINGS',
        balance: 45000, availableBalance: 40000, minBalance: 5000,
        ifsc: 'KBKK0000005', branch: 'Delhi Connaught Place Branch',
        openingDate: '2024-05-18', status: 'FROZEN', nominee: 'Kavita Mehta'
      },
      {
        accountId: 'ACCS000006', userId: 'U0002', accountType: 'SAVINGS',
        balance: 0, availableBalance: 0, minBalance: 5000,
        ifsc: 'KBKK0000002', branch: 'Ahmedabad City Branch',
        openingDate: '2024-06-01', status: 'PENDING', nominee: 'Ravi Patel'
      }
    ];

    // --- CARDS ---
    const cards = [
      {
        cardId: 'DCARD0001', accountId: 'ACCS000001', userId: 'U0001',
        cardNumber: '4532876512341234', cardType: 'DEBIT',
        expiryDate: '12/2028', cvv: '456',
        pin: await hash('1234'), isBlocked: false,
        atmEnabled: true, onlineEnabled: true, dailyLimit: 50000,
        creditLimit: 0, outstandingBalance: 0, minimumDue: 0, dueDate: ''
      },
      {
        cardId: 'CCARD0001', accountId: 'ACCS000001', userId: 'U0001',
        cardNumber: '5234567890123456', cardType: 'CREDIT',
        expiryDate: '06/2027', cvv: '789',
        pin: await hash('5678'), isBlocked: false,
        atmEnabled: true, onlineEnabled: true, dailyLimit: 100000,
        creditLimit: 300000, outstandingBalance: 45200, minimumDue: 4520, dueDate: '2026-08-15'
      },
      {
        cardId: 'DCARD0002', accountId: 'ACCS000002', userId: 'U0002',
        cardNumber: '4532111122223333', cardType: 'DEBIT',
        expiryDate: '03/2029', cvv: '321',
        pin: await hash('4321'), isBlocked: false,
        atmEnabled: true, onlineEnabled: true, dailyLimit: 40000,
        creditLimit: 0, outstandingBalance: 0, minimumDue: 0, dueDate: ''
      },
      {
        cardId: 'DCARD0003', accountId: 'ACCS000003', userId: 'U0003',
        cardNumber: '4532444455556666', cardType: 'DEBIT',
        expiryDate: '09/2028', cvv: '654',
        pin: await hash('9876'), isBlocked: false,
        atmEnabled: true, onlineEnabled: false, dailyLimit: 25000,
        creditLimit: 0, outstandingBalance: 0, minimumDue: 0, dueDate: ''
      },
      {
        cardId: 'CCARD0002', accountId: 'ACCS000003', userId: 'U0003',
        cardNumber: '5234777788889999', cardType: 'CREDIT',
        expiryDate: '01/2028', cvv: '987',
        pin: await hash('1111'), isBlocked: true,
        atmEnabled: false, onlineEnabled: false, dailyLimit: 75000,
        creditLimit: 200000, outstandingBalance: 128000, minimumDue: 12800, dueDate: '2026-07-20'
      },
      {
        cardId: 'DCARD0004', accountId: 'ACCS000004', userId: 'U0004',
        cardNumber: '4532000011112222', cardType: 'DEBIT',
        expiryDate: '11/2029', cvv: '147',
        pin: await hash('2468'), isBlocked: false,
        atmEnabled: true, onlineEnabled: true, dailyLimit: 60000,
        creditLimit: 0, outstandingBalance: 0, minimumDue: 0, dueDate: ''
      }
    ];

    // --- TRANSACTIONS ---
    const transactions: any[] = [];
    const txnData = [
      { accountId: 'ACCS000001', type: 'CREDIT', category: 'CASH_DEPOSIT', amount: 50000, desc: 'Cash Deposit at Branch', date: '2026-06-01' },
      { accountId: 'ACCS000001', type: 'CREDIT', category: 'ONLINE_DEPOSIT', amount: 75000, desc: 'Salary Credit - TCS', date: '2026-06-05' },
      { accountId: 'ACCS000001', type: 'DEBIT', category: 'ATM_WITHDRAWAL', amount: 10000, desc: 'ATM Withdrawal - Mumbai Central', date: '2026-06-08' },
      { accountId: 'ACCS000001', type: 'DEBIT', category: 'ONLINE_TRANSACTION', amount: 5500, desc: 'Online Shopping - Amazon', date: '2026-06-10' },
      { accountId: 'ACCS000001', type: 'DEBIT', category: 'SAME_BANK_TRANSFER', amount: 25000, desc: 'Transfer to Sneha Patel', date: '2026-06-12', toAccount: 'ACCS000002' },
      { accountId: 'ACCS000001', type: 'DEBIT', category: 'EMI', amount: 16267, desc: 'Personal Loan EMI', date: '2026-06-15' },
      { accountId: 'ACCS000001', type: 'CREDIT', category: 'ONLINE_DEPOSIT', amount: 75000, desc: 'Salary Credit - TCS', date: '2026-07-05' },
      { accountId: 'ACCS000001', type: 'DEBIT', category: 'CASH_WITHDRAWAL', amount: 15000, desc: 'Cash Withdrawal', date: '2026-07-06' },
      { accountId: 'ACCS000001', type: 'DEBIT', category: 'CARD_PAYMENT', amount: 8900, desc: 'Credit Card Bill Payment', date: '2026-07-07' },
      { accountId: 'ACCS000001', type: 'DEBIT', category: 'OWN_TRANSFER', amount: 30000, desc: 'Transfer to Current Account', date: '2026-07-08', toAccount: 'ACCC000001' },

      { accountId: 'ACCC000001', type: 'CREDIT', category: 'OWN_TRANSFER', amount: 30000, desc: 'From Savings Account', date: '2026-07-08', fromAccount: 'ACCS000001' },
      { accountId: 'ACCC000001', type: 'CREDIT', category: 'ONLINE_DEPOSIT', amount: 200000, desc: 'Business Payment Received', date: '2026-06-20' },
      { accountId: 'ACCC000001', type: 'DEBIT', category: 'ONLINE_TRANSACTION', amount: 85000, desc: 'Vendor Payment', date: '2026-06-25' },

      { accountId: 'ACCS000002', type: 'CREDIT', category: 'ONLINE_DEPOSIT', amount: 65000, desc: 'Salary Credit - TCS', date: '2026-06-05' },
      { accountId: 'ACCS000002', type: 'CREDIT', category: 'SAME_BANK_TRANSFER', amount: 25000, desc: 'Received from Amit Sharma', date: '2026-06-12', fromAccount: 'ACCS000001' },
      { accountId: 'ACCS000002', type: 'DEBIT', category: 'ATM_WITHDRAWAL', amount: 5000, desc: 'ATM Withdrawal', date: '2026-06-14' },
      { accountId: 'ACCS000002', type: 'DEBIT', category: 'ONLINE_TRANSACTION', amount: 12500, desc: 'Insurance Premium', date: '2026-06-18' },
      { accountId: 'ACCS000002', type: 'CREDIT', category: 'ONLINE_DEPOSIT', amount: 65000, desc: 'Salary Credit - TCS', date: '2026-07-05' },
      { accountId: 'ACCS000002', type: 'DEBIT', category: 'CASH_WITHDRAWAL', amount: 20000, desc: 'Cash Withdrawal', date: '2026-07-06' },

      { accountId: 'ACCS000003', type: 'CREDIT', category: 'ONLINE_DEPOSIT', amount: 55000, desc: 'Salary Credit', date: '2026-06-05' },
      { accountId: 'ACCS000003', type: 'DEBIT', category: 'ONLINE_TRANSACTION', amount: 3200, desc: 'Electricity Bill', date: '2026-06-10' },
      { accountId: 'ACCS000003', type: 'DEBIT', category: 'EMI', amount: 12500, desc: 'Home Loan EMI', date: '2026-06-15' },
      { accountId: 'ACCS000003', type: 'CREDIT', category: 'CASH_DEPOSIT', amount: 10000, desc: 'Cash Deposit', date: '2026-06-20' },
      { accountId: 'ACCS000003', type: 'CREDIT', category: 'ONLINE_DEPOSIT', amount: 55000, desc: 'Salary Credit', date: '2026-07-05' },

      { accountId: 'ACCC000002', type: 'CREDIT', category: 'ONLINE_DEPOSIT', amount: 500000, desc: 'Business Revenue', date: '2026-06-01' },
      { accountId: 'ACCC000002', type: 'DEBIT', category: 'ONLINE_TRANSACTION', amount: 125000, desc: 'Supplier Payment', date: '2026-06-15' },
      { accountId: 'ACCC000002', type: 'DEBIT', category: 'ONLINE_TRANSACTION', amount: 75000, desc: 'Office Rent', date: '2026-07-01' },

      { accountId: 'ACCS000004', type: 'CREDIT', category: 'ONLINE_DEPOSIT', amount: 80000, desc: 'Salary Credit - TCS', date: '2026-06-05' },
      { accountId: 'ACCS000004', type: 'DEBIT', category: 'ONLINE_TRANSACTION', amount: 2800, desc: 'Phone Recharge', date: '2026-06-08' },
      { accountId: 'ACCS000004', type: 'DEBIT', category: 'ATM_WITHDRAWAL', amount: 8000, desc: 'ATM Withdrawal', date: '2026-06-12' },
      { accountId: 'ACCS000004', type: 'CREDIT', category: 'CHEQUE_DEPOSIT', amount: 35000, desc: 'Cheque Deposit - Rent', date: '2026-06-20' },
      { accountId: 'ACCS000004', type: 'CREDIT', category: 'ONLINE_DEPOSIT', amount: 80000, desc: 'Salary Credit - TCS', date: '2026-07-05' },
      { accountId: 'ACCS000004', type: 'DEBIT', category: 'SAME_BANK_TRANSFER', amount: 15000, desc: 'Transfer to Amit Sharma', date: '2026-07-07', toAccount: 'ACCS000001' },

      { accountId: 'ACCS000005', type: 'CREDIT', category: 'ONLINE_DEPOSIT', amount: 45000, desc: 'Salary Credit', date: '2026-05-05' },
      { accountId: 'ACCS000005', type: 'DEBIT', category: 'ATM_WITHDRAWAL', amount: 5000, desc: 'ATM Withdrawal', date: '2026-05-10' },
    ];

    const balanceMap: Record<string, number> = {};
    txnData.forEach((t: any, i) => {
      if (!balanceMap[t.accountId]) balanceMap[t.accountId] = 0;
      if (t.type === 'CREDIT') balanceMap[t.accountId] += t.amount;
      else balanceMap[t.accountId] -= t.amount;

      transactions.push({
        transactionId: 'TXN' + String(i + 1).padStart(5, '0'),
        accountId: t.accountId,
        transactionType: t.type,
        category: t.category,
        amount: t.amount,
        balance: balanceMap[t.accountId],
        description: t.desc,
        referenceId: 'REF' + String(100000 + i),
        date: t.date,
        time: `${String(9 + (i % 10)).padStart(2, '0')}:${String(15 + (i * 7) % 45).padStart(2, '0')}:00`,
        status: 'COMPLETED',
        toAccount: t.toAccount || '',
        fromAccount: t.fromAccount || ''
      });
    });

    // --- LOANS ---
    const loans = [
      {
        loanId: 'LOAN0001', userId: 'U0001', accountId: 'ACCS000001',
        loanType: 'PERSONAL', amount: 500000, tenureMonths: 36, interestRate: 10.5,
        emiAmount: this.utils.calculateEMI(500000, 10.5, 36),
        status: 'DISBURSED', appliedDate: '2024-01-15',
        approvedDate: '2024-01-25', disbursedDate: '2024-02-01',
        remarks: 'All documents verified. Loan disbursed.',
        documents: ['income_proof.pdf', 'identity_proof.pdf', 'address_proof.pdf'],
        emiSchedule: this.utils.generateEMISchedule(500000, 10.5, 36, '2024-02-01')
      },
      {
        loanId: 'LOAN0002', userId: 'U0003', accountId: 'ACCS000003',
        loanType: 'HOME', amount: 3500000, tenureMonths: 240, interestRate: 8.5,
        emiAmount: this.utils.calculateEMI(3500000, 8.5, 240),
        status: 'DISBURSED', appliedDate: '2024-02-10',
        approvedDate: '2024-03-01', disbursedDate: '2024-03-15',
        remarks: 'Home loan approved after property verification.',
        documents: ['income_proof.pdf', 'property_docs.pdf', 'identity_proof.pdf'],
        emiSchedule: this.utils.generateEMISchedule(3500000, 8.5, 240, '2024-03-15')
      },
      {
        loanId: 'LOAN0003', userId: 'U0002', accountId: 'ACCS000002',
        loanType: 'VEHICLE', amount: 800000, tenureMonths: 60, interestRate: 9.0,
        emiAmount: this.utils.calculateEMI(800000, 9.0, 60),
        status: 'APPROVED', appliedDate: '2026-06-01',
        approvedDate: '2026-06-15', disbursedDate: '',
        remarks: 'Vehicle loan approved. Awaiting disbursement.',
        documents: ['income_proof.pdf', 'vehicle_quotation.pdf'],
        emiSchedule: []
      },
      {
        loanId: 'LOAN0004', userId: 'U0004', accountId: 'ACCS000004',
        loanType: 'EDUCATION', amount: 1200000, tenureMonths: 84, interestRate: 7.5,
        emiAmount: this.utils.calculateEMI(1200000, 7.5, 84),
        status: 'WAITING', appliedDate: '2026-07-01',
        approvedDate: '', disbursedDate: '',
        remarks: 'Under review. Additional documents requested.',
        documents: ['admission_letter.pdf', 'income_proof.pdf'],
        emiSchedule: []
      },
      {
        loanId: 'LOAN0005', userId: 'U0005', accountId: 'ACCS000005',
        loanType: 'PERSONAL', amount: 200000, tenureMonths: 24, interestRate: 12.0,
        emiAmount: this.utils.calculateEMI(200000, 12.0, 24),
        status: 'REJECTED', appliedDate: '2026-06-10',
        approvedDate: '', disbursedDate: '',
        remarks: 'Rejected: Account is frozen. Please resolve account status first.',
        documents: ['income_proof.pdf'],
        emiSchedule: []
      }
    ];

    if (loans[0].emiSchedule.length > 0) {
      for (let i = 0; i < Math.min(28, loans[0].emiSchedule.length); i++) {
        loans[0].emiSchedule[i].status = 'PAID';
      }
      if (loans[0].emiSchedule[28]) loans[0].emiSchedule[28].status = 'UPCOMING';
    }
    if (loans[1].emiSchedule.length > 0) {
      for (let i = 0; i < Math.min(27, loans[1].emiSchedule.length); i++) {
        loans[1].emiSchedule[i].status = 'PAID';
      }
      if (loans[1].emiSchedule[27]) loans[1].emiSchedule[27].status = 'UPCOMING';
    }

    // --- SCHEDULED PAYMENTS ---
    const scheduledPayments = [
      {
        id: 'SP001', userId: 'U0001', accountId: 'ACCS000001',
        payeeName: 'Sneha Patel', payeeAccount: 'ACCS000002',
        amount: 5000, frequency: 'MONTHLY',
        nextExecution: '2026-08-01', category: 'TRANSFER',
        status: 'ACTIVE'
      },
      {
        id: 'SP002', userId: 'U0001', accountId: 'ACCS000001',
        payeeName: 'Meera Nair', payeeAccount: 'ACCS000004',
        amount: 15000, frequency: 'MONTHLY',
        nextExecution: '2026-08-05', category: 'RENT',
        status: 'ACTIVE'
      },
      {
        id: 'SP003', userId: 'U0002', accountId: 'ACCS000002',
        payeeName: 'Vikram Reddy', payeeAccount: 'ACCS000003',
        amount: 8000, frequency: 'ONCE',
        nextExecution: '2026-07-15', category: 'TRANSFER',
        status: 'ACTIVE'
      }
    ];

    // --- AUDIT LOGS ---
    const auditLogs = [
      { id: 'AUD001', userId: 'S0001', action: 'SYSTEM_INIT', target: '-', details: 'System initialized with seed data', timestamp: '2023-01-01T09:00:00' },
      { id: 'AUD002', userId: 'S0001', action: 'USER_CREATED', target: 'S0002', details: 'Staff user Priya Singh created', timestamp: '2023-03-10T10:30:00' },
      { id: 'AUD003', userId: 'S0001', action: 'ACCOUNT_APPROVED', target: 'ACCS000001', details: 'Savings account approved for Amit Sharma', timestamp: '2023-06-15T11:00:00' },
      { id: 'AUD004', userId: 'S0002', action: 'LOAN_APPROVED', target: 'LOAN0001', details: 'Personal loan of ₹5,00,000 approved for U0001', timestamp: '2024-01-25T14:30:00' },
      { id: 'AUD005', userId: 'S0001', action: 'ACCOUNT_FROZEN', target: 'ACCS000005', details: 'Account frozen due to suspicious activity', timestamp: '2026-06-01T16:00:00' },
      { id: 'AUD006', userId: 'S0002', action: 'LOAN_APPROVED', target: 'LOAN0002', details: 'Home loan of ₹35,00,000 approved for U0003', timestamp: '2024-03-01T10:00:00' },
      { id: 'AUD007', userId: 'S0001', action: 'LOAN_REJECTED', target: 'LOAN0005', details: 'Personal loan rejected for U0005 - account frozen', timestamp: '2026-06-20T11:30:00' },
      { id: 'AUD008', userId: 'S0002', action: 'CARD_BLOCKED', target: 'CCARD0002', details: 'Credit card blocked for U0003 on customer request', timestamp: '2026-06-25T15:00:00' },
      { id: 'AUD009', userId: 'S0001', action: 'LOAN_APPROVED', target: 'LOAN0003', details: 'Vehicle loan of ₹8,00,000 approved for U0002', timestamp: '2026-06-15T09:00:00' },
      { id: 'AUD010', userId: 'S0002', action: 'USER_UPDATED', target: 'U0004', details: 'Contact details updated for Meera Nair', timestamp: '2026-07-05T12:00:00' }
    ];

    // --- NOTIFICATIONS ---
    const notifications = [
      { id: 'N001', userId: 'U0001', title: 'Salary Credited', message: '₹75,000 credited to your savings account', type: 'success', timestamp: '2026-07-05T09:15:00', read: false },
      { id: 'N002', userId: 'U0001', title: 'EMI Due Reminder', message: 'Your personal loan EMI of ₹16,267 is due on 15th July', type: 'warning', timestamp: '2026-07-07T08:00:00', read: false },
      { id: 'N003', userId: 'U0001', title: 'Credit Card Bill', message: 'Your credit card bill of ₹45,200 is due on 15th August', type: 'info', timestamp: '2026-07-06T10:00:00', read: true },
      { id: 'N004', userId: 'U0002', title: 'Vehicle Loan Approved', message: 'Your vehicle loan of ₹8,00,000 has been approved!', type: 'success', timestamp: '2026-06-15T09:30:00', read: false },
      { id: 'N005', userId: 'U0003', title: 'Card Blocked', message: 'Your credit card ending 9999 has been blocked as requested', type: 'info', timestamp: '2026-06-25T15:05:00', read: true },
      { id: 'N006', userId: 'U0005', title: 'Account Frozen', message: 'Your account has been frozen. Please contact the branch.', type: 'error', timestamp: '2026-06-01T16:05:00', read: false }
    ];

    // --- COMPLAINTS ---
    const complaints = [
      { complaintId: 'COMP1001', userId: 'U0001', category: 'CARDS', subject: 'Card Transaction Declined at POS', description: 'My debit card transaction of Rs 2500 was declined at retail store despite sufficient balance.', status: 'OPEN', createdAt: '2026-07-28' },
      { complaintId: 'COMP1002', userId: 'U0002', category: 'TRANSFERS', subject: 'Delayed Same Bank Transfer', description: 'Initiated transfer to U0003 yesterday, amount debited but not credited yet.', status: 'OPEN', createdAt: '2026-07-29' },
      { complaintId: 'COMP1003', userId: 'U0003', category: 'ACCOUNT', subject: 'Address Update Request', description: 'Submitted updated address proof for branch records update.', status: 'RESOLVED', resolution: 'Address updated successfully in core banking database.', createdAt: '2026-07-20', updatedAt: '2026-07-22' }
    ];

    // Save all data
    this.store.setAll('users', users);
    this.store.setAll('accounts', accounts);
    this.store.setAll('cards', cards);
    this.store.setAll('transactions', transactions);
    this.store.setAll('loans', loans);
    this.store.setAll('scheduledPayments', scheduledPayments);
    this.store.setAll('auditLogs', auditLogs);
    this.store.setAll('notifications', notifications);
    this.store.setAll('complaints', complaints);
    this.store.markInitialized();

    console.log('✅ Seed data loaded successfully in Angular SeedService');
  }

  async verifyAndRepairSeedUsers(): Promise<void> {
    try {
      const existingUsers = this.store.getAll<any>('users') || [];
      const requiredMap: Record<string, string> = {
        'S0001': 'Admin@1234',
        'S0002': 'Staff@1234',
        'S0003': 'LoanOfficer@123',
        'S0004': 'Manager@1234',
        'S0005': 'Csr@1234',
        'U0001': 'Customer@1234'
      };

      let modified = false;

      for (const [userId, rawPassword] of Object.entries(requiredMap)) {
        const u = existingUsers.find(x => x.userId === userId);
        const expectedHash = await this.utils.hashPassword(rawPassword);

        if (!u) {
          modified = true;
          break;
        } else if (u.password !== expectedHash) {
          u.password = expectedHash;
          modified = true;
        }
      }

      if (modified || existingUsers.length === 0) {
        console.log('Re-initializing seed data to ensure password integrity...');
        this.store.clearAll();
        await this.loadSeedData();
      }
    } catch (e) {
      console.warn('verifyAndRepairSeedUsers exception:', e);
    }
  }
}
