import {
    Users, FileText, ShieldCheck, Server, Settings,
    TrendingUp, CheckCircle, XCircle,
    Plus, Download, RefreshCw
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import './AdminDashboard.css'

const systemHealth = [
    { name: 'API Gateway', status: 'healthy', latency: '12ms', uptime: '100%' },
    { name: 'Compliance Engine', status: 'healthy', latency: '45ms', uptime: '100%' },
    { name: 'Order Service', status: 'healthy', latency: '23ms', uptime: '99.99%' },
    { name: 'Kafka Cluster', status: 'healthy', latency: '8ms', uptime: '99.9%' },
    { name: 'PostgreSQL', status: 'healthy', latency: '5ms', uptime: '100%' },
    { name: 'Redis Cache', status: 'healthy', latency: '1ms', uptime: '100%' },
]

const rules = [
    { id: 1, name: 'Market Hours Check', code: 'MKT_HOURS', category: 'exchange', status: 'active', priority: 10 },
    { id: 2, name: 'Max Order Value', code: 'MAX_ORD_VAL', category: 'broker', status: 'active', priority: 20 },
    { id: 3, name: 'Rate Limit', code: 'RATE_LIMIT', category: 'system', status: 'active', priority: 5 },
    { id: 4, name: 'Lot Size Validation', code: 'LOT_SIZE', category: 'exchange', status: 'active', priority: 15 },
    { id: 5, name: 'Circuit Breaker', code: 'CIRCUIT_BRK', category: 'exchange', status: 'draft', priority: 10 },
]

const pendingApprovals = [
    { id: 1, name: 'John Doe', email: 'john@example.com', type: 'trader', date: '2024-12-23' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', type: 'strategy_dev', date: '2024-12-22' },
    { id: 3, name: 'Acme Trading', email: 'admin@acme.com', type: 'broker', date: '2024-12-21' },
]

const activityData = [
    { time: '00:00', signals: 120 },
    { time: '04:00', signals: 80 },
    { time: '08:00', signals: 450 },
    { time: '09:00', signals: 1200 },
    { time: '10:00', signals: 2100 },
    { time: '11:00', signals: 1800 },
    { time: '12:00', signals: 1400 },
    { time: '13:00', signals: 1600 },
    { time: '14:00', signals: 1900 },
    { time: '15:00', signals: 800 },
    { time: '16:00', signals: 200 },
    { time: '20:00', signals: 50 },
]

export default function AdminDashboard() {
    return (
        <div className="admin-dashboard">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>System Administration</h1>
                    <p>Manage platform settings, users, and compliance rules</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary">
                        <Download size={16} />
                        Export Report
                    </button>
                    <button className="btn btn-primary">
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="admin-stats">
                <div className="stat-card-admin">
                    <div className="stat-icon users">
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">12,450</span>
                        <span className="stat-label">Total Users</span>
                        <span className="stat-change positive">+245 this week</span>
                    </div>
                </div>

                <div className="stat-card-admin">
                    <div className="stat-icon signals">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">1.2M</span>
                        <span className="stat-label">Signals Today</span>
                        <span className="stat-change positive">+15% vs yesterday</span>
                    </div>
                </div>

                <div className="stat-card-admin">
                    <div className="stat-icon rules">
                        <ShieldCheck size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">24</span>
                        <span className="stat-label">Active Rules</span>
                        <span className="stat-change neutral">2 in draft</span>
                    </div>
                </div>

                <div className="stat-card-admin">
                    <div className="stat-icon health">
                        <Server size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">99.99%</span>
                        <span className="stat-label">System Uptime</span>
                        <span className="stat-change positive">All systems healthy</span>
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="admin-grid">
                {/* System Health */}
                <div className="card system-health-card">
                    <div className="card-header">
                        <h3 className="card-title">System Health</h3>
                        <span className="all-healthy">
                            <CheckCircle size={16} />
                            All Healthy
                        </span>
                    </div>
                    <div className="card-body">
                        <div className="health-grid">
                            {systemHealth.map((service, idx) => (
                                <div key={idx} className="health-item">
                                    <div className="health-status">
                                        <span className={`status-dot ${service.status}`} />
                                        <span className="service-name">{service.name}</span>
                                    </div>
                                    <div className="health-metrics">
                                        <span className="latency">{service.latency}</span>
                                        <span className="uptime">{service.uptime}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Activity Chart */}
                <div className="card activity-card">
                    <div className="card-header">
                        <h3 className="card-title">Signal Activity (24h)</h3>
                    </div>
                    <div className="chart-body">
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={activityData}>
                                <defs>
                                    <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                                <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--surface-primary)',
                                        border: '1px solid var(--border-primary)',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="signals"
                                    stroke="#6366F1"
                                    strokeWidth={2}
                                    fill="url(#activityGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Rules & Approvals */}
            <div className="rules-approvals-grid">
                {/* Compliance Rules */}
                <div className="card rules-card">
                    <div className="card-header">
                        <h3 className="card-title">Compliance Rules</h3>
                        <button className="btn btn-primary btn-sm">
                            <Plus size={14} />
                            Add Rule
                        </button>
                    </div>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Rule Name</th>
                                    <th>Code</th>
                                    <th>Category</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rules.map(rule => (
                                    <tr key={rule.id}>
                                        <td className="rule-name">{rule.name}</td>
                                        <td className="rule-code">{rule.code}</td>
                                        <td>
                                            <span className={`category-badge ${rule.category}`}>
                                                {rule.category}
                                            </span>
                                        </td>
                                        <td>{rule.priority}</td>
                                        <td>
                                            <span className={`badge ${rule.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                                                {rule.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pending Approvals */}
                <div className="card approvals-card">
                    <div className="card-header">
                        <h3 className="card-title">Pending Approvals</h3>
                        <span className="pending-count">{pendingApprovals.length}</span>
                    </div>
                    <div className="approvals-list">
                        {pendingApprovals.map(user => (
                            <div key={user.id} className="approval-item">
                                <div className="approval-info">
                                    <div className="approval-avatar">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="approval-details">
                                        <span className="approval-name">{user.name}</span>
                                        <span className="approval-email">{user.email}</span>
                                        <span className="approval-type">{user.type.replace('_', ' ')}</span>
                                    </div>
                                </div>
                                <div className="approval-actions">
                                    <button className="btn-icon approve">
                                        <CheckCircle size={18} />
                                    </button>
                                    <button className="btn-icon reject">
                                        <XCircle size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <h3>Quick Actions</h3>
                <div className="actions-grid">
                    <button className="action-card">
                        <FileText size={24} />
                        <span>Generate Daily Report</span>
                    </button>
                    <button className="action-card">
                        <Download size={24} />
                        <span>Export Audit Logs</span>
                    </button>
                    <button className="action-card">
                        <Users size={24} />
                        <span>Manage Users</span>
                    </button>
                    <button className="action-card">
                        <Settings size={24} />
                        <span>System Settings</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
