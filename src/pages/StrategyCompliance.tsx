import { useState } from 'react'
import {
    Shield, CheckCircle, AlertTriangle, Clock,
    History, GitBranch, Tag, Eye,
    FileText, Download,
    Search,
    Award, XCircle, Info
} from 'lucide-react'
import './StrategyCompliance.css'

interface Strategy {
    id: string
    name: string
    version: string
    certification: 'certified' | 'under_review' | 'unverified' | 'rejected'
    complianceStatus: 'compliant' | 'warning' | 'blocked'
    complianceReason?: string
    lastUpdated: string
    owner: string
    rulesApplied: number
    versionsHistory: {
        version: string
        date: string
        trades: number
        status: 'active' | 'deprecated'
    }[]
}

const strategies: Strategy[] = [
    {
        id: 'STRAT_001',
        name: 'Momentum Alpha',
        version: 'v2.1.3',
        certification: 'certified',
        complianceStatus: 'compliant',
        lastUpdated: '2024-12-20',
        owner: 'Rahul Sharma',
        rulesApplied: 5,
        versionsHistory: [
            { version: 'v2.1.3', date: '2024-12-20', trades: 245, status: 'active' },
            { version: 'v2.1.2', date: '2024-12-15', trades: 1240, status: 'deprecated' },
            { version: 'v2.1.0', date: '2024-12-01', trades: 3420, status: 'deprecated' },
            { version: 'v2.0.0', date: '2024-11-15', trades: 5680, status: 'deprecated' },
        ]
    },
    {
        id: 'STRAT_002',
        name: 'Mean Reversion',
        version: 'v1.8.0',
        certification: 'under_review',
        complianceStatus: 'warning',
        complianceReason: 'Position size approaching 80% of limit',
        lastUpdated: '2024-12-22',
        owner: 'Priya Patel',
        rulesApplied: 4,
        versionsHistory: [
            { version: 'v1.8.0', date: '2024-12-22', trades: 89, status: 'active' },
            { version: 'v1.7.5', date: '2024-12-10', trades: 890, status: 'deprecated' },
            { version: 'v1.7.0', date: '2024-11-28', trades: 2100, status: 'deprecated' },
        ]
    },
    {
        id: 'STRAT_003',
        name: 'Breakout Pro',
        version: 'v3.0.1',
        certification: 'certified',
        complianceStatus: 'compliant',
        lastUpdated: '2024-12-18',
        owner: 'Amit Kumar',
        rulesApplied: 6,
        versionsHistory: [
            { version: 'v3.0.1', date: '2024-12-18', trades: 156, status: 'active' },
            { version: 'v3.0.0', date: '2024-12-05', trades: 780, status: 'deprecated' },
        ]
    },
    {
        id: 'STRAT_004',
        name: 'High Frequency Scalper',
        version: 'v1.0.0',
        certification: 'rejected',
        complianceStatus: 'blocked',
        complianceReason: 'Order frequency exceeds SEBI guidelines (>100 orders/min)',
        lastUpdated: '2024-12-23',
        owner: 'Sneha Reddy',
        rulesApplied: 5,
        versionsHistory: [
            { version: 'v1.0.0', date: '2024-12-23', trades: 0, status: 'active' },
        ]
    },
    {
        id: 'STRAT_005',
        name: 'Trend Following Beta',
        version: 'v0.9.0',
        certification: 'unverified',
        complianceStatus: 'warning',
        complianceReason: 'New strategy - requires initial compliance review',
        lastUpdated: '2024-12-24',
        owner: 'Vikram Singh',
        rulesApplied: 0,
        versionsHistory: [
            { version: 'v0.9.0', date: '2024-12-24', trades: 0, status: 'active' },
        ]
    },
]

export default function StrategyCompliance() {
    const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(strategies[0])
    const [searchQuery, setSearchQuery] = useState('')
    const [certFilter, setCertFilter] = useState('all')

    const getCertificationIcon = (cert: string) => {
        switch (cert) {
            case 'certified':
                return <Award size={16} />
            case 'under_review':
                return <Clock size={16} />
            case 'unverified':
                return <AlertTriangle size={16} />
            case 'rejected':
                return <XCircle size={16} />
            default:
                return <Info size={16} />
        }
    }

    const getComplianceIcon = (status: string) => {
        switch (status) {
            case 'compliant':
                return <CheckCircle size={18} />
            case 'warning':
                return <AlertTriangle size={18} />
            case 'blocked':
                return <XCircle size={18} />
            default:
                return <Info size={18} />
        }
    }

    const filteredStrategies = strategies.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.id.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesFilter = certFilter === 'all' || s.certification === certFilter
        return matchesSearch && matchesFilter
    })

    return (
        <div className="strategy-compliance-page">
            {/* Page Header */}
            <div className="page-header">
                <div className="page-header-content">
                    <div className="page-title-group">
                        <h1>Strategy Compliance Center</h1>
                        <p>Certification status, compliance monitoring, and version history</p>
                    </div>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-secondary">
                        <Download size={16} />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Certification Legend */}
            <div className="certification-legend">
                <div className="legend-item certified">
                    <Award size={16} />
                    <span>Certified</span>
                    <span className="legend-desc">Fully reviewed and approved</span>
                </div>
                <div className="legend-item under_review">
                    <Clock size={16} />
                    <span>Under Review</span>
                    <span className="legend-desc">Awaiting compliance verification</span>
                </div>
                <div className="legend-item unverified">
                    <AlertTriangle size={16} />
                    <span>Unverified</span>
                    <span className="legend-desc">Not yet submitted for review</span>
                </div>
                <div className="legend-item rejected">
                    <XCircle size={16} />
                    <span>Rejected</span>
                    <span className="legend-desc">Failed compliance requirements</span>
                </div>
            </div>

            {/* Filters */}
            <div className="strategy-filters">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search strategies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    className="form-select"
                    value={certFilter}
                    onChange={(e) => setCertFilter(e.target.value)}
                >
                    <option value="all">All Certifications</option>
                    <option value="certified">Certified</option>
                    <option value="under_review">Under Review</option>
                    <option value="unverified">Unverified</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            <div className="compliance-layout">
                {/* Strategy List */}
                <div className="strategy-list">
                    {filteredStrategies.map(strategy => (
                        <div
                            key={strategy.id}
                            className={`strategy-card ${selectedStrategy?.id === strategy.id ? 'selected' : ''}`}
                            onClick={() => setSelectedStrategy(strategy)}
                        >
                            <div className="strategy-card-header">
                                <div className="strategy-name-group">
                                    <div className={`compliance-indicator ${strategy.complianceStatus}`}>
                                        {getComplianceIcon(strategy.complianceStatus)}
                                    </div>
                                    <div>
                                        <h4>{strategy.name}</h4>
                                        <span className="strategy-id">{strategy.id}</span>
                                    </div>
                                </div>
                                <div className={`certification-badge ${strategy.certification}`}>
                                    {getCertificationIcon(strategy.certification)}
                                    <span>{strategy.certification.replace('_', ' ')}</span>
                                </div>
                            </div>

                            <div className="strategy-card-body">
                                <div className="strategy-meta">
                                    <span className="version-tag">
                                        <Tag size={12} />
                                        {strategy.version}
                                    </span>
                                    <span className="owner">Owner: {strategy.owner}</span>
                                </div>

                                {strategy.complianceReason && (
                                    <div className={`compliance-reason ${strategy.complianceStatus}`}>
                                        {strategy.complianceReason}
                                    </div>
                                )}
                            </div>

                            <div className="strategy-card-footer">
                                <span className="rules-applied">
                                    <Shield size={12} />
                                    {strategy.rulesApplied} rules applied
                                </span>
                                <span className="last-updated">
                                    Updated: {strategy.lastUpdated}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Strategy Detail */}
                {selectedStrategy && (
                    <div className="strategy-detail">
                        <div className="detail-header">
                            <div className="detail-title">
                                <div className={`compliance-status-large ${selectedStrategy.complianceStatus}`}>
                                    {getComplianceIcon(selectedStrategy.complianceStatus)}
                                    <span>
                                        {selectedStrategy.complianceStatus === 'compliant' && '✅ Compliant'}
                                        {selectedStrategy.complianceStatus === 'warning' && '⚠️ Warning'}
                                        {selectedStrategy.complianceStatus === 'blocked' && '❌ Blocked'}
                                    </span>
                                </div>
                                <h2>{selectedStrategy.name}</h2>
                                <p>{selectedStrategy.id}</p>
                            </div>
                            <div className={`certification-status ${selectedStrategy.certification}`}>
                                {getCertificationIcon(selectedStrategy.certification)}
                                <div>
                                    <span className="cert-label">Certification Status</span>
                                    <span className="cert-value">{selectedStrategy.certification.replace('_', ' ').toUpperCase()}</span>
                                </div>
                            </div>
                        </div>

                        {selectedStrategy.complianceReason && (
                            <div className={`compliance-alert ${selectedStrategy.complianceStatus}`}>
                                <div className="alert-icon">
                                    {selectedStrategy.complianceStatus === 'warning' && <AlertTriangle size={20} />}
                                    {selectedStrategy.complianceStatus === 'blocked' && <XCircle size={20} />}
                                </div>
                                <div className="alert-content">
                                    <strong>
                                        {selectedStrategy.complianceStatus === 'warning' && 'Compliance Warning'}
                                        {selectedStrategy.complianceStatus === 'blocked' && 'Compliance Violation'}
                                    </strong>
                                    <p>{selectedStrategy.complianceReason}</p>
                                </div>
                            </div>
                        )}

                        {/* Version History */}
                        <div className="version-history">
                            <h3>
                                <History size={18} />
                                Version History
                            </h3>
                            <div className="version-timeline">
                                {selectedStrategy.versionsHistory.map((ver, idx) => (
                                    <div key={idx} className={`version-item ${ver.status}`}>
                                        <div className="version-connector">
                                            <div className="version-dot">
                                                {idx === 0 ? <GitBranch size={14} /> : null}
                                            </div>
                                            {idx < selectedStrategy.versionsHistory.length - 1 && (
                                                <div className="version-line" />
                                            )}
                                        </div>
                                        <div className="version-content">
                                            <div className="version-header">
                                                <span className="version-number">{ver.version}</span>
                                                <span className={`version-status ${ver.status}`}>
                                                    {ver.status}
                                                </span>
                                            </div>
                                            <div className="version-meta">
                                                <span>Deployed: {ver.date}</span>
                                                <span>•</span>
                                                <span>{ver.trades.toLocaleString()} trades executed</span>
                                            </div>
                                        </div>
                                        {idx === 0 && (
                                            <button className="btn btn-ghost btn-sm">
                                                <Eye size={14} />
                                                View Logs
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Rules Applied */}
                        <div className="rules-section">
                            <h3>
                                <Shield size={18} />
                                Compliance Rules Applied
                            </h3>
                            <div className="rules-list">
                                {[
                                    { rule: 'Max Order Quantity', status: 'passed' },
                                    { rule: 'Trading Window Restriction', status: 'passed' },
                                    { rule: 'Position Limit Check', status: selectedStrategy.complianceStatus === 'warning' ? 'warning' : 'passed' },
                                    { rule: 'Order Frequency Limit', status: selectedStrategy.complianceStatus === 'blocked' ? 'failed' : 'passed' },
                                    { rule: 'Symbol Whitelist Check', status: 'passed' },
                                ].slice(0, selectedStrategy.rulesApplied || 5).map((rule, idx) => (
                                    <div key={idx} className={`rule-item ${rule.status}`}>
                                        {rule.status === 'passed' && <CheckCircle size={16} />}
                                        {rule.status === 'warning' && <AlertTriangle size={16} />}
                                        {rule.status === 'failed' && <XCircle size={16} />}
                                        <span>{rule.rule}</span>
                                        <span className={`rule-status ${rule.status}`}>
                                            {rule.status.toUpperCase()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="detail-actions">
                            <button className="btn btn-secondary">
                                <FileText size={16} />
                                View Full Report
                            </button>
                            <button className="btn btn-secondary">
                                <Download size={16} />
                                Export Audit Trail
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
