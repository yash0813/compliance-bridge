import { useState, useEffect } from 'react'
import { Search, Download, RefreshCw, Loader2, AlertCircle, Zap, X } from 'lucide-react'
import { ordersAPI } from '../services/api'
import { useToast } from '../context/ToastContext'
import './Orders.css'

export default function Orders() {
    const { showToast } = useToast()
    const [orders, setOrders] = useState<any[]>([])
    const [filter, setFilter] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [showOrderModal, setShowOrderModal] = useState(false)
    const [isPlacingOrder, setIsPlacingOrder] = useState(false)
    const [orderForm, setOrderForm] = useState({
        symbol: 'RELIANCE',
        side: 'BUY',
        quantity: 1,
        price: 0,
        type: 'MARKET'
    })

    const fetchOrders = async (quiet = false) => {
        if (!quiet) setIsLoading(true)
        else setIsRefreshing(true)
        try {
            const res = await ordersAPI.getAll()
            setOrders(res.orders)
        } catch (error) {
            console.error('Failed to fetch orders:', error)
            showToast('Failed to load orders', 'error')
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
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
            fetchOrders()
            showToast('Order placed successfully', 'success')
        } catch (error: any) {
            showToast(error.message || 'Order failed', 'error')
        } finally {
            setIsPlacingOrder(false)
        }
    }

    useEffect(() => {
        fetchOrders()
        const interval = setInterval(() => fetchOrders(true), 10000)
        return () => clearInterval(interval)
    }, [])

    const filteredOrders = orders.filter((o: any) => {
        const matchesStatus = filter === 'all' || o.status === filter
        const matchesSearch = o.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.orderId.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesStatus && matchesSearch
    })

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(orders, null, 2))
        const downloadAnchorNode = document.createElement('a')
        downloadAnchorNode.setAttribute("href", dataStr)
        downloadAnchorNode.setAttribute("download", `orders_${new Date().toISOString().split('T')[0]}.json`)
        document.body.appendChild(downloadAnchorNode)
        downloadAnchorNode.click()
        downloadAnchorNode.remove()
    }

    const statusCounts = {
        all: orders.length,
        filled: orders.filter(o => o.status === 'filled').length,
        pending: orders.filter(o => o.status === 'pending').length,
        rejected: orders.filter(o => o.status === 'rejected').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
    }

    return (
        <div className="orders-page">
            <div className="page-header">
                <div>
                    <h1>Orders</h1>
                    <p>View and manage your trading orders</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={handleExport}>
                        <Download size={16} />
                        Export
                    </button>
                    <button className="btn btn-secondary" onClick={() => fetchOrders(true)} disabled={isRefreshing}>
                        <RefreshCw size={16} className={isRefreshing ? 'spin' : ''} />
                        Refresh
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowOrderModal(true)}>
                        <Zap size={16} />
                        New Order
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="orders-toolbar">
                <div className="status-filters">
                    {Object.entries(statusCounts).map(([status, count]) => (
                        <button
                            key={status}
                            className={`filter-btn ${filter === status ? 'active' : ''}`}
                            onClick={() => setFilter(status)}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                            <span className="count">{count}</span>
                        </button>
                    ))}
                </div>
                <div className="search-filter">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search by symbol or order ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="card">
                <div className="table-container">
                    <table className="data-table orders-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Time</th>
                                <th>Symbol</th>
                                <th>Side</th>
                                <th>Qty</th>
                                <th>Price</th>
                                <th>Avg Price</th>
                                <th>Type</th>
                                <th>Strategy</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={10} className="loading-cell">
                                        <Loader2 size={24} className="spin" />
                                        <span>Loading your orders...</span>
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="empty-cell">
                                        <AlertCircle size={24} />
                                        <span>No orders found matching your criteria.</span>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map(order => (
                                    <tr key={order._id}>
                                        <td className="order-id">{order.orderId}</td>
                                        <td className="time">
                                            {new Date(order.createdAt).toLocaleTimeString()}
                                            <div className="date-meta">{new Date(order.createdAt).toLocaleDateString()}</div>
                                        </td>
                                        <td>
                                            <div className="symbol-cell">
                                                <span className="symbol">{order.symbol}</span>
                                                <span className="exchange">NSE</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`side-badge ${order.side.toLowerCase()}`}>
                                                {order.side}
                                            </span>
                                        </td>
                                        <td>{order.quantity}</td>
                                        <td>₹{order.price.toLocaleString()}</td>
                                        <td>{order.status === 'executed' ? `₹${order.price.toLocaleString()}` : '-'}</td>
                                        <td>
                                            <span className="type-badge">LIMIT</span>
                                        </td>
                                        <td className="strategy">{order.strategyId?.name || 'Manual'}</td>
                                        <td>
                                            <span className={`badge badge-${order.status === 'executed' || order.status === 'filled' ? 'success' :
                                                order.status === 'pending' || order.status === 'queued' ? 'warning' :
                                                    order.status === 'rejected' ? 'error' : 'neutral'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

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
        </div>
    )
}
