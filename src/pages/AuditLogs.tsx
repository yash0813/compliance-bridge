import { useState } from 'react'
import { Download, Calendar, Search, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import './AuditLogs.css'

const logsData = [
    { id: 1, timestamp: '2024-12-23 10:32:15.123', event: 'signal_received', user: 'USR_12345', resource: 'SIG_001', status: 'success', details: 'Signal received from Momentum Alpha strategy' },
    { id: 2, timestamp: '2024-12-23 10:32:15.156', event: 'compliance_check', user: 'USR_12345', resource: 'SIG_001', status: 'success', details: 'All 12 compliance rules passed' },
    { id: 3, timestamp: '2024-12-23 10:32:15.189', event: 'order_placed', user: 'USR_12345', resource: 'ORD_001', status: 'success', details: 'Order placed via Zerodha - RELIANCE BUY 100' },
    { id: 4, timestamp: '2024-12-23 10:32:16.234', event: 'order_filled', user: 'USR_12345', resource: 'ORD_001', status: 'success', details: 'Order filled at ₹2,450.25' },
    { id: 5, timestamp: '2024-12-23 10:31:45.100', event: 'signal_received', user: 'USR_67890', resource: 'SIG_002', status: 'success', details: 'Signal received from Mean Reversion strategy' },
    { id: 6, timestamp: '2024-12-23 10:31:45.145', event: 'compliance_check', user: 'USR_67890', resource: 'SIG_002', status: 'failure', details: 'Failed: MAX_ORD_VAL - Order value exceeds limit' },
    { id: 7, timestamp: '2024-12-23 10:30:22.050', event: 'user_login', user: 'USR_11111', resource: 'SESSION_001', status: 'success', details: 'User logged in from IP 203.0.113.45' },
    { id: 8, timestamp: '2024-12-23 10:28:10.200', event: 'rule_updated', user: 'ADMIN_001', resource: 'RULE_005', status: 'success', details: 'Compliance rule MAX_ORD_VAL updated - limit changed to ₹10L' },
]

export default function AuditLogs() {
    const [logs] = useState(logsData)
    const [eventFilter, setEventFilter] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')

    const eventTypes = ['all', 'signal_received', 'compliance_check', 'order_placed', 'order_filled', 'user_login', 'rule_updated']

    const filteredLogs = logs.filter(log => {
        const matchesEvent = eventFilter === 'all' || log.event === eventFilter
        const matchesSearch = log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.resource.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesEvent && matchesSearch
    })

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success': return <CheckCircle size={16} className="status-icon success" />
            case 'failure': return <XCircle size={16} className="status-icon failure" />
            default: return <AlertTriangle size={16} className="status-icon warning" />
        }
    }

    return (
        <div className="audit-page">
            <div className="page-header">
                <div>
                    <h1>Audit Logs</h1>
                    <p>Immutable audit trail for regulatory compliance</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary">
                        <Calendar size={16} />
                        Date Range
                    </button>
                    <button className="btn btn-primary">
                        <Download size={16} />
                        Export
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="audit-toolbar">
                <div className="event-filters">
                    <select
                        className="event-select"
                        value={eventFilter}
                        onChange={(e) => setEventFilter(e.target.value)}
                    >
                        {eventTypes.map(type => (
                            <option key={type} value={type}>
                                {type === 'all' ? 'All Events' : type.replace(/_/g, ' ')}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Logs */}
            <div className="logs-container">
                {filteredLogs.map(log => (
                    <div key={log.id} className={`log-entry ${log.status}`}>
                        <div className="log-timeline">
                            <div className="timeline-dot" />
                            <div className="timeline-line" />
                        </div>
                        <div className="log-content">
                            <div className="log-header">
                                <span className="log-timestamp">{log.timestamp}</span>
                                <span className={`event-badge ${log.event.split('_')[0]}`}>
                                    {log.event.replace(/_/g, ' ')}
                                </span>
                                {getStatusIcon(log.status)}
                            </div>
                            <p className="log-details">{log.details}</p>
                            <div className="log-meta">
                                <span className="meta-item">
                                    <span className="meta-label">User:</span> {log.user}
                                </span>
                                <span className="meta-item">
                                    <span className="meta-label">Resource:</span> {log.resource}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Export Info */}
            <div className="export-info">
                <FileText size={20} />
                <div>
                    <h4>Regulator-Ready Export</h4>
                    <p>Export logs in CSV, JSON, or PDF format for regulatory submissions. All exports include cryptographic verification hashes.</p>
                </div>
                <button className="btn btn-secondary">Generate Report</button>
            </div>
        </div>
    )
}
