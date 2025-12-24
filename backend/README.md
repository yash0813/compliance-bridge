# Compliance-Bridge Backend API

Express.js + MongoDB backend for the SEBI-Compliant Trading Platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your MongoDB URI

# Start MongoDB (if local)
mongod

# Seed the database with demo data
node seed.js

# Start the server
npm run dev
```

### API Base URL
```
http://localhost:5000/api
```

---

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new user |
| POST | `/api/auth/login` | Login & get token |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout |

### Users (Admin/Broker)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get user by ID |
| PUT | `/api/users/:id/block` | Block user |
| PUT | `/api/users/:id/unblock` | Unblock user |
| PUT | `/api/users/:id/pause` | Pause trading |
| PUT | `/api/users/:id/resume` | Resume trading |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List orders |
| POST | `/api/orders` | Place order |
| GET | `/api/orders/:id` | Get order |
| DELETE | `/api/orders/:id` | Cancel order |
| GET | `/api/orders/stats/summary` | Get stats |

### Strategies
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/strategies` | List strategies |
| POST | `/api/strategies` | Create strategy |
| GET | `/api/strategies/:id` | Get strategy |
| PUT | `/api/strategies/:id` | Update strategy |
| PUT | `/api/strategies/:id/certify` | Certify (broker) |
| PUT | `/api/strategies/:id/reject` | Reject (broker) |

### Positions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/positions` | List positions |
| GET | `/api/positions/summary` | Get summary |
| POST | `/api/positions` | Create position |
| PUT | `/api/positions/:id/close` | Close position |

### Audit Logs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/audit` | List audit logs |
| GET | `/api/audit/timeline` | Recent timeline |
| GET | `/api/audit/stats` | Get statistics |
| GET | `/api/audit/:id` | Get single log |
| GET | `/api/audit/verify/:hash` | Verify integrity |

---

## 🔐 Authentication

Include JWT token in Authorization header:
```
Authorization: Bearer <your-token>
```

---

## 📦 Database Models

- **User** - Traders, brokers, admins, regulators
- **Order** - Trading orders with compliance tracking
- **Strategy** - Trading strategies with certification
- **Position** - Open positions with P&L
- **AuditLog** - Immutable audit trail with hash chain

---

## 🧪 Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| trader@demo.com | demo123 | Trader |
| broker@demo.com | demo123 | Broker |
| admin@demo.com | demo123 | Admin |
| regulator@demo.com | demo123 | Regulator |

---

## 🛡️ Security Features

- Password hashing (bcrypt)
- JWT authentication
- Role-based access control
- Immutable audit logs with hash chain
- CORS protection
- Input validation

---

## 📝 Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/compliance-bridge
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
```
