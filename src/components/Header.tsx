import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../App'
import {
    Search, Bell, Moon, Sun, Settings, ChevronDown,
    TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
    Shield, Zap, Clock, X, ExternalLink, Activity
} from 'lucide-react'
import './Header.css'
import { marketAPI } from '../services/api' // Ensure this import exists or is correct

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
    const [searchResult, setSearchResult] = useState<any>(null)
    const [searchError, setSearchError] = useState<string | null>(null)
    const [isSearching, setIsSearching] = useState(false)
    const notifRef = useRef<HTMLDivElement>(null)
    const searchRef = useRef<HTMLDivElement>(null)
    const [tradingMode, setTradingMode] = useState<string>('PAPER')

    const unreadCount = notifications.filter(n => !n.read).length

    // Real Market Data Fetcher
    useEffect(() => {
        const fetchSystemConfig = async () => {
            try {
                const { tradingMode } = await import('../services/api').then(m => m.authAPI.me())
                if (tradingMode) setTradingMode(tradingMode)
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

        try {
            const quote = await marketAPI.getQuote(query.toUpperCase());
            setSearchResult(quote);
        } catch (e: any) {
            console.error("Search error:", e);
            setSearchError(e.message || "Symbol not found");
        } finally {
            setIsSearching(false);
        }
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
                                    placeholder="Search for symbols (e.g., RELIANCE, TCS)..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
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
                                    <div className="p-4 text-center text-muted">
                                        <p>Searching...</p>
                                    </div>
                                )}

                                {searchError && (
                                    <div className="p-4 text-center text-danger" style={{ color: '#ff6b6b' }}>
                                        <p>❌ {searchError}</p>
                                    </div>
                                )}

                                {searchResult && (
                                    <div className="search-result-card" style={{ padding: '20px', background: 'var(--bg-secondary)', borderRadius: '12px', marginTop: '10px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{searchResult.symbol}</h3>
                                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{new Date(searchResult.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                                            <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹{searchResult.lastPrice.toLocaleString('en-IN')}</span>
                                            <span style={{
                                                fontSize: '1rem',
                                                color: searchResult.change >= 0 ? '#4caf50' : '#ff6b6b',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}>
                                                {searchResult.change >= 0 ? '+' : ''}{searchResult.change} ({searchResult.changePercent}%)
                                            </span>
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
        </header >
    )
}
