# Compliance-Bridge: API Contracts

## 1. API Versioning & Base URL

```
Production:  https://api.compliance-bridge.io/v1
Staging:     https://staging-api.compliance-bridge.io/v1
```

## 2. Authentication

All API requests require authentication via JWT Bearer token or API Key.

```http
Authorization: Bearer <jwt_token>
# OR
X-API-Key: cb_live_xxxxxxxxxxxx
```

---

## 3. Signal API

### 3.1 Submit Signal

```http
POST /signals
Content-Type: application/json
X-API-Key: cb_live_xxxxxxxxxxxx
X-Request-ID: uuid
```

**Request Body:**
```json
{
  "external_id": "strategy_signal_001",
  "instrument": {
    "symbol": "RELIANCE",
    "exchange": "NSE",
    "token": "256265"
  },
  "side": "BUY",
  "quantity": 100,
  "order_type": "LIMIT",
  "price": 2450.50,
  "trigger_price": null,
  "product_type": "CNC",
  "validity": "DAY",
  "signal_timestamp": "2024-12-23T10:30:00.000Z",
  "metadata": {
    "strategy_version": "1.2.3",
    "confidence": 0.85
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "signal_id": "sig_abc123xyz",
    "status": "received",
    "received_at": "2024-12-23T10:30:00.123Z",
    "compliance_status": "pending"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid signal format",
    "details": [
      {"field": "quantity", "message": "must be positive integer"}
    ]
  }
}
```

### 3.2 Get Signal Status

```http
GET /signals/{signal_id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "signal_id": "sig_abc123xyz",
    "external_id": "strategy_signal_001",
    "status": "completed",
    "compliance_result": {
      "status": "passed",
      "rules_checked": 12,
      "rules_passed": 12
    },
    "order": {
      "order_id": "ord_xyz789",
      "broker_order_id": "220001234567890",
      "status": "filled",
      "filled_quantity": 100,
      "average_price": 2450.25
    },
    "timeline": [
      {"event": "received", "timestamp": "2024-12-23T10:30:00.123Z"},
      {"event": "compliance_passed", "timestamp": "2024-12-23T10:30:00.156Z"},
      {"event": "order_placed", "timestamp": "2024-12-23T10:30:00.189Z"},
      {"event": "order_filled", "timestamp": "2024-12-23T10:30:01.234Z"}
    ]
  }
}
```

### 3.3 List Signals

```http
GET /signals?strategy_id={id}&status={status}&from={timestamp}&to={timestamp}&limit=50&offset=0
```

---

## 4. Strategy API

### 4.1 Create Strategy

```http
POST /strategies
Authorization: Bearer <jwt_token>
```

**Request:**
```json
{
  "name": "Momentum Strategy Alpha",
  "description": "Trend-following strategy for large-cap stocks",
  "allowed_instruments": ["RELIANCE", "TCS", "INFY"],
  "allowed_segments": ["NSE_EQ"],
  "risk_limits": {
    "max_order_value": 500000,
    "max_position_size": 1000,
    "max_daily_orders": 100
  },
  "broker_accounts": [
    {"broker_account_id": "ba_123", "allocation_pct": 100}
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "strategy_id": "str_abc123",
    "name": "Momentum Strategy Alpha",
    "status": "active",
    "api_key": {
      "key": "cb_live_xxxxxxxxxxxxxx",
      "prefix": "cb_live_"
    },
    "created_at": "2024-12-23T10:00:00Z"
  }
}
```

### 4.2 Update Strategy

```http
PATCH /strategies/{strategy_id}
```

### 4.3 Toggle Strategy Status

```http
POST /strategies/{strategy_id}/toggle
```

**Request:**
```json
{
  "status": "paused"  // "active" | "paused"
}
```

---

## 5. Order API

### 5.1 Get Order

```http
GET /orders/{order_id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order_id": "ord_xyz789",
    "signal_id": "sig_abc123xyz",
    "broker_order_id": "220001234567890",
    "exchange_order_id": "1234567890",
    "instrument": {
      "symbol": "RELIANCE",
      "exchange": "NSE"
    },
    "side": "BUY",
    "quantity": 100,
    "filled_quantity": 100,
    "pending_quantity": 0,
    "order_type": "LIMIT",
    "price": 2450.50,
    "average_price": 2450.25,
    "status": "filled",
    "placed_at": "2024-12-23T10:30:00.189Z",
    "filled_at": "2024-12-23T10:30:01.234Z"
  }
}
```

### 5.2 List Orders

```http
GET /orders?strategy_id={id}&status={status}&from={date}&to={date}
```

### 5.3 Cancel Order

```http
DELETE /orders/{order_id}
```

---

## 6. Compliance API

### 6.1 Get Compliance Rules

```http
GET /compliance/rules?category={category}&is_active=true
```

### 6.2 Create Compliance Rule (Admin Only)

```http
POST /compliance/rules
Authorization: Bearer <admin_token>
```

**Request:**
```json
{
  "name": "Max Order Value Check",
  "code": "MAX_ORD_VAL_001",
  "description": "Limit maximum order value",
  "category": "broker",
  "condition": {
    "type": "max_value",
    "field": "order_value",
    "limit": 1000000
  },
  "action": "reject",
  "priority": 20,
  "applies_to": {
    "exchanges": ["NSE", "BSE"],
    "brokers": ["ALL"]
  }
}
```

### 6.3 Get Compliance Result

```http
GET /compliance/results/{signal_id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "signal_id": "sig_abc123xyz",
    "overall_status": "passed",
    "rules_checked": 12,
    "rules_passed": 12,
    "rules_failed": 0,
    "execution_time_ms": 45,
    "checks": [
      {"rule": "Market Hours", "status": "passed", "message": null},
      {"rule": "Max Order Value", "status": "passed", "message": null},
      {"rule": "Rate Limit", "status": "passed", "message": null}
    ]
  }
}
```

---

## 7. Broker API

### 7.1 Connect Broker Account

```http
POST /brokers/{broker_code}/connect
```

**Request:**
```json
{
  "client_id": "AB1234",
  "api_key": "xxxxxxxxxxxx",
  "api_secret": "xxxxxxxxxxxx"
}
```

### 7.2 Get Broker Connection Status

```http
GET /brokers/accounts/{account_id}/status
```

### 7.3 Sync Positions

```http
POST /brokers/accounts/{account_id}/sync
```

---

## 8. Audit API

### 8.1 Get Audit Logs

```http
GET /audit/logs?resource_type=signal&resource_id={id}&from={date}&to={date}
```

### 8.2 Export Audit Report

```http
POST /audit/export
```

**Request:**
```json
{
  "format": "csv",
  "date_range": {
    "from": "2024-12-01T00:00:00Z",
    "to": "2024-12-31T23:59:59Z"
  },
  "filters": {
    "strategy_ids": ["str_abc123"],
    "event_types": ["signal_received", "order_placed", "order_filled"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "export_id": "exp_123456",
    "status": "processing",
    "download_url": null,
    "expires_at": null
  }
}
```

---

## 9. WebSocket API

### 9.1 Connection

```javascript
const ws = new WebSocket('wss://ws.compliance-bridge.io/v1');
ws.send(JSON.stringify({
  type: 'auth',
  token: 'jwt_token_here'
}));
```

### 9.2 Subscribe to Channels

```json
{
  "type": "subscribe",
  "channels": ["orders", "signals", "positions"]
}
```

### 9.3 Event Types

```json
// Signal received
{"type": "signal.received", "data": {"signal_id": "sig_123", "status": "received"}}

// Compliance check completed
{"type": "signal.compliance", "data": {"signal_id": "sig_123", "status": "passed"}}

// Order placed
{"type": "order.placed", "data": {"order_id": "ord_456", "broker_order_id": "123456"}}

// Order filled
{"type": "order.filled", "data": {"order_id": "ord_456", "filled_qty": 100, "avg_price": 2450.25}}

// Position update
{"type": "position.update", "data": {"symbol": "RELIANCE", "qty": 100, "pnl": 250.00}}
```

---

## 10. Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Invalid or expired token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `COMPLIANCE_REJECTED` | 422 | Signal failed compliance |
| `BROKER_ERROR` | 502 | Broker API error |
| `INTERNAL_ERROR` | 500 | Internal server error |

---

## 11. Rate Limits

| Endpoint | Rate Limit |
|----------|------------|
| `POST /signals` | 60/minute |
| `GET /signals/*` | 120/minute |
| `GET /orders/*` | 120/minute |
| WebSocket | 5 connections/user |
