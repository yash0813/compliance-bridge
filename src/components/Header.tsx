import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../App'
import {
    Search, Bell, Moon, Sun, Settings, ChevronDown,
    TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
    Shield, Zap, Clock, X, ExternalLink, Activity
} from 'lucide-react'
import './Header.css'
import { marketAPI, systemAPI, ordersAPI } from '../services/api'
import { useToast } from '../context/ToastContext'
import Chart from 'react-apexcharts'

interface Notification {
    id: number
    type: 'success' | 'warning' | 'error' | 'info'
    title: string
    message: string
    time: string
    read: boolean
}

const mockNotifications: Notification[] = [
    { id: 1, type: 'success', title: 'Order Executed', message: 'RELIANCE BUY 100 @ ₹2,450 filled', time: '2 min ago', read: false },
    { id: 2, type: 'warning', title: 'Risk Alert', message: 'Position size exceeds 20% threshold', time: '15 min ago', read: false },
    { id: 3, type: 'error', title: 'Order Rejected', message: 'SBIN SELL failed - margin insufficient', time: '1 hour ago', read: false },
    { id: 4, type: 'info', title: 'New Policy Alert', message: 'Read "Algo Trading Risk Controls" by EOD', time: '1 hour ago', read: false },
    { id: 5, type: 'success', title: 'Strategy Active', message: 'Momentum Alpha strategy started', time: '3 hours ago', read: true },
]

const marketData = [
    { symbol: 'NIFTY 50', value: '25,487.50', change: '+0.45%', positive: true },
    { symbol: 'SENSEX', value: '82,648.62', change: '+0.32%', positive: true },
    { symbol: 'BANK NIFTY', value: '54,892.30', change: '-0.11%', positive: false },
]

export default function Header() {
    const navigate = useNavigate()
    const { user } = useUser()
    const [marketDataState, setMarketData] = useState(marketData)
    const [theme, setTheme] = useState<'light' | 'dark'>('light')
    const [showNotifications, setShowNotifications] = useState(false)
    const [showSearch, setShowSearch] = useState(false)
    const [notifications, setNotifications] = useState(mockNotifications)
    const [searchQuery, setSearchQuery] = useState('')
    const [suggestions, setSuggestions] = useState<any[]>([])
    const [searchResult, setSearchResult] = useState<any>(null)
    const [history, setHistory] = useState<any[]>([])
    const [searchError, setSearchError] = useState<string | null>(null)
    const [isSearching, setIsSearching] = useState(false)
    const notifRef = useRef<HTMLDivElement>(null)
    const searchRef = useRef<HTMLDivElement>(null)
    const [tradingMode, setTradingMode] = useState<string>('PAPER')
    const [isBrokerLoggedIn, setIsBrokerLoggedIn] = useState<boolean>(false)
    const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false)
    const [showOrderModal, setShowOrderModal] = useState(false)
    const [isPlacingOrder, setIsPlacingOrder] = useState(false)
    const [orderForm, setOrderForm] = useState({
        symbol: '',
        side: 'BUY' as 'BUY' | 'SELL',
        quantity: 1,
        price: 0,
        type: 'MARKET' as 'MARKET' | 'LIMIT'
    })
    const { showToast } = useToast()

    const unreadCount = notifications.filter(n => !n.read).length

    // Real Market Data Fetcher
    useEffect(() => {
        const fetchSystemConfig = async () => {
            try {
                const { user, tradingMode } = await import('../services/api').then(m => m.authAPI.me())
                if (tradingMode) setTradingMode(tradingMode)

                if (user.role === 'admin' || user.role === 'broker') {
                    const status = await systemAPI.getBrokerStatus()
                    setIsBrokerLoggedIn(status.isLoggedIn)
                }
            } catch (e) {
                console.error("Failed to fetch system config")
            }
        }
        fetchSystemConfig()

        const fetchMarketData = async () => {
            // ... existing fetch logic ...
            try {
                // Fetch real data from backend proxy
                const indices = await marketAPI.getIndices()

                if (indices && indices.length > 0) {
                    setMarketData(prev => {
                        return prev.map(item => {
                            const realData = indices.find(idx =>
                                (item.symbol === 'NIFTY 50' && idx.symbol === 'NIFTY 50') ||
                                (item.symbol === 'SENSEX' && idx.symbol === 'SENSEX') ||
                                (item.symbol === 'BANK NIFTY' && idx.symbol === 'BANK NIFTY')
                            );

                            if (realData) {
                                return {
                                    ...item,
                                    value: realData.lastPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 }),
                                    change: (realData.changePercent >= 0 ? '+' : '') + realData.changePercent.toFixed(2) + '%',
                                    positive: realData.changePercent >= 0
                                }
                            }
                            return item;
                        })
                    })
                }
            } catch (error) {
                console.error("Market data fetch failed", error)
            }
        }

        fetchMarketData()
        const interval = setInterval(fetchMarketData, 20000)
        return () => clearInterval(interval)
    }, [])


    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark'
        if (savedTheme) {
            setTheme(savedTheme)
            document.documentElement.setAttribute('data-theme', savedTheme)
        }
    }, [])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false)
            }
            // Only close search if clicking outside AND modal is open AND not clicking the trigger
            const target = event.target as HTMLElement;
            const isSearchTrigger = target.closest('.search-trigger');
            if (searchRef.current && !searchRef.current.contains(event.target as Node) && !isSearchTrigger) {
                setShowSearch(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
        document.documentElement.setAttribute('data-theme', newTheme)
        localStorage.setItem('theme', newTheme)
    }

    const markAsRead = (id: number) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        )
    }

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle size={18} />
            case 'warning': return <AlertTriangle size={18} />
            case 'error': return <X size={18} />
            default: return <Zap size={18} />
        }
    }

    const handleSearch = async (query: string) => {
        setIsSearching(true);
        setSearchError(null);
        setSearchResult(null);
        setHistory([]);
        setSuggestions([]);

        try {
            const [quote, chartHistory] = await Promise.all([
                marketAPI.getQuote(query.toUpperCase()),
                marketAPI.getHistory(query.toUpperCase())
            ]);
            setSearchResult(quote);
            setHistory(chartHistory);
        } catch (e: any) {
            console.error("Search error:", e);
            setSearchError(e.message || "Symbol not found");
        } finally {
            setIsSearching(false);
        }
    };

    // Live suggestion effect
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length >= 1 && !searchResult) {
                try {
                    const results = await marketAPI.search(searchQuery);
                    setSuggestions(results);
                } catch (e) {
                    console.error("Suggestion error:", e);
                }
            } else if (searchQuery.length === 0) {
                setSuggestions([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, searchResult]);

    const handleBrokerLogin = async () => {
        setIsLoggingIn(true)
        try {
            const res = await systemAPI.brokerLogin()
            if (res.success) {
                setIsBrokerLoggedIn(true)
                showToast('Dhan API Connected Successfully', 'success')
            }
        } catch (e: any) {
            showToast(e.message || 'Dhan Connection Failed', 'error')
        } finally {
            setIsLoggingIn(false)
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
            showToast('Order placed successfully via DhanHQ', 'success')
        } catch (error: any) {
            showToast(error.message || 'Order failed', 'error')
        } finally {
            setIsPlacingOrder(false)
        }
    }

    const handleOpenStockDetail = (symbol: string) => {
        window.open(`/#/stock/${symbol}`, '_blank', 'width=1200,height=800');
    };

    const currentTime = new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    })

    return (
        <header className="header">
            <div className="header-content">
                {/* Left Section - Market Ticker */}
                <div className="header-left">
                    <div className="market-ticker">
                        {marketDataState.map((item, index) => (
                            <div key={index} className="ticker-item">
                                <span className="ticker-symbol">{item.symbol}</span>
                                <span className="ticker-value">{item.value}</span>
                                <span className={`ticker-change ${item.positive ? 'positive' : 'negative'}`}>
                                    {item.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                    {item.change}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Center Section - Search */}
                <div className="header-center">
                    <button
                        className="search-trigger"
                        onClick={() => {
                            setShowSearch(true);
                            setSearchQuery(''); // Reset query on open
                            setSearchResult(null);
                            setSearchError(null);
                        }}
                    >
                        <Search size={18} />
                        <span>Search symbols, strategies...</span>
                        <kbd className="search-kbd">⌘K</kbd>
                    </button>
                </div>

                {showSearch && (
                    <div className="search-modal-overlay" ref={searchRef} onClick={(e) => {
                        if (e.target === e.currentTarget) setShowSearch(false);
                    }}>
                        <div className="search-modal" style={{ minHeight: '400px', height: 'auto' }}>
                            <div className="search-modal-header">
                                <button
                                    className="search-submit-btn"
                                    onClick={() => {
                                        if (searchQuery) handleSearch(searchQuery)
                                    }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-muted)' }}
                                >
                                    <Search size={20} />
                                </button>
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Search stocks, indices, strategies..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setSearchResult(null); // Clear result if user starts typing again
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && searchQuery) {
                                            handleSearch(searchQuery)
                                        }
                                    }}
                                    autoFocus
                                />
                                <button className="search-close" onClick={() => setShowSearch(false)}>
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="search-modal-body">
                                {isSearching && (
                                    <div className="loading-state" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <div className="spinner" style={{ margin: '0 auto 10px' }} />
                                        <p>Fetching market data...</p>
                                    </div>
                                )}

                                {suggestions.length > 0 && !searchResult && !isSearching && (
                                    <div className="search-suggestions">
                                        <h4 style={{ margin: '0 0 12px', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Top Matches</h4>
                                        {suggestions.map((s, idx) => (
                                            <div
                                                key={idx}
                                                className="suggestion-item"
                                                onClick={() => {
                                                    // Handle search in current window
                                                    setSearchQuery(s.symbol);
                                                    handleSearch(s.symbol);
                                                    // OR open in new window directly? User said "when i click stock"
                                                    // To be safe, clicking the name/symbol opens the window,
                                                    // while the row click just selects it for preview?
                                                    // No, user said "open new window". Let's do it on click.
                                                    handleOpenStockDetail(s.symbol);
                                                }}
                                            >
                                                <div className="suggestion-left">
                                                    <span className="suggestion-symbol">{s.symbol}</span>
                                                    <span className="suggestion-name">{s.name}</span>
                                                </div>
                                                <div className="suggestion-right">
                                                    <span className="suggestion-exch">{s.exch}</span>
                                                    <ChevronDown size={14} style={{ transform: 'rotate(-270deg)', opacity: 0.5 }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {searchError && (
                                    <div className="p-4 text-center text-danger" style={{ color: '#ff6b6b' }}>
                                        <p>❌ {searchError}</p>
                                    </div>
                                )}

                                {searchResult && (
                                    <div className="search-result-container animate-fadeIn">
                                        <div
                                            className="search-result-card premium-card"
                                            style={{ padding: '24px', background: 'var(--bg-elevated)', borderRadius: '16px', border: '1px solid var(--border-glass)', marginBottom: '20px' }}
                                        >
                                            <div className="result-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <h3
                                                            style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', cursor: 'pointer' }}
                                                            onClick={() => handleOpenStockDetail(searchResult.symbol)}
                                                        >
                                                            {searchResult.symbol}
                                                        </h3>
                                                        <button
                                                            onClick={() => handleOpenStockDetail(searchResult.symbol)}
                                                            style={{ background: 'none', border: 'none', color: 'var(--primary-500)', cursor: 'pointer' }}
                                                            title="Open Full Analysis"
                                                        >
                                                            <ExternalLink size={16} />
                                                        </button>
                                                        <span className="badge badge-neutral" style={{ fontSize: '10px' }}>NSE</span>
                                                    </div>
                                                    <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '12px' }}>Spot Price • Last updated {new Date(searchResult.timestamp).toLocaleTimeString()}</p>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                                                        ₹{searchResult.lastPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                        color: searchResult.changePercent >= 0 ? 'var(--success-500)' : 'var(--error-500)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'flex-end',
                                                        gap: '4px'
                                                    }}>
                                                        {searchResult.changePercent >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                        {searchResult.change.toFixed(2)} ({searchResult.changePercent.toFixed(2)}%)
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Candlestick Chart */}
                                            <div className="market-chart-container" style={{ margin: '0 -10px 20px -10px', height: '240px' }}>
                                                {history.length > 0 ? (
                                                    <Chart
                                                        options={{
                                                            chart: {
                                                                type: 'candlestick',
                                                                toolbar: { show: false },
                                                                background: 'transparent',
                                                                sparkline: { enabled: false }
                                                            },
                                                            theme: { mode: theme as any },
                                                            xaxis: {
                                                                type: 'datetime',
                                                                labels: { show: false, style: { colors: 'var(--text-muted)' } },
                                                                axisBorder: { show: false },
                                                                axisTicks: { show: false }
                                                            },
                                                            yaxis: {
                                                                show: true,
                                                                opposite: true,
                                                                labels: { style: { colors: 'var(--text-muted)', fontSize: '10px' } }
                                                            },
                                                            grid: { borderColor: 'var(--border-primary)', strokeDashArray: 4, padding: { left: 0, right: 0 } },
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
                                                ) : (
                                                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                                                        {isSearching ? 'Loading chart...' : 'Chart data unavailable'}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Competitor Features: L2/Stats */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px', padding: '15px', background: 'var(--surface-secondary)', borderRadius: '12px' }}>
                                                <div>
                                                    <p style={{ margin: '0 0 8px', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Day Range</p>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600' }}>
                                                        <span>L: ₹{(searchResult.lastPrice * 0.98).toFixed(2)}</span>
                                                        <span>H: ₹{(searchResult.lastPrice * 1.02).toFixed(2)}</span>
                                                    </div>
                                                    <div style={{ height: '4px', background: 'var(--border-primary)', borderRadius: '2px', marginTop: '6px', position: 'relative' }}>
                                                        <div style={{ position: 'absolute', left: '45%', width: '10%', height: '100%', background: 'var(--primary-500)', borderRadius: '2px' }} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <p style={{ margin: '0 0 8px', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Market Depth (L1)</p>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                                        <span style={{ color: 'var(--success-500)' }}>Bid: 42.5k</span>
                                                        <span style={{ color: 'var(--error-500)' }}>Ask: 38.1k</span>
                                                    </div>
                                                    <div style={{ display: 'flex', height: '4px', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
                                                        <div style={{ width: '55%', background: 'var(--success-500)' }} />
                                                        <div style={{ width: '45%', background: 'var(--error-500)' }} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <button
                                                    className="btn btn-success"
                                                    style={{ flex: 1, padding: '14px', borderRadius: '12px', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOrderForm({
                                                            ...orderForm,
                                                            symbol: searchResult.symbol,
                                                            side: 'BUY',
                                                            price: searchResult.lastPrice
                                                        });
                                                        setShowOrderModal(true);
                                                        setShowSearch(false);
                                                    }}
                                                >
                                                    <Zap size={18} />
                                                    BUY {searchResult.symbol}
                                                </button>
                                                <button
                                                    className="btn btn-danger"
                                                    style={{ flex: 1, padding: '14px', borderRadius: '12px', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOrderForm({
                                                            ...orderForm,
                                                            symbol: searchResult.symbol,
                                                            side: 'SELL',
                                                            price: searchResult.lastPrice
                                                        });
                                                        setShowOrderModal(true);
                                                        setShowSearch(false);
                                                    }}
                                                >
                                                    <Zap size={18} />
                                                    SELL {searchResult.symbol}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {!isSearching && !searchResult && !searchError && (
                                    <>
                                        <div className="search-section">
                                            <h4>Quick Actions</h4>
                                            <div className="search-actions">
                                                <button className="search-action-item" onClick={() => { navigate('/strategies/new'); setShowSearch(false); }}>
                                                    <Zap size={16} />
                                                    <span>New Strategy</span>
                                                </button>
                                                <button className="search-action-item" onClick={() => { navigate('/positions'); setShowSearch(false); }}>
                                                    <Activity size={16} />
                                                    <span>View Positions</span>
                                                </button>
                                                <button className="search-action-item" onClick={() => { navigate('/compliance'); setShowSearch(false); }}>
                                                    <Shield size={16} />
                                                    <span>Compliance Check</span>
                                                </button>
                                                <button className="search-action-item" onClick={() => { navigate('/settings'); setShowSearch(false); }}>
                                                    <Settings size={16} />
                                                    <span>Settings</span>
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Right Section - Actions */}
                <div className="header-right">
                    {/* Live Clock */}
                    <div className="header-clock">
                        <Clock size={14} />
                        <span>{currentTime}</span>
                    </div>

                    {/* System Status */}
                    <div className={`system-status-badge ${tradingMode === 'LIVE' ? 'live' : 'paper'}`}>
                        <span className={`status-dot active ${tradingMode === 'LIVE' ? 'pulse' : ''}`} />
                        <span>{tradingMode === 'LIVE' ? 'LIVE MARKET' : 'PAPER TRADING'}</span>
                    </div>

                    {/* Broker Connection Status (Only for Broker/Admin) */}
                    {(user?.role === 'admin' || user?.role === 'broker') && (
                        <button
                            className={`broker-status-btn ${isBrokerLoggedIn ? 'connected' : 'disconnected'}`}
                            onClick={!isBrokerLoggedIn ? handleBrokerLogin : undefined}
                            disabled={isLoggingIn || isBrokerLoggedIn}
                        >
                            <Shield size={14} />
                            <span>
                                {isLoggingIn ? 'Connecting...' : isBrokerLoggedIn ? 'Dhan Connected' : 'Connect Dhan'}
                            </span>
                        </button>
                    )}

                    {/* Theme Toggle */}
                    <button className="header-btn" onClick={toggleTheme} title="Toggle Theme">
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>

                    {/* Notifications */}
                    <div className="notifications-wrapper" ref={notifRef}>
                        <button
                            className={`header-btn ${showNotifications ? 'active' : ''}`}
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <Bell size={18} />
                            {unreadCount > 0 && (
                                <span className="notification-badge">{unreadCount}</span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="notifications-dropdown">
                                <div className="notifications-header">
                                    <h3>Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button className="mark-all-read" onClick={markAllAsRead}>
                                            Mark all read
                                        </button>
                                    )}
                                </div>
                                <div className="notifications-list">
                                    {notifications.map(notif => (
                                        <div
                                            key={notif.id}
                                            className={`notification-item ${notif.type} ${notif.read ? 'read' : ''}`}
                                            onClick={() => markAsRead(notif.id)}
                                        >
                                            <div className={`notification-icon ${notif.type}`}>
                                                {getNotificationIcon(notif.type)}
                                            </div>
                                            <div className="notification-content">
                                                <span className="notification-title">{notif.title}</span>
                                                <span className="notification-message">{notif.message}</span>
                                                <span className="notification-time">{notif.time}</span>
                                            </div>
                                            {!notif.read && <div className="notification-unread-dot" />}
                                        </div>
                                    ))}
                                </div>
                                <div className="notifications-footer">
                                    <button className="view-all-btn">
                                        View All Notifications
                                        <ExternalLink size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Profile */}
                    <div className="user-menu">
                        <button className="user-menu-trigger">
                            <div className="user-avatar-sm">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="user-info-compact">
                                <span className="user-name-sm">{user?.name?.split(' ')[0] || 'User'}</span>
                                <span className="user-role-sm">{user?.role || 'Trader'}</span>
                            </div>
                            <ChevronDown size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Manual Order Modal - Accessible from Search */}
            {showOrderModal && (
                <div className="modal-overlay">
                    <div className="modal order-modal" style={{ maxWidth: '450px' }}>
                        <div className="modal-header">
                            <div className="modal-title-group">
                                <h2>Direct Trade Ticket</h2>
                                <p>Execute {orderForm.side} order for {orderForm.symbol}</p>
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
                                    <label className="form-label">Symbol</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={orderForm.symbol}
                                        onChange={e => setOrderForm(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                                        required
                                        readOnly
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Quantity</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={orderForm.quantity}
                                        onChange={e => setOrderForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                                        required
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
        </header >
    )
}
