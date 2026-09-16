-- FalconShield AI Seed Data

-- Users (Passwords hashed for 'password123')
INSERT INTO users (id, name, email, password, role, createdAt) VALUES
('u-admin-01', 'Sarah Connor (Admin)', 'admin@falconshield.ai', '$2a$10$wN16lqG1D3L.Z26z13pX0O7m/kQy/S5TfC2wFkZ2kY8z/r/Yf.iSa', 'ADMIN', NOW()),
('u-analyst-01', 'Alex Mercer (Lead Analyst)', 'analyst@falconshield.ai', '$2a$10$wN16lqG1D3L.Z26z13pX0O7m/kQy/S5TfC2wFkZ2kY8z/r/Yf.iSa', 'FRAUD_ANALYST', NOW()),
('u-support-01', 'Elena Rostova (Support)', 'support@falconshield.ai', '$2a$10$wN16lqG1D3L.Z26z13pX0O7m/kQy/S5TfC2wFkZ2kY8z/r/Yf.iSa', 'CUSTOMER_SUPPORT', NOW());

-- Customers
INSERT INTO customers (id, customerName, cardNumber, riskScore, location, totalSpent, fraudCount, createdAt) VALUES
('c-101', 'Jonathan Wick', '4532-****-****-8812', 0.92, 'New York, USA', 45210.50, 3, NOW()),
('c-102', 'Bruce Wayne', '5412-****-****-1199', 0.14, 'Gotham, USA', 128900.00, 0, NOW()),
('c-103', 'Diana Prince', '4916-****-****-7741', 0.45, 'London, UK', 34100.20, 1, NOW()),
('c-104', 'Arthur Dent', '4024-****-****-3312', 0.88, 'Islington, UK', 9850.00, 2, NOW()),
('c-105', 'Natasha Romanoff', '5200-****-****-9011', 0.25, 'Tokyo, Japan', 67400.00, 0, NOW());

-- Transactions
INSERT INTO transactions (id, customerId, amount, merchant, merchantCategory, transactionDate, city, country, deviceType, status, fraudScore, prediction, riskCategory, createdAt) VALUES
('tx-1001', 'c-101', 4850.00, 'LuxBoutique Electronics', 'electronics', NOW() - INTERVAL '10 MINUTE', 'Moscow', 'Russia', 'unknown_device', 'BLOCKED', 0.94, 'Fraudulent', 'Critical Risk', NOW() - INTERVAL '10 MINUTE'),
('tx-1002', 'c-102', 120.50, 'Whole Foods Market', 'grocery', NOW() - INTERVAL '25 MINUTE', 'Gotham', 'USA', 'mobile_app', 'APPROVED', 0.05, 'Legitimate', 'Low Risk', NOW() - INTERVAL '25 MINUTE'),
('tx-1003', 'c-103', 2450.00, 'Global Flight Reservations', 'travel', NOW() - INTERVAL '1 HOUR', 'Istanbul', 'Turkey', 'web_browser', 'FLAGGED', 0.68, 'Fraudulent', 'High Risk', NOW() - INTERVAL '1 HOUR'),
('tx-1004', 'c-104', 3900.00, 'Diamond & Gem Exchange', 'jewelry', NOW() - INTERVAL '2 HOUR', 'Lagos', 'Nigeria', 'unknown_device', 'BLOCKED', 0.91, 'Fraudulent', 'Critical Risk', NOW() - INTERVAL '2 HOUR'),
('tx-1005', 'c-105', 45.00, 'Starbucks Coffee', 'restaurants', NOW() - INTERVAL '3 HOUR', 'Tokyo', 'Japan', 'pos_terminal', 'APPROVED', 0.02, 'Legitimate', 'Low Risk', NOW() - INTERVAL '3 HOUR');

-- Fraud Alerts
INSERT INTO fraud_alerts (id, transactionId, severity, assignedTo, status, notes, createdAt) VALUES
('alt-2001', 'tx-1001', 'CRITICAL', 'Alex Mercer (Lead Analyst)', 'OPEN', 'High amount transaction originating from untrusted device and high-risk international IP.', NOW() - INTERVAL '10 MINUTE'),
('alt-2002', 'tx-1003', 'HIGH', 'Unassigned', 'UNDER_INVESTIGATION', 'Cardholder spending pattern velocity anomaly detected.', NOW() - INTERVAL '1 HOUR'),
('alt-2003', 'tx-1004', 'CRITICAL', 'Alex Mercer (Lead Analyst)', 'RESOLVED', 'Confirmed card theft. Card blocked permanently and refund initiated.', NOW() - INTERVAL '2 HOUR');

-- Fraud Rules
INSERT INTO fraud_rules (id, ruleName, conditionType, threshold, action, isEnabled, createdAt) VALUES
('r-3001', 'High Amount Threshold', 'MAX_AMOUNT', '3000.00', 'BLOCK', true, NOW()),
('r-3002', 'Velocity Spikes (24h)', 'VELOCITY_LIMIT', '10 transactions', 'FLAG', true, NOW()),
('r-3003', 'High Risk Country IP', 'HIGH_RISK_COUNTRY', 'Nigeria, Russia, North Korea', 'BLOCK', true, NOW()),
('r-3004', 'Unusual Night Time Spikes', 'NIGHT_TRANSACTION', '01:00 - 05:00', 'FLAG', true, NOW());

-- Audit Logs
INSERT INTO audit_logs (id, userId, userName, action, details, timestamp) VALUES
('log-4001', 'u-admin-01', 'Sarah Connor (Admin)', 'RULE_UPDATE', 'Updated rule "High Amount Threshold" limit to $3000.00', NOW() - INTERVAL '1 DAY'),
('log-4002', 'u-analyst-01', 'Alex Mercer (Lead Analyst)', 'ALERT_RESOLVE', 'Resolved alert alt-2003 as Confirmed Fraud', NOW() - INTERVAL '2 HOUR');
