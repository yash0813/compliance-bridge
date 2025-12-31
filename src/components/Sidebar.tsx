import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useUser } from '../App'
import { authAPI } from '../services/api'
import {
    LayoutDashboard,
    LineChart,
    FileText,
    Briefcase,
    ShieldCheck,
    Settings,
    LogOut,
    Zap,
    Users,
    Building2,
    ChevronLeft,
    HelpCircle,
    Sparkles,
    Activity,
    Server,
    Award,
    Info,
    Eye,
    Radio,
    Layers,
    Shield,
    Plug
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import './Sidebar.css'

// Navigation items are defined per role - each role sees different menu options
// This keeps the UI clean and role-specific

const traderNavItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/strategies', icon: Zap, label: 'Strategies' },
    { path: '/strategy-compliance', icon: Award, label: 'Certification' },
    { path: '/positions', icon: Briefcase, label: 'Positions' },
    { path: '/orders', icon: FileText, label: 'Orders' },
    { path: '/policies', icon: FileText, label: 'Policies' }, // Added
]

const brokerNavItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/signal-gateway', icon: Radio, label: 'Signal Gateway' },
    { path: '/order-queue', icon: Layers, label: 'Order Queue' },
    { path: '/risk-engine', icon: Shield, label: 'Risk Engine' },
    { path: '/broker-adapters', icon: Plug, label: 'Broker Adapters' },
    { path: '/broker-health', icon: Server, label: 'Control Center' },
    { path: '/security', icon: ShieldCheck, label: 'Security & IP' },
    { path: '/audit-timeline', icon: Activity, label: 'Audit Timeline' },
    { path: '/policies', icon: FileText, label: 'Policies' }, // Added
]

const adminNavItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/signal-gateway', icon: Radio, label: 'Signal Gateway' },
    { path: '/order-queue', icon: Layers, label: 'Order Queue' },
    { path: '/risk-engine', icon: Shield, label: 'Risk Engine' },
    { path: '/broker-adapters', icon: Plug, label: 'Broker Adapters' },
    { path: '/broker-health', icon: Server, label: 'Control Center' },
    { path: '/security', icon: ShieldCheck, label: 'Security & IP' },
    { path: '/audit-timeline', icon: Activity, label: 'Audit Timeline' },
    { path: '/policies', icon: FileText, label: 'Policies' }, // Added
    { path: '/settings', icon: Settings, label: 'Settings' },
]

// Read-only regulator access
const regulatorNavItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { path: '/audit-timeline', icon: Activity, label: 'Audit Timeline' },
    { path: '/strategy-compliance', icon: Award, label: 'Certification' },
    { path: '/orders', icon: FileText, label: 'Order History' },
    { path: '/policies', icon: FileText, label: 'Policies' }, // Added
    { path: '/how-it-works', icon: Info, label: 'How It Works' },
]

export default function Sidebar() {
    const { user, setUser } = useUser()
    const location = useLocation()
    const [collapsed, setCollapsed] = useState(false)

    const navItems = user?.role === 'admin'
        ? adminNavItems
        : user?.role === 'broker'
            ? brokerNavItems
            : user?.role === 'regulator'
                ? regulatorNavItems
                : traderNavItems

    const handleLogout = async () => {
        await authAPI.logout()
        setUser(null)
    }

    const roleIcon = user?.role === 'admin' ? Users : user?.role === 'broker' ? Building2 : user?.role === 'regulator' ? Eye : LineChart
    const RoleIcon = roleIcon

    const roleColors = {
        trader: { bg: 'linear-gradient(135deg, #10B981, #06B6D4)', color: '#10B981' },
        broker: { bg: 'linear-gradient(135deg, #8B5CF6, #6366F1)', color: '#8B5CF6' },
        admin: { bg: 'linear-gradient(135deg, #F59E0B, #F97316)', color: '#F59E0B' },
        regulator: { bg: 'linear-gradient(135deg, #EC4899, #8B5CF6)', color: '#EC4899' },
    }

    const currentRole = user?.role || 'trader'
    const roleStyle = roleColors[currentRole as keyof typeof roleColors]

    return (
        <motion.aside
            className={`sidebar ${collapsed ? 'collapsed' : ''}`}
            initial={false}
            animate={{ width: collapsed ? 80 : 280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
            {/* Background Pattern */}
            <div className="sidebar-bg-pattern" />

            {/* Logo */}
            <div className="sidebar-logo">
                <motion.div
                    className="logo-icon"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <ShieldCheck size={24} />
                </motion.div>
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            className="logo-text"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <span className="logo-title">Compliance</span>
                            <span className="logo-subtitle">Bridge</span>
                        </motion.div>
                    )}
                </AnimatePresence>
                <button
                    className="collapse-btn"
                    onClick={() => setCollapsed(!collapsed)}
                    title={collapsed ? 'Expand' : 'Collapse'}
                >
                    <ChevronLeft size={18} />
                </button>
            </div>

            {/* Role Badge */}
            <AnimatePresence>
                {!collapsed && (
                    <motion.div
                        className="role-badge"
                        style={{ background: roleStyle.bg }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                    >
                        <RoleIcon size={14} />
                        <span>{user?.role?.charAt(0).toUpperCase()}{user?.role?.slice(1)} Portal</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation */}
            <nav className="sidebar-nav">
                <div className="nav-section">
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                className="nav-section-title"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                Main Menu
                            </motion.span>
                        )}
                    </AnimatePresence>
                    {navItems.map((item, index) => {
                        const Icon = item.icon
                        const isActive = location.pathname === item.path ||
                            (item.path === '/dashboard' && location.pathname === '/')

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                                title={collapsed ? item.label : undefined}
                            >
                                <motion.div
                                    className="nav-icon-wrapper"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Icon size={20} />
                                </motion.div>
                                <AnimatePresence>
                                    {!collapsed && (
                                        <motion.span
                                            className="nav-label"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                                {isActive && (
                                    <motion.div
                                        className="nav-indicator"
                                        layoutId="sidebar-indicator"
                                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                                    />
                                )}
                            </NavLink>
                        )
                    })}
                </div>
            </nav>

            {/* Bottom Section */}
            <div className="sidebar-bottom">
                {/* Pro Badge */}
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            className="pro-badge"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                        >
                            <div className="pro-badge-icon">
                                <Sparkles size={18} />
                            </div>
                            <div className="pro-badge-content">
                                <span className="pro-badge-title">Enterprise Plan</span>
                                <span className="pro-badge-subtitle">Full access enabled</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Help Button */}
                <NavLink
                    to="/help"
                    className="nav-item help-item"
                    title={collapsed ? 'Help & Support' : undefined}
                >
                    <div className="nav-icon-wrapper">
                        <HelpCircle size={20} />
                    </div>
                    {!collapsed && <span className="nav-label">Help & Support</span>}
                </NavLink>

                {/* User Section */}
                <div className="sidebar-footer">
                    <div className="user-info">
                        <motion.div
                            className="user-avatar"
                            style={{ background: roleStyle.bg }}
                            whileHover={{ scale: 1.05 }}
                        >
                            {user?.name?.charAt(0) || 'U'}
                        </motion.div>
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.div
                                    className="user-details"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                >
                                    <span className="user-name">{user?.name || 'User'}</span>
                                    <span className="user-email">{user?.email || 'user@example.com'}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <motion.button
                        className="logout-btn"
                        onClick={handleLogout}
                        title="Logout"
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <LogOut size={18} />
                    </motion.button>
                </div>
            </div>
        </motion.aside>
    )
}
