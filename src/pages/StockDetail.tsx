import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { marketAPI, ordersAPI } from '../services/api'
import { TrendingUp, TrendingDown, Zap, Activity, Shield, BarChart2, DollarSign } from 'lucide-react'
import Chart from 'react-apexcharts'
import { useToast } from '../context/ToastContext'
import { useTheme } from '../App'
import './StockDetail.css'

export default function StockDetail() {
    const { symbol } = useParams<{ symbol: string }>()
    const { theme } = useTheme()
    const [quote, setQuote] = useState<any>(null)
    const [history, setHistory] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [orderForm, setOrderForm] = useState({
        quantity: 1,
        side: 'BUY' as 'BUY' | 'SELL',
        type: 'MARKET' as 'MARKET' | 'LIMIT',
        price: 0
    })
    const [isPlacingOrder, setIsPlacingOrder] = useState(false)
    const { showToast } = useToast()

    useEffect(() => {
        const fetchData = async () => {
            if (!symbol) return;
            setIsLoading(true);
            try {
                const [quoteData, historyData] = await Promise.all([
                    marketAPI.getQuote(symbol),
                    marketAPI.getHistory(symbol)
                ]);
                setQuote(quoteData);
                setHistory(historyData);
                setOrderForm(prev => ({ ...prev, price: quoteData.lastPrice }));
            } catch (err: any) {
                setError(err.message || 'Failed to fetch data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [symbol]);

    const handlePlaceOrder = async () => {
        if (!symbol) return;
        setIsPlacingOrder(true);
        try {
            await ordersAPI.create({
                symbol: symbol,
                side: orderForm.side,
                quantity: orderForm.quantity,
                price: orderForm.type === 'LIMIT' ? orderForm.price : undefined
            });
            showToast(`Order placed: ${orderForm.side} ${orderForm.quantity} ${symbol}`, 'success');
        } catch (err: any) {
            showToast(err.message || 'Order failed', 'error');
        } finally {
            setIsPlacingOrder(false);
        }
    };

    if (isLoading && !quote) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-transparent">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-10 text-center">
                <h1 className="text-2xl font-bold text-error-500">Error</h1>
                <p className="text-muted">{error}</p>
            </div>
        );
    }

    return (
        <div className="stock-detail-page">
            {/* Header Section */}
            <div className="stock-detail-header">
                <div className="stock-main-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h1>{symbol}</h1>
                        <span className="badge badge-neutral" style={{ padding: '4px 8px', borderRadius: '6px' }}>NSE</span>
                    </div>
                    <div className="stock-price-row">
                        <span className="stock-current-price">₹{quote?.lastPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        <div className={`stock-change ${quote?.changePercent >= 0 ? 'text-success-500' : 'text-error-500'}`}>
                            {quote?.changePercent >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                            {quote?.change.toFixed(2)} ({quote?.changePercent.toFixed(2)}%)
                        </div>
                    </div>
                </div>

                <div className="stock-stats-grid">
                    <div className="stock-stat-item">
                        <p className="stat-label">Volume (24h)</p>
                        <p className="stat-value">1.2M</p>
                    </div>
                    <div className="stock-stat-item">
                        <p className="stat-label">Day High</p>
                        <p className="stat-value text-success-500">₹{(quote?.lastPrice * 1.02).toFixed(2)}</p>
                    </div>
                    <div className="stock-stat-item">
                        <p className="stat-label">Sentiment</p>
                        <p className="stat-value text-primary-500">Bullish</p>
                    </div>
                    <div className="stock-stat-item">
                        <p className="stat-label">Day Low</p>
                        <p className="stat-value text-error-500">₹{(quote?.lastPrice * 0.98).toFixed(2)}</p>
                    </div>
                </div>
            </div>

            <div className="stock-content-layout">
                {/* Visual Analysis Group */}
                <div className="analysis-column">
                    <div className="chart-section">
                        <div className="chart-header">
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <BarChart2 size={24} color="var(--primary-500)" />
                                Technical Outlook
                            </h2>
                            <div className="chart-controls">
                                <button className="chart-btn active">15M</button>
                                <button className="chart-btn">1H</button>
                                <button className="chart-btn">1D</button>
                                <button className="chart-btn">1W</button>
                            </div>
                        </div>

                        <div style={{ height: '420px', background: 'var(--bg-secondary)', borderRadius: '16px', padding: '10px' }}>
                            <Chart
                                options={{
                                    chart: {
                                        type: 'candlestick',
                                        toolbar: { show: true },
                                        background: 'transparent',
                                    },
                                    theme: { mode: theme as any },
                                    xaxis: {
                                        type: 'datetime',
                                        labels: { style: { colors: 'var(--text-muted)', fontSize: '10px' } },
                                        axisBorder: { show: false },
                                        axisTicks: { show: false }
                                    },
                                    yaxis: {
                                        opposite: true,
                                        labels: { style: { colors: 'var(--text-muted)', fontSize: '10px' } }
                                    },
                                    grid: { borderColor: 'var(--border-primary)', strokeDashArray: 4 },
                                    plotOptions: {
                                        candlestick: {
                                            colors: { upward: '#10B981', downward: '#EF4444' }
                                        }
                                    },
                                    tooltip: { theme: theme as any }
                                }}
                                series={[{ data: history }]}
                                type="candlestick"
                                height="100%"
                            />
                        </div>

                        <div className="info-cards-grid">
                            {[
                                { label: 'Market Cap', value: '₹14.2T', icon: DollarSign },
                                { label: 'P/E Ratio', value: '24.5', icon: Activity },
                                { label: 'Div Yield', value: '1.2%', icon: TrendingUp },
                                { label: 'Day Volatility', value: '1.8%', icon: Shield }
                            ].map((stat, i) => (
                                <div key={i} className="info-card">
                                    <stat.icon size={18} />
                                    <p className="stat-label">{stat.label}</p>
                                    <p style={{ fontSize: '1.1rem', fontWeight: 800 }}>{stat.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Execution */}
                <div className="execution-column">
                    <div className="execution-ticket">
                        <h2>
                            <Zap size={24} color="var(--primary-500)" />
                            Order Ticket
                        </h2>

                        <div className="side-toggle" style={{ marginBottom: '24px' }}>
                            <button
                                className={`side-btn buy ${orderForm.side === 'BUY' ? 'active' : ''}`}
                                onClick={() => setOrderForm(prev => ({ ...prev, side: 'BUY' }))}
                            >
                                BUY
                            </button>
                            <button
                                className={`side-btn sell ${orderForm.side === 'SELL' ? 'active' : ''}`}
                                onClick={() => setOrderForm(prev => ({ ...prev, side: 'SELL' }))}
                            >
                                SELL
                            </button>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Quantity</label>
                            <input
                                type="number"
                                className="form-input"
                                value={orderForm.quantity}
                                onChange={e => setOrderForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                                min="1"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Order Type</label>
                            <select
                                className="form-select"
                                value={orderForm.type}
                                onChange={e => setOrderForm(prev => ({ ...prev, type: e.target.value as any }))}
                            >
                                <option value="MARKET">Market</option>
                                <option value="LIMIT">Limit</option>
                            </select>
                        </div>

                        {orderForm.type === 'LIMIT' && (
                            <div className="form-group">
                                <label className="form-label">Limit Price</label>
                                <input
                                    type="number"
                                    step="0.05"
                                    className="form-input"
                                    value={orderForm.price}
                                    onChange={e => setOrderForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                                />
                            </div>
                        )}

                        <div className="order-summary">
                            <div className="summary-row">
                                <span className="summary-label">Estimated Margin</span>
                                <span className="summary-value">₹{(orderForm.quantity * (orderForm.type === 'LIMIT' ? orderForm.price : quote?.lastPrice || 0) / 5).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label">Brokerage (Est)</span>
                                <span className="summary-value">₹20.00</span>
                            </div>
                        </div>

                        <button
                            className={`confirm-btn ${orderForm.side === 'BUY' ? 'btn-success' : 'btn-danger'}`}
                            onClick={handlePlaceOrder}
                            disabled={isPlacingOrder}
                            style={{ height: '56px' }}
                        >
                            {isPlacingOrder ? 'Executing Request...' : `Confirm ${orderForm.side} Order`}
                        </button>

                        <div style={{ marginTop: '24px', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                            <Shield size={14} />
                            <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' }}>SEBI Compliant Execution</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
