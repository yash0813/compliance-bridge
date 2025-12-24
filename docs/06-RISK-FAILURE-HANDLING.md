# Compliance-Bridge: Risk & Failure Handling

## 1. Risk Categories

### 1.1 Risk Matrix

| Risk Category | Likelihood | Impact | Priority | Mitigation Strategy |
|--------------|------------|--------|----------|---------------------|
| Strategy IP Leak | Low | Critical | P1 | Zero-code architecture |
| Broker API Failure | Medium | High | P1 | Multi-broker failover |
| Compliance Rule Failure | Low | Critical | P1 | Rule versioning, rollback |
| Order Execution Failure | Medium | High | P1 | Retry, manual intervention |
| Data Loss | Low | Critical | P1 | Multi-region backup |
| DDoS Attack | Medium | Medium | P2 | Rate limiting, WAF |
| Regulatory Non-compliance | Low | Critical | P1 | Immutable audit logs |

---

## 2. Failure Scenarios & Handling

### 2.1 Signal Ingestion Failures

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SIGNAL INGESTION FAILURE HANDLING                    │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────┐
                              │ Signal Input │
                              └──────┬───────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │ API Gateway  │
                              └──────┬───────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
        [Rate Limited]          [Valid]              [Invalid]
              │                      │                      │
              ▼                      ▼                      ▼
     ┌────────────────┐     ┌──────────────┐     ┌────────────────┐
     │ Return 429     │     │ Process      │     │ Return 400     │
     │ Retry-After: X │     │ Signal       │     │ Validation     │
     │                │     │              │     │ Error Details  │
     └────────────────┘     └──────────────┘     └────────────────┘
```

**Handling Rules:**
- Rate limit: Return `429 Too Many Requests` with `Retry-After` header
- Invalid schema: Return `400 Bad Request` with detailed validation errors
- Server error: Return `503 Service Unavailable`, retry with exponential backoff
- All failures logged with full request context

### 2.2 Compliance Engine Failures

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     COMPLIANCE ENGINE FAILURE HANDLING                      │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────┐
                              │   Signal     │
                              └──────┬───────┘
                                     │
                                     ▼
                       ┌─────────────────────────┐
                       │  Compliance Engine      │
                       │  ┌─────────────────────┐│
                       │  │ Rule 1: ✓ Pass      ││
                       │  │ Rule 2: ✓ Pass      ││
                       │  │ Rule 3: ✗ TIMEOUT   ││◄───┐
                       │  └─────────────────────┘│    │
                       └──────────────┬──────────┘    │
                                      │               │
                    ┌─────────────────┴───────────────┴─────────┐
                    │                                           │
               [Rule Timeout]                            [Rule Error]
                    │                                           │
                    ▼                                           ▼
           ┌────────────────┐                        ┌────────────────┐
           │ FAIL-SAFE MODE │                        │ LOG & ALERT    │
           │ ─────────────  │                        │ ──────────────││
           │ • Mark signal  │                        │ • Detailed log │
           │   as 'pending' │                        │ • PagerDuty    │
           │ • Retry 3x     │                        │ • Fallback to  │
           │ • Manual if    │                        │   default rule │
           │   still fails  │                        │                │
           └────────────────┘                        └────────────────┘
```

**Handling Rules:**
- Rule timeout (>500ms): Retry with fallback to cached rule result
- Rule execution error: Log, alert, apply fail-safe (default: reject)
- Complete engine failure: Queue signals, switch to backup engine instance
- Never silently fail - all failures must be audited

### 2.3 Broker API Failures

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        BROKER API FAILURE HANDLING                          │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────┐
                              │ Order Ready  │
                              └──────┬───────┘
                                     │
                                     ▼
                       ┌─────────────────────────┐
                       │  Broker Adapter         │
                       │  (Primary: Zerodha)     │
                       └──────────────┬──────────┘
                                      │
           ┌───────────────┬──────────┼──────────┬───────────────┐
           │               │          │          │               │
      [Success]      [Timeout]   [5xx Error] [Auth Error]  [Rate Limit]
           │               │          │          │               │
           ▼               ▼          ▼          ▼               ▼
     ┌──────────┐   ┌───────────┐ ┌───────────┐ ┌──────────┐ ┌─────────┐
     │ Complete │   │ Retry 3x  │ │ Retry 3x  │ │ Refresh  │ │ Queue & │
     │ Order    │   │ w/ backoff│ │ w/ backoff│ │ Token    │ │ Delay   │
     └──────────┘   └─────┬─────┘ └─────┬─────┘ └────┬─────┘ └─────────┘
                          │             │            │
                          └──────┬──────┘            │
                                 │                   │
                          [Still Failing]      [Refresh OK]
                                 │                   │
                                 ▼                   ▼
                       ┌─────────────────┐   ┌──────────────┐
                       │ FAILOVER        │   │ Retry Order  │
                       │ ────────────────│   │              │
                       │ • Switch broker │   └──────────────┘
                       │ • Mark primary  │
                       │   unhealthy     │
                       │ • Alert ops     │
                       └─────────────────┘
```

**Retry Configuration:**
```yaml
broker_retry:
  max_attempts: 3
  initial_delay_ms: 100
  max_delay_ms: 2000
  backoff_multiplier: 2
  jitter: true
  
failover:
  primary_unhealthy_threshold: 3  # failures before failover
  health_check_interval_s: 30
  recovery_probe_interval_s: 60
```

### 2.4 Order Execution Failures

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ORDER EXECUTION FAILURE MATRIX                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┬─────────────────────────┬────────────────────────────┐
│ Failure Type         │ System Response         │ User Notification          │
├──────────────────────┼─────────────────────────┼────────────────────────────┤
│ Insufficient Funds   │ Reject immediately      │ "Insufficient margin"      │
│ Invalid Instrument   │ Reject immediately      │ "Instrument not tradeable" │
│ Market Closed        │ Queue for next session  │ "Queued for market open"   │
│ Circuit Breaker      │ Queue for reset         │ "Halted - circuit breaker" │
│ Price Out of Range   │ Reject                  │ "Price outside limits"     │
│ Lot Size Invalid     │ Reject                  │ "Invalid lot size"         │
│ Broker Timeout       │ Retry → Failover        │ "Processing..."            │
│ Exchange Reject      │ Log & notify            │ "Exchange rejected: {msg}" │
│ Partial Fill         │ Update position         │ "Partially filled: X/Y"    │
└──────────────────────┴─────────────────────────┴────────────────────────────┘
```

---

## 3. System Resilience Architecture

### 3.1 Circuit Breaker Pattern

```go
type CircuitBreaker struct {
    State           string  // closed, open, half-open
    FailureCount    int
    SuccessCount    int
    LastFailure     time.Time
    Threshold       int     // failures before opening
    ResetTimeout    time.Duration
}

// State Transitions
// closed  → open       : failures >= threshold
// open    → half-open  : after reset_timeout
// half-open → closed   : success
// half-open → open     : failure
```

### 3.2 Health Check Endpoints

```http
GET /health/live
Response: {"status": "ok", "timestamp": "..."}

GET /health/ready
Response: {
  "status": "ready",
  "components": {
    "database": {"status": "up", "latency_ms": 5},
    "kafka": {"status": "up", "lag": 0},
    "redis": {"status": "up", "latency_ms": 1},
    "brokers": {
      "zerodha": {"status": "up", "last_success": "..."},
      "angel": {"status": "degraded", "error": "high_latency"}
    }
  }
}
```

---

## 4. Disaster Recovery

### 4.1 RTO/RPO Targets

| Component | RPO (Data Loss) | RTO (Downtime) | Strategy |
|-----------|-----------------|----------------|----------|
| Database (PostgreSQL) | 0 (sync replica) | 15 minutes | Multi-region active-passive |
| Audit Logs (ClickHouse) | 1 minute | 30 minutes | Async replication |
| Cache (Redis) | 5 minutes | 5 minutes | Redis Cluster |
| Message Queue (Kafka) | 0 | 10 minutes | Multi-broker cluster |

### 4.2 Failover Procedures

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          REGIONAL FAILOVER                                  │
└─────────────────────────────────────────────────────────────────────────────┘

NORMAL STATE:
┌─────────────────────┐          ┌─────────────────────┐
│  MUMBAI (Primary)   │ ──sync──►│ SINGAPORE (Standby) │
│  ● Active           │          │ ○ Hot Standby       │
│  All traffic here   │          │ Read replicas       │
└─────────────────────┘          └─────────────────────┘

FAILOVER STATE (Mumbai down):
┌─────────────────────┐          ┌─────────────────────┐
│  MUMBAI (Failed)    │          │ SINGAPORE (Active)  │
│  ✗ Unreachable      │          │ ● Promoted          │
│                     │          │ All traffic here    │
└─────────────────────┘          └─────────────────────┘

Automatic failover triggers:
1. Health checks fail for 60 seconds
2. DNS failover to Singapore endpoint
3. Promote read replica to primary
4. Alert operations team
```

---

## 5. Monitoring & Alerting

### 5.1 Key Metrics

```yaml
critical_metrics:
  - name: signal_processing_latency_p99
    threshold: 500ms
    action: page_oncall
    
  - name: compliance_check_failure_rate
    threshold: 1%
    action: page_oncall
    
  - name: broker_api_error_rate
    threshold: 5%
    action: alert_slack
    
  - name: order_rejection_rate
    threshold: 10%
    action: alert_slack
    
  - name: audit_log_lag_seconds
    threshold: 60
    action: page_oncall

warning_metrics:
  - name: kafka_consumer_lag
    threshold: 10000
    action: alert_slack
    
  - name: database_connection_pool_usage
    threshold: 80%
    action: alert_slack
```

### 5.2 Alert Escalation

```
Level 1 (Slack):
├── Warning conditions
├── Non-critical errors
└── Performance degradation

Level 2 (PagerDuty - Primary Oncall):
├── Critical failures
├── Compliance engine down
└── Data integrity issues

Level 3 (PagerDuty - Secondary + Manager):
├── Regional outage
├── Security incident
└── Regulatory compliance risk
```

---

## 6. Security Incident Response

### 6.1 Incident Classification

| Severity | Description | Response Time | Example |
|----------|-------------|---------------|---------|
| P1 Critical | Data breach, service down | 15 minutes | API key compromised |
| P2 High | Security vulnerability | 1 hour | Auth bypass discovered |
| P3 Medium | Suspicious activity | 4 hours | Unusual API patterns |
| P4 Low | Minor security issue | 24 hours | Weak password detected |

### 6.2 Incident Response Steps

```
1. DETECT
   └── Automated monitoring alerts
   └── User report

2. CONTAIN
   └── Isolate affected systems
   └── Revoke compromised credentials
   └── Enable emergency rate limits

3. INVESTIGATE
   └── Collect audit logs
   └── Identify attack vector
   └── Assess data exposure

4. REMEDIATE
   └── Patch vulnerability
   └── Rotate all secrets
   └── Update firewall rules

5. RECOVER
   └── Restore services
   └── Verify system integrity
   └── Monitor for recurrence

6. REVIEW
   └── Post-incident report
   └── Update runbooks
   └── Implement preventive measures
```
