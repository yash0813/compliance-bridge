# 🛡️ Compliance-Bridge

**SEBI-Compliant Algorithmic Trading Platform**

A comprehensive infrastructure that connects algo traders with brokers while ensuring regulatory compliance, IP protection, and complete audit trails.

### 🌐 [Live Demo →](https://yash0813.github.io/compliance-bridge)

![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)
![Electron](https://img.shields.io/badge/Electron-39.2-47848F?logo=electron)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/yash0813/compliance-bridge)

---

## 🚀 Features

### 📊 Multi-Role Dashboards
- **Trader Dashboard** - P&L tracking, positions, strategy performance
- **Broker Dashboard** - Compliance overview, order flow, risk monitoring
- **Admin Dashboard** - System-wide controls and user management
- **Regulator View** - Read-only audit access for compliance officers

### 🔐 SEBI Compliance (March 2026 Mandates)

| Mandate | Feature | Status |
|---------|---------|--------|
| **Static IP Wall** | Whitelisted IP management & verification | ✅ Implemented |
| **Broker as Principal** | Vendor empanelment tracking | ✅ Implemented |
| **Logic Scrutiny** | White Box vs Black Box classification | ✅ Implemented |

### 🎛️ Broker Control Center
- **Master Kill Switch** - Instantly halt all trading
- **Pause All Algorithms** - Temporarily suspend all strategies
- **Per-User Controls** - Block/pause individual traders
- **API Health Monitor** - Real-time latency & error tracking

### 📜 Immutable Audit Timeline
- Complete signal-to-execution trail
- Millisecond-precision timestamps (IST)
- Compliance rules visibility per order
- Cryptographic audit hashes
- Export functionality for regulators

### 🏆 Strategy Certification
- **Certified** - Fully reviewed and approved
- **Under Review** - Awaiting compliance verification
- **Unverified** - Not yet submitted
- **Rejected** - Failed compliance requirements

### 📈 Strategy Versioning
- Complete version history (v1.0 → v2.1.3)
- Trade counts per version
- Deployment timestamps
- Change logs

### 🏗️ Core Architecture (JM Financial Stack)

| Component | Description |
|-----------|-------------|
| **📡 Signal Ingestion Gateway** | Real-time monitoring of incoming trading signals with throughput charts |
| **📦 Order Queue (Kafka)** | Message queue visualization with partitions and depth monitoring |
| **🛡️ Risk Engine** | Margin, exposure, drawdown, and VaR metrics with alerts |
| **🔌 Broker Adapters** | Zerodha, Angel One, Upstox, ICICI Direct connection management |

---

## 🖥️ Screenshots

### Login Page
Premium authentication with role-based demo accounts

### Broker Control Center
Master controls, API health, user access management

### Security & IP Compliance
Static IP whitelisting, vendor status, strategy classification

---

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript + Vite 5
- **Backend:** Node.js + Express
- **Database:** MongoDB (Local + In-Memory Fallback)
- **Deployment:** Docker (Frontend + Backend + DB)
- **Styling:** Custom CSS with CSS Variables (Enterprise Dark Theme)
- **Desktop App:** Electron 39

---

## 📦 Installation & Deployment

### Option 1: Docker (Recommended)
Run the entire stack (Frontend + Backend + MongoDB) with one command:

```bash
docker-compose up --build
```
Access the app at [http://localhost:5001](http://localhost:5001).

### Option 2: Manual Setup

1. **Frontend:**
   ```bash
   npm install
   npm run dev
   ```

2. **Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

---

## 🔑 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Trader | trader@demo.com | demo123 |
| Broker | broker@demo.com | demo123 |
| Admin | admin@demo.com | demo123 |
| Regulator | regulator@demo.com | demo123 |

All data is reset on server restart (if using In-Memory DB).

---

## 🖥️ Build Desktop App (Windows)

```bash
# Build for Windows
npm run electron:build

# Output in /release folder:
# - Compliance-Bridge Setup 1.0.0.exe (Installer)
# - Compliance-Bridge 1.0.0.exe (Portable)
```

---

## 📁 Project Structure

```
compliance-bridge/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Layout.tsx
│   ├── pages/           # Route pages
│   │   ├── TraderDashboard.tsx
│   │   ├── BrokerDashboard.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── AuditTimeline.tsx
│   │   ├── BrokerHealth.tsx
│   │   ├── SecurityCompliance.tsx
│   │   ├── StrategyCompliance.tsx
│   │   └── ...
│   ├── styles/          # Global styles
│   └── App.tsx          # Main app with routing
├── docs/                # Documentation
│   ├── 01-EXECUTIVE-SUMMARY.md
│   ├── 02-SYSTEM-ARCHITECTURE.md
│   ├── 03-DATABASE-SCHEMA.md
│   └── ...
├── electron/            # Desktop app config
└── package.json
```

---

## 📋 SEBI Compliance Features

### 1. Static IP Whitelisting
- View all registered Static IPs
- Current IP verification status
- Add new IPs for SEBI verification
- IP expiry tracking
- Cost display: ₹5,000-15,000/month per IP

### 2. Vendor Empanelment
- Empanelment ID display
- Broker registration status
- Validity period tracking
- Compliance checklist

### 3. Strategy Classification
- **White Box:** Logic fully disclosed to broker
- **Black Box:** Proprietary, requires special SEBI approval
- Disclosure level tracking
- Audit history

---

## 🔒 Security Features

- Role-based access control (RBAC)
- Read-only regulator mode
- Immutable audit logs
- Compliance rule enforcement
- Emergency kill switch
- Per-user trading controls

---

## 📅 Roadmap

- [x] Multi-role dashboards
- [x] Audit timeline with compliance rules
- [x] Broker control center
- [x] Strategy certification & versioning
- [x] Security & SEBI compliance module
- [x] Windows desktop application
- [x] Backend API integration
- [x] Real broker API connections (Simulated via Adapters)
- [x] Production deployment (Docker)
- [ ] WebSocket real-time data
- [ ] Document Control & Policy Workflow

---

## 📄 License

MIT License - See LICENSE file for details.

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

---

## 📞 Contact

For enterprise inquiries and demos, contact us at: **yash.c0813@gmail.com**

---

*SEBI Compliance Deadline: March 31, 2026*
