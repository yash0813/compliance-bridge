/**
 * Broker Adapter Manager
 * 
 * @author Yash
 * @description Multi-broker connection management for Zerodha, Angel One, Upstox, ICICI Direct
 * 
 * Provides a unified abstraction layer for connecting to multiple broker APIs.
 * Monitors API health, connection status, and order routing.
 */

import { useState, useEffect } from 'react'
import {
    Plug, Wifi, CheckCircle, XCircle, AlertTriangle,
    RefreshCw, Settings, Activity, Clock, TrendingUp, BarChart3,
    Zap, Shield, Lock, Play, Pause
} from 'lucide-react'
import './BrokerAdapters.css'

interface BrokerAdapter {
    id: string
    name: string
    logo: string
    status: 'connected' | 'disconnected' | 'error' | 'maintenance'
    apiVersion: string
    latency: number
    uptime: number
    ordersToday: number
    errorRate: number
    lastHeartbeat: string
    features: string[]
    credentials: {
        apiKey: string
        lastRotated: string
        expiresIn: string
    }
}

const brokerAdapters: BrokerAdapter[] = [
    {
        id: 'zerodha',
        name: 'Zerodha',
        logo: '🦋',
        status: 'connected',
        apiVersion: 'Kite Connect v3',
        latency: 12,
        uptime: 99.98,
        ordersToday: 2450,
        errorRate: 0.02,
        lastHeartbeat: '2 sec ago',
        features: ['Equity', 'F&O', 'Currency', 'Commodity'],
        credentials: {
            apiKey: 'zer****8a9f',
            lastRotated: '15 days ago',
            expiresIn: '45 days'
        }
    },
    {
        id: 'angelone',
        name: 'Angel One',
        logo: '👼',
        status: 'connected',
        apiVersion: 'SmartAPI v2.1',
        latency: 18,
        uptime: 99.85,
        ordersToday: 1820,
        errorRate: 0.05,
        lastHeartbeat: '5 sec ago',
        features: ['Equity', 'F&O', 'Currency'],
        credentials: {
            apiKey: 'ang****3b2c',
            lastRotated: '8 days ago',
            expiresIn: '52 days'
        }
    },
    {
        id: 'upstox',
        name: 'Upstox',
        logo: '📈',
        status: 'connected',
        apiVersion: 'Upstox API v2',
        latency: 15,
        uptime: 99.72,
        ordersToday: 980,
        errorRate: 0.08,
        lastHeartbeat: '3 sec ago',
        features: ['Equity', 'F&O'],
        credentials: {
            apiKey: 'ups****7d4e',
            lastRotated: '22 days ago',
            expiresIn: '38 days'
        }
    },
    {
        id: 'icici',
        name: 'ICICI Direct',
        logo: '🏦',
        status: 'maintenance',
        apiVersion: 'Breeze API v1',
        latency: 0,
        uptime: 98.50,
        ordersToday: 0,
        errorRate: 0,
        lastHeartbeat: 'Maintenance',
        features: ['Equity', 'F&O', 'Mutual Funds'],
        credentials: {
            apiKey: 'ici****9f2a',
            lastRotated: '30 days ago',
            expiresIn: '30 days'
        }
    }
]

const orderRouting = [
    { symbol: 'RELIANCE', broker: 'Zerodha', reason: 'Lowest latency', orders: 450 },
    { symbol: 'TCS', broker: 'Angel One', reason: 'Best fill rate', orders: 320 },
    { symbol: 'INFY', broker: 'Zerodha', reason: 'Lowest latency', orders: 280 },
    { symbol: 'HDFCBANK', broker: 'Upstox', reason: 'Lower brokerage', orders: 210 },
    { symbol: 'SBIN', broker: 'Angel One', reason: 'Best fill rate', orders: 190 },
]

export default function BrokerAdapters() {
    const [adapters, setAdapters] = useState(brokerAdapters)
    const [selectedAdapter, setSelectedAdapter] = useState<string | null>(null)

    useEffect(() => {
        const interval = setInterval(() => {
            setAdapters(prev => prev.map(adapter => ({
                ...adapter,
                latency: adapter.status === 'connected'
                    ? Math.max(5, adapter.latency + (Math.random() - 0.5) * 4)
                    : 0,
                ordersToday: adapter.status === 'connected'
                    ? adapter.ordersToday + Math.floor(Math.random() * 3)
                    : adapter.ordersToday
            })))
        }, 2000)

        return () => clearInterval(interval)
    }, [])

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'connected': return <CheckCircle size={16} className="status-icon connected" />
            case 'disconnected': return <XCircle size={16} className="status-icon disconnected" />
            case 'error': return <AlertTriangle size={16} className="status-icon error" />
            case 'maintenance': return <Clock size={16} className="status-icon maintenance" />
            default: return null
        }
    }

    const totalOrders = adapters.reduce((sum, a) => sum + a.ordersToday, 0)
    const avgLatency = adapters.filter(a => a.status === 'connected').reduce((sum, a) => sum + a.latency, 0) / adapters.filter(a => a.status === 'connected').length
    const connectedBrokers = adapters.filter(a => a.status === 'connected').length

    return (
        <div className="broker-adapters-page">
            {/* Page Header */}
            <div className="page-header">
                <div className="header-content">
                    <div className="header-icon adapters">
                        <Plug size={28} />
                    </div>
                    <div>
                        <h1>Broker Adapters</h1>
                        <p>Multi-broker connection management and order routing abstraction layer</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary">
                        <Plug size={16} />
                        Add Broker
                    </button>
                    <button className="btn btn-ghost">
                        <RefreshCw size={16} />
                        Refresh All
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon brokers">
                        <Wifi size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Connected Brokers</span>
                        <span className="stat-value">{connectedBrokers} / {adapters.length}</span>
                        <span className="stat-badge success">All Healthy</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon orders">
                        <BarChart3 size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Orders Routed Today</span>
                        <span className="stat-value">{totalOrders.toLocaleString()}</span>
                        <span className="stat-change positive">
                            <TrendingUp size={14} /> +15.2%
                        </span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon latency">
                        <Activity size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Avg API Latency</span>
                        <span className="stat-value">{avgLatency.toFixed(1)} ms</span>
                        <span className="stat-badge success">Optimal</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon uptime">
                        <Shield size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Avg Uptime</span>
                        <span className="stat-value">99.76%</span>
                        <span className="stat-badge success">SLA Met</span>
                    </div>
                </div>
            </div>

            {/* Broker Cards */}
            <div className="adapters-section">
                <h3>Broker Execution Layer</h3>
                <div className="adapters-grid">
                    {adapters.map((adapter) => (
                        <div
                            key={adapter.id}
                            className={`adapter-card ${adapter.status}`}
                            onClick={() => setSelectedAdapter(selectedAdapter === adapter.id ? null : adapter.id)}
                        >
                            <div className="adapter-header">
                                <div className="adapter-logo">{adapter.logo}</div>
                                <div className="adapter-title">
                                    <h4>{adapter.name}</h4>
                                    <span className="api-version">{adapter.apiVersion}</span>
                                </div>
                                <div className={`adapter-status ${adapter.status}`}>
                                    {getStatusIcon(adapter.status)}
                                    <span>{adapter.status}</span>
                                </div>
                            </div>

                            <div className="adapter-metrics">
                                <div className="metric">
                                    <span className="metric-label">Latency</span>
                                    <span className={`metric-value ${adapter.latency > 20 ? 'warning' : ''}`}>
                                        {adapter.latency > 0 ? `${adapter.latency.toFixed(0)}ms` : '-'}
                                    </span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Uptime</span>
                                    <span className="metric-value">{adapter.uptime}%</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Orders</span>
                                    <span className="metric-value">{adapter.ordersToday.toLocaleString()}</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Error Rate</span>
                                    <span className={`metric-value ${adapter.errorRate > 0.05 ? 'warning' : 'success'}`}>
                                        {adapter.errorRate}%
                                    </span>
                                </div>
                            </div>

                            <div className="adapter-features">
                                {adapter.features.map((feature, i) => (
                                    <span key={i} className="feature-tag">{feature}</span>
                                ))}
                            </div>

                            <div className="adapter-footer">
                                <span className="heartbeat">
                                    <Activity size={14} />
                                    {adapter.lastHeartbeat}
                                </span>
                                <div className="adapter-actions">
                                    {adapter.status === 'connected' ? (
                                        <button className="btn btn-ghost btn-sm">
                                            <Pause size={14} /> Pause
                                        </button>
                                    ) : (
                                        <button className="btn btn-primary btn-sm">
                                            <Play size={14} /> Connect
                                        </button>
                                    )}
                                    <button className="btn btn-ghost btn-sm">
                                        <Settings size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {selectedAdapter === adapter.id && (
                                <div className="adapter-details">
                                    <div className="details-section">
                                        <h5><Lock size={14} /> API Credentials</h5>
                                        <div className="credentials-info">
                                            <div className="cred-row">
                                                <span>API Key:</span>
                                                <code>{adapter.credentials.apiKey}</code>
                                            </div>
                                            <div className="cred-row">
                                                <span>Last Rotated:</span>
                                                <span>{adapter.credentials.lastRotated}</span>
                                            </div>
                                            <div className="cred-row">
                                                <span>Expires In:</span>
                                                <span className={adapter.credentials.expiresIn.includes('30') ? 'warning' : ''}>
                                                    {adapter.credentials.expiresIn}
                                                </span>
                                            </div>
                                        </div>
                                        <button className="btn btn-ghost btn-sm">
                                            <RefreshCw size={14} /> Rotate Keys
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Order Routing Table */}
            <div className="table-card">
                <div className="table-header">
                    <h3><Zap size={18} /> Smart Order Routing</h3>
                    <span className="routing-info">Orders are routed based on latency, fill rate, and cost optimization</span>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Symbol</th>
                            <th>Preferred Broker</th>
                            <th>Routing Reason</th>
                            <th>Orders Routed</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orderRouting.map((route, index) => (
                            <tr key={index}>
                                <td className="symbol">{route.symbol}</td>
                                <td>
                                    <span className="broker-badge">
                                        {adapters.find(a => a.name === route.broker)?.logo} {route.broker}
                                    </span>
                                </td>
                                <td className="reason">{route.reason}</td>
                                <td>{route.orders.toLocaleString()}</td>
                                <td>
                                    <button className="btn btn-ghost btn-sm">
                                        <Settings size={14} /> Configure
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Architecture Diagram */}
            <div className="architecture-card">
                <h3>Broker Abstraction Layer Architecture</h3>
                <div className="architecture-diagram">
                    <div className="arch-layer signals">
                        <div className="layer-label">Compliance-Bridge</div>
                        <div className="layer-box">Order Queue → Broker Abstraction Layer</div>
                    </div>
                    <div className="arch-arrow">↓</div>
                    <div className="arch-layer adapters">
                        <div className="layer-label">Broker Adapters</div>
                        <div className="adapter-boxes">
                            {adapters.map(adapter => (
                                <div key={adapter.id} className={`adapter-box ${adapter.status}`}>
                                    <span className="logo">{adapter.logo}</span>
                                    <span className="name">{adapter.name}</span>
                                    <span className="status-dot" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="arch-arrow">↓</div>
                    <div className="arch-layer exchanges">
                        <div className="layer-label">Exchanges</div>
                        <div className="exchange-boxes">
                            <div className="exchange-box">NSE</div>
                            <div className="exchange-box">BSE</div>
                            <div className="exchange-box">MCX</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
