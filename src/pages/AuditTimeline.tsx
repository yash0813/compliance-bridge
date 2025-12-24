import { useState } from 'react'
import {
    Clock, CheckCircle, AlertTriangle, XCircle,
    Download, Search,
    Zap, Send, Server, FileCheck, Shield, Activity,
    RefreshCw, Copy
} from 'lucide-react'
import './AuditTimeline.css'

interface AuditEvent {
    id: string
    signalId: string
    strategyName: string
    strategyVersion: string
    symbol: string
    side: 'BUY' | 'SELL'
    qty: number
    timestamp: string
    stages: {
        stage: string
        status: 'success' | 'warning' | 'error' | 'pending'
        timestamp: string
        duration?: string
        details?: string
    }[]
    complianceChecks: {
        rule: string
        status: 'passed' | 'failed' | 'warning'
        value?: string
        limit?: string
    }[]
    finalStatus: 'filled' | 'rejected' | 'pending' | 'cancelled'
    brokerId: string
    userId: string
}

const auditEvents: AuditEvent[] = [
    {
        id: 'SIG-2024-001245',
        signalId: 'SIG-2024-001245',
        strategyName: 'Momentum Alpha',
        strategyVersion: 'v2.1.3',
        symbol: 'RELIANCE',
        side: 'BUY',
        qty: 100,
        timestamp: '2024-12-24T10:32:15.234+05:30',
        stages: [
            { stage: 'Signal Received', status: 'success', timestamp: '10:32:15.234 IST', duration: '0ms' },
            { stage: 'Compliance Validation', status: 'success', timestamp: '10:32:15.238 IST', duration: '4ms', details: '5 rules checked' },
            { stage: 'Sent to Broker', status: 'success', timestamp: '10:32:15.245 IST', duration: '7ms' },
            { stage: 'Broker Accepted', status: 'success', timestamp: '10:32:15.312 IST', duration: '67ms' },
            { stage: 'Order Filled', status: 'success', timestamp: '10:32:15.456 IST', duration: '144ms' },
        ],
        complianceChecks: [
            { rule: 'Max Order Qty Check', status: 'passed', value: '100', limit: '500' },
            { rule: 'Trading Window Check', status: 'passed', value: '10:32 IST', limit: '09:15-15:30' },
            { rule: 'Position Limit Check', status: 'passed', value: '₹2.45L', limit: '₹50L' },
            { rule: 'Order Frequency Check', status: 'passed', value: '12/min', limit: '100/min' },
            { rule: 'Symbol Whitelist Check', status: 'passed', value: 'RELIANCE', limit: 'NSE F&O' },
        ],
        finalStatus: 'filled',
        brokerId: 'BROKER_001',
        userId: 'USR_12345'
    },
    {
        id: 'SIG-2024-001244',
        signalId: 'SIG-2024-001244',
        strategyName: 'Mean Reversion',
        strategyVersion: 'v1.8.0',
        symbol: 'TCS',
        side: 'SELL',
        qty: 250,
        timestamp: '2024-12-24T10:31:55.123+05:30',
        stages: [
            { stage: 'Signal Received', status: 'success', timestamp: '10:31:55.123 IST', duration: '0ms' },
            { stage: 'Compliance Validation', status: 'error', timestamp: '10:31:55.128 IST', duration: '5ms', details: 'Rule violation detected' },
            { stage: 'Signal Rejected', status: 'error', timestamp: '10:31:55.128 IST', duration: '0ms' },
        ],
        complianceChecks: [
            { rule: 'Max Order Qty Check', status: 'failed', value: '250', limit: '200' },
            { rule: 'Trading Window Check', status: 'passed', value: '10:31 IST', limit: '09:15-15:30' },
            { rule: 'Position Limit Check', status: 'passed', value: '₹9.6L', limit: '₹50L' },
            { rule: 'Order Frequency Check', status: 'passed', value: '8/min', limit: '100/min' },
            { rule: 'Symbol Whitelist Check', status: 'passed', value: 'TCS', limit: 'NSE F&O' },
        ],
        finalStatus: 'rejected',
        brokerId: 'BROKER_001',
        userId: 'USR_67890'
    },
    {
        id: 'SIG-2024-001243',
        signalId: 'SIG-2024-001243',
        strategyName: 'Breakout Pro',
        strategyVersion: 'v3.0.1',
        symbol: 'INFY',
        side: 'BUY',
        qty: 75,
        timestamp: '2024-12-24T10:31:40.567+05:30',
        stages: [
            { stage: 'Signal Received', status: 'success', timestamp: '10:31:40.567 IST', duration: '0ms' },
            { stage: 'Compliance Validation', status: 'warning', timestamp: '10:31:40.573 IST', duration: '6ms', details: 'Warning: Near limit' },
            { stage: 'Sent to Broker', status: 'success', timestamp: '10:31:40.580 IST', duration: '7ms' },
            { stage: 'Broker Accepted', status: 'success', timestamp: '10:31:40.645 IST', duration: '65ms' },
            { stage: 'Order Filled', status: 'success', timestamp: '10:31:40.823 IST', duration: '178ms' },
        ],
        complianceChecks: [
            { rule: 'Max Order Qty Check', status: 'passed', value: '75', limit: '500' },
            { rule: 'Trading Window Check', status: 'passed', value: '10:31 IST', limit: '09:15-15:30' },
            { rule: 'Position Limit Check', status: 'warning', value: '₹42L', limit: '₹50L' },
            { rule: 'Order Frequency Check', status: 'passed', value: '15/min', limit: '100/min' },
            { rule: 'Symbol Whitelist Check', status: 'passed', value: 'INFY', limit: 'NSE F&O' },
        ],
        finalStatus: 'filled',
        brokerId: 'BROKER_001',
        userId: 'USR_11111'
    },
]

export default function AuditTimeline() {
    const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(auditEvents[0])
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    const filteredEvents = auditEvents.filter(event => {
        const matchesSearch = event.signalId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.strategyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.symbol.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'all' || event.finalStatus === statusFilter
        return matchesSearch && matchesStatus
    })

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success':
            case 'passed':
            case 'filled':
                return <CheckCircle size={16} />
            case 'warning':
                return <AlertTriangle size={16} />
            case 'error':
            case 'failed':
            case 'rejected':
                return <XCircle size={16} />
            default:
                return <Clock size={16} />
        }
    }

    const getStageIcon = (stage: string) => {
        if (stage.includes('Received')) return <Zap size={18} />
        if (stage.includes('Validation')) return <Shield size={18} />
        if (stage.includes('Sent')) return <Send size={18} />
        if (stage.includes('Accepted')) return <Server size={18} />
        if (stage.includes('Filled')) return <FileCheck size={18} />
        if (stage.includes('Rejected')) return <XCircle size={18} />
        return <Activity size={18} />
    }

    return (
        <div className="audit-timeline-page">
            {/* Page Header */}
            <div className="page-header">
                <div className="page-header-content">
                    <div className="page-title-group">
                        <h1>Immutable Audit Timeline</h1>
                        <p>Complete signal-to-execution audit trail with compliance verification</p>
                    </div>
                    <div className="page-header-meta">
                        <div className="timezone-badge">
                            <Clock size={14} />
                            <span>All times in IST (UTC+5:30)</span>
                        </div>
                    </div>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-secondary">
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                    <button className="btn btn-secondary">
                        <Download size={16} />
                        Export Logs
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="audit-filters">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by Signal ID, Strategy, or Symbol..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <select
                        className="form-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="filled">Filled</option>
                        <option value="rejected">Rejected</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>
            </div>

            <div className="audit-layout">
                {/* Events List */}
                <div className="events-list">
                    {filteredEvents.map(event => (
                        <div
                            key={event.id}
                            className={`event-card ${selectedEvent?.id === event.id ? 'selected' : ''} ${event.finalStatus}`}
                            onClick={() => setSelectedEvent(event)}
                        >
                            <div className="event-header">
                                <div className="event-id">
                                    <span className="signal-id">{event.signalId}</span>
                                    <span className="strategy-version">{event.strategyVersion}</span>
                                </div>
                                <span className={`status-badge ${event.finalStatus}`}>
                                    {getStatusIcon(event.finalStatus)}
                                    {event.finalStatus}
                                </span>
                            </div>
                            <div className="event-details">
                                <span className="strategy-name">{event.strategyName}</span>
                                <span className="event-trade">
                                    <span className={`side ${event.side.toLowerCase()}`}>{event.side}</span>
                                    {event.qty} {event.symbol}
                                </span>
                            </div>
                            <div className="event-time">
                                <Clock size={12} />
                                {new Date(event.timestamp).toLocaleTimeString('en-IN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit'
                                })} IST
                            </div>
                        </div>
                    ))}
                </div>

                {/* Timeline Detail */}
                {selectedEvent && (
                    <div className="timeline-detail">
                        <div className="detail-header">
                            <div className="detail-title">
                                <h2>Signal Timeline</h2>
                                <div className="detail-id">
                                    <span>{selectedEvent.signalId}</span>
                                    <button className="btn btn-ghost btn-icon btn-sm" title="Copy ID">
                                        <Copy size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="detail-meta">
                                <span className="meta-item">
                                    <strong>Strategy:</strong> {selectedEvent.strategyName} ({selectedEvent.strategyVersion})
                                </span>
                                <span className="meta-item">
                                    <strong>User:</strong> {selectedEvent.userId}
                                </span>
                                <span className="meta-item">
                                    <strong>Broker:</strong> {selectedEvent.brokerId}
                                </span>
                            </div>
                        </div>

                        {/* Visual Timeline */}
                        <div className="visual-timeline">
                            <h3>Execution Timeline</h3>
                            <div className="timeline-track">
                                {selectedEvent.stages.map((stage, index) => (
                                    <div key={index} className={`timeline-stage ${stage.status}`}>
                                        <div className="stage-connector">
                                            <div className="stage-dot">
                                                {getStageIcon(stage.stage)}
                                            </div>
                                            {index < selectedEvent.stages.length - 1 && (
                                                <div className="stage-line" />
                                            )}
                                        </div>
                                        <div className="stage-content">
                                            <div className="stage-header">
                                                <span className="stage-name">{stage.stage}</span>
                                                <span className={`stage-status ${stage.status}`}>
                                                    {getStatusIcon(stage.status)}
                                                </span>
                                            </div>
                                            <div className="stage-time">
                                                <Clock size={12} />
                                                {stage.timestamp}
                                            </div>
                                            {stage.duration && (
                                                <span className="stage-duration">+{stage.duration}</span>
                                            )}
                                            {stage.details && (
                                                <span className="stage-details">{stage.details}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Compliance Checks */}
                        <div className="compliance-checks">
                            <h3>
                                <Shield size={18} />
                                Compliance Rules Applied
                            </h3>
                            <div className="checks-list">
                                {selectedEvent.complianceChecks.map((check, index) => (
                                    <div key={index} className={`check-item ${check.status}`}>
                                        <div className="check-icon">
                                            {getStatusIcon(check.status)}
                                        </div>
                                        <div className="check-content">
                                            <span className="check-rule">{check.rule}</span>
                                            <div className="check-values">
                                                <span className="check-value">Value: <strong>{check.value}</strong></span>
                                                <span className="check-limit">Limit: <strong>{check.limit}</strong></span>
                                            </div>
                                        </div>
                                        <span className={`check-status ${check.status}`}>
                                            {check.status === 'passed' ? 'PASSED' : check.status === 'warning' ? 'WARNING' : 'FAILED'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Audit Signature */}
                        <div className="audit-signature">
                            <div className="signature-content">
                                <Shield size={20} />
                                <div className="signature-text">
                                    <span className="signature-title">Immutable Audit Record</span>
                                    <span className="signature-hash">
                                        Hash: 0x{Math.random().toString(16).substr(2, 32)}...
                                    </span>
                                </div>
                            </div>
                            <span className="signature-time">
                                Recorded: {new Date(selectedEvent.timestamp).toLocaleString('en-IN')} IST
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
