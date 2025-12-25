import { useState, useEffect } from 'react'
import {
    Users, FileText, ShieldCheck, Server, Settings,
    TrendingUp, CheckCircle,
    Plus, Download, RefreshCw
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { usersAPI, auditAPI, checkAPIHealth } from '../services/api'
import './AdminDashboard.css'

interface ServiceHealth {
    name: string
    status: 'healthy' | 'degraded' | 'down'
    latency: string
    uptime: string
}

interface AdminStats {
    totalUsers: number
    totalSignals: number // Derived from audit logs or orders
    activeRules: number
    systemUptime: string
}

// Keep static for demo as backend doesn't have dynamic rules engine yet
const rules = [
    { id: 1, name: 'Market Hours Check', code: 'MKT_HOURS', category: 'exchange', status: 'active', priority: 10 },
    { id: 2, name: 'Max Order Value', code: 'MAX_ORD_VAL', category: 'broker', status: 'active', priority: 20 },
    { id: 3, name: 'Rate Limit', code: 'RATE_LIMIT', category: 'system', status: 'active', priority: 5 },
    { id: 4, name: 'Lot Size Validation', code: 'LOT_SIZE', category: 'exchange', status: 'active', priority: 15 },
    { id: 5, name: 'Circuit Breaker', code: 'CIRCUIT_BRK', category: 'exchange', status: 'draft', priority: 10 },
]

// Mock activity data (would come from time-series DB in prod)
const activityData = [
    { time: '09:00', signals: 120 },
    { time: '10:00', signals: 450 },
    { time: '11:00', signals: 890 },
    { time: '12:00', signals: 560 },
    { time: '13:00', signals: 670 },
    { time: '14:00', signals: 900 },
    { time: '15:00', signals: 340 },
    { time: '16:00', signals: 120 },
]

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminStats>({
        totalUsers: 0,
        totalSignals: 0,
        activeRules: 4,
        systemUptime: '99.9%'
    })
    const [recentUsers, setRecentUsers] = useState<any[]>([])
    const [healthDetails, setHealthDetails] = useState<ServiceHealth[]>([
        { name: 'Backend API', status: 'healthy', latency: '...', uptime: '100%' },
        { name: 'Database', status: 'healthy', latency: '...', uptime: '100%' },
    ])
    const [isLoading, setIsLoading] = useState(false)

    const fetchAdminData = async () => {
        setIsLoading(true)
        try {
            const [usersData, auditStats, isBackendUp] = await Promise.all([
                usersAPI.getAll(),
                auditAPI.getStats(),
                checkAPIHealth()
            ])

            setStats({
                totalUsers: usersData.users.length,
                totalSignals: auditStats.totalToday,
                activeRules: 4,
                systemUptime: isBackendUp ? '99.99%' : 'Down'
            })

            setRecentUsers(usersData.users.slice(0, 5))

            setHealthDetails([
                {
                    name: 'Backend API',
                    status: isBackendUp ? 'healthy' : 'down',
                    latency: isBackendUp ? '25ms' : '-',
                    uptime: isBackendUp ? '99.99%' : '0%'
                },
                {
                    name: 'Database',
                    status: isBackendUp ? 'healthy' : 'down',
                    latency: isBackendUp ? '5ms' : '-',
                    uptime: '100%'
                },
                // Mock others as they are not exposed via API yet
                { name: 'Compliance Engine', status: 'healthy', latency: '12ms', uptime: '100%' },
                { name: 'Order Gateway', status: 'healthy', latency: '45ms', uptime: '99.9%' }
            ])

        } catch (error) {
            console.error('Failed to fetch admin data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchAdminData()
    }, [])

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
                    <button className="btn btn-primary" onClick={fetchAdminData}>
                        <RefreshCw size={16} className={isLoading ? 'spin' : ''} />
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
                        <span className="stat-value">{stats.totalUsers}</span>
                        <span className="stat-label">Total Users</span>
                        <span className="stat-change positive">Registered</span>
                    </div>
                </div>

                <div className="stat-card-admin">
                    <div className="stat-icon signals">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.totalSignals}</span>
                        <span className="stat-label">System Events Today</span>
                        <span className="stat-change positive">Active</span>
                    </div>
                </div>

                <div className="stat-card-admin">
                    <div className="stat-icon rules">
                        <ShieldCheck size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.activeRules}</span>
                        <span className="stat-label">Active Rules</span>
                        <span className="stat-change neutral">2 in draft</span>
                    </div>
                </div>

                <div className="stat-card-admin">
                    <div className="stat-icon health">
                        <Server size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.systemUptime}</span>
                        <span className="stat-label">System Uptime</span>
                        <span className="stat-change positive">Health Check</span>
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
                            {healthDetails.map((service, idx) => (
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

                {/* Recent Users */}
                <div className="card approvals-card">
                    <div className="card-header">
                        <h3 className="card-title">Recent Users</h3>
                        <span className="pending-count">{recentUsers.length}</span>
                    </div>
                    <div className="approvals-list">
                        {recentUsers.map(user => (
                            <div key={user.id} className="approval-item">
                                <div className="approval-info">
                                    <div className="approval-avatar">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="approval-details">
                                        <span className="approval-name">{user.name}</span>
                                        <span className="approval-email">{user.email}</span>
                                        <span className="approval-type">{user.role}</span>
                                    </div>
                                </div>
                                <div className="approval-actions">
                                    <button className="btn-icon approve" title="Details">
                                        <Settings size={18} />
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
