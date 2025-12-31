import { useState, useEffect } from 'react'
import {
    ShieldCheck, AlertOctagon, RefreshCw, Download,
    Power, Users, Zap, Clock, Wallet, Link, Server, Cpu, X
} from 'lucide-react'
import { motion } from 'framer-motion'
import { systemAPI, ordersAPI, usersAPI } from '../services/api'
import './BrokerDashboard.css'

export default function BrokerDashboard() {
    const [killSwitchActive, setKillSwitchActive] = useState(false)
    const [showKillConfirm, setShowKillConfirm] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [stats, setStats] = useState({
        users: 0,
        ordersToday: 0,
        complianceRate: 99.2,
        pendingOrders: 0,
        activeStrategies: 0,
        availableMargin: 0,
        brokerStatus: 'connected'
    })
    const [liveOrders, setLiveOrders] = useState<any[]>([])
    const [showOrderModal, setShowOrderModal] = useState(false)
    const [isPlacingOrder, setIsPlacingOrder] = useState(false)
    const [orderForm, setOrderForm] = useState({
        symbol: 'RELIANCE',
        side: 'BUY',
        quantity: 1,
        price: 0,
        type: 'MARKET'
    })

    useEffect(() => {
        fetchInitialData()
        const interval = setInterval(fetchInitialData, 10000)
        return () => clearInterval(interval)
    }, [])

    const fetchInitialData = async () => {
        try {
            const [settingsRes, ordersRes, usersRes] = await Promise.all([
                systemAPI.getSettings(),
                ordersAPI.getAll({ limit: 10 }),
                usersAPI.getAll()
            ])

            if (settingsRes.success) setKillSwitchActive(settingsRes.settings.masterKillSwitch)
            if (ordersRes.orders) {
                setLiveOrders(ordersRes.orders)
                const pending = ordersRes.orders.filter((o: any) => o.status === 'pending' || o.status === 'queued').length
                setStats(prev => ({ ...prev, ordersToday: ordersRes.total, pendingOrders: pending }))
            }
            if (usersRes.users) {
                setStats(prev => ({ ...prev, users: usersRes.users.length }))
            }

            // Fetch Broker Status & Margin
            const brokerRes = await systemAPI.getBrokerStatus()
            if (brokerRes.success && brokerRes.margin) {
                setStats(prev => ({
                    ...prev,
                    availableMargin: brokerRes.margin?.available || 0,
                    brokerStatus: brokerRes.isLoggedIn ? 'connected' : 'disconnected'
                }))
            }

        } catch (error) {
            console.error("Dashboard fetch error:", error)
        }
    }

    const handleKillSwitch = async () => {
        if (!killSwitchActive) {
            setShowKillConfirm(true)
        } else {
            try {
                await systemAPI.toggleKillSwitch(false)
                setKillSwitchActive(false)
            } catch (e) {
                console.error("Failed to deactivate kill switch")
            }
        }
    }

    const confirmKill = async () => {
        try {
            await systemAPI.toggleKillSwitch(true)
            setKillSwitchActive(true)
            setShowKillConfirm(false)
        } catch (e) {
            console.error("Failed to activate kill switch")
        }
    }

    const handleRefresh = async () => {
        setIsRefreshing(true)
        await fetchInitialData()
        setIsRefreshing(false)
    }

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(liveOrders, null, 2))
        const downloadAnchorNode = document.createElement('a')
        downloadAnchorNode.setAttribute("href", dataStr)
        downloadAnchorNode.setAttribute("download", `orders_export_${new Date().toISOString().split('T')[0]}.json`)
        document.body.appendChild(downloadAnchorNode)
        downloadAnchorNode.click()
        downloadAnchorNode.remove()
    }

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsPlacingOrder(true)
        try {
            await ordersAPI.create({
                symbol: orderForm.symbol,
                side: orderForm.side,
                quantity: orderForm.quantity,
                price: orderForm.type === 'LIMIT' ? orderForm.price : undefined
            })
            setShowOrderModal(false)
            fetchInitialData() // Refresh list
        } catch (error: any) {
            console.error("Order placement failed:", error)
        } finally {
            setIsPlacingOrder(false)
        }
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <motion.div
            className="broker-dashboard"
            initial="hidden"
            animate="show"
            variants={containerVariants}
        >
            {/* Page Header */}
            <div className="page-header">
                <div className="page-header-content">
                    <div className="page-title-group">
                        <h1>Dhan Execution Control</h1>
                        <p>Real-time monitoring and control of live DhanHQ algorithmic flows</p>
                    </div>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-secondary" onClick={handleRefresh}>
                        <RefreshCw size={16} className={isRefreshing ? 'spin' : ''} />
                        Refresh
                    </button>
                    <button className="btn btn-secondary" onClick={handleExport}>
                        <Download size={16} />
                        Export
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowOrderModal(true)}>
                        <Zap size={16} />
                        New Order
                    </button>
                </div>
            </div>

            {/* Kill Switch Panel */}
            <motion.div
                className={`kill-switch-panel ${killSwitchActive ? 'active' : ''}`}
                variants={itemVariants}
            >
                <div className="kill-switch-content">
                    <div className={`kill-switch-icon ${killSwitchActive ? 'danger' : 'success'}`}>
                        <Power size={28} />
                    </div>
                    <div className="kill-switch-info">
                        <h3>Dhan Master Kill Switch</h3>
                        <span className={`kill-status-badge ${killSwitchActive ? 'halted' : 'active'}`}>
                            {killSwitchActive ? 'DHAN HALTED' : 'DHAN LIVE'}
                        </span>
                        <p>Immediately halt all algorithmic trading on Dhan in case of emergency.</p>
                    </div>
                </div>
                <div className="kill-switch-controls">
                    <div className="kill-switch-stats">
                        <div className="kill-stat">
                            <span className="kill-stat-value">{stats.users.toLocaleString()}</span>
                            <span className="kill-stat-label">Active Users</span>
                        </div>
                        <div className="kill-stat">
                            <span className="kill-stat-value">{stats.pendingOrders}</span>
                            <span className="kill-stat-label">Pending Orders</span>
                        </div>
                    </div>
                    <button
                        className={`kill-toggle-btn ${killSwitchActive ? 'active' : ''}`}
                        onClick={handleKillSwitch}
                    >
                        <span>{killSwitchActive ? 'Resume Trading' : 'Halt Trading'}</span>
                    </button>
                </div>
            </motion.div>

            {/* Metrics */}
            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-header">
                        <div className="metric-icon-wrapper primary"><Users size={22} /></div>
                    </div>
                    <div className="metric-body">
                        <span className="metric-label">Total Users</span>
                        <span className="metric-value">{stats.users}</span>
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-header">
                        <div className="metric-icon-wrapper success"><Zap size={22} /></div>
                    </div>
                    <div className="metric-body">
                        <span className="metric-label">Orders Today</span>
                        <span className="metric-value">{stats.ordersToday}</span>
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-header">
                        <div className="metric-icon-wrapper warning"><Clock size={22} /></div>
                    </div>
                    <div className="metric-body">
                        <span className="metric-label">Pending</span>
                        <span className="metric-value">{stats.pendingOrders}</span>
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-header">
                        <div className="metric-icon-wrapper primary"><Wallet size={22} /></div>
                    </div>
                    <div className="metric-body">
                        <span className="metric-label">Available Margin (₹)</span>
                        <span className="metric-value">{(stats.availableMargin || 0).toLocaleString()}</span>
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-header">
                        <div className="metric-icon-wrapper success"><ShieldCheck size={22} /></div>
                    </div>
                    <div className="metric-body">
                        <span className="metric-label">System Health</span>
                        <span className="metric-value">Healthy</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="dashboard-main-grid">
                <div className="card order-flow-card">
                    <div className="card-header">
                        <h3 className="card-title">Live Order Flow</h3>
                    </div>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>User</th>
                                    <th>Symbol</th>
                                    <th>Side</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {liveOrders.map((order: any) => (
                                    <tr key={order._id}>
                                        <td>{new Date(order.createdAt).toLocaleTimeString()}</td>
                                        <td>{order.userId?.name || 'Anonymous'}</td>
                                        <td>{order.symbol}</td>
                                        <td>{order.side}</td>
                                        <td>{order.quantity}</td>
                                        <td>₹{(order.price || 0).toLocaleString()}</td>
                                        <td>
                                            <span className={`badge badge-${order.status === 'executed' ? 'success' : 'warning'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card trader-list-card">
                    <div className="card-header">
                        <h3 className="card-title">Dhan API Status</h3>
                    </div>
                    <div className="broker-health-list">
                        <div className="health-item">
                            <Server size={16} />
                            <span>API Gateway</span>
                            <span className="health-status-online">Online</span>
                        </div>
                        <div className="health-item">
                            <Cpu size={16} />
                            <span>Latencies</span>
                            <span className="health-latency">42ms</span>
                        </div>
                        <div className="health-item">
                            <Link size={16} />
                            <span>Bridge Status</span>
                            <span className="health-status-online">Active</span>
                        </div>
                        <div className="dhan-branding-footer">
                            <img src="https://dhan.co/wp-content/uploads/2021/08/logo.svg" alt="Dhan Logo" style={{ width: '60px', opacity: 0.5 }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Kill Confirm Modal */}
            {showKillConfirm && (
                <div className="modal-overlay">
                    <div className="modal kill-modal">
                        <div className="modal-icon danger"><AlertOctagon size={48} /></div>
                        <h2>Activate Kill Switch?</h2>
                        <p>This will halt ALL trading on the platform. {stats.users} users will be affected.</p>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowKillConfirm(false)}>Cancel</button>
                            <button className="btn btn-danger" onClick={confirmKill}><Power size={18} />Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Manual Order Modal */}
            {showOrderModal && (
                <div className="modal-overlay">
                    <div className="modal order-modal" style={{ maxWidth: '450px' }}>
                        <div className="modal-header">
                            <div className="modal-title-group">
                                <h2>Manual Order Ticket</h2>
                                <p>Execute direct trades through DhanHQ bridge</p>
                            </div>
                            <button className="modal-close-btn" onClick={() => setShowOrderModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form className="order-form" onSubmit={handlePlaceOrder}>
                            <div className="side-toggle">
                                <button
                                    type="button"
                                    className={`side-btn buy ${orderForm.side === 'BUY' ? 'active' : ''}`}
                                    onClick={() => setOrderForm(prev => ({ ...prev, side: 'BUY' }))}
                                >
                                    BUY
                                </button>
                                <button
                                    type="button"
                                    className={`side-btn sell ${orderForm.side === 'SELL' ? 'active' : ''}`}
                                    onClick={() => setOrderForm(prev => ({ ...prev, side: 'SELL' }))}
                                >
                                    SELL
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                <div className="form-group">
                                    <label>Symbol</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={orderForm.symbol}
                                        onChange={e => setOrderForm(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                                        placeholder="e.g. RELIANCE"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Quantity</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={orderForm.quantity}
                                        onChange={e => setOrderForm(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Type</label>
                                    <select
                                        className="form-select"
                                        value={orderForm.type}
                                        onChange={e => setOrderForm(prev => ({ ...prev, type: e.target.value }))}
                                    >
                                        <option value="MARKET">Market</option>
                                        <option value="LIMIT">Limit</option>
                                    </select>
                                </div>
                                {orderForm.type === 'LIMIT' && (
                                    <div className="form-group">
                                        <label>Price</label>
                                        <input
                                            type="number"
                                            step="0.05"
                                            className="form-input"
                                            value={orderForm.price}
                                            onChange={e => setOrderForm(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                                            required
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowOrderModal(false)}>Cancel</button>
                                <button
                                    type="submit"
                                    className={`btn ${orderForm.side === 'BUY' ? 'btn-success' : 'btn-danger'}`}
                                    disabled={isPlacingOrder}
                                    style={{ flex: 1 }}
                                >
                                    {isPlacingOrder ? 'Executing...' : `Confirm ${orderForm.side}`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </motion.div>
    )
}
