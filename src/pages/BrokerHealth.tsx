import { useState, useEffect } from 'react'
import {
    Activity, Server, Clock, AlertTriangle, CheckCircle,
    RefreshCw, TrendingUp,
    TrendingDown, Zap, Shield, Users, Pause, Play,
    Ban, Power,
    
} from 'lucide-react'
import './BrokerHealth.css'

interface BrokerStatus {
    id: string
    name: string
    status: 'operational' | 'degraded' | 'down'
    latency: number
    lastSuccess: string
    errorRate: number
    ordersToday: number
    uptime: number
}

interface UserControl {
    id: string
    name: string
    email: string
    strategies: number
    status: 'active' | 'paused' | 'blocked'
    ordersToday: number
    pnl: number
}

const brokerStatus: BrokerStatus = {
    id: 'BROKER_001',
    name: 'Zerodha Kite',
    status: 'operational',
    latency: 45,
    lastSuccess: '2 seconds ago',
    errorRate: 0.02,
    ordersToday: 12456,
    uptime: 99.98
}

const systemComponents = [
    { name: 'Order Gateway', status: 'operational', latency: '12ms' },
    { name: 'Compliance Engine', status: 'operational', latency: '4ms' },
    { name: 'Market Data Feed', status: 'operational', latency: '8ms' },
    { name: 'Audit Logger', status: 'operational', latency: '2ms' },
    { name: 'Signal Processor', status: 'operational', latency: '6ms' },
]

const userControls: UserControl[] = [
    { id: 'USR_12345', name: 'Rahul Sharma', email: 'rahul@example.com', strategies: 3, status: 'active', ordersToday: 145, pnl: 12500 },
    { id: 'USR_67890', name: 'Priya Patel', email: 'priya@example.com', strategies: 2, status: 'active', ordersToday: 89, pnl: -3200 },
    { id: 'USR_11111', name: 'Amit Kumar', email: 'amit@example.com', strategies: 1, status: 'paused', ordersToday: 0, pnl: 0 },
    { id: 'USR_22222', name: 'Sneha Reddy', email: 'sneha@example.com', strategies: 4, status: 'active', ordersToday: 234, pnl: 21000 },
    { id: 'USR_33333', name: 'Vikram Singh', email: 'vikram@example.com', strategies: 2, status: 'blocked', ordersToday: 0, pnl: 0 },
]

export default function BrokerHealth() {
    const [masterKillActive, setMasterKillActive] = useState(false)
    const [pauseAllAlgos, setPauseAllAlgos] = useState(false)
    const [users, setUsers] = useState(userControls)
    // expandedUser state removed
    const [lastSync, setLastSync] = useState(new Date())

    useEffect(() => {
        const interval = setInterval(() => {
            setLastSync(new Date())
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    const toggleUserStatus = (userId: string, newStatus: 'active' | 'paused' | 'blocked') => {
        setUsers(prev => prev.map(u =>
            u.id === userId ? { ...u, status: newStatus } : u
        ))
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'operational':
            case 'active':
                return 'success'
            case 'degraded':
            case 'paused':
                return 'warning'
            case 'down':
            case 'blocked':
                return 'error'
            default:
                return 'neutral'
        }
    }

    return (
        <div className="broker-health-page">
            {/* System Status Bar */}
            <div className="system-status-bar">
                <div className="status-bar-content">
                    <div className="status-indicator">
                        <span className="status-dot active pulse" />
                        <span className="status-text">All Systems Operational</span>
                    </div>
                    <div className="status-meta">
                        <span className="timezone">IST (UTC+5:30)</span>
                        <span className="last-sync">
                            <RefreshCw size={12} />
                            Last sync: {lastSync.toLocaleTimeString('en-IN')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>Broker Control Center</h1>
                    <p>Monitor broker health, control user access, and manage system operations</p>
                </div>
            </div>

            {/* Master Controls */}
            <div className="master-controls">
                <div className="control-card emergency">
                    <div className="control-header">
                        <div className="control-icon danger">
                            <Power size={24} />
                        </div>
                        <div className="control-info">
                            <h3>Master Kill Switch</h3>
                            <p>Immediately halt ALL trading activity</p>
                        </div>
                    </div>
                    <div className="control-action">
                        <span className={`control-status ${masterKillActive ? 'danger' : 'success'}`}>
                            {masterKillActive ? 'TRADING HALTED' : 'TRADING ACTIVE'}
                        </span>
                        <button
                            className={`toggle-btn ${masterKillActive ? 'active' : ''}`}
                            onClick={() => setMasterKillActive(!masterKillActive)}
                        >
                            <div className="toggle-track">
                                <div className="toggle-thumb" />
                            </div>
                        </button>
                    </div>
                </div>

                <div className="control-card warning">
                    <div className="control-header">
                        <div className="control-icon warning">
                            <Pause size={24} />
                        </div>
                        <div className="control-info">
                            <h3>Pause All Algorithms</h3>
                            <p>Temporarily pause all algo strategies</p>
                        </div>
                    </div>
                    <div className="control-action">
                        <span className={`control-status ${pauseAllAlgos ? 'warning' : 'success'}`}>
                            {pauseAllAlgos ? 'ALL PAUSED' : 'RUNNING'}
                        </span>
                        <button
                            className={`toggle-btn warning ${pauseAllAlgos ? 'active' : ''}`}
                            onClick={() => setPauseAllAlgos(!pauseAllAlgos)}
                        >
                            <div className="toggle-track">
                                <div className="toggle-thumb" />
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Broker Health Panel */}
            <div className="health-section">
                <h2>
                    <Server size={20} />
                    Broker API Health
                </h2>

                <div className="health-grid">
                    <div className="health-card main">
                        <div className="health-header">
                            <div className="broker-info">
                                <div className={`broker-status-dot ${getStatusColor(brokerStatus.status)}`} />
                                <div>
                                    <h4>{brokerStatus.name}</h4>
                                    <span className="broker-id">{brokerStatus.id}</span>
                                </div>
                            </div>
                            <span className={`health-badge ${getStatusColor(brokerStatus.status)}`}>
                                {brokerStatus.status.toUpperCase()}
                            </span>
                        </div>

                        <div className="health-metrics">
                            <div className="health-metric">
                                <Activity size={18} />
                                <div className="metric-data">
                                    <span className="metric-value">{brokerStatus.latency}ms</span>
                                    <span className="metric-label">API Latency</span>
                                </div>
                                <span className={`metric-trend ${brokerStatus.latency < 50 ? 'good' : 'warning'}`}>
                                    {brokerStatus.latency < 50 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                                </span>
                            </div>

                            <div className="health-metric">
                                <Clock size={18} />
                                <div className="metric-data">
                                    <span className="metric-value">{brokerStatus.lastSuccess}</span>
                                    <span className="metric-label">Last Successful Order</span>
                                </div>
                                <span className="metric-trend good">
                                    <CheckCircle size={14} />
                                </span>
                            </div>

                            <div className="health-metric">
                                <AlertTriangle size={18} />
                                <div className="metric-data">
                                    <span className="metric-value">{brokerStatus.errorRate}%</span>
                                    <span className="metric-label">Error Rate</span>
                                </div>
                                <span className={`metric-trend ${brokerStatus.errorRate < 1 ? 'good' : 'warning'}`}>
                                    {brokerStatus.errorRate < 1 ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                                </span>
                            </div>

                            <div className="health-metric">
                                <Zap size={18} />
                                <div className="metric-data">
                                    <span className="metric-value">{brokerStatus.ordersToday.toLocaleString()}</span>
                                    <span className="metric-label">Orders Today</span>
                                </div>
                            </div>
                        </div>

                        <div className="uptime-bar">
                            <div className="uptime-header">
                                <span>Uptime (30 days)</span>
                                <span className="uptime-value">{brokerStatus.uptime}%</span>
                            </div>
                            <div className="uptime-track">
                                <div className="uptime-fill" style={{ width: `${brokerStatus.uptime}%` }} />
                            </div>
                        </div>
                    </div>

                    <div className="health-card components">
                        <h4>System Components</h4>
                        <div className="components-list">
                            {systemComponents.map((comp, idx) => (
                                <div key={idx} className="component-item">
                                    <div className={`component-status ${getStatusColor(comp.status)}`}>
                                        <CheckCircle size={14} />
                                    </div>
                                    <span className="component-name">{comp.name}</span>
                                    <span className="component-latency">{comp.latency}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* User Controls */}
            <div className="user-controls-section">
                <div className="section-header">
                    <h2>
                        <Users size={20} />
                        User Access Controls
                    </h2>
                    <p>Manage individual user trading permissions</p>
                </div>

                <div className="users-table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Strategies</th>
                                <th>Orders Today</th>
                                <th>P&L</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className={user.status === 'blocked' ? 'blocked' : ''}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="user-avatar">{user.name.charAt(0)}</div>
                                            <div className="user-info">
                                                <span className="user-name">{user.name}</span>
                                                <span className="user-id">{user.id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{user.strategies}</td>
                                    <td>{user.ordersToday}</td>
                                    <td>
                                        <span className={`pnl ${user.pnl >= 0 ? 'positive' : 'negative'}`}>
                                            {user.pnl >= 0 ? '+' : ''}₹{user.pnl.toLocaleString()}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`user-status-badge ${user.status}`}>
                                            {user.status === 'active' && <Play size={10} />}
                                            {user.status === 'paused' && <Pause size={10} />}
                                            {user.status === 'blocked' && <Ban size={10} />}
                                            {user.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="user-actions">
                                            {user.status !== 'active' && (
                                                <button
                                                    className="action-btn resume"
                                                    onClick={() => toggleUserStatus(user.id, 'active')}
                                                    title="Resume Trading"
                                                >
                                                    <Play size={14} />
                                                </button>
                                            )}
                                            {user.status === 'active' && (
                                                <button
                                                    className="action-btn pause"
                                                    onClick={() => toggleUserStatus(user.id, 'paused')}
                                                    title="Pause Trading"
                                                >
                                                    <Pause size={14} />
                                                </button>
                                            )}
                                            {user.status !== 'blocked' && (
                                                <button
                                                    className="action-btn block"
                                                    onClick={() => toggleUserStatus(user.id, 'blocked')}
                                                    title="Block User"
                                                >
                                                    <Ban size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Confirmation Modal Language */}
            <div className="compliance-notice">
                <Shield size={18} />
                <div>
                    <strong>Broker Control Notice</strong>
                    <p>All control actions are logged and auditable. Changes take effect immediately and will affect live market operations.</p>
                </div>
            </div>
        </div>
    )
}
