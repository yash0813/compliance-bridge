import { TrendingUp, TrendingDown, RefreshCw, X } from 'lucide-react'
import './Positions.css'

const positionsData = [
    { symbol: 'RELIANCE', exchange: 'NSE', qty: 100, avgPrice: 2450, ltp: 2475, pnl: 2500, pnlPct: 1.02, product: 'CNC', value: 247500 },
    { symbol: 'TCS', exchange: 'NSE', qty: -50, avgPrice: 3890, ltp: 3850, pnl: 2000, pnlPct: 1.03, product: 'MIS', value: 192500 },
    { symbol: 'INFY', exchange: 'NSE', qty: 75, avgPrice: 1450, ltp: 1478, pnl: 2100, pnlPct: 1.93, product: 'CNC', value: 110850 },
    { symbol: 'HDFCBANK', exchange: 'NSE', qty: 40, avgPrice: 1620, ltp: 1645, pnl: 1000, pnlPct: 1.54, product: 'MIS', value: 65800 },
    { symbol: 'ICICIBANK', exchange: 'NSE', qty: -60, avgPrice: 1245, ltp: 1260, pnl: -900, pnlPct: -1.2, product: 'MIS', value: 75600 },
    { symbol: 'BHARTIARTL', exchange: 'NSE', qty: 80, avgPrice: 1580, ltp: 1565, pnl: -1200, pnlPct: -0.95, product: 'CNC', value: 125200 },
]

export default function Positions() {
    const totalPnl = positionsData.reduce((acc, p) => acc + p.pnl, 0)
    const totalValue = positionsData.reduce((acc, p) => acc + p.value, 0)
    const longPositions = positionsData.filter(p => p.qty > 0)
    const shortPositions = positionsData.filter(p => p.qty < 0)

    return (
        <div className="positions-page">
            <div className="page-header">
                <div>
                    <h1>Positions</h1>
                    <p>Monitor your open positions across all strategies</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary">
                        <RefreshCw size={16} />
                        Sync
                    </button>
                    <button className="btn btn-danger">
                        <X size={16} />
                        Close All
                    </button>
                </div>
            </div>

            {/* Position Summary */}
            <div className="position-summary">
                <div className="summary-card">
                    <span className="summary-label">Total P&L</span>
                    <span className={`summary-value ${totalPnl >= 0 ? 'positive' : 'negative'}`}>
                        {totalPnl >= 0 ? '+' : ''}₹{totalPnl.toLocaleString()}
                    </span>
                </div>
                <div className="summary-card">
                    <span className="summary-label">Total Value</span>
                    <span className="summary-value">₹{(totalValue / 100000).toFixed(2)}L</span>
                </div>
                <div className="summary-card">
                    <span className="summary-label">Long Positions</span>
                    <span className="summary-value">{longPositions.length}</span>
                </div>
                <div className="summary-card">
                    <span className="summary-label">Short Positions</span>
                    <span className="summary-value">{shortPositions.length}</span>
                </div>
            </div>

            {/* Positions Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Open Positions</h3>
                </div>
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
                                <th>Product</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {positionsData.map((pos, idx) => (
                                <tr key={idx}>
                                    <td>
                                        <div className="symbol-cell">
                                            <span className="symbol-badge">{pos.symbol.charAt(0)}</span>
                                            <div>
                                                <span className="symbol-name">{pos.symbol}</span>
                                                <span className="symbol-exchange">{pos.exchange}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={pos.qty > 0 ? 'long' : 'short'}>
                                            {pos.qty > 0 ? `+${pos.qty}` : pos.qty}
                                        </span>
                                    </td>
                                    <td>₹{pos.avgPrice.toLocaleString()}</td>
                                    <td>₹{pos.ltp.toLocaleString()}</td>
                                    <td>₹{pos.value.toLocaleString()}</td>
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
                                        <span className="product-badge">{pos.product}</span>
                                    </td>
                                    <td>
                                        <button className="btn btn-sm btn-secondary">Close</button>
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
