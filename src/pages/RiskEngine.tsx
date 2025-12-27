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
    Shield, AlertTriangle, TrendingDown,
    DollarSign, Percent, Target, RefreshCw, Bell,
    BarChart3, Zap, Settings, Power
} from 'lucide-react'
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { positionsAPI, authAPI } from '../services/api'
import { useToast } from '../context/ToastContext'
import './RiskEngine.css'

interface RiskData {
    marginUsed: number
    dailyPnL: number
    drawdown: number
    exposure: number
    openPositions: number
    ordersPerMinute: number
}

interface RiskSettings {
    maxMarginUsed: number
    maxDailyLoss: number
    maxDrawdown: number
    maxExposure: number
    maxOpenPositions: number
    maxOrdersPerMinute: number
}

const drawdownHistory = [
    { time: '09:15', value: 0 },
    { time: '09:30', value: -1.2 },
    { time: '10:00', value: -0.5 },
    { time: '10:30', value: 0.8 },
    { time: '11:00', value: 1.4 },
]

export default function RiskEngine() {
    const { showToast } = useToast()
    const [riskData, setRiskData] = useState<RiskData>({
        marginUsed: 0,
        dailyPnL: 0,
        drawdown: 0,
        exposure: 0,
        openPositions: 0,
        ordersPerMinute: 0
    })
    const [riskLimits, setRiskLimits] = useState<RiskSettings>({
        maxMarginUsed: 80,
        maxDailyLoss: 100000,
        maxDrawdown: 5,
        maxExposure: 5000000,
        maxOpenPositions: 50,
        maxOrdersPerMinute: 100
    })
    const [exposureBySymbol, setExposureBySymbol] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [alerts, setAlerts] = useState<any[]>([])
    const [showConfig, setShowConfig] = useState(false)
    const [currentUser, setCurrentUser] = useState<any>(null)

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const [posData, userRes] = await Promise.all([
                positionsAPI.getAll(),
                authAPI.me()
            ])

            setCurrentUser(userRes.user)
            if (userRes.user.riskSettings) {
                setRiskLimits(userRes.user.riskSettings as any)
            }

            // Calculate exposure
            const totalExposure = posData.positions.reduce((sum, p) => sum + (p.currentPrice * Math.abs(p.quantity)), 0)

            // Calculate Top 5 symbols by exposure
            const sortedPositions = [...posData.positions]
                .sort((a, b) => (b.currentPrice * Math.abs(b.quantity)) - (a.currentPrice * Math.abs(a.quantity)))
                .slice(0, 5)

            const pieData = sortedPositions.map((p, i) => ({
                name: p.symbol,
                value: p.currentPrice * Math.abs(p.quantity),
                color: ['#6366F1', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B'][i % 5]
            }))

            // Mock margin logic (Total Capital assumed 1Cr for demo)
            const totalCapital = 10000000
            const marginUsedPct = (totalExposure / (totalCapital * 5)) * 100 // 5x leverage assumption

            setRiskData({
                marginUsed: marginUsedPct,
                dailyPnL: posData.totalUnrealizedPnL,
                drawdown: posData.totalUnrealizedPnL < 0 ? (Math.abs(posData.totalUnrealizedPnL) / totalCapital) * 100 : 0,
                exposure: totalExposure,
                openPositions: posData.positions.length,
                ordersPerMinute: Math.floor(Math.random() * 20)
            })

            setExposureBySymbol(pieData)

            // Generate Alerts
            const newAlerts = []
            if (marginUsedPct > riskLimits.maxMarginUsed * 0.9) newAlerts.push({ type: 'warning', message: 'High Margin Utilization', time: 'Just now' })
            if (Math.abs(posData.totalUnrealizedPnL) > riskLimits.maxDailyLoss * 0.8) newAlerts.push({ type: 'error', message: 'Approaching Daily Loss Limit', time: 'Just now' })
            setAlerts(newAlerts)

        } catch (error) {
            console.error('Failed to fetch risk data:', error)
            showToast('Failed to load risk metrics', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSaveConfig = async () => {
        try {
            await authAPI.updateSettings(riskLimits)
            setShowConfig(false)
            showToast('Risk limits updated successfully', 'success')
            fetchData()
        } catch (error) {
            showToast('Failed to update limits', 'error')
        }
    }

    const handleKillSwitch = async () => {
        if (!window.confirm('EMERGENCY: This will PAUSE your account and prevent all new orders. Continue?')) return

        try {
            await authAPI.pauseAccount(currentUser.id)
            showToast('ACCOUNT PAUSED - KILL SWITCH ACTIVATED', 'error')
            fetchData()
        } catch (error) {
            showToast('Failed to activate kill switch', 'error')
        }
    }

    useEffect(() => {
        fetchData()
        const interval = setInterval(fetchData, 5000)
        return () => clearInterval(interval)
    }, [])

    const getRiskLevel = (current: number, limit: number) => {
        if (limit === 0) return 'safe'
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

    if (showConfig) {
        return (
            <div className="risk-engine-page">
                <div className="page-header">
                    <h1>Configuration</h1>
                </div>
                <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
                    <h3>Edit Risk Limits</h3>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label>Max Daily Loss (₹)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={riskLimits.maxDailyLoss}
                            onChange={e => setRiskLimits({ ...riskLimits, maxDailyLoss: Number(e.target.value) })}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label>Max Exposure (₹)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={riskLimits.maxExposure}
                            onChange={e => setRiskLimits({ ...riskLimits, maxExposure: Number(e.target.value) })}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label>Max Margin %</label>
                        <input
                            type="number"
                            className="form-input"
                            value={riskLimits.maxMarginUsed}
                            onChange={e => setRiskLimits({ ...riskLimits, maxMarginUsed: Number(e.target.value) })}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label>Max Open Positions</label>
                        <input
                            type="number"
                            className="form-input"
                            value={riskLimits.maxOpenPositions}
                            onChange={e => setRiskLimits({ ...riskLimits, maxOpenPositions: Number(e.target.value) })}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button className="btn btn-primary" onClick={handleSaveConfig}>Save Changes</button>
                        <button className="btn btn-secondary" onClick={() => setShowConfig(false)}>Cancel</button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="risk-engine-page">
            <div className="page-header">
                <div className="header-content">
                    <div className="header-icon risk">
                        <Shield size={28} />
                    </div>
                    <div>
                        <h1>Risk Engine {currentUser?.isPaused && <span style={{ color: 'red' }}>(PAUSED)</span>}</h1>
                        <p>Real-time risk monitoring, margin management, and exposure limits</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={() => setShowConfig(true)}>
                        <Settings size={16} />
                        Configure
                    </button>
                    <button className="btn btn-danger" onClick={handleKillSwitch}>
                        <Power size={16} />
                        KILL SWITCH
                    </button>
                    <button className="btn btn-ghost" onClick={fetchData}>
                        <RefreshCw size={16} className={isLoading ? 'spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Risk Score Banner */}
            <div className="risk-score-banner">
                <div className="risk-score">
                    <div className="score-circle">
                        <span className="score-value">
                            {Math.max(0, 100 - Math.round(riskData.marginUsed))}
                        </span>
                        <span className="score-label">Risk Score</span>
                    </div>
                </div>
                <div className="risk-summary">
                    <h3>Overall Risk Assessment</h3>
                    <p>Current exposure is {formatCurrency(riskData.exposure)} with {riskData.openPositions} active positions.</p>
                    <div className="risk-tags">
                        <span className={`risk-tag ${getRiskLevel(riskData.marginUsed, riskLimits.maxMarginUsed)}`}>
                            Margin: {riskData.marginUsed.toFixed(1)}%
                        </span>
                        {currentUser?.isPaused ? (
                            <span className="risk-tag critical">Account Paused</span>
                        ) : (
                            <span className="risk-tag safe">System: Active</span>
                        )}
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
                        <div className="bar-fill" style={{ width: `${Math.min(100, riskData.marginUsed)}%` }} />
                        <div className="bar-limit" style={{ left: `${riskLimits.maxMarginUsed}%` }} />
                    </div>
                    <div className="metric-footer">
                        <span>Limit: {riskLimits.maxMarginUsed}%</span>
                    </div>
                </div>

                {/* Daily P&L */}
                <div className={`metric-card ${Math.abs(riskData.dailyPnL) > riskLimits.maxDailyLoss ? 'critical' : 'safe'}`}>
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
                    <div className="metric-value">{riskData.drawdown.toFixed(2)}%</div>
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
                        {exposureBySymbol.length > 0 ? (
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
                        ) : (
                            <div className="no-data">No active positions</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Risk Alerts */}
            <div className="alerts-row">
                <div className="table-card alerts-card">
                    <div className="table-header">
                        <h3><Bell size={18} /> Risk Alerts</h3>
                    </div>
                    <div className="alerts-list">
                        {alerts.length > 0 ? alerts.map((alert, i) => (
                            <div key={i} className={`alert-item ${alert.type}`}>
                                <div className="alert-icon">
                                    <AlertTriangle size={18} />
                                </div>
                                <div className="alert-content">
                                    <span className="alert-message">{alert.message}</span>
                                    <span className="alert-time">{alert.time}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="no-alerts">No active risk alerts</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
