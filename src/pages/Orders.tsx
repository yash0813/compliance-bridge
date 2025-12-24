import { useState } from 'react'
import { Search, Download, RefreshCw } from 'lucide-react'
import './Orders.css'

const ordersData = [
    { id: 'ORD001', time: '10:32:15', symbol: 'RELIANCE', exchange: 'NSE', side: 'BUY', qty: 100, price: 2450.00, avgPrice: 2449.50, type: 'LIMIT', product: 'CNC', status: 'filled', strategy: 'Momentum Alpha' },
    { id: 'ORD002', time: '10:31:45', symbol: 'TCS', exchange: 'NSE', side: 'SELL', qty: 50, price: 3850.00, avgPrice: 3851.25, type: 'MARKET', product: 'MIS', status: 'filled', strategy: 'Mean Reversion' },
    { id: 'ORD003', time: '10:30:22', symbol: 'INFY', exchange: 'NSE', side: 'BUY', qty: 75, price: 1450.00, avgPrice: null, type: 'LIMIT', product: 'CNC', status: 'pending', strategy: 'Momentum Alpha' },
    { id: 'ORD004', time: '10:28:10', symbol: 'HDFCBANK', exchange: 'NSE', side: 'BUY', qty: 40, price: 1620.00, avgPrice: 1619.75, type: 'LIMIT', product: 'MIS', status: 'filled', strategy: 'Breakout Pro' },
    { id: 'ORD005', time: '10:25:33', symbol: 'SBIN', exchange: 'NSE', side: 'SELL', qty: 100, price: 625.00, avgPrice: null, type: 'LIMIT', product: 'CNC', status: 'rejected', strategy: 'Options Hedger' },
    { id: 'ORD006', time: '10:22:18', symbol: 'ICICIBANK', exchange: 'NSE', side: 'BUY', qty: 60, price: 1245.00, avgPrice: 1244.50, type: 'LIMIT', product: 'MIS', status: 'filled', strategy: 'Momentum Alpha' },
    { id: 'ORD007', time: '10:18:45', symbol: 'WIPRO', exchange: 'NSE', side: 'SELL', qty: 150, price: 485.00, avgPrice: null, type: 'LIMIT', product: 'CNC', status: 'cancelled', strategy: 'Mean Reversion' },
    { id: 'ORD008', time: '10:15:30', symbol: 'BHARTIARTL', exchange: 'NSE', side: 'BUY', qty: 80, price: 1580.00, avgPrice: 1580.00, type: 'MARKET', product: 'MIS', status: 'filled', strategy: 'Breakout Pro' },
]

export default function Orders() {
    const [orders] = useState(ordersData)
    const [filter, setFilter] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')

    const filteredOrders = orders.filter(o => {
        const matchesStatus = filter === 'all' || o.status === filter
        const matchesSearch = o.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.id.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesStatus && matchesSearch
    })

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
                    <button className="btn btn-secondary">
                        <Download size={16} />
                        Export
                    </button>
                    <button className="btn btn-primary">
                        <RefreshCw size={16} />
                        Refresh
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
                            {filteredOrders.map(order => (
                                <tr key={order.id}>
                                    <td className="order-id">{order.id}</td>
                                    <td className="time">{order.time}</td>
                                    <td>
                                        <div className="symbol-cell">
                                            <span className="symbol">{order.symbol}</span>
                                            <span className="exchange">{order.exchange}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`side-badge ${order.side.toLowerCase()}`}>
                                            {order.side}
                                        </span>
                                    </td>
                                    <td>{order.qty}</td>
                                    <td>₹{order.price.toLocaleString()}</td>
                                    <td>{order.avgPrice ? `₹${order.avgPrice.toLocaleString()}` : '-'}</td>
                                    <td>
                                        <span className="type-badge">{order.type}</span>
                                    </td>
                                    <td className="strategy">{order.strategy}</td>
                                    <td>
                                        <span className={`badge badge-${order.status === 'filled' ? 'success' :
                                                order.status === 'pending' ? 'warning' :
                                                    order.status === 'rejected' ? 'error' : 'neutral'
                                            }`}>
                                            {order.status}
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
