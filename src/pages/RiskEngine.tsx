/**
 * Risk Engine Dashboard
 * 
 * @author Yash
 * @description Real-time risk monitoring with margin, exposure, drawdown, and VaR metrics
 * 
 * Core risk management component for SEBI compliance - monitors all trading activity
 * and enforces risk limits before orders reach the broker.
 */

import { useState, useEffect } from 'react'
import {
    Shield, AlertTriangle, TrendingDown, AlertOctagon,
    Activity, DollarSign, Percent, Target, RefreshCw, Bell,
    CheckCircle, BarChart3, Zap
} from 'lucide-react'
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import './RiskEngine.css'

// Risk metrics data
const riskLimits = {
    maxMarginUsed: 80, // percentage
    maxDailyLoss: 100000, // INR
    maxDrawdown: 15, // percentage
    maxExposure: 5000000, // INR
    maxOpenPositions: 50,
    maxOrdersPerMinute: 100
}

const currentRisk = {
    marginUsed: 62.5,
    dailyPnL: 45000,
    drawdown: 4.2,
    exposure: 3250000,
    openPositions: 28,
    ordersPerMinute: 45
}

const exposureBySymbol = [
    { name: 'RELIANCE', value: 850000, color: '#6366F1' },
    { name: 'TCS', value: 620000, color: '#8B5CF6' },
    { name: 'HDFCBANK', value: 480000, color: '#06B6D4' },
    { name: 'INFY', value: 520000, color: '#10B981' },
    { name: 'Others', value: 780000, color: '#F59E0B' },
]

const drawdownHistory = [
    { time: '09:15', value: 0 },
    { time: '09:30', value: -1.2 },
    { time: '09:45', value: -2.8 },
    { time: '10:00', value: -1.5 },
    { time: '10:15', value: 0.8 },
    { time: '10:30', value: 2.1 },
    { time: '10:45', value: 1.4 },
    { time: '11:00', value: 3.2 },
    { time: '11:15', value: 2.8 },
    { time: '11:30', value: 4.5 },
]

const riskAlerts = [
    { id: 1, type: 'warning', message: 'Margin utilization approaching 70% threshold', time: '2 min ago', acknowledged: false },
    { id: 2, type: 'info', message: 'Position concentration in RELIANCE exceeds 20%', time: '15 min ago', acknowledged: true },
    { id: 3, type: 'success', message: 'Daily VaR within acceptable limits (95% confidence)', time: '30 min ago', acknowledged: true },
    { id: 4, type: 'warning', message: 'Order rate spike detected: 78 orders/min', time: '45 min ago', acknowledged: true },
]

const riskBreaches = [
    { rule: 'Max Loss Per Trade', limit: '₹5,000', triggered: 2, lastBreach: '10:32 AM', status: 'resolved' },
    { rule: 'Position Size Limit', limit: '500 shares', triggered: 0, lastBreach: 'Never', status: 'ok' },
    { rule: 'Sector Exposure', limit: '30%', triggered: 1, lastBreach: 'Yesterday', status: 'ok' },
    { rule: 'Order Frequency', limit: '100/min', triggered: 0, lastBreach: 'Never', status: 'ok' },
]

export default function RiskEngine() {
    const [riskData, setRiskData] = useState(currentRisk)
    const [alerts] = useState(riskAlerts)

    useEffect(() => {
        const interval = setInterval(() => {
            setRiskData(prev => ({
                ...prev,
                marginUsed: Math.min(80, Math.max(50, prev.marginUsed + (Math.random() - 0.5) * 2)),
                dailyPnL: prev.dailyPnL + (Math.random() - 0.4) * 2000,
                drawdown: Math.max(0, Math.min(10, prev.drawdown + (Math.random() - 0.5) * 0.5)),
                ordersPerMinute: Math.floor(Math.random() * 30) + 30
            }))
        }, 3000)

        return () => clearInterval(interval)
    }, [])

    const getRiskLevel = (current: number, limit: number) => {
        const ratio = current / limit
        if (ratio >= 0.9) return 'critical'
        if (ratio >= 0.7) return 'warning'
        return 'safe'
    }

    const formatCurrency = (value: number) => {
        if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
        if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`
        return `₹${value.toFixed(0)}`
    }

    return (
        <div className="risk-engine-page">
            {/* Page Header */}
            <div className="page-header">
                <div className="header-content">
                    <div className="header-icon risk">
                        <Shield size={28} />
                    </div>
                    <div>
                        <h1>Risk Engine</h1>
                        <p>Real-time risk monitoring, margin management, and exposure limits</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn btn-ghost">
                        <Bell size={16} />
                        Alerts ({alerts.filter(a => !a.acknowledged).length})
                    </button>
                    <button className="btn btn-ghost">
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Risk Score Banner */}
            <div className="risk-score-banner">
                <div className="risk-score">
                    <div className="score-circle">
                        <span className="score-value">72</span>
                        <span className="score-label">Risk Score</span>
                    </div>
                </div>
                <div className="risk-summary">
                    <h3>Overall Risk Assessment</h3>
                    <p>Your portfolio is operating within acceptable risk parameters.
                        Monitor margin utilization as it approaches threshold.</p>
                    <div className="risk-tags">
                        <span className="risk-tag safe">Margin: Safe</span>
                        <span className="risk-tag safe">Exposure: Normal</span>
                        <span className="risk-tag warning">Concentration: Monitor</span>
                    </div>
                </div>
            </div>

            {/* Key Risk Metrics */}
            <div className="metrics-grid">
                {/* Margin Utilization */}
                <div className={`metric-card ${getRiskLevel(riskData.marginUsed, riskLimits.maxMarginUsed)}`}>
                    <div className="metric-header">
                        <Percent size={20} />
                        <span>Margin Utilization</span>
                    </div>
                    <div className="metric-value">{riskData.marginUsed.toFixed(1)}%</div>
                    <div className="metric-bar">
                        <div className="bar-fill" style={{ width: `${riskData.marginUsed}%` }} />
                        <div className="bar-limit" style={{ left: `${riskLimits.maxMarginUsed}%` }} />
                    </div>
                    <div className="metric-footer">
                        <span>Limit: {riskLimits.maxMarginUsed}%</span>
                        <span className={getRiskLevel(riskData.marginUsed, riskLimits.maxMarginUsed)}>
                            {riskLimits.maxMarginUsed - riskData.marginUsed > 0
                                ? `${(riskLimits.maxMarginUsed - riskData.marginUsed).toFixed(1)}% headroom`
                                : 'LIMIT REACHED'}
                        </span>
                    </div>
                </div>

                {/* Daily P&L */}
                <div className={`metric-card ${riskData.dailyPnL >= 0 ? 'safe' : 'warning'}`}>
                    <div className="metric-header">
                        <DollarSign size={20} />
                        <span>Daily P&L</span>
                    </div>
                    <div className="metric-value">
                        {riskData.dailyPnL >= 0 ? '+' : ''}{formatCurrency(riskData.dailyPnL)}
                    </div>
                    <div className="metric-bar">
                        <div
                            className="bar-fill pnl"
                            style={{
                                width: `${Math.min(100, Math.abs(riskData.dailyPnL) / riskLimits.maxDailyLoss * 100)}%`,
                                background: riskData.dailyPnL >= 0 ? 'var(--success-500)' : 'var(--error-500)'
                            }}
                        />
                    </div>
                    <div className="metric-footer">
                        <span>Max Loss Limit: {formatCurrency(riskLimits.maxDailyLoss)}</span>
                    </div>
                </div>

                {/* Drawdown */}
                <div className={`metric-card ${getRiskLevel(riskData.drawdown, riskLimits.maxDrawdown)}`}>
                    <div className="metric-header">
                        <TrendingDown size={20} />
                        <span>Current Drawdown</span>
                    </div>
                    <div className="metric-value">{riskData.drawdown.toFixed(1)}%</div>
                    <div className="metric-bar">
                        <div className="bar-fill" style={{ width: `${(riskData.drawdown / riskLimits.maxDrawdown) * 100}%` }} />
                    </div>
                    <div className="metric-footer">
                        <span>Max Allowed: {riskLimits.maxDrawdown}%</span>
                    </div>
                </div>

                {/* Total Exposure */}
                <div className={`metric-card ${getRiskLevel(riskData.exposure, riskLimits.maxExposure)}`}>
                    <div className="metric-header">
                        <Target size={20} />
                        <span>Total Exposure</span>
                    </div>
                    <div className="metric-value">{formatCurrency(riskData.exposure)}</div>
                    <div className="metric-bar">
                        <div className="bar-fill" style={{ width: `${(riskData.exposure / riskLimits.maxExposure) * 100}%` }} />
                    </div>
                    <div className="metric-footer">
                        <span>Limit: {formatCurrency(riskLimits.maxExposure)}</span>
                    </div>
                </div>

                {/* Open Positions */}
                <div className={`metric-card ${getRiskLevel(riskData.openPositions, riskLimits.maxOpenPositions)}`}>
                    <div className="metric-header">
                        <BarChart3 size={20} />
                        <span>Open Positions</span>
                    </div>
                    <div className="metric-value">{riskData.openPositions}</div>
                    <div className="metric-bar">
                        <div className="bar-fill" style={{ width: `${(riskData.openPositions / riskLimits.maxOpenPositions) * 100}%` }} />
                    </div>
                    <div className="metric-footer">
                        <span>Max: {riskLimits.maxOpenPositions} positions</span>
                    </div>
                </div>

                {/* Order Rate */}
                <div className={`metric-card ${getRiskLevel(riskData.ordersPerMinute, riskLimits.maxOrdersPerMinute)}`}>
                    <div className="metric-header">
                        <Zap size={20} />
                        <span>Order Rate</span>
                    </div>
                    <div className="metric-value">{riskData.ordersPerMinute}/min</div>
                    <div className="metric-bar">
                        <div className="bar-fill" style={{ width: `${(riskData.ordersPerMinute / riskLimits.maxOrdersPerMinute) * 100}%` }} />
                    </div>
                    <div className="metric-footer">
                        <span>Limit: {riskLimits.maxOrdersPerMinute}/min</span>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="charts-row">
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Drawdown History</h3>
                        <span className="chart-subtitle">Intraday P&L movement (%)</span>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={drawdownHistory}>
                                <defs>
                                    <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
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
                                    formatter={(value: number) => [`${value.toFixed(2)}%`, 'P&L']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#10B981"
                                    strokeWidth={2}
                                    fill="url(#drawdownGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Exposure by Symbol</h3>
                        <span className="chart-subtitle">Current position distribution</span>
                    </div>
                    <div className="chart-container pie-chart">
                        <ResponsiveContainer width="100%" height={250}>
                            <RechartsPie>
                                <Pie
                                    data={exposureBySymbol}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {exposureBySymbol.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => formatCurrency(value)}
                                    contentStyle={{
                                        background: 'var(--surface-primary)',
                                        border: '1px solid var(--border-primary)',
                                        borderRadius: '8px'
                                    }}
                                />
                            </RechartsPie>
                        </ResponsiveContainer>
                        <div className="pie-legend">
                            {exposureBySymbol.map((item, index) => (
                                <div key={index} className="legend-item">
                                    <span className="legend-color" style={{ background: item.color }} />
                                    <span className="legend-label">{item.name}</span>
                                    <span className="legend-value">{formatCurrency(item.value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Risk Alerts & Breaches */}
            <div className="alerts-row">
                <div className="table-card alerts-card">
                    <div className="table-header">
                        <h3><Bell size={18} /> Risk Alerts</h3>
                    </div>
                    <div className="alerts-list">
                        {alerts.map((alert) => (
                            <div key={alert.id} className={`alert-item ${alert.type} ${alert.acknowledged ? 'ack' : ''}`}>
                                <div className="alert-icon">
                                    {alert.type === 'warning' && <AlertTriangle size={18} />}
                                    {alert.type === 'info' && <Activity size={18} />}
                                    {alert.type === 'success' && <CheckCircle size={18} />}
                                </div>
                                <div className="alert-content">
                                    <span className="alert-message">{alert.message}</span>
                                    <span className="alert-time">{alert.time}</span>
                                </div>
                                {!alert.acknowledged && (
                                    <button className="btn btn-ghost btn-sm">Acknowledge</button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="table-card breaches-card">
                    <div className="table-header">
                        <h3><AlertOctagon size={18} /> Rule Breaches (Today)</h3>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Rule</th>
                                <th>Limit</th>
                                <th>Triggered</th>
                                <th>Last Breach</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {riskBreaches.map((breach, index) => (
                                <tr key={index}>
                                    <td className="rule-name">{breach.rule}</td>
                                    <td>{breach.limit}</td>
                                    <td>
                                        <span className={`breach-count ${breach.triggered > 0 ? 'has-breach' : ''}`}>
                                            {breach.triggered}
                                        </span>
                                    </td>
                                    <td className="breach-time">{breach.lastBreach}</td>
                                    <td>
                                        <span className={`status-badge ${breach.status}`}>
                                            {breach.status === 'ok' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                                            {breach.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
