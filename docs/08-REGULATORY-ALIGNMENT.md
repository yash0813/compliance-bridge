# Compliance-Bridge: Regulatory Alignment Document

## For SEBI, NSE, BSE & Broker Review

---

## Executive Summary

**Compliance-Bridge** is a regulatory infrastructure platform designed to enable SEBI-compliant algorithmic trading while maintaining complete separation between strategy intellectual property and broker execution responsibilities.

This document explains our architectural approach to regulators, demonstrating how Compliance-Bridge satisfies all regulatory requirements.

---

## 1. Regulatory Framework Addressed

| Regulation | Date | Key Requirements | How We Address |
|------------|------|------------------|----------------|
| SEBI Algo Trading Circular | Aug 2021 | Broker control, audit trail | Broker retains full execution control |
| SEBI API Trading Guidelines | 2022 | Rate limits, authorization | Built-in throttling, OAuth 2.0 |
| NSE Circular on Algo Trading | 2021 | Empanelment, monitoring | Compliance engine, audit logs |
| BSE Guidelines | 2021 | Order validation, limits | Exchange-specific rule modules |

---

## 2. Core Compliance Architecture

### 2.1 The Black-Box Problem & Our Solution

**The Problem:**
- Strategy developers want IP protection (code secrecy)
- Regulators require full auditability
- Brokers need execution control

**Our Solution:**
```
┌────────────────────────────────────────────────────────────────────────┐
│                     COMPLIANCE-BRIDGE APPROACH                         │
│                                                                        │
│   ┌────────────────┐      ┌────────────────┐      ┌────────────────┐  │
│   │   STRATEGY     │      │  COMPLIANCE    │      │    BROKER      │  │
│   │   (Black-Box)  │─────►│    BRIDGE      │─────►│   (Control)    │  │
│   │                │      │                │      │                │  │
│   │   Sends ONLY:  │      │   Validates:   │      │   Receives:    │  │
│   │   • Signals    │      │   • Every rule │      │   • Clean      │  │
│   │   • No code    │      │   • Full audit │      │     orders     │  │
│   │   • No logic   │      │   • All logged │      │   • Full       │  │
│   │                │      │                │      │     control    │  │
│   └────────────────┘      └────────────────┘      └────────────────┘  │
│                                                                        │
│   ✓ Strategy IP Protected    ✓ 100% Auditable    ✓ Broker Control    │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.2 What We Accept vs. What We Don't

| We Accept | We Reject |
|-----------|-----------|
| Trading signals (instrument, side, qty) | Strategy source code |
| Order parameters | Algorithm logic |
| Risk metadata | Decision-making code |
| Strategy identifier | Proprietary indicators |

**Key Principle: Signals contain WHAT to trade, never HOW or WHY (logic).**

---

## 3. Broker Control Guarantees

### 3.1 Broker Authority Points

| Control Point | Implementation | Broker Action |
|---------------|----------------|---------------|
| **Master Kill Switch** | Dashboard button | Halt all algo trading instantly |
| **User Suspension** | Admin panel | Suspend individual traders |
| **Strategy Disable** | Per-strategy toggle | Disable specific strategies |
| **Order Approval** | Optional queue | Review orders before placement |
| **Rate Limits** | Configurable | Set orders/minute per user |
| **Position Limits** | Real-time enforcement | Cap maximum exposure |

### 3.2 Kill Switch Implementation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           KILL SWITCH LEVELS                                │
└─────────────────────────────────────────────────────────────────────────────┘

Level 1: STRATEGY KILL
├── Scope: Single strategy
├── Action: Stop signals from one strategy
└── Recovery: Manual re-enable

Level 2: USER KILL
├── Scope: All strategies for one user
├── Action: Suspend user's algo trading
└── Recovery: Admin approval required

Level 3: MASTER KILL
├── Scope: ALL algo trading on platform
├── Action: Reject all incoming signals
├── Effect: Immediate (< 100ms)
└── Recovery: Requires explicit confirmation + reason

All kill actions are:
• Logged immutably
• Timestamped (NTP-synced)
• Attributed to admin who triggered
• Exportable for regulatory review
```

---

## 4. Audit Trail & Logging

### 4.1 What We Log (Everything)

| Event | Data Captured | Retention |
|-------|---------------|-----------|
| Signal received | Full signal payload, timestamp, source IP | 7 years |
| Compliance check | Rules applied, pass/fail, reasons | 7 years |
| Order created | Order details, user, strategy | 7 years |
| Broker response | Success/failure, broker order ID | 7 years |
| Trade executed | Fill details, timestamps | 7 years |
| User actions | Login, settings changes | 7 years |
| Admin actions | Rule changes, user management | 7 years |

### 4.2 Audit Log Properties

```
IMMUTABILITY
├── Logs stored in append-only database (ClickHouse)
├── No delete or update operations permitted
├── Cryptographic hashing of log chains
└── Tamper detection via hash verification

TIME SYNCHRONIZATION
├── NTP-synced to IST (Asia/Kolkata)
├── Microsecond precision
├── Drift monitoring and alerting
└── Timestamp in every log entry

EXPORT FORMATS
├── CSV (Excel compatible)
├── JSON (API integration)
├── PDF (Official reports)
└── Custom SEBI format (if specified)
```

### 4.3 Sample Audit Entry

```json
{
  "log_id": "audit_2024122310302345",
  "timestamp": "2024-12-23T10:30:23.456+05:30",
  "event_type": "order_placed",
  "actor": {
    "user_id": "usr_abc123",
    "email": "trader@example.com",
    "ip_address": "203.0.113.45"
  },
  "strategy": {
    "id": "str_xyz789",
    "name": "Momentum Alpha"
  },
  "signal": {
    "id": "sig_001",
    "received_at": "2024-12-23T10:30:23.100+05:30"
  },
  "compliance": {
    "result": "passed",
    "rules_checked": 12,
    "rules_passed": 12,
    "execution_time_ms": 45
  },
  "order": {
    "id": "ord_12345",
    "broker": "Zerodha",
    "broker_order_id": "220001234567890",
    "instrument": "RELIANCE",
    "exchange": "NSE",
    "side": "BUY",
    "quantity": 100,
    "price": 2450.50
  },
  "hash": "sha256:abc123..."
}
```

---

## 5. Compliance Rules Engine

### 5.1 Pre-built Regulatory Rules

| Rule ID | Rule Name | Category | Description |
|---------|-----------|----------|-------------|
| MKT_001 | Market Hours | Exchange | Reject orders outside 9:15-15:30 IST |
| MKT_002 | Lot Size | Exchange | Validate quantity is lot-size multiple |
| MKT_003 | Price Band | Exchange | Reject if price outside circuit limits |
| MKT_004 | Instrument Valid | Exchange | Verify instrument is tradeable |
| BRK_001 | Max Order Value | Broker | Cap single order value |
| BRK_002 | Segment Enabled | Broker | Check user has segment access |
| USR_001 | Rate Limit | User | Max orders per minute |
| USR_002 | Daily Loss Limit | User | Stop trading on loss threshold |
| USR_003 | Position Limit | User | Cap maximum position size |
| SYS_001 | Circuit Breaker | System | Halt on abnormal activity |

### 5.2 Rule Versioning

```
Every rule change is:
├── Version controlled (v1, v2, v3...)
├── Logged with who changed, when, why
├── Never deleted (archived only)
├── Rollback-capable
└── Auditable for regulatory review
```

---

## 6. Data Security & Privacy

### 6.1 Security Measures

| Layer | Protection |
|-------|------------|
| Transport | TLS 1.3 encryption |
| Authentication | OAuth 2.0 / JWT tokens |
| Authorization | Role-based access control |
| Secrets | HashiCorp Vault with HSM |
| Database | Encryption at rest (AES-256) |
| Logs | Immutable, append-only |
| Network | WAF, DDoS protection |

### 6.2 Data Handling

```
STRATEGY IP PROTECTION:
├── No strategy code ever touches our systems
├── Only standardized signals (no logic)
├── Cannot reverse-engineer strategy from signals
└── Strategy developers control their own code

USER DATA:
├── Minimal data collection
├── No sharing with third parties
├── GDPR-style data rights (even for India)
├── Right to export own data
└── Clear data retention policies
```

---

## 7. Regulatory Reporting

### 7.1 Available Reports

| Report | Frequency | Format | Content |
|--------|-----------|--------|---------|
| Daily Summary | Daily | PDF/CSV | Orders, fills, rejections |
| Monthly Compliance | Monthly | PDF | Compliance rate, violations |
| User Activity | On-demand | CSV | All user actions |
| Strategy Performance | On-demand | PDF | Per-strategy metrics |
| Audit Export | On-demand | JSON | Raw audit logs |

### 7.2 Regulator Access

```
OPTIONS FOR REGULATOR ACCESS:

Option A: Export on Request
├── Platform generates report
├── Encrypted file sent to regulator
└── Typical turnaround: < 24 hours

Option B: API Access (Read-Only)
├── Dedicated API credentials for regulator
├── Real-time access to audit logs
├── Query by date, user, strategy
└── Rate-limited to prevent abuse

Option C: Direct Database Access (Enterprise)
├── Separate read replica for regulator
├── Real-time data replication
├── Full query capability
└── For high-scrutiny accounts
```

---

## 8. Regulatory Contact

For regulatory queries, compliance audits, or clarifications:

**Compliance Team**
Email: compliance@compliance-bridge.io
Phone: [To be assigned]

**Registered Address**
[Company registration details to be added upon incorporation]

---

## 9. Certification Roadmap

| Certification | Target Date | Status |
|---------------|-------------|--------|
| SEBI Registration | Q2 2025 | Planned |
| NSE Empanelment | Q3 2025 | Planned |
| BSE Empanelment | Q3 2025 | Planned |
| SOC 2 Type II | Q4 2026 | Planned |
| ISO 27001 | Q1 2027 | Planned |

---

## 10. Attestation

We attest that:

1. **No strategy code is stored, processed, or transmitted** through Compliance-Bridge systems.
2. **Brokers retain full execution control** including kill switches at multiple levels.
3. **All trading signals are validated** against exchange, broker, and user rules before order placement.
4. **Complete, immutable audit logs** are maintained for 7 years.
5. **NTP-synchronized timestamps** are recorded for all events.
6. **Data is encrypted** in transit and at rest.
7. **The architecture is designed** to comply with SEBI algo trading guidelines.

---

*This document is intended for regulatory review and is subject to updates as regulations evolve.*
