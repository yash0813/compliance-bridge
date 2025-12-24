import { useState, useRef, useEffect } from 'react'
import { useUser } from '../App'
import {
    Search, Bell, Moon, Sun, Settings, ChevronDown,
    TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
    Shield, Zap, Clock, X, ExternalLink, Activity
} from 'lucide-react'
import './Header.css'

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
    { id: 4, type: 'info', title: 'Market Update', message: 'NIFTY crossed 22,000 level', time: '2 hours ago', read: true },
    { id: 5, type: 'success', title: 'Strategy Active', message: 'Momentum Alpha strategy started', time: '3 hours ago', read: true },
]

const marketData = [
    { symbol: 'NIFTY 50', value: '22,147.50', change: '+0.85%', positive: true },
    { symbol: 'SENSEX', value: '73,648.62', change: '+0.92%', positive: true },
    { symbol: 'BANK NIFTY', value: '47,892.30', change: '-0.23%', positive: false },
]

export default function Header() {
    const { user } = useUser()
    const [theme, setTheme] = useState<'light' | 'dark'>('light')
    const [showNotifications, setShowNotifications] = useState(false)
    const [showSearch, setShowSearch] = useState(false)
    const [notifications, setNotifications] = useState(mockNotifications)
    const [searchQuery, setSearchQuery] = useState('')
    const notifRef = useRef<HTMLDivElement>(null)
    const searchRef = useRef<HTMLDivElement>(null)

    const unreadCount = notifications.filter(n => !n.read).length

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
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
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
                        {marketData.map((item, index) => (
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
                <div className="header-center" ref={searchRef}>
                    <button
                        className="search-trigger"
                        onClick={() => setShowSearch(true)}
                    >
                        <Search size={18} />
                        <span>Search symbols, strategies...</span>
                        <kbd className="search-kbd">⌘K</kbd>
                    </button>

                    {showSearch && (
                        <div className="search-modal-overlay">
                            <div className="search-modal">
                                <div className="search-modal-header">
                                    <Search size={20} />
                                    <input
                                        type="text"
                                        className="search-input"
                                        placeholder="Search for symbols, strategies, settings..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        autoFocus
                                    />
                                    <button className="search-close" onClick={() => setShowSearch(false)}>
                                        <X size={18} />
                                    </button>
                                </div>
                                <div className="search-modal-body">
                                    <div className="search-section">
                                        <h4>Quick Actions</h4>
                                        <div className="search-actions">
                                            <button className="search-action-item">
                                                <Zap size={16} />
                                                <span>New Strategy</span>
                                            </button>
                                            <button className="search-action-item">
                                                <Activity size={16} />
                                                <span>View Positions</span>
                                            </button>
                                            <button className="search-action-item">
                                                <Shield size={16} />
                                                <span>Compliance Check</span>
                                            </button>
                                            <button className="search-action-item">
                                                <Settings size={16} />
                                                <span>Settings</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="search-section">
                                        <h4>Recent Searches</h4>
                                        <div className="recent-searches">
                                            <button className="recent-search-item">RELIANCE</button>
                                            <button className="recent-search-item">TCS</button>
                                            <button className="recent-search-item">Momentum Alpha</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Section - Actions */}
                <div className="header-right">
                    {/* Live Clock */}
                    <div className="header-clock">
                        <Clock size={14} />
                        <span>{currentTime}</span>
                    </div>

                    {/* System Status */}
                    <div className="system-status-badge">
                        <span className="status-dot active pulse" />
                        <span>Live</span>
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
        </header>
    )
}
