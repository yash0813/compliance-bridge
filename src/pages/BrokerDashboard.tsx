import { useState } from 'react'
import {
    ShieldCheck, AlertTriangle, XCircle, Activity,
    Users, Clock, TrendingUp, Power, Zap,
    CheckCircle, AlertOctagon, ArrowUpRight, ArrowDownRight,
    RefreshCw, Download, Filter, MoreHorizontal,
    Eye, Ban, Play
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import './BrokerDashboard.css'

const complianceData = [
    { hour: '09:00', passed: 450, rejected: 5, warnings: 8 },
    { hour: '10:00', passed: 820, rejected: 12, warnings: 15 },
    { hour: '11:00', passed: 650, rejected: 8, warnings: 10 },
    { hour: '12:00', passed: 420, rejected: 3, warnings: 5 },
    { hour: '13:00', passed: 380, rejected: 6, warnings: 7 },
    { hour: '14:00', passed: 590, rejected: 9, warnings: 12 },
    { hour: '15:00', passed: 310, rejected: 4, warnings: 6 },
]

const riskTrendData = [
    { time: '09:00', value: 15 },
    { time: '10:00', value: 32 },
    { time: '11:00', value: 25 },
    { time: '12:00', value: 18 },
    { time: '13:00', value: 28 },
    { time: '14:00', value: 45 },
    { time: '15:00', value: 22 },
]

const orderFlow = [
    { id: 1, time: '10:32:15', user: 'USR_12345', userName: 'Rahul Sharma', strategy: 'Momentum Alpha', symbol: 'RELIANCE', side: 'BUY', qty: 100, price: 2450, status: 'filled' },
    { id: 2, time: '10:32:10', user: 'USR_67890', userName: 'Priya Patel', strategy: 'Mean Reversion', symbol: 'TCS', side: 'SELL', qty: 50, price: 3850, status: 'filled' },
    { id: 3, time: '10:31:55', user: 'USR_12345', userName: 'Rahul Sharma', strategy: 'Momentum Alpha', symbol: 'INFY', side: 'BUY', qty: 75, price: 1450, status: 'pending' },
    { id: 4, time: '10:31:40', user: 'USR_11111', userName: 'Amit Kumar', strategy: 'Breakout Pro', symbol: 'HDFCBANK', side: 'BUY', qty: 40, price: 1620, status: 'filled' },
    { id: 5, time: '10:31:20', user: 'USR_22222', userName: 'Sneha Reddy', strategy: 'Scalper X', symbol: 'SBIN', side: 'SELL', qty: 100, price: 625, status: 'rejected' },
    { id: 6, time: '10:30:55', user: 'USR_33333', userName: 'Vikram Singh', strategy: 'Trend Follow', symbol: 'ICICIBANK', side: 'BUY', qty: 80, price: 1025, status: 'filled' },
]

const activeUsers = [
    { id: 1, name: 'Rahul Sharma', strategies: 3, orders: 45, pnl: 12500, status: 'active' },
    { id: 2, name: 'Priya Patel', strategies: 2, orders: 32, pnl: -3200, status: 'active' },
    { id: 3, name: 'Amit Kumar', strategies: 1, orders: 18, pnl: 8750, status: 'idle' },
    { id: 4, name: 'Sneha Reddy', strategies: 4, orders: 67, pnl: 21000, status: 'active' },
]

const pieData = [
    { name: 'Passed', value: 45312, color: '#10B981' },
    { name: 'Rejected', value: 156, color: '#EF4444' },
    { name: 'Warnings', value: 210, color: '#F59E0B' },
]

const riskAlerts = [
    { id: 1, type: 'high', title: 'Position Limit Exceeded', user: 'USR_22222', time: '2 min ago' },
    { id: 2, type: 'medium', title: 'Unusual Order Volume', user: 'USR_12345', time: '5 min ago' },
    { id: 3, type: 'low', title: 'Strategy Deviation Detected', user: 'USR_67890', time: '10 min ago' },
]

export default function BrokerDashboard() {
    const [killSwitchActive, setKillSwitchActive] = useState(false)
    const [showKillConfirm, setShowKillConfirm] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [selectedTimeframe, setSelectedTimeframe] = useState('today')

    const handleKillSwitch = () => {
        if (!killSwitchActive) {
            setShowKillConfirm(true)
        } else {
            setKillSwitchActive(false)
        }
    }

    const confirmKill = () => {
        setKillSwitchActive(true)
        setShowKillConfirm(false)
    }

    const handleRefresh = async () => {
        setIsRefreshing(true)
        await new Promise(r => setTimeout(r, 1000))
        setIsRefreshing(false)
    }

    const totalSignals = 45678
    const passedSignals = 45312
    const complianceRate = ((passedSignals / totalSignals) * 100).toFixed(1)

    return (
        <div className="broker-dashboard">
            {/* Page Header */}
            <div className="page-header">
                <div className="page-header-content">
                    <div className="page-title-group">
                        <h1>Execution Control Center</h1>
                        <p>Real-time monitoring and control of algorithmic trading activities</p>
                    </div>
                    <div className="page-header-meta">
                        <div className="live-indicator">
                            <span className="status-dot active pulse" />
                            <span>Live Data</span>
                        </div>
                        <span className="last-updated">Updated just now</span>
                    </div>
                </div>
                <div className="page-header-actions">
                    <select
                        className="form-select timeframe-select"
                        value={selectedTimeframe}
                        onChange={(e) => setSelectedTimeframe(e.target.value)}
                    >
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                    </select>
                    <button className="btn btn-secondary" onClick={handleRefresh}>
                        <RefreshCw size={16} className={isRefreshing ? 'spin' : ''} />
                        Refresh
                    </button>
                    <button className="btn btn-secondary">
                        <Download size={16} />
                        Export
                    </button>
                </div>
            </div>

            {/* Kill Switch Panel */}
            <div className={`kill-switch-panel ${killSwitchActive ? 'active' : ''}`}>
                <div className="kill-switch-content">
                    <div className={`kill-switch-icon ${killSwitchActive ? 'danger' : 'success'}`}>
                        <Power size={28} />
                    </div>
                    <div className="kill-switch-info">
                        <div className="kill-switch-header">
                            <h3>Master Kill Switch</h3>
                            <span className={`kill-status-badge ${killSwitchActive ? 'halted' : 'active'}`}>
                                {killSwitchActive ? 'HALTED' : 'TRADING ACTIVE'}
                            </span>
                        </div>
                        <p>
                            {killSwitchActive
                                ? 'All algorithmic trading is HALTED. All pending orders are being rejected automatically.'
                                : 'Trading is active. Toggle to immediately halt all algorithmic trading on the platform.'}
                        </p>
                    </div>
                </div>
                <div className="kill-switch-controls">
                    <div className="kill-switch-stats">
                        <div className="kill-stat">
                            <span className="kill-stat-value">1,234</span>
                            <span className="kill-stat-label">Active Users</span>
                        </div>
                        <div className="kill-stat">
                            <span className="kill-stat-value">89</span>
                            <span className="kill-stat-label">Pending Orders</span>
                        </div>
                    </div>
                    <button
                        className={`kill-toggle-btn ${killSwitchActive ? 'active' : ''}`}
                        onClick={handleKillSwitch}
                    >
                        <div className="toggle-track">
                            <div className="toggle-thumb">
                                {killSwitchActive ? <Ban size={14} /> : <Play size={14} />}
                            </div>
                        </div>
                        <span>{killSwitchActive ? 'Resume Trading' : 'Halt Trading'}</span>
                    </button>
                </div>
            </div>

            {/* Risk Alerts */}
            {riskAlerts.length > 0 && (
                <div className="risk-alerts-panel">
                    <div className="risk-alerts-header">
                        <AlertTriangle size={18} />
                        <span>Active Risk Alerts</span>
                        <span className="alert-count">{riskAlerts.length}</span>
                    </div>
                    <div className="risk-alerts-list">
                        {riskAlerts.map(alert => (
                            <div key={alert.id} className={`risk-alert-item ${alert.type}`}>
                                <div className="alert-indicator" />
                                <div className="alert-content">
                                    <span className="alert-title">{alert.title}</span>
                                    <span className="alert-meta">{alert.user} • {alert.time}</span>
                                </div>
                                <button className="btn btn-ghost btn-sm">
                                    <Eye size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Primary Metrics */}
            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-header">
                        <div className="metric-icon-wrapper primary">
                            <Users size={22} />
                        </div>
                        <button className="btn btn-ghost btn-icon btn-sm">
                            <MoreHorizontal size={16} />
                        </button>
                    </div>
                    <div className="metric-body">
                        <span className="metric-label">Active Users</span>
                        <span className="metric-value">1,234</span>
                        <div className="metric-change positive">
                            <ArrowUpRight size={14} />
                            <span>+12% from yesterday</span>
                        </div>
                    </div>
                    <div className="metric-footer">
                        <div className="mini-chart">
                            <ResponsiveContainer width="100%" height={40}>
                                <AreaChart data={riskTrendData}>
                                    <defs>
                                        <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="value" stroke="#6366F1" fill="url(#userGradient)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-header">
                        <div className="metric-icon-wrapper success">
                            <Zap size={22} />
                        </div>
                        <button className="btn btn-ghost btn-icon btn-sm">
                            <MoreHorizontal size={16} />
                        </button>
                    </div>
                    <div className="metric-body">
                        <span className="metric-label">Orders / Minute</span>
                        <span className="metric-value">456</span>
                        <div className="metric-change positive">
                            <ArrowUpRight size={14} />
                            <span>+8.5% from avg</span>
                        </div>
                    </div>
                    <div className="metric-footer">
                        <div className="mini-chart">
                            <ResponsiveContainer width="100%" height={40}>
                                <AreaChart data={riskTrendData}>
                                    <defs>
                                        <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="value" stroke="#10B981" fill="url(#orderGradient)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-header">
                        <div className="metric-icon-wrapper warning">
                            <Clock size={22} />
                        </div>
                        <button className="btn btn-ghost btn-icon btn-sm">
                            <MoreHorizontal size={16} />
                        </button>
                    </div>
                    <div className="metric-body">
                        <span className="metric-label">Pending Orders</span>
                        <span className="metric-value">89</span>
                        <div className="metric-change negative">
                            <ArrowDownRight size={14} />
                            <span>-5% from peak</span>
                        </div>
                    </div>
                    <div className="metric-footer">
                        <div className="pending-bar">
                            <div className="pending-progress" style={{ width: '35%' }} />
                        </div>
                        <span className="pending-label">35% of daily limit</span>
                    </div>
                </div>

                <div className="metric-card success">
                    <div className="metric-header">
                        <div className="metric-icon-wrapper success">
                            <ShieldCheck size={22} />
                        </div>
                        <button className="btn btn-ghost btn-icon btn-sm">
                            <MoreHorizontal size={16} />
                        </button>
                    </div>
                    <div className="metric-body">
                        <span className="metric-label">Compliance Rate</span>
                        <span className="metric-value">{complianceRate}%</span>
                        <div className="metric-change positive">
                            <ArrowUpRight size={14} />
                            <span>+0.3% improvement</span>
                        </div>
                    </div>
                    <div className="metric-footer">
                        <div className="compliance-mini-stats">
                            <div className="mini-stat">
                                <CheckCircle size={12} />
                                <span>45,312 passed</span>
                            </div>
                            <div className="mini-stat warning">
                                <AlertTriangle size={12} />
                                <span>210 warnings</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Compliance Overview */}
            <div className="compliance-section">
                <div className="section-header">
                    <div className="section-title-group">
                        <h2>Compliance Overview</h2>
                        <p>Real-time signal validation status</p>
                    </div>
                    <div className="section-actions">
                        <div className="compliance-score-badge">
                            <CheckCircle size={16} />
                            <span>Score: {complianceRate}%</span>
                        </div>
                    </div>
                </div>

                <div className="compliance-grid">
                    <div className="compliance-stats">
                        <div className="stat-card-modern signals">
                            <div className="stat-icon">
                                <Activity size={24} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">{totalSignals.toLocaleString()}</span>
                                <span className="stat-label">Total Signals</span>
                            </div>
                            <div className="stat-trend positive">
                                <TrendingUp size={14} />
                                <span>+15%</span>
                            </div>
                        </div>

                        <div className="stat-card-modern passed">
                            <div className="stat-icon success">
                                <CheckCircle size={24} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">{passedSignals.toLocaleString()}</span>
                                <span className="stat-label">Passed (99.2%)</span>
                            </div>
                            <div className="stat-trend positive">
                                <TrendingUp size={14} />
                                <span>+12%</span>
                            </div>
                        </div>

                        <div className="stat-card-modern rejected">
                            <div className="stat-icon danger">
                                <XCircle size={24} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">156</span>
                                <span className="stat-label">Rejected (0.34%)</span>
                            </div>
                            <div className="stat-trend negative">
                                <ArrowDownRight size={14} />
                                <span>-8%</span>
                            </div>
                        </div>

                        <div className="stat-card-modern warnings">
                            <div className="stat-icon warning">
                                <AlertTriangle size={24} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">210</span>
                                <span className="stat-label">Warnings (0.46%)</span>
                            </div>
                            <div className="stat-trend neutral">
                                <span>Same</span>
                            </div>
                        </div>
                    </div>

                    <div className="compliance-chart-container">
                        <div className="donut-chart-wrapper">
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={3}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => value.toLocaleString()}
                                        contentStyle={{
                                            background: 'var(--surface-primary)',
                                            border: '1px solid var(--border-primary)',
                                            borderRadius: '12px',
                                            boxShadow: 'var(--shadow-lg)'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="donut-center">
                                <span className="donut-value">{complianceRate}%</span>
                                <span className="donut-label">Compliance</span>
                            </div>
                        </div>
                        <div className="chart-legend">
                            {pieData.map((item, index) => (
                                <div key={index} className="legend-item">
                                    <span className="legend-color" style={{ background: item.color }} />
                                    <span className="legend-name">{item.name}</span>
                                    <span className="legend-value">{item.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-section">
                <div className="chart-card">
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">Hourly Compliance Activity</h3>
                            <p className="card-subtitle">Passed vs Rejected signals over time</p>
                        </div>
                        <div className="card-actions">
                            <button className="btn btn-ghost btn-sm">
                                <Filter size={14} />
                                Filter
                            </button>
                        </div>
                    </div>
                    <div className="chart-body">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={complianceData} barGap={2}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
                                <XAxis
                                    dataKey="hour"
                                    tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                                    axisLine={{ stroke: 'var(--border-primary)' }}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--surface-primary)',
                                        border: '1px solid var(--border-primary)',
                                        borderRadius: '12px',
                                        boxShadow: 'var(--shadow-lg)'
                                    }}
                                />
                                <Bar dataKey="passed" fill="#10B981" radius={[4, 4, 0, 0]} name="Passed" />
                                <Bar dataKey="rejected" fill="#EF4444" radius={[4, 4, 0, 0]} name="Rejected" />
                                <Bar dataKey="warnings" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Warnings" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Order Flow & Active Users */}
            <div className="data-section">
                <div className="order-flow-card">
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">Live Order Flow</h3>
                            <p className="card-subtitle">Real-time order execution stream</p>
                        </div>
                        <div className="card-actions">
                            <div className="live-badge">
                                <span className="status-dot active pulse" />
                                Live
                            </div>
                            <button className="btn btn-ghost btn-sm">
                                <Filter size={14} />
                            </button>
                        </div>
                    </div>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>User</th>
                                    <th>Strategy</th>
                                    <th>Symbol</th>
                                    <th>Side</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {orderFlow.map(order => (
                                    <tr key={order.id}>
                                        <td className="time-cell">{order.time}</td>
                                        <td>
                                            <div className="user-cell">
                                                <div className="user-avatar-mini">{order.userName.charAt(0)}</div>
                                                <div className="user-info-mini">
                                                    <span className="user-name-mini">{order.userName}</span>
                                                    <span className="user-id-mini">{order.user}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="strategy-cell">{order.strategy}</td>
                                        <td className="symbol-cell">{order.symbol}</td>
                                        <td>
                                            <span className={`side-badge ${order.side.toLowerCase()}`}>
                                                {order.side}
                                            </span>
                                        </td>
                                        <td>{order.qty}</td>
                                        <td className="price-cell">₹{order.price.toLocaleString()}</td>
                                        <td>
                                            <span className={`badge badge-${order.status === 'filled' ? 'success' :
                                                order.status === 'pending' ? 'warning' : 'error'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn btn-ghost btn-icon btn-sm">
                                                <MoreHorizontal size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="card-footer">
                        <button className="btn btn-ghost btn-sm">View All Orders →</button>
                    </div>
                </div>

                <div className="active-users-card">
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">Active Traders</h3>
                            <p className="card-subtitle">Currently trading users</p>
                        </div>
                        <span className="user-count-badge">{activeUsers.length} online</span>
                    </div>
                    <div className="active-users-list">
                        {activeUsers.map(user => (
                            <div key={user.id} className="active-user-item">
                                <div className="user-avatar-wrapper">
                                    <div className="user-avatar-sm">{user.name.charAt(0)}</div>
                                    <span className={`user-status-dot ${user.status}`} />
                                </div>
                                <div className="user-info">
                                    <span className="user-name">{user.name}</span>
                                    <span className="user-stats">
                                        {user.strategies} strategies • {user.orders} orders
                                    </span>
                                </div>
                                <div className={`user-pnl ${user.pnl >= 0 ? 'positive' : 'negative'}`}>
                                    {user.pnl >= 0 ? '+' : ''}₹{Math.abs(user.pnl).toLocaleString()}
                                </div>
                                <button className="btn btn-ghost btn-icon btn-sm">
                                    <Eye size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="card-footer">
                        <button className="btn btn-ghost btn-sm">View All Users →</button>
                    </div>
                </div>
            </div>

            {/* Kill Confirm Modal */}
            {showKillConfirm && (
                <div className="modal-overlay">
                    <div className="modal kill-modal">
                        <div className="modal-icon danger">
                            <AlertOctagon size={48} />
                        </div>
                        <h2>Activate Kill Switch?</h2>
                        <p>This will immediately halt ALL algorithmic trading on the platform. All pending signals will be rejected and no new orders will be processed.</p>

                        <div className="kill-impact">
                            <div className="impact-item">
                                <span className="impact-value">1,234</span>
                                <span className="impact-label">Users Affected</span>
                            </div>
                            <div className="impact-item">
                                <span className="impact-value">89</span>
                                <span className="impact-label">Pending Orders</span>
                            </div>
                            <div className="impact-item">
                                <span className="impact-value">45</span>
                                <span className="impact-label">Active Strategies</span>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn btn-secondary btn-lg" onClick={() => setShowKillConfirm(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-danger btn-lg" onClick={confirmKill}>
                                <Power size={18} />
                                Confirm - Halt Trading
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
