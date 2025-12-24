import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useUser } from '../App'
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
import './Sidebar.css'

// Navigation items are defined per role - each role sees different menu options
// This keeps the UI clean and role-specific

const traderNavItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/strategies', icon: Zap, label: 'Strategies' },
    { path: '/strategy-compliance', icon: Award, label: 'Certification' },
    { path: '/positions', icon: Briefcase, label: 'Positions' },
    { path: '/orders', icon: FileText, label: 'Orders' },
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
    { path: '/settings', icon: Settings, label: 'Settings' },
]

// Read-only regulator access
const regulatorNavItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { path: '/audit-timeline', icon: Activity, label: 'Audit Timeline' },
    { path: '/strategy-compliance', icon: Award, label: 'Certification' },
    { path: '/orders', icon: FileText, label: 'Order History' },
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

    const handleLogout = () => {
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
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            {/* Background Pattern */}
            <div className="sidebar-bg-pattern" />

            {/* Logo */}
            <div className="sidebar-logo">
                <div className="logo-icon">
                    <ShieldCheck size={24} />
                </div>
                {!collapsed && (
                    <div className="logo-text">
                        <span className="logo-title">Compliance</span>
                        <span className="logo-subtitle">Bridge</span>
                    </div>
                )}
                <button
                    className="collapse-btn"
                    onClick={() => setCollapsed(!collapsed)}
                    title={collapsed ? 'Expand' : 'Collapse'}
                >
                    <ChevronLeft size={18} />
                </button>
            </div>

            {/* Role Badge */}
            {!collapsed && (
                <div className="role-badge" style={{ background: roleStyle.bg }}>
                    <RoleIcon size={14} />
                    <span>{user?.role?.charAt(0).toUpperCase()}{user?.role?.slice(1)} Portal</span>
                </div>
            )}

            {/* Navigation */}
            <nav className="sidebar-nav">
                <div className="nav-section">
                    {!collapsed && <span className="nav-section-title">Main Menu</span>}
                    {navItems.map(item => {
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
                                <div className="nav-icon-wrapper">
                                    <Icon size={20} />
                                </div>
                                {!collapsed && <span className="nav-label">{item.label}</span>}
                                {isActive && <div className="nav-indicator" />}
                            </NavLink>
                        )
                    })}
                </div>
            </nav>

            {/* Bottom Section */}
            <div className="sidebar-bottom">
                {/* Pro Badge */}
                {!collapsed && (
                    <div className="pro-badge">
                        <div className="pro-badge-icon">
                            <Sparkles size={18} />
                        </div>
                        <div className="pro-badge-content">
                            <span className="pro-badge-title">Enterprise Plan</span>
                            <span className="pro-badge-subtitle">Full access enabled</span>
                        </div>
                    </div>
                )}

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
                        <div className="user-avatar" style={{ background: roleStyle.bg }}>
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        {!collapsed && (
                            <div className="user-details">
                                <span className="user-name">{user?.name || 'User'}</span>
                                <span className="user-email">{user?.email || 'user@example.com'}</span>
                            </div>
                        )}
                    </div>
                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </aside>
    )
}
