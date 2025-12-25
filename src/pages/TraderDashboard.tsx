import { useState, useEffect } from 'react'
import { ordersAPI, positionsAPI, strategiesAPI } from '../services/api'
import {
    TrendingUp, TrendingDown, DollarSign, Target,
    PieChart, ArrowUpRight, ArrowDownRight,
    MoreHorizontal, RefreshCw, Plus, Zap, Clock,
    Eye, Play, Pause, Settings, ChevronRight, Wallet,
    Calendar, Download
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import './TraderDashboard.css'

// =============================================
// MOCK DATA - Replace with actual API calls later
// TODO: Connect to WebSocket for real-time updates
// Author: Yash
// Last Updated: 24 Dec 2024
// =============================================

// Keep P&L data mocked for now until backend supports timeseries aggregation
const pnlData = [
    { time: '09:15', value: 0, benchmark: 0 },
    { time: '10:00', value: 2500, benchmark: 1800 },
    { time: '10:30', value: 1800, benchmark: 2200 },
    { time: '11:00', value: 4200, benchmark: 3100 },
    { time: '11:30', value: 3800, benchmark: 3500 },
    { time: '12:00', value: 6500, benchmark: 4200 },
    { time: '12:30', value: 8200, benchmark: 5100 },
    { time: '13:00', value: 7500, benchmark: 5800 },
    { time: '13:30', value: 9800, benchmark: 6200 },
    { time: '14:00', value: 11200, benchmark: 7100 },
    { time: '14:30', value: 10500, benchmark: 7800 },
    { time: '15:00', value: 12450, benchmark: 8200 },
]

const weeklyPnL = [
    { day: 'Mon', profit: 8500, loss: -2100 },
    { day: 'Tue', profit: 6200, loss: -3400 },
    { day: 'Wed', profit: 9800, loss: -1200 },
    { day: 'Thu', profit: 4500, loss: -4200 },
    { day: 'Fri', profit: 12450, loss: -800 },
]

export default function TraderDashboard() {
    const [timeRange, setTimeRange] = useState('today')
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [positions, setPositions] = useState<any[]>([])
    const [orders, setOrders] = useState<any[]>([])
    const [strategies, setStrategies] = useState<any[]>([])
    const [stats] = useState({
        sharpeRatio: '1.85',
        maxDrawdown: '-4.2%',
        avgTrade: '₹856'
    })

    const fetchDashboardData = async () => {
        setIsRefreshing(true)
        try {
            const [posData, ordData, strData] = await Promise.all([
                positionsAPI.getAll(),
                ordersAPI.getAll({ limit: 10 }),
                strategiesAPI.getAll(),
                ordersAPI.getStats()
            ])

            // Map API positions to UI format
            setPositions(posData.positions.map(p => ({
                symbol: p.symbol,
                exchange: 'NSE', // Default for now
                qty: p.quantity,
                avgPrice: p.avgEntryPrice,
                ltp: p.currentPrice,
                pnl: p.unrealizedPnL,
                pnlPct: p.pnlPercentage,
                product: 'MIS', // Default
                change: 0 // Not available in API yet
            })))

            // Map API orders to UI format
            setOrders(ordData.orders.map(o => ({
                id: o.orderId,
                time: new Date(o.createdAt).toLocaleTimeString(),
                symbol: o.symbol,
                side: o.side,
                qty: o.quantity,
                price: o.price,
                status: o.status,
                type: 'LIMIT' // Default
            })))

            // Map API strategies to UI format
            setStrategies(strData.strategies.map((s: any) => ({
                id: s._id,
                name: s.name,
                status: s.isActive ? 'active' : 'paused',
                pnl: s.metrics?.totalPnL || 0,
                winRate: s.metrics?.winRate || 0,
                trades: s.metrics?.totalTrades || 0,
                roi: s.metrics?.profitFactor ? (s.metrics.profitFactor - 1) * 100 : 0,
                color: s.isPaused ? '#F59E0B' : '#10B981'
            })))

            // Update stats if available (using order stats for avg trade count maybe?)
            // setStats(...) 

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error)
        } finally {
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const totalPnl = positions.reduce((acc, p) => acc + p.pnl, 0)
    const totalPnlPct = 2.3 // Calculate from capital base if available
    const winRate = strategies.length > 0
        ? Math.round(strategies.reduce((acc, s) => acc + s.winRate, 0) / strategies.length)
        : 0
    const exposure = positions.reduce((acc, p) => acc + (p.ltp * p.qty), 0)

    const handleRefresh = () => {
        fetchDashboardData()
    }

    const quickStats = [
        { label: 'Sharpe Ratio', value: stats.sharpeRatio, change: '+0.12', positive: true },
        { label: 'Max Drawdown', value: stats.maxDrawdown, change: '-0.5%', positive: true },
        { label: 'Avg Trade', value: stats.avgTrade, change: '+₹42', positive: true },
    ]

    return (
        <div className="trader-dashboard">
            {/* Page Header */}
            <div className="page-header">
                <div className="page-header-left">
                    <div className="page-title-group">
                        <h1>Trading Dashboard</h1>
                        <p>Real-time overview of your trading activity</p>
                    </div>
                    <div className="header-quick-stats">
                        {quickStats.map((stat, idx) => (
                            <div key={idx} className="quick-stat-item">
                                <span className="quick-stat-label">{stat.label}</span>
                                <span className="quick-stat-value">{stat.value}</span>
                                <span className={`quick-stat-change ${stat.positive ? 'positive' : 'negative'}`}>
                                    {stat.change}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="page-header-right">
                    <select
                        className="form-select"
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                    >
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="year">This Year</option>
                    </select>
                    <button className="btn btn-secondary" onClick={handleRefresh}>
                        <RefreshCw size={16} className={isRefreshing ? 'spin' : ''} />
                        Refresh
                    </button>
                    <button className="btn btn-primary">
                        <Plus size={16} />
                        New Order
                    </button>
                </div>
            </div>

            {/* Primary Metrics */}
            <div className="metrics-grid-4">
                <div className={`metric-card-v2 ${totalPnl >= 0 ? 'success' : 'danger'}`}>
                    <div className="metric-card-header">
                        <div className={`metric-icon-circle ${totalPnl >= 0 ? 'success' : 'danger'}`}>
                            <DollarSign size={22} />
                        </div>
                        <div className={`metric-trend-badge ${totalPnl >= 0 ? 'positive' : 'negative'}`}>
                            {totalPnl >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            {totalPnlPct}%
                        </div>
                    </div>
                    <div className="metric-card-body">
                        <span className="metric-title">Day P&L</span>
                        <span className={`metric-amount ${totalPnl >= 0 ? 'positive' : 'negative'}`}>
                            {totalPnl >= 0 ? '+' : ''}₹{Math.abs(totalPnl).toLocaleString()}
                        </span>
                    </div>
                    <div className="metric-card-chart">
                        <ResponsiveContainer width="100%" height={50}>
                            <AreaChart data={pnlData.slice(-6)}>
                                <defs>
                                    <linearGradient id="pnlMiniGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={totalPnl >= 0 ? "#10B981" : "#EF4444"} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={totalPnl >= 0 ? "#10B981" : "#EF4444"} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={totalPnl >= 0 ? "#10B981" : "#EF4444"}
                                    fill="url(#pnlMiniGradient)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="metric-card-v2">
                    <div className="metric-card-header">
                        <div className="metric-icon-circle primary">
                            <Target size={22} />
                        </div>
                        <div className="metric-trend-badge positive">
                            <ArrowUpRight size={12} />
                            4.1%
                        </div>
                    </div>
                    <div className="metric-card-body">
                        <span className="metric-title">Total P&L</span>
                        <span className="metric-amount positive">+₹89,230</span>
                    </div>
                    <div className="metric-card-footer">
                        <span className="metric-sub-label">Since inception</span>
                        <span className="metric-sub-value">32 days</span>
                    </div>
                </div>

                <div className="metric-card-v2">
                    <div className="metric-card-header">
                        <div className="metric-icon-circle warning">
                            <PieChart size={22} />
                        </div>
                        <button className="btn btn-ghost btn-icon btn-sm">
                            <MoreHorizontal size={16} />
                        </button>
                    </div>
                    <div className="metric-card-body">
                        <span className="metric-title">Win Rate</span>
                        <span className="metric-amount">{winRate}%</span>
                    </div>
                    <div className="metric-card-footer">
                        <div className="win-rate-bar">
                            <div className="win-bar" style={{ width: `${winRate}%` }} />
                            <div className="lose-bar" style={{ width: `${100 - winRate}%` }} />
                        </div>
                        <span className="metric-sub-label">45 wins / 22 losses</span>
                    </div>
                </div>

                <div className="metric-card-v2">
                    <div className="metric-card-header">
                        <div className="metric-icon-circle info">
                            <Wallet size={22} />
                        </div>
                        <button className="btn btn-ghost btn-icon btn-sm">
                            <MoreHorizontal size={16} />
                        </button>
                    </div>
                    <div className="metric-card-body">
                        <span className="metric-title">Exposure</span>
                        <span className="metric-amount">₹{(exposure / 100000).toFixed(1)}L</span>
                    </div>
                    <div className="metric-card-footer">
                        <div className="exposure-bar">
                            <div className="exposure-fill" style={{ width: '24.5%' }} />
                        </div>
                        <span className="metric-sub-label">24.5% of capital utilized</span>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="charts-grid">
                <div className="chart-card large">
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">P&L Performance</h3>
                            <p className="card-subtitle">Intraday profit and loss curve</p>
                        </div>
                        <div className="card-actions">
                            <div className="chart-legend-inline">
                                <span className="legend-dot" style={{ background: '#10B981' }} />
                                <span>Your P&L</span>
                                <span className="legend-dot" style={{ background: '#6366F1' }} />
                                <span>Benchmark</span>
                            </div>
                            <button className="btn btn-ghost btn-sm">
                                <Download size={14} />
                            </button>
                        </div>
                    </div>
                    <div className="chart-body">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={pnlData}>
                                <defs>
                                    <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="benchmarkGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
                                <XAxis
                                    dataKey="time"
                                    tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                                    axisLine={{ stroke: 'var(--border-primary)' }}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) => `₹${value / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--surface-primary)',
                                        border: '1px solid var(--border-primary)',
                                        borderRadius: '12px',
                                        boxShadow: 'var(--shadow-lg)'
                                    }}
                                    formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="benchmark"
                                    stroke="#6366F1"
                                    strokeWidth={2}
                                    fill="url(#benchmarkGradient)"
                                    strokeDasharray="5 5"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#10B981"
                                    strokeWidth={2}
                                    fill="url(#pnlGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card">
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">Weekly Summary</h3>
                            <p className="card-subtitle">Profit vs Loss by day</p>
                        </div>
                        <button className="btn btn-ghost btn-sm">
                            <Calendar size={14} />
                        </button>
                    </div>
                    <div className="chart-body">
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={weeklyPnL}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
                                <XAxis
                                    dataKey="day"
                                    tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) => `${value / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--surface-primary)',
                                        border: '1px solid var(--border-primary)',
                                        borderRadius: '12px',
                                    }}
                                />
                                <Bar dataKey="profit" fill="#10B981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="loss" fill="#EF4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="card-footer">
                        <div className="weekly-summary">
                            <div className="summary-item">
                                <span className="summary-label">Total Profit</span>
                                <span className="summary-value positive">+₹41,450</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Total Loss</span>
                                <span className="summary-value negative">-₹11,700</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Net</span>
                                <span className="summary-value positive">+₹29,750</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Strategies Section */}
            <div className="strategies-section">
                <div className="section-header">
                    <div>
                        <h2>Active Strategies</h2>
                        <p>Monitor and manage your algo strategies</p>
                    </div>
                    <button className="btn btn-primary btn-sm">
                        <Plus size={14} />
                        Add Strategy
                    </button>
                </div>
                <div className="strategies-grid">
                    {strategies.map(strategy => (
                        <div key={strategy.id} className="strategy-card">
                            <div className="strategy-header">
                                <div className="strategy-info">
                                    <div className="strategy-icon" style={{ background: strategy.color }}>
                                        <Zap size={18} />
                                    </div>
                                    <div>
                                        <h4 className="strategy-name">{strategy.name}</h4>
                                        <span className={`strategy-status ${strategy.status}`}>
                                            {strategy.status === 'active' ? <Play size={10} /> : <Pause size={10} />}
                                            {strategy.status}
                                        </span>
                                    </div>
                                </div>
                                <button className="btn btn-ghost btn-icon btn-sm">
                                    <Settings size={16} />
                                </button>
                            </div>
                            <div className="strategy-metrics">
                                <div className="strategy-metric">
                                    <span className="metric-label">P&L</span>
                                    <span className={`metric-value ${strategy.pnl >= 0 ? 'positive' : 'negative'}`}>
                                        {strategy.pnl >= 0 ? '+' : ''}₹{strategy.pnl.toLocaleString()}
                                    </span>
                                </div>
                                <div className="strategy-metric">
                                    <span className="metric-label">Win Rate</span>
                                    <span className="metric-value">{strategy.winRate}%</span>
                                </div>
                                <div className="strategy-metric">
                                    <span className="metric-label">ROI</span>
                                    <span className={`metric-value ${strategy.roi >= 0 ? 'positive' : 'negative'}`}>
                                        {strategy.roi >= 0 ? '+' : ''}{strategy.roi}%
                                    </span>
                                </div>
                                <div className="strategy-metric">
                                    <span className="metric-label">Trades</span>
                                    <span className="metric-value">{strategy.trades}</span>
                                </div>
                            </div>
                            <div className="strategy-progress">
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${strategy.winRate}%`, background: strategy.color }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Positions & Orders */}
            <div className="data-grid">
                {/* Positions */}
                <div className="data-card">
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">Active Positions</h3>
                            <p className="card-subtitle">{positions.length} open positions</p>
                        </div>
                        <div className="card-actions">
                            <button className="btn btn-ghost btn-sm">
                                <Settings size={14} />
                            </button>
                            <button className="btn btn-ghost btn-sm">
                                View All
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Symbol</th>
                                    <th>Qty</th>
                                    <th>Avg Price</th>
                                    <th>LTP</th>
                                    <th>P&L</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {positions.map((pos, idx) => (
                                    <tr key={idx}>
                                        <td>
                                            <div className="symbol-cell">
                                                <div className="symbol-icon" style={{
                                                    background: pos.pnl >= 0
                                                        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15))'
                                                        : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(236, 72, 153, 0.15))'
                                                }}>
                                                    <span style={{ color: pos.pnl >= 0 ? 'var(--success-600)' : 'var(--error-600)' }}>
                                                        {pos.symbol.charAt(0)}
                                                    </span>
                                                </div>
                                                <div className="symbol-info">
                                                    <span className="symbol-name">{pos.symbol}</span>
                                                    <span className="symbol-meta">{pos.exchange} • {pos.product}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{pos.qty}</td>
                                        <td>₹{pos.avgPrice.toLocaleString()}</td>
                                        <td>
                                            <div className="ltp-cell">
                                                <span>₹{pos.ltp.toLocaleString()}</span>
                                                <span className={`ltp-change ${pos.change >= 0 ? 'positive' : 'negative'}`}>
                                                    {pos.change >= 0 ? '+' : ''}{pos.change}%
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={`pnl-cell ${pos.pnl >= 0 ? 'positive' : 'negative'}`}>
                                                <span className="pnl-value">
                                                    {pos.pnl >= 0 ? '+' : ''}₹{pos.pnl.toLocaleString()}
                                                </span>
                                                <span className="pnl-pct">
                                                    {pos.pnl >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                                    {Math.abs(pos.pnlPct)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <button className="btn btn-ghost btn-icon btn-sm">
                                                <Eye size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="data-card">
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">Recent Orders</h3>
                            <p className="card-subtitle">Latest executed orders</p>
                        </div>
                        <button className="btn btn-ghost btn-sm">
                            View All
                            <ChevronRight size={14} />
                        </button>
                    </div>
                    <div className="orders-list">
                        {orders.map(order => (
                            <div key={order.id} className="order-item">
                                <div className="order-time">
                                    <Clock size={12} />
                                    {order.time}
                                </div>
                                <div className="order-main">
                                    <div className="order-symbol">{order.symbol}</div>
                                    <div className="order-details">
                                        <span className={`order-side ${order.side.toLowerCase()}`}>
                                            {order.side}
                                        </span>
                                        <span className="order-qty">{order.qty} @ ₹{order.price}</span>
                                        <span className="order-type">{order.type}</span>
                                    </div>
                                </div>
                                <span className={`badge badge-${order.status === 'filled' ? 'success' :
                                    order.status === 'pending' ? 'warning' : 'error'
                                    }`}>
                                    {order.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
