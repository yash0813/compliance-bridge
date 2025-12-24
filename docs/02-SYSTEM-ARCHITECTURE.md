# Compliance-Bridge: System Architecture

## 1. Architecture Overview

### Design Principles
- **Separation of Concerns**: Strategy, Compliance, Execution are isolated layers
- **Defense in Depth**: Multiple security layers, no single point of failure
- **Auditability First**: Every action logged before execution
- **Immutability**: Audit logs cannot be modified or deleted
- **Horizontal Scalability**: Stateless services, shared-nothing architecture

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     STRATEGY LAYER (EXTERNAL)                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                       │
│  │Strategy │ │Strategy │ │Strategy │ │Strategy │   BLACK-BOX           │
│  │   A     │ │   B     │ │   C     │ │   N     │   (IP Protected)      │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘                       │
│       └───────────┴─────┬─────┴───────────┘                             │
│                         │ SIGNALS ONLY (No Code)                        │
└─────────────────────────┼───────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    COMPLIANCE-BRIDGE CORE                               │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              SIGNAL INGESTION GATEWAY                            │   │
│  │  API Gateway → Load Balancer → Rate Limiter → Schema Validator  │   │
│  └─────────────────────────────────┬───────────────────────────────┘   │
│                                    ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              COMPLIANCE ENGINE                                   │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │   │
│  │  │ Exchange    │ │ Broker      │ │ User Risk   │ │ Time      │ │   │
│  │  │ Rules       │ │ Constraints │ │ Limits      │ │ Windows   │ │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │   │
│  └─────────────────────────────────┬───────────────────────────────┘   │
│                                    ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              ORDER MANAGEMENT SYSTEM                             │   │
│  │  Order Creator → Order Queue (Kafka) → Risk Engine → Dispatcher │   │
│  └─────────────────────────────────┬───────────────────────────────┘   │
│                                    ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              AUDIT & LOGGING (Immutable)                         │   │
│  │  Event Capture → ClickHouse → Report Generator → Export Service │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────┬───────────────────────────────────┘
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    BROKER ABSTRACTION LAYER                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │  Zerodha    │ │  Angel One  │ │   Upstox    │ │ ICICI Direct│       │
│  │  Adapter    │ │  Adapter    │ │   Adapter   │ │   Adapter   │       │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘       │
└─────────┼───────────────┼───────────────┼───────────────┼───────────────┘
          └───────────────┴───────┬───────┴───────────────┘
                                  ▼
                         ┌─────────────────┐
                         │  NSE / BSE      │
                         └─────────────────┘
```

---

## 3. Component Breakdown

### 3.1 Signal Ingestion Layer
| Component | Responsibility | Technology |
|-----------|---------------|------------|
| API Gateway | Rate limiting, auth, validation | Kong / AWS API Gateway |
| Load Balancer | Traffic distribution, SSL | NGINX / HAProxy |
| WebSocket Gateway | Real-time updates | Socket.io |
| Schema Validator | Signal format validation | JSON Schema |

### 3.2 Compliance Engine
| Component | Responsibility | Technology |
|-----------|---------------|------------|
| Rule Execution Engine | Execute compliance rules | Custom / Drools |
| Exchange Rules Module | NSE/BSE validations | Configurable Rules |
| Broker Constraints | Broker-specific limits | Configurable Rules |
| User Risk Limits | Per-user risk controls | Dynamic Calculator |
| Hot-Deploy Manager | Zero-downtime updates | Feature Flags |

### 3.3 Order Management System
| Component | Responsibility | Technology |
|-----------|---------------|------------|
| Order Creator | Transform signals to orders | Factory Pattern |
| Order Queue | Reliable queuing | Apache Kafka |
| Risk Calculator | Real-time risk computation | Custom Engine |
| Order Dispatcher | Route to broker | Strategy Pattern |

### 3.4 Broker Abstraction Layer
| Component | Responsibility | Technology |
|-----------|---------------|------------|
| Broker Adapters | API integration | Adapter Pattern |
| Retry Handler | Handle failures | Exponential Backoff |
| Error Normalizer | Standardize errors | Error Mapping |

---

## 4. Technology Stack

| Layer | Technology | Justification |
|-------|------------|---------------|
| Frontend | React + TypeScript | Type safety, ecosystem |
| API Gateway | Kong | Rate limiting, auth |
| Backend API | Node.js + Express | Fast development |
| Compliance Engine | Go | Performance critical |
| Messaging | Apache Kafka | Durability, ordering |
| Database (Tx) | PostgreSQL | ACID, reliability |
| Database (Logs) | ClickHouse | High-performance analytics |
| Cache | Redis | Low latency |
| Secrets | HashiCorp Vault | HSM integration |
| Infrastructure | Kubernetes | Scalability |
| Monitoring | Prometheus + Grafana | Metrics, alerting |
