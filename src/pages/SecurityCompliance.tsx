import { useState, useEffect } from 'react'
import {
    Shield, Server, CheckCircle, XCircle, AlertTriangle,
    Eye, EyeOff, Plus, Trash2, RefreshCw, Copy,
    Building2, FileText, Clock, Calendar,
    Fingerprint, MapPin, Activity, AlertOctagon
} from 'lucide-react'
import { authAPI } from '../services/api'
import './SecurityCompliance.css'

// SEBI Compliance Status
interface IPWhitelist {
    id: string
    ip: string
    label: string
    status: 'active' | 'pending' | 'expired'
    addedOn: string
    expiresOn: string
    verifiedBy: string
    location: string
}

interface VendorStatus {
    vendorName: string
    empanelmentId: string
    status: 'approved' | 'pending' | 'rejected'
    validFrom: string
    validUntil: string
    brokerName: string
}

interface StrategyClassification {
    id: string
    name: string
    type: 'white-box' | 'black-box'
    disclosureStatus: 'full' | 'partial' | 'none'
    sebiApproval: 'approved' | 'pending' | 'not-required'
    lastAudit: string
}

// Mock data
// Mock data removed in favor of API calls

const vendorStatusData: VendorStatus = {
    vendorName: 'Compliance-Bridge Technologies Pvt. Ltd.',
    empanelmentId: 'SEBI/ALGO/VENDOR/2024/0089',
    status: 'approved',
    validFrom: '2024-04-01',
    validUntil: '2026-03-31',
    brokerName: 'Zerodha Broking Ltd.'
}

const strategyClassifications: StrategyClassification[] = [
    {
        id: '1',
        name: 'Momentum Alpha Strategy',
        type: 'white-box',
        disclosureStatus: 'full',
        sebiApproval: 'approved',
        lastAudit: '2024-11-15'
    },
    {
        id: '2',
        name: 'Mean Reversion Pro',
        type: 'white-box',
        disclosureStatus: 'full',
        sebiApproval: 'approved',
        lastAudit: '2024-10-22'
    },
    {
        id: '3',
        name: 'AI-ML Predictor',
        type: 'black-box',
        disclosureStatus: 'partial',
        sebiApproval: 'pending',
        lastAudit: '2024-12-01'
    }
]

export default function SecurityCompliance() {
    const [activeTab, setActiveTab] = useState<'ip' | 'vendor' | 'strategy' | 'incident'>('ip')
    const [ipList, setIpList] = useState<IPWhitelist[]>([])
    const [showAddIP, setShowAddIP] = useState(false)
    const [newIP, setNewIP] = useState({ ip: '', label: '', location: '' })
    const [ipError, setIpError] = useState('')
    const [currentIP, setCurrentIP] = useState('')
    const [lastCheck, setLastCheck] = useState(new Date())
    const [isLoading, setIsLoading] = useState(false)

    const fetchIPs = async () => {
        try {
            setIsLoading(true)
            const { user } = await authAPI.me()
            // Map backend data to UI interface
            const mappedIPs: IPWhitelist[] = (user.whitelistedIPs || []).map((ip: any) => ({
                id: ip._id,
                ip: ip.ip,
                label: ip.label,
                status: ip.verified ? 'active' : 'pending',
                addedOn: new Date(ip.addedAt).toISOString().split('T')[0],
                expiresOn: new Date(new Date(ip.addedAt).setFullYear(new Date(ip.addedAt).getFullYear() + 1)).toISOString().split('T')[0],
                verifiedBy: ip.verified ? 'SEBI-REG-AUTO' : 'Pending',
                location: ip.location || 'Unknown'
            }))
            setIpList(mappedIPs)
        } catch (error) {
            console.error('Failed to fetch IPs:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        // Simulate getting current IP (in real app, use a service like ipify)
        setCurrentIP('127.0.0.1')
        fetchIPs()

        const interval = setInterval(() => {
            setLastCheck(new Date())
            // checkCurrentIP() 
        }, 30000)

        return () => clearInterval(interval)
    }, [])

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
            case 'approved':
            case 'full':
                return <span className="status-badge success"><CheckCircle size={12} /> Active</span>
            case 'pending':
            case 'partial':
                return <span className="status-badge warning"><Clock size={12} /> Pending</span>
            case 'expired':
            case 'rejected':
            case 'none':
                return <span className="status-badge error"><XCircle size={12} /> {status}</span>
            default:
                return <span className="status-badge">{status}</span>
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
    }

    const handleAddIP = async () => {
        setIpError('')

        // Simple IP validation regex
        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

        if (!newIP.ip || !newIP.label) {
            setIpError('Please fill in both IP address and label')
            return
        }

        if (!ipRegex.test(newIP.ip)) {
            setIpError('Please enter a valid IPv4 address (e.g., 192.168.1.1)')
            return
        }

        try {
            await authAPI.addIP(newIP.ip, newIP.label, newIP.location)
            await fetchIPs() // Refresh list
            setNewIP({ ip: '', label: '', location: '' })
            setShowAddIP(false)
        } catch (error: any) {
            setIpError(error.message || 'Failed to add IP')
        }
    }

    const handleDeleteIP = async (id: string) => {
        try {
            await authAPI.removeIP(id)
            setIpList(ipList.filter(ip => ip.id !== id))
        } catch (error) {
            console.error('Failed to delete IP:', error)
        }
    }

    const isCurrentIPWhitelisted = ipList.some(ip => ip.ip === currentIP && ip.status === 'active')

    return (
        <div className="security-compliance-page">
            {/* Page Header */}
            <div className="page-header">
                <div className="header-content">
                    <div className="header-icon">
                        <Shield size={28} />
                    </div>
                    <div>
                        <h1>Security & SEBI Compliance</h1>
                        <p>Static IP Whitelisting, Vendor Empanelment & Strategy Classification</p>
                    </div>
                </div>
                <div className="header-badge">
                    <Calendar size={14} />
                    <span>Deadline: March 31, 2026</span>
                </div>
            </div>

            {/* SEBI Mandate Cards */}
            <div className="mandate-cards">
                <div className="mandate-card">
                    <div className="mandate-icon ip">
                        <Server size={24} />
                    </div>
                    <div className="mandate-content">
                        <h3>Static IP Wall</h3>
                        <p>Every API order must originate from a whitelisted Static IP</p>
                    </div>
                    <div className="mandate-status">
                        {isCurrentIPWhitelisted ? (
                            <span className="status-badge success"><CheckCircle size={12} /> Compliant</span>
                        ) : (
                            <span className="status-badge error"><XCircle size={12} /> Non-Compliant</span>
                        )}
                    </div>
                </div>

                <div className="mandate-card">
                    <div className="mandate-icon vendor">
                        <Building2 size={24} />
                    </div>
                    <div className="mandate-content">
                        <h3>Broker as Principal</h3>
                        <p>Third-party platforms must be empanelled vendors</p>
                    </div>
                    <div className="mandate-status">
                        {vendorStatusData.status === 'approved' ? (
                            <span className="status-badge success"><CheckCircle size={12} /> Empanelled</span>
                        ) : (
                            <span className="status-badge warning"><Clock size={12} /> Pending</span>
                        )}
                    </div>
                </div>

                <div className="mandate-card">
                    <div className="mandate-icon strategy">
                        <Eye size={24} />
                    </div>
                    <div className="mandate-content">
                        <h3>Logic Scrutiny</h3>
                        <p>Clear distinction between White Box & Black Box strategies</p>
                    </div>
                    <div className="mandate-status">
                        <span className="status-badge success"><CheckCircle size={12} /> Classified</span>
                    </div>
                </div>
            </div>

            {/* Current IP Status Banner */}
            <div className={`ip-status-banner ${isCurrentIPWhitelisted ? 'compliant' : 'non-compliant'}`}>
                <div className="ip-status-left">
                    <div className="ip-status-icon">
                        {isCurrentIPWhitelisted ? <CheckCircle size={24} /> : <AlertOctagon size={24} />}
                    </div>
                    <div className="ip-status-content">
                        <h4>{isCurrentIPWhitelisted ? 'Current IP is Whitelisted' : 'Current IP Not Whitelisted'}</h4>
                        <p>
                            Your current IP: <strong>{currentIP}</strong>
                            {isCurrentIPWhitelisted && ' — Primary Trading Server'}
                        </p>
                    </div>
                </div>
                <div className="ip-status-right">
                    <span className="last-check">
                        <Activity size={14} />
                        Last verified: {lastCheck.toLocaleTimeString()}
                    </span>
                    <button className="btn btn-ghost" onClick={() => setLastCheck(new Date())}>
                        <RefreshCw size={16} />
                        Verify Now
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="compliance-tabs">
                <button
                    className={`tab-btn ${activeTab === 'ip' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ip')}
                >
                    <Server size={18} />
                    Static IP Whitelist
                </button>
                <button
                    className={`tab-btn ${activeTab === 'vendor' ? 'active' : ''}`}
                    onClick={() => setActiveTab('vendor')}
                >
                    <Building2 size={18} />
                    Vendor Empanelment
                </button>
                <button
                    className={`tab-btn ${activeTab === 'strategy' ? 'active' : ''}`}
                    onClick={() => setActiveTab('strategy')}
                >
                    <Eye size={18} />
                    Strategy Classification
                </button>
                <button
                    className={`tab-btn ${activeTab === 'incident' ? 'active' : ''}`}
                    onClick={() => setActiveTab('incident')}
                >
                    <AlertOctagon size={18} />
                    Incident Reporting
                </button>
                <div style={{ flex: 1 }} />
                {isLoading && (
                    <div className="loading-indicator" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                        <RefreshCw size={16} className="spin" />
                        <span style={{ fontSize: '12px' }}>Syncing...</span>
                    </div>
                )}
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {/* Static IP Whitelist Tab */}
                {activeTab === 'ip' && (
                    <div className="ip-whitelist-section">
                        <div className="section-header">
                            <div>
                                <h2>Whitelisted Static IPs</h2>
                                <p>Only orders from these IPs are allowed per SEBI mandate</p>
                            </div>
                            <button className="btn btn-primary" onClick={() => setShowAddIP(true)}>
                                <Plus size={16} />
                                Add New IP
                            </button>
                        </div>

                        {showAddIP && (
                            <div className="add-ip-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Static IP Address</label>
                                        <input
                                            type="text"
                                            placeholder="xxx.xxx.xxx.xxx"
                                            value={newIP.ip}
                                            onChange={(e) => setNewIP({ ...newIP, ip: e.target.value })}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Label / Purpose</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Primary Trading Server"
                                            value={newIP.label}
                                            onChange={(e) => setNewIP({ ...newIP, label: e.target.value })}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Location</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Mumbai, India"
                                            value={newIP.location}
                                            onChange={(e) => setNewIP({ ...newIP, location: e.target.value })}
                                            className="form-input"
                                        />
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button className="btn btn-ghost" onClick={() => setShowAddIP(false)}>Cancel</button>
                                    <button className="btn btn-primary" onClick={handleAddIP}>
                                        <Plus size={16} />
                                        Submit for SEBI Verification
                                    </button>
                                </div>
                                {ipError && (
                                    <p className="form-error" style={{ color: 'var(--error-500)', fontSize: '13px', marginBottom: 'var(--space-2)' }}>
                                        <AlertTriangle size={14} /> {ipError}
                                    </p>
                                )}
                                <p className="form-note">
                                    <AlertTriangle size={14} />
                                    New IPs require SEBI verification (typically 3-5 business days). Cost: ₹5,000-15,000/month per IP.
                                </p>
                            </div>
                        )}

                        <div className="ip-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>IP Address</th>
                                        <th>Label</th>
                                        <th>Location</th>
                                        <th>Status</th>
                                        <th>SEBI Verification</th>
                                        <th>Expires</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ipList.map((ip) => (
                                        <tr key={ip.id} className={ip.ip === currentIP ? 'current-ip' : ''}>
                                            <td>
                                                <div className="ip-cell">
                                                    <code>{ip.ip}</code>
                                                    <button className="copy-btn" onClick={() => copyToClipboard(ip.ip)}>
                                                        <Copy size={12} />
                                                    </button>
                                                    {ip.ip === currentIP && (
                                                        <span className="current-badge">Current</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>{ip.label}</td>
                                            <td>
                                                <span className="location">
                                                    <MapPin size={12} />
                                                    {ip.location}
                                                </span>
                                            </td>
                                            <td>{getStatusBadge(ip.status)}</td>
                                            <td>
                                                <span className="verification-id">{ip.verifiedBy}</span>
                                            </td>
                                            <td>{ip.expiresOn}</td>
                                            <td>
                                                <button
                                                    className="btn btn-ghost btn-sm text-error"
                                                    style={{ color: 'var(--error-500)' }}
                                                    onClick={() => handleDeleteIP(ip.id)}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="ip-info-card">
                            <div className="info-icon">
                                <AlertTriangle size={20} />
                            </div>
                            <div className="info-content">
                                <h4>SEBI Static IP Requirement</h4>
                                <p>
                                    As per SEBI circular dated October 2024, all algo trading orders must originate from
                                    whitelisted Static IPs registered with the broker. Non-compliant orders will be rejected.
                                    <br /><br />
                                    <strong>Monthly Cost:</strong> ₹5,000 - ₹15,000 per Static IP depending on ISP provider.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Vendor Empanelment Tab */}
                {activeTab === 'vendor' && (
                    <div className="vendor-section">
                        <div className="vendor-card">
                            <div className="vendor-header">
                                <div className="vendor-logo">
                                    <Building2 size={32} />
                                </div>
                                <div className="vendor-title">
                                    <h2>{vendorStatusData.vendorName}</h2>
                                    <p>Empanelled Algo Trading Vendor</p>
                                </div>
                                {getStatusBadge(vendorStatusData.status)}
                            </div>

                            <div className="vendor-details">
                                <div className="detail-row">
                                    <div className="detail-item">
                                        <label>Empanelment ID</label>
                                        <div className="detail-value">
                                            <code>{vendorStatusData.empanelmentId}</code>
                                            <button className="copy-btn" onClick={() => copyToClipboard(vendorStatusData.empanelmentId)}>
                                                <Copy size={12} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="detail-item">
                                        <label>Registered Broker</label>
                                        <span className="detail-value">{vendorStatusData.brokerName}</span>
                                    </div>
                                </div>

                                <div className="detail-row">
                                    <div className="detail-item">
                                        <label>Valid From</label>
                                        <span className="detail-value">{vendorStatusData.validFrom}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Valid Until</label>
                                        <span className="detail-value highlight">{vendorStatusData.validUntil}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="vendor-notice">
                                <div className="notice-icon">
                                    <Shield size={20} />
                                </div>
                                <div className="notice-content">
                                    <h4>Broker as Principal</h4>
                                    <p>
                                        Under SEBI's new framework, the broker ({vendorStatusData.brokerName}) is legally
                                        liable for all orders executed through this platform. As an empanelled vendor,
                                        we operate as an authorized agent under the broker's supervision.
                                    </p>
                                </div>
                            </div>

                            <div className="compliance-checklist">
                                <h3>Vendor Compliance Checklist</h3>
                                <div className="checklist-items">
                                    <div className="checklist-item checked">
                                        <CheckCircle size={18} />
                                        <span>Registered with SEBI as Algo Trading Vendor</span>
                                    </div>
                                    <div className="checklist-item checked">
                                        <CheckCircle size={18} />
                                        <span>Empanelled with registered broker</span>
                                    </div>
                                    <div className="checklist-item checked">
                                        <CheckCircle size={18} />
                                        <span>Static IP whitelisted with exchange</span>
                                    </div>
                                    <div className="checklist-item checked">
                                        <CheckCircle size={18} />
                                        <span>Audit trail logging enabled</span>
                                    </div>
                                    <div className="checklist-item checked">
                                        <CheckCircle size={18} />
                                        <span>Kill switch functionality implemented</span>
                                    </div>
                                    <div className="checklist-item checked">
                                        <CheckCircle size={18} />
                                        <span>Strategy classification documented</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Strategy Classification Tab */}
                {activeTab === 'strategy' && (
                    <div className="strategy-section">
                        <div className="section-header">
                            <div>
                                <h2>Strategy Classification</h2>
                                <p>SEBI requires clear distinction between White Box and Black Box strategies</p>
                            </div>
                        </div>

                        <div className="classification-legend">
                            <div className="legend-item white-box">
                                <Eye size={18} />
                                <div>
                                    <strong>White Box</strong>
                                    <span>Logic fully disclosed to broker</span>
                                </div>
                            </div>
                            <div className="legend-item black-box">
                                <EyeOff size={18} />
                                <div>
                                    <strong>Black Box</strong>
                                    <span>Proprietary logic, requires special approval</span>
                                </div>
                            </div>
                        </div>

                        <div className="strategy-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Strategy Name</th>
                                        <th>Classification</th>
                                        <th>Disclosure Level</th>
                                        <th>SEBI Approval</th>
                                        <th>Last Audit</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {strategyClassifications.map((strategy) => (
                                        <tr key={strategy.id}>
                                            <td>
                                                <div className="strategy-name">
                                                    <Fingerprint size={16} />
                                                    {strategy.name}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`type-badge ${strategy.type}`}>
                                                    {strategy.type === 'white-box' ? <Eye size={12} /> : <EyeOff size={12} />}
                                                    {strategy.type === 'white-box' ? 'White Box' : 'Black Box'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`disclosure-badge ${strategy.disclosureStatus}`}>
                                                    {strategy.disclosureStatus === 'full' ? 'Full Disclosure' :
                                                        strategy.disclosureStatus === 'partial' ? 'Partial' : 'None'}
                                                </span>
                                            </td>
                                            <td>{getStatusBadge(strategy.sebiApproval)}</td>
                                            <td>{strategy.lastAudit}</td>
                                            <td>
                                                <button className="btn btn-ghost btn-sm">
                                                    <FileText size={14} />
                                                    View Docs
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="classification-info">
                            <div className="info-card white-box-info">
                                <div className="info-header">
                                    <Eye size={24} />
                                    <h3>White Box Requirements</h3>
                                </div>
                                <ul>
                                    <li>Complete strategy logic must be disclosed to the broker</li>
                                    <li>Entry/exit conditions clearly documented</li>
                                    <li>Risk parameters visible and verifiable</li>
                                    <li>Faster approval process</li>
                                </ul>
                            </div>

                            <div className="info-card black-box-info">
                                <div className="info-header">
                                    <EyeOff size={24} />
                                    <h3>Black Box Requirements</h3>
                                </div>
                                <ul>
                                    <li>Requires additional SEBI approval</li>
                                    <li>Strategy performance must be auditable</li>
                                    <li>Enhanced risk monitoring required</li>
                                    <li>May require third-party audit</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
                {/* Incident Reporting Tab (New) */}
                {activeTab === 'incident' && (
                    <div className="incident-section">
                        <div className="section-header">
                            <div>
                                <h2>Incident & Non-Conformance Reporting</h2>
                                <p>Report and track compliance violations and system anomalies</p>
                            </div>
                            <button className="btn btn-primary" onClick={() => setShowAddIP(true)}> {/* Reusing state for now or create new */}
                                <Plus size={16} />
                                Report Incident
                            </button>
                        </div>

                        <div className="empty-state">
                            <AlertOctagon size={48} />
                            <h3>No Open Incidents</h3>
                            <p>All systems are operating within compliance parameters.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
