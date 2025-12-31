import { useState, useEffect } from 'react'
import { Download, Calendar, Search, FileText, CheckCircle, XCircle, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react'
import { auditAPI } from '../services/api'
import { useToast } from '../context/ToastContext'
import './AuditLogs.css'

export default function AuditLogs() {
    const { showToast } = useToast()
    const [logs, setLogs] = useState<any[]>([])
    const [eventFilter, setEventFilter] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)

    const eventTypes = [
        'all', 'login', 'logout', 'order_placed', 'order_executed', 'order_rejected',
        'strategy_created', 'user_blocked', 'kill_switch_activated', 'compliance_check'
    ]

    const fetchLogs = async (quiet = false) => {
        if (!quiet) setIsLoading(true)
        else setIsRefreshing(true)
        try {
            const res = await auditAPI.getAll()
            setLogs(res.logs)
        } catch (error) {
            showToast('Failed to load audit logs', 'error')
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        fetchLogs()
    }, [])

    const filteredLogs = logs.filter(log => {
        const matchesEvent = eventFilter === 'all' || log.eventType === eventFilter
        const matchesSearch = log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.userName && log.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (log.targetType && log.targetType.toLowerCase().includes(searchTerm.toLowerCase()))
        return matchesEvent && matchesSearch
    })

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2))
        const downloadAnchorNode = document.createElement('a')
        downloadAnchorNode.setAttribute("href", dataStr)
        downloadAnchorNode.setAttribute("download", `audit_logs_${new Date().toISOString()}.json`)
        document.body.appendChild(downloadAnchorNode)
        downloadAnchorNode.click()
        downloadAnchorNode.remove()
    }

    const getStatusIcon = (severity: string) => {
        switch (severity) {
            case 'info': return <CheckCircle size={16} className="status-icon success" />
            case 'critical': return <XCircle size={16} className="status-icon failure" />
            case 'warning': return <AlertTriangle size={16} className="status-icon warning" />
            default: return <CheckCircle size={16} className="status-icon info" />
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
                    <button className="btn btn-secondary" onClick={() => fetchLogs()} disabled={isRefreshing}>
                        <RefreshCw size={16} className={isRefreshing ? 'spin' : ''} />
                        Refresh
                    </button>
                    <button className="btn btn-primary" onClick={handleExport}>
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
                {isLoading ? (
                    <div className="loading-state">
                        <Loader2 size={32} className="spin" />
                        <p>Fetching regulatory logs...</p>
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="empty-state">
                        <p>No audit events found.</p>
                    </div>
                ) : (
                    filteredLogs.map(log => (
                        <div key={log._id} className={`log-entry ${log.severity}`}>
                            <div className="log-timeline">
                                <div className="timeline-dot" />
                                <div className="timeline-line" />
                            </div>
                            <div className="log-content">
                                <div className="log-header">
                                    <span className="log-timestamp">{new Date(log.timestamp).toLocaleString()}</span>
                                    <span className={`event-badge ${log.eventType.split('_')[0]}`}>
                                        {log.eventType.replace(/_/g, ' ')}
                                    </span>
                                    {getStatusIcon(log.severity)}
                                </div>
                                <p className="log-details">{log.description}</p>
                                <div className="log-meta">
                                    <span className="meta-item">
                                        <span className="meta-label">User:</span> {log.userName}
                                    </span>
                                    {log.targetType && (
                                        <span className="meta-item">
                                            <span className="meta-label">{log.targetType.charAt(0).toUpperCase() + log.targetType.slice(1)}:</span> {log.targetName || log.targetId}
                                        </span>
                                    )}
                                    <span className="meta-item hash">
                                        <span className="meta-label">Hash:</span> {log.hash}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
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
