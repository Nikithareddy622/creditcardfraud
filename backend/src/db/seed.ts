import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding FalconShield AI Database...');

  // Delete existing data
  await prisma.auditLog.deleteMany();
  await prisma.fraudAlert.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.fraudRule.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Users
  const admin = await prisma.user.create({
    data: {
      id: 'u-admin-01',
      name: 'Sarah Connor (Admin)',
      email: 'admin@falconshield.ai',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });

  const analyst = await prisma.user.create({
    data: {
      id: 'u-analyst-01',
      name: 'Alex Mercer (Lead Analyst)',
      email: 'analyst@falconshield.ai',
      password: hashedPassword,
      role: 'FRAUD_ANALYST'
    }
  });

  const support = await prisma.user.create({
    data: {
      id: 'u-support-01',
      name: 'Elena Rostova (Support)',
      email: 'support@falconshield.ai',
      password: hashedPassword,
      role: 'CUSTOMER_SUPPORT'
    }
  });

  // Customers
  const c1 = await prisma.customer.create({
    data: {
      id: 'c-101',
      customerName: 'Jonathan Wick',
      email: 'j.wick@continental.com',
      phone: '+1 (555) 019-2834',
      cardNumber: '4532-****-****-8812',
      age: 42,
      gender: 'Male',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      location: 'New York, USA',
      occupation: 'Security Specialist',
      monthlyIncome: 18500.00,
      averageSpend: 2500.00,
      registeredDeviceType: 'iPhone 15 Pro',
      knownDevices: 'iPhone 15 Pro, MacBook Pro',
      knownLocations: 'New York, USA; Los Angeles, USA',
      riskScore: 92,
      fraudHistoryCount: 3,
      totalSpent: 45210.50,
      fraudCount: 3
    }
  });

  const c2 = await prisma.customer.create({
    data: {
      id: 'c-102',
      customerName: 'Bruce Wayne',
      email: 'b.wayne@wayneenterprises.com',
      phone: '+1 (555) 839-1002',
      cardNumber: '5412-****-****-1199',
      age: 38,
      gender: 'Male',
      city: 'Gotham',
      state: 'NJ',
      country: 'USA',
      location: 'Gotham, USA',
      occupation: 'Executive Officer',
      monthlyIncome: 450000.00,
      averageSpend: 15000.00,
      registeredDeviceType: 'Custom Secure Tablet',
      knownDevices: 'Custom Secure Tablet, Wayne Workstation',
      knownLocations: 'Gotham, USA; Zurich, Switzerland',
      riskScore: 14,
      fraudHistoryCount: 0,
      totalSpent: 128900.00,
      fraudCount: 0
    }
  });

  const c3 = await prisma.customer.create({
    data: {
      id: 'c-103',
      customerName: 'Diana Prince',
      email: 'diana.p@louvre.org',
      phone: '+44 20 7946 0912',
      cardNumber: '4916-****-****-7741',
      age: 34,
      gender: 'Female',
      city: 'London',
      state: 'Greater London',
      country: 'UK',
      location: 'London, UK',
      occupation: 'Curator',
      monthlyIncome: 12000.00,
      averageSpend: 1800.00,
      registeredDeviceType: 'iPad Air',
      knownDevices: 'iPad Air, Web Browser',
      knownLocations: 'London, UK; Paris, France',
      riskScore: 45,
      fraudHistoryCount: 1,
      totalSpent: 34100.20,
      fraudCount: 1
    }
  });

  const c4 = await prisma.customer.create({
    data: {
      id: 'c-104',
      customerName: 'Arthur Dent',
      email: 'dent.a@bbc.co.uk',
      phone: '+44 1632 960123',
      cardNumber: '4024-****-****-3312',
      age: 40,
      gender: 'Male',
      city: 'Islington',
      state: 'London',
      country: 'UK',
      location: 'Islington, UK',
      occupation: 'Radio Producer',
      monthlyIncome: 4200.00,
      averageSpend: 650.00,
      registeredDeviceType: 'Android Smartphone',
      knownDevices: 'Android Smartphone',
      knownLocations: 'Islington, UK',
      riskScore: 88,
      fraudHistoryCount: 2,
      totalSpent: 9850.00,
      fraudCount: 2
    }
  });

  const c5 = await prisma.customer.create({
    data: {
      id: 'c-105',
      customerName: 'Natasha Romanoff',
      email: 'n.romanoff@avengers.org',
      phone: '+81 3 5555 0149',
      cardNumber: '5200-****-****-9011',
      age: 32,
      gender: 'Female',
      city: 'Tokyo',
      state: 'Kanto',
      country: 'Japan',
      location: 'Tokyo, Japan',
      occupation: 'Intelligence Analyst',
      monthlyIncome: 22000.00,
      averageSpend: 3200.00,
      registeredDeviceType: 'iPhone 14 Pro',
      knownDevices: 'iPhone 14 Pro, Encrypted Laptop',
      knownLocations: 'Tokyo, Japan; Berlin, Germany',
      riskScore: 25,
      fraudHistoryCount: 0,
      totalSpent: 67400.00,
      fraudCount: 0
    }
  });

  // Transactions
  const tx1 = await prisma.transaction.create({
    data: {
      id: 'tx-1001',
      customerId: c1.id,
      amount: 4850.00,
      merchant: 'LuxBoutique Electronics',
      merchantCategory: 'electronics',
      transactionDate: new Date(Date.now() - 10 * 60 * 1000),
      city: 'Moscow',
      country: 'Russia',
      deviceType: 'unknown_device',
      status: 'BLOCKED',
      fraudScore: 0.94,
      prediction: 'Fraudulent',
      riskCategory: 'Critical Risk'
    }
  });

  const tx2 = await prisma.transaction.create({
    data: {
      id: 'tx-1002',
      customerId: c2.id,
      amount: 120.50,
      merchant: 'Whole Foods Market',
      merchantCategory: 'grocery',
      transactionDate: new Date(Date.now() - 25 * 60 * 1000),
      city: 'Gotham',
      country: 'USA',
      deviceType: 'mobile_app',
      status: 'APPROVED',
      fraudScore: 0.05,
      prediction: 'Legitimate',
      riskCategory: 'Low Risk'
    }
  });

  const tx3 = await prisma.transaction.create({
    data: {
      id: 'tx-1003',
      customerId: c3.id,
      amount: 2450.00,
      merchant: 'Global Flight Reservations',
      merchantCategory: 'travel',
      transactionDate: new Date(Date.now() - 60 * 60 * 1000),
      city: 'Istanbul',
      country: 'Turkey',
      deviceType: 'web_browser',
      status: 'FLAGGED',
      fraudScore: 0.68,
      prediction: 'Fraudulent',
      riskCategory: 'High Risk'
    }
  });

  const tx4 = await prisma.transaction.create({
    data: {
      id: 'tx-1004',
      customerId: c4.id,
      amount: 3900.00,
      merchant: 'Diamond & Gem Exchange',
      merchantCategory: 'jewelry',
      transactionDate: new Date(Date.now() - 120 * 60 * 1000),
      city: 'Lagos',
      country: 'Nigeria',
      deviceType: 'unknown_device',
      status: 'BLOCKED',
      fraudScore: 0.91,
      prediction: 'Fraudulent',
      riskCategory: 'Critical Risk'
    }
  });

  const tx5 = await prisma.transaction.create({
    data: {
      id: 'tx-1005',
      customerId: c5.id,
      amount: 45.00,
      merchant: 'Starbucks Coffee',
      merchantCategory: 'restaurants',
      transactionDate: new Date(Date.now() - 180 * 60 * 1000),
      city: 'Tokyo',
      country: 'Japan',
      deviceType: 'pos_terminal',
      status: 'APPROVED',
      fraudScore: 0.02,
      prediction: 'Legitimate',
      riskCategory: 'Low Risk'
    }
  });

  // Fraud Alerts
  await prisma.fraudAlert.create({
    data: {
      id: 'alt-2001',
      transactionId: tx1.id,
      severity: 'CRITICAL',
      assignedTo: 'Alex Mercer (Lead Analyst)',
      status: 'OPEN',
      notes: 'High amount transaction originating from untrusted device and high-risk international IP.'
    }
  });

  await prisma.fraudAlert.create({
    data: {
      id: 'alt-2002',
      transactionId: tx3.id,
      severity: 'HIGH',
      assignedTo: 'Unassigned',
      status: 'UNDER_INVESTIGATION',
      notes: 'Cardholder spending pattern velocity anomaly detected.'
    }
  });

  await prisma.fraudAlert.create({
    data: {
      id: 'alt-2003',
      transactionId: tx4.id,
      severity: 'CRITICAL',
      assignedTo: 'Alex Mercer (Lead Analyst)',
      status: 'RESOLVED',
      notes: 'Confirmed card theft. Card blocked permanently and refund initiated.'
    }
  });

  // Rules
  await prisma.fraudRule.createMany({
    data: [
      {
        id: 'r-3001',
        ruleName: 'High Amount Threshold',
        conditionType: 'MAX_AMOUNT',
        threshold: '3000.00',
        action: 'BLOCK',
        isEnabled: true
      },
      {
        id: 'r-3002',
        ruleName: 'Velocity Spikes (24h)',
        conditionType: 'VELOCITY_LIMIT',
        threshold: '10 transactions',
        action: 'FLAG',
        isEnabled: true
      },
      {
        id: 'r-3003',
        ruleName: 'High Risk Country IP',
        conditionType: 'HIGH_RISK_COUNTRY',
        threshold: 'Nigeria, Russia, North Korea',
        action: 'BLOCK',
        isEnabled: true
      },
      {
        id: 'r-3004',
        ruleName: 'Unusual Night Time Spikes',
        conditionType: 'NIGHT_TRANSACTION',
        threshold: '01:00 - 05:00',
        action: 'FLAG',
        isEnabled: true
      }
    ]
  });

  // Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        id: 'log-4001',
        userId: admin.id,
        userName: admin.name,
        action: 'RULE_UPDATE',
        details: 'Updated rule "High Amount Threshold" limit to $3000.00'
      },
      {
        id: 'log-4002',
        userId: analyst.id,
        userName: analyst.name,
        action: 'ALERT_RESOLVE',
        details: 'Resolved alert alt-2003 as Confirmed Fraud'
      }
    ]
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
