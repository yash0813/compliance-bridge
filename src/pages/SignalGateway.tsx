/**
 * Signal Ingestion Gateway
 * 
 * @author Yash
 * @description Real-time monitoring of incoming trading signals from external strategies
 * 
 * This is the entry point for all Black-Box strategy signals into the Compliance-Bridge system.
 * Signals are validated, rate-limited, and forwarded to the Compliance Engine.
 */

import { useState, useEffect } from 'react'
import {
    Radio, Zap, Clock, CheckCircle, XCircle,
    AlertTriangle, TrendingUp, ArrowDown, ArrowUp, RefreshCw,
    Server, Wifi, WifiOff, Filter
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import './SignalGateway.css'

// Mock real-time signal data
const generateSignalData = () => {
    const strategies = ['Momentum Alpha', 'Mean Reversion Pro', 'AI-ML Predictor', 'Scalper X', 'Trend Follower']
    const symbols = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN', 'BAJFINANCE', 'TATASTEEL']
    const sides = ['BUY', 'SELL']

    return {
        id: `SIG-${Date.now()}`,
        timestamp: new Date().toISOString(),
        strategy: strategies[Math.floor(Math.random() * strategies.length)],
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        side: sides[Math.floor(Math.random() * sides.length)],
        quantity: Math.floor(Math.random() * 500) + 50,
        price: (Math.random() * 3000 + 500).toFixed(2),
        status: Math.random() > 0.1 ? 'accepted' : 'rejected',
        latency: Math.floor(Math.random() * 5) + 1,
        source_ip: '203.45.167.89'
    }
}

// Throughput data for chart
const throughputData = [
    { time: '09:15', signals: 120, accepted: 118, rejected: 2 },
    { time: '09:30', signals: 245, accepted: 240, rejected: 5 },
    { time: '09:45', signals: 380, accepted: 372, rejected: 8 },
    { time: '10:00', signals: 520, accepted: 510, rejected: 10 },
    { time: '10:15', signals: 450, accepted: 445, rejected: 5 },
    { time: '10:30', signals: 380, accepted: 375, rejected: 5 },
    { time: '10:45', signals: 290, accepted: 287, rejected: 3 },
    { time: '11:00', signals: 320, accepted: 315, rejected: 5 },
    { time: '11:15', signals: 410, accepted: 405, rejected: 5 },
    { time: '11:30', signals: 480, accepted: 472, rejected: 8 },
]

const strategyStats = [
    { name: 'Momentum Alpha', signals: 1250, accepted: 1245, latency: 1.2, status: 'active' },
    { name: 'Mean Reversion Pro', signals: 890, accepted: 885, latency: 0.8, status: 'active' },
    { name: 'AI-ML Predictor', signals: 2100, accepted: 2050, latency: 2.1, status: 'active' },
    { name: 'Scalper X', signals: 4500, accepted: 4480, latency: 0.5, status: 'paused' },
    { name: 'Trend Follower', signals: 320, accepted: 318, latency: 1.5, status: 'active' },
]

export default function SignalGateway() {
    const [signals, setSignals] = useState<ReturnType<typeof generateSignalData>[]>([])
    const [isLive, setIsLive] = useState(true)
    const [totalSignals, setTotalSignals] = useState(9780)
    const [acceptedSignals, setAcceptedSignals] = useState(9712)
    const [avgLatency, setAvgLatency] = useState(1.2)

    // Simulate real-time signals
    useEffect(() => {
        if (!isLive) return

        const interval = setInterval(() => {
            const newSignal = generateSignalData()
            setSignals(prev => [newSignal, ...prev.slice(0, 19)])
            setTotalSignals(prev => prev + 1)
            if (newSignal.status === 'accepted') {
                setAcceptedSignals(prev => prev + 1)
            }
            setAvgLatency(prev => ((prev * 10 + newSignal.latency) / 11))
        }, 800)

        return () => clearInterval(interval)
    }, [isLive])

    const acceptanceRate = ((acceptedSignals / totalSignals) * 100).toFixed(2)

    return (
        <div className="signal-gateway-page">
            {/* Page Header */}
            <div className="page-header">
                <div className="header-content">
                    <div className="header-icon">
                        <Radio size={28} />
                    </div>
                    <div>
                        <h1>Signal Ingestion Gateway</h1>
                        <p>Real-time monitoring of incoming trading signals from external strategies</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button
                        className={`btn ${isLive ? 'btn-success' : 'btn-secondary'}`}
                        onClick={() => setIsLive(!isLive)}
                    >
                        {isLive ? <><Wifi size={16} /> Live</> : <><WifiOff size={16} /> Paused</>}
                    </button>
                    <button className="btn btn-ghost">
                        <Filter size={16} />
                        Filters
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon signals">
                        <Zap size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Total Signals Today</span>
                        <span className="stat-value">{totalSignals.toLocaleString()}</span>
                        <span className="stat-change positive">
                            <TrendingUp size={14} /> +12.5% vs yesterday
                        </span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon accepted">
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Accepted Signals</span>
                        <span className="stat-value">{acceptedSignals.toLocaleString()}</span>
                        <span className="stat-badge success">{acceptanceRate}% Rate</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon rejected">
                        <XCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Rejected Signals</span>
                        <span className="stat-value">{(totalSignals - acceptedSignals).toLocaleString()}</span>
                        <span className="stat-badge error">{(100 - parseFloat(acceptanceRate)).toFixed(2)}% Blocked</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon latency">
                        <Clock size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Avg Latency</span>
                        <span className="stat-value">{avgLatency.toFixed(1)} ms</span>
                        <span className="stat-badge success">Within SLA</span>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="charts-row">
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Signal Throughput</h3>
                        <span className="chart-subtitle">Signals per 15-minute interval</span>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={throughputData}>
                                <defs>
                                    <linearGradient id="signalGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                                <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} />
                                <YAxis stroke="var(--text-muted)" fontSize={12} />
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
                                    fill="url(#signalGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Accept vs Reject</h3>
                        <span className="chart-subtitle">Signal validation results</span>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={throughputData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                                <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} />
                                <YAxis stroke="var(--text-muted)" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--surface-primary)',
                                        border: '1px solid var(--border-primary)',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Bar dataKey="accepted" fill="#10B981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="rejected" fill="#EF4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Strategy Performance Table */}
            <div className="table-card">
                <div className="table-header">
                    <h3>Strategy Signal Stats</h3>
                    <button className="btn btn-ghost btn-sm">
                        <RefreshCw size={14} />
                        Refresh
                    </button>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Strategy</th>
                            <th>Signals Sent</th>
                            <th>Accepted</th>
                            <th>Rejection Rate</th>
                            <th>Avg Latency</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {strategyStats.map((strategy, index) => (
                            <tr key={index}>
                                <td>
                                    <div className="strategy-cell">
                                        <Server size={16} />
                                        <span>{strategy.name}</span>
                                    </div>
                                </td>
                                <td>{strategy.signals.toLocaleString()}</td>
                                <td>{strategy.accepted.toLocaleString()}</td>
                                <td>
                                    <span className="rejection-rate">
                                        {((1 - strategy.accepted / strategy.signals) * 100).toFixed(2)}%
                                    </span>
                                </td>
                                <td>{strategy.latency} ms</td>
                                <td>
                                    <span className={`status-badge ${strategy.status}`}>
                                        {strategy.status === 'active' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                                        {strategy.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Live Signal Feed */}
            <div className="table-card live-feed">
                <div className="table-header">
                    <h3>
                        <span className={`live-indicator ${isLive ? 'active' : ''}`} />
                        Live Signal Feed
                    </h3>
                    <span className="feed-count">{signals.length} recent signals</span>
                </div>
                <div className="signal-feed">
                    {signals.length === 0 ? (
                        <div className="empty-state">
                            <Radio size={48} />
                            <p>Waiting for signals...</p>
                        </div>
                    ) : (
                        signals.map((signal) => (
                            <div key={signal.id} className={`signal-item ${signal.status}`}>
                                <div className="signal-icon">
                                    {signal.side === 'BUY' ? (
                                        <ArrowUp size={16} className="buy" />
                                    ) : (
                                        <ArrowDown size={16} className="sell" />
                                    )}
                                </div>
                                <div className="signal-details">
                                    <span className="signal-symbol">{signal.symbol}</span>
                                    <span className="signal-strategy">{signal.strategy}</span>
                                </div>
                                <div className="signal-action">
                                    <span className={`signal-side ${signal.side.toLowerCase()}`}>
                                        {signal.side}
                                    </span>
                                    <span className="signal-qty">{signal.quantity} qty</span>
                                </div>
                                <div className="signal-price">₹{signal.price}</div>
                                <div className="signal-latency">{signal.latency}ms</div>
                                <div className="signal-status">
                                    {signal.status === 'accepted' ? (
                                        <CheckCircle size={16} className="accepted" />
                                    ) : (
                                        <XCircle size={16} className="rejected" />
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
