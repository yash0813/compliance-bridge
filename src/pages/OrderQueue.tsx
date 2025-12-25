/**
 * Order Queue (Kafka) Visualization
 * 
 * @author Yash
 * @description Real-time order queue monitoring with Kafka-style messaging visualization
 * 
 * Shows pending orders, queue depth, processing rate, and order flow through the system.
 */

import { useState, useEffect } from 'react'
import {
    Layers, Clock, CheckCircle,
    TrendingUp, ArrowRight, RefreshCw, Play, Pause,
    Activity, Zap, Server, Package
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { ordersAPI } from '../services/api'
import './OrderQueue.css'

// Mock queue data for visualization (System Metrics)
const queueDepthData = [
    { time: '09:15', depth: 45, processed: 120, pending: 15 },
    { time: '09:30', depth: 82, processed: 245, pending: 28 },
    { time: '09:45', depth: 120, processed: 380, pending: 42 },
    { time: '10:00', depth: 95, processed: 520, pending: 35 },
    { time: '10:15', depth: 68, processed: 450, pending: 22 },
    { time: '10:30', depth: 55, processed: 380, pending: 18 },
    { time: '10:45', depth: 42, processed: 290, pending: 12 },
    { time: '11:00', depth: 78, processed: 320, pending: 25 },
    { time: '11:15', depth: 110, processed: 410, pending: 38 },
    { time: '11:30', depth: 85, processed: 480, pending: 28 },
]

const partitions = [
    { id: 0, name: 'Partition 0 (NSE-EQ)', messages: 1250, lag: 12, consumer: 'broker-consumer-1' },
    { id: 1, name: 'Partition 1 (NSE-FO)', messages: 890, lag: 5, consumer: 'broker-consumer-2' },
    { id: 2, name: 'Partition 2 (BSE-EQ)', messages: 450, lag: 2, consumer: 'broker-consumer-3' },
    { id: 3, name: 'Partition 3 (MCX)', messages: 320, lag: 8, consumer: 'broker-consumer-4' },
]

export default function OrderQueue() {
    const [queueItems, setQueueItems] = useState<any[]>([])
    const [isProcessing, setIsProcessing] = useState(true)
    const [totalProcessed, setTotalProcessed] = useState(0)
    const [currentQueueDepth, setCurrentQueueDepth] = useState(0)
    const [avgProcessingTime, setAvgProcessingTime] = useState(12.5)

    const fetchQueueData = async () => {
        try {
            const response = await ordersAPI.getAll({ limit: 50 })
            const orders = response.orders.map(o => ({
                id: o.orderId || o._id,
                symbol: o.symbol,
                side: o.side,
                quantity: o.quantity,
                price: o.price,
                status: o.status,
                broker: o.broker,
                queueTime: Math.floor(Math.random() * 50) + 5, // Mock latency
                priority: 1, // Default
                timestamp: o.createdAt
            }))
            setQueueItems(orders)
            setCurrentQueueDepth(response.total > 50 ? 50 : response.total) // Just showing active view
        } catch (error) {
            console.error('Failed to fetch order queue:', error)
        }
    }

    useEffect(() => {
        fetchQueueData()
    }, [])

    useEffect(() => {
        if (!isProcessing) return

        const interval = setInterval(() => {
            // Poll for new data every 3 seconds to simulate "live" view
            fetchQueueData()

            // Simulate changing metrics
            setTotalProcessed(prev => prev + Math.floor(Math.random() * 5))
            setAvgProcessingTime(prev => ((prev * 10 + Math.random() * 5 + 10) / 11))
        }, 3000)

        return () => clearInterval(interval)
    }, [isProcessing])

    const getStatusColor = (status: string) => {
        const s = status.toLowerCase()
        if (s === 'queued' || s === 'pending') return 'warning'
        if (s === 'processing' || s === 'open') return 'info'
        if (s === 'sent') return 'primary'
        if (s === 'executed' || s === 'filled') return 'success'
        if (s === 'rejected' || s === 'cancelled') return 'error'
        return 'default'
    }

    return (
        <div className="order-queue-page">
            {/* Page Header */}
            <div className="page-header">
                <div className="header-content">
                    <div className="header-icon kafka">
                        <Layers size={28} />
                    </div>
                    <div>
                        <h1>Order Queue (Kafka)</h1>
                        <p>Real-time message queue monitoring and order flow visualization</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button
                        className={`btn ${isProcessing ? 'btn-success' : 'btn-secondary'}`}
                        onClick={() => setIsProcessing(!isProcessing)}
                    >
                        {isProcessing ? <><Play size={16} /> Processing</> : <><Pause size={16} /> Paused</>}
                    </button>
                    <button className="btn btn-ghost">
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon queue">
                        <Package size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Current Queue Depth</span>
                        <span className="stat-value">{currentQueueDepth}</span>
                        <span className="stat-change neutral">
                            <Activity size={14} /> Orders pending
                        </span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon processed">
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Orders Processed</span>
                        <span className="stat-value">{totalProcessed.toLocaleString()}</span>
                        <span className="stat-change positive">
                            <TrendingUp size={14} /> +8.2% today
                        </span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon time">
                        <Clock size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Avg Processing Time</span>
                        <span className="stat-value">{avgProcessingTime.toFixed(1)} ms</span>
                        <span className="stat-badge success">Optimal</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon throughput">
                        <Zap size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Throughput</span>
                        <span className="stat-value">~450/min</span>
                        <span className="stat-badge success">High Capacity</span>
                    </div>
                </div>
            </div>

            {/* Kafka Partitions */}
            <div className="partitions-section">
                <h3>Kafka Topic Partitions</h3>
                <div className="partitions-grid">
                    {partitions.map((partition) => (
                        <div key={partition.id} className="partition-card">
                            <div className="partition-header">
                                <Server size={18} />
                                <span>{partition.name}</span>
                            </div>
                            <div className="partition-stats">
                                <div className="partition-stat">
                                    <span className="label">Messages</span>
                                    <span className="value">{partition.messages.toLocaleString()}</span>
                                </div>
                                <div className="partition-stat">
                                    <span className="label">Lag</span>
                                    <span className={`value ${partition.lag > 10 ? 'warning' : 'success'}`}>
                                        {partition.lag}
                                    </span>
                                </div>
                            </div>
                            <div className="partition-consumer">
                                <span className="consumer-label">Consumer:</span>
                                <span className="consumer-name">{partition.consumer}</span>
                            </div>
                            <div className="partition-progress">
                                <div
                                    className="progress-bar"
                                    style={{ width: `${100 - (partition.lag / partition.messages * 100)}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Charts */}
            <div className="charts-row">
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Queue Depth Over Time</h3>
                        <span className="chart-subtitle">Orders waiting in queue</span>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={queueDepthData}>
                                <defs>
                                    <linearGradient id="depthGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
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
                                    dataKey="depth"
                                    stroke="#F59E0B"
                                    strokeWidth={2}
                                    fill="url(#depthGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Processing Rate</h3>
                        <span className="chart-subtitle">Orders processed per interval</span>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={queueDepthData}>
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
                                <Line
                                    type="monotone"
                                    dataKey="processed"
                                    stroke="#10B981"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Order Flow Pipeline */}
            <div className="pipeline-section">
                <h3>Order Flow Pipeline</h3>
                <div className="pipeline">
                    <div className="pipeline-stage">
                        <div className="stage-icon received">
                            <Package size={20} />
                        </div>
                        <span className="stage-label">Received</span>
                        <span className="stage-count">142</span>
                    </div>
                    <ArrowRight className="pipeline-arrow" />
                    <div className="pipeline-stage">
                        <div className="stage-icon validated">
                            <CheckCircle size={20} />
                        </div>
                        <span className="stage-label">Validated</span>
                        <span className="stage-count">138</span>
                    </div>
                    <ArrowRight className="pipeline-arrow" />
                    <div className="pipeline-stage">
                        <div className="stage-icon queued">
                            <Layers size={20} />
                        </div>
                        <span className="stage-label">Queued</span>
                        <span className="stage-count">{currentQueueDepth}</span>
                    </div>
                    <ArrowRight className="pipeline-arrow" />
                    <div className="pipeline-stage">
                        <div className="stage-icon processing">
                            <Activity size={20} />
                        </div>
                        <span className="stage-label">Processing</span>
                        <span className="stage-count">12</span>
                    </div>
                    <ArrowRight className="pipeline-arrow" />
                    <div className="pipeline-stage">
                        <div className="stage-icon sent">
                            <Zap size={20} />
                        </div>
                        <span className="stage-label">Sent to Broker</span>
                        <span className="stage-count">8,450</span>
                    </div>
                </div>
            </div>

            {/* Live Queue */}
            <div className="table-card">
                <div className="table-header">
                    <h3>
                        <span className={`live-indicator ${isProcessing ? 'active' : ''}`} />
                        Live Order Queue
                    </h3>
                    <span className="queue-count">{queueItems.length} orders in view</span>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Symbol</th>
                            <th>Side</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Broker</th>
                            <th>Queue Time</th>
                            <th>Priority</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {queueItems.map((order) => (
                            <tr key={order.id} className={`order-row ${order.status}`}>
                                <td><code className="order-id">{order.id}</code></td>
                                <td className="symbol">{order.symbol}</td>
                                <td>
                                    <span className={`side-badge ${order.side.toLowerCase()}`}>
                                        {order.side}
                                    </span>
                                </td>
                                <td>{order.quantity}</td>
                                <td className="price">₹{order.price}</td>
                                <td>{order.broker}</td>
                                <td>{order.queueTime}ms</td>
                                <td>
                                    <span className={`priority-badge p${order.priority}`}>
                                        P{order.priority}
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-badge ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
