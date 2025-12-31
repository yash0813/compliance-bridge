import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, RefreshCw, X, Loader2, AlertCircle } from 'lucide-react'
import { positionsAPI, ordersAPI } from '../services/api'
import { useToast } from '../context/ToastContext'
import './Positions.css'

interface Position {
    _id: string;
    symbol: string;
    side: 'LONG' | 'SHORT';
    quantity: number;
    avgEntryPrice: number;
    currentPrice: number;
    unrealizedPnL: number;
    pnlPercentage: number;
    strategyId?: { name: string };
}

export default function Positions() {
    const { showToast } = useToast()
    const [positions, setPositions] = useState<Position[]>([])
    const [summary, setSummary] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSyncing, setIsSyncing] = useState(false)
    const [showOrderModal, setShowOrderModal] = useState(false)
    const [isPlacingOrder, setIsPlacingOrder] = useState(false)
    const [orderForm, setOrderForm] = useState({
        symbol: 'RELIANCE',
        side: 'BUY',
        quantity: 1,
        price: 0,
        type: 'MARKET'
    })

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const [positionsRes, summaryRes] = await Promise.all([
                positionsAPI.getAll(),
                positionsAPI.getSummary()
            ])
            setPositions(positionsRes.positions)
            setSummary(summaryRes.summary)
        } catch (error) {
            console.error('Failed to fetch positions:', error)
            showToast('Failed to load positions', 'error')
        } finally {
            setIsLoading(false)
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
            fetchData()
            showToast('Order placed successfully', 'success')
        } catch (error: any) {
            showToast(error.message || 'Order failed', 'error')
        } finally {
            setIsPlacingOrder(false)
        }
    }

    const syncData = async () => {
        setIsSyncing(true)
        try {
            // In a real app, this might trigger a broker sync
            await fetchData()
            showToast('Positions synced successfully', 'success')
        } catch (error) {
            showToast('Failed to sync positions', 'error')
        } finally {
            setIsSyncing(false)
        }
    }

    const handleClose = async (id: string, symbol: string) => {
        if (!window.confirm(`Are you sure you want to exit your position in ${symbol}?`)) return

        try {
            await positionsAPI.close(id, 0) // exitPrice 0 lets backend/broker decide
            showToast('Position closed successfully', 'success')
            fetchData() // Refresh list
        } catch (error: any) {
            showToast(error.message || 'Failed to close position', 'error')
        }
    }

    useEffect(() => {
        fetchData()
        const interval = setInterval(fetchData, 5000) // Auto-refresh every 5s
        return () => clearInterval(interval)
    }, [])

    if (isLoading && positions.length === 0) {
        return (
            <div className="loading-state">
                <Loader2 className="spin" size={32} />
                <p>Loading open positions...</p>
            </div>
        )
    }

    return (
        <div className="positions-page">
            <div className="page-header">
                <div>
                    <h1>Positions</h1>
                    <p>Monitor your open positions across all strategies</p>
                </div>
                <div className="header-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={syncData}
                        disabled={isSyncing}
                    >
                        <RefreshCw size={16} className={isSyncing ? 'spin' : ''} />
                        {isSyncing ? 'Syncing...' : 'Sync'}
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowOrderModal(true)}>
                        <TrendingUp size={16} />
                        New Order
                    </button>
                </div>
            </div>

            {/* Position Summary */}
            {summary && (
                <div className="position-summary">
                    <div className="summary-card">
                        <span className="summary-label">Total P&L</span>
                        <span className={`summary-value ${summary.unrealizedPnL >= 0 ? 'positive' : 'negative'}`}>
                            {summary.unrealizedPnL >= 0 ? '+' : ''}₹{summary.unrealizedPnL.toLocaleString()}
                        </span>
                    </div>
                    <div className="summary-card">
                        <span className="summary-label">Total Exposure</span>
                        <span className="summary-value">₹{(summary.totalExposure / 100000).toFixed(2)}L</span>
                    </div>
                    <div className="summary-card">
                        <span className="summary-label">Long Positions</span>
                        <span className="summary-value">{summary.longPositions}</span>
                    </div>
                    <div className="summary-card">
                        <span className="summary-label">Short Positions</span>
                        <span className="summary-value">{summary.shortPositions}</span>
                    </div>
                </div>
            )}

            {/* Positions Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Open Positions ({positions.length})</h3>
                </div>

                {positions.length === 0 ? (
                    <div className="empty-state">
                        <AlertCircle size={48} className="text-muted" />
                        <p>No open positions found</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table positions-table">
                            <thead>
                                <tr>
                                    <th>Symbol</th>
                                    <th>Qty</th>
                                    <th>Avg Price</th>
                                    <th>LTP</th>
                                    <th>Value</th>
                                    <th>P&L</th>
                                    <th>Strategy</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {positions.map((pos) => (
                                    <tr key={pos._id}>
                                        <td>
                                            <div className="symbol-cell">
                                                <span className="symbol-badge">{pos.symbol.charAt(0)}</span>
                                                <div>
                                                    <span className="symbol-name">{pos.symbol}</span>
                                                    <span className="symbol-exchange">{pos.side}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={pos.quantity > 0 ? 'long' : 'short'}>
                                                {pos.quantity > 0 ? `+${pos.quantity}` : pos.quantity}
                                            </span>
                                        </td>
                                        <td>₹{pos.avgEntryPrice.toLocaleString()}</td>
                                        <td>₹{pos.currentPrice.toLocaleString()}</td>
                                        <td>₹{(pos.currentPrice * Math.abs(pos.quantity)).toLocaleString()}</td>
                                        <td>
                                            <div className={`pnl-cell ${pos.unrealizedPnL >= 0 ? 'positive' : 'negative'}`}>
                                                <span className="pnl-value">
                                                    {pos.unrealizedPnL >= 0 ? '+' : ''}₹{pos.unrealizedPnL.toLocaleString()}
                                                </span>
                                                <span className="pnl-pct">
                                                    {pos.unrealizedPnL >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                                    {Math.abs(pos.pnlPercentage).toFixed(2)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="product-badge">{pos.strategyId?.name || 'Manual'}</span>
                                        </td>
                                        <td style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                className="btn btn-success"
                                                style={{ padding: '4px 8px', fontSize: '10px' }}
                                                onClick={() => {
                                                    setOrderForm({ ...orderForm, symbol: pos.symbol, side: 'BUY' });
                                                    setShowOrderModal(true);
                                                }}
                                            >
                                                BUY
                                            </button>
                                            <button
                                                className="btn btn-danger"
                                                style={{ padding: '4px 8px', fontSize: '10px' }}
                                                onClick={() => {
                                                    setOrderForm({ ...orderForm, symbol: pos.symbol, side: 'SELL' });
                                                    setShowOrderModal(true);
                                                }}
                                            >
                                                SELL
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleClose(pos._id, pos.symbol)}
                                            >
                                                Exit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
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
