/**
 * Compliance-Bridge Main Application
 * 
 * @author Yash
 * @version 1.0.0
 * @description SEBI-compliant algo trading platform with multi-role dashboards
 * 
 * Using HashRouter for Electron desktop app compatibility
 * (file:// protocol doesn't work with BrowserRouter)
 */

import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, createContext, useContext } from 'react'
import Layout from './components/Layout'
import TraderDashboard from './pages/TraderDashboard'
import BrokerDashboard from './pages/BrokerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Strategies from './pages/Strategies'
import Orders from './pages/Orders'
import Positions from './pages/Positions'
import Compliance from './pages/Compliance'
import AuditLogs from './pages/AuditLogs'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Help from './pages/Help'
// New Enterprise Pages
import AuditTimeline from './pages/AuditTimeline'
import BrokerHealth from './pages/BrokerHealth'
import StrategyCompliance from './pages/StrategyCompliance'
import HowItWorks from './pages/HowItWorks'
import SecurityCompliance from './pages/SecurityCompliance'

// Theme Context
interface ThemeContextType {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
    theme: 'light',
    toggleTheme: () => { }
});

export const useTheme = () => useContext(ThemeContext);

// User Context - Added 'regulator' role for read-only auditor access
interface User {
    id: string;
    name: string;
    email: string;
    role: 'trader' | 'broker' | 'admin' | 'regulator';
    avatar?: string;
}

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    isAuthenticated: boolean;
}

export const UserContext = createContext<UserContextType>({
    user: null,
    setUser: () => { },
    isAuthenticated: false
});

export const useUser = () => useContext(UserContext);

function App() {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const saved = localStorage.getItem('theme');
        return (saved as 'light' | 'dark') || 'light';
    });

    const [user, setUser] = useState<User | null>(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });

    const toggleTheme = () => {
        setTheme(prev => {
            const next = prev === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', next);
            document.documentElement.setAttribute('data-theme', next);
            return next;
        });
    };

    const handleSetUser = (newUser: User | null) => {
        setUser(newUser);
        if (newUser) {
            localStorage.setItem('user', JSON.stringify(newUser));
        } else {
            localStorage.removeItem('user');
        }
    };

    // Apply theme on mount
    if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', theme);
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <UserContext.Provider value={{ user, setUser: handleSetUser, isAuthenticated: !!user }}>
                <HashRouter>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/" element={user ? <Layout /> : <Navigate to="/login" />}>
                            <Route index element={
                                user?.role === 'admin' ? <AdminDashboard /> :
                                    user?.role === 'broker' ? <BrokerDashboard /> :
                                        user?.role === 'regulator' ? <AuditTimeline /> :
                                            <TraderDashboard />
                            } />
                            <Route path="dashboard" element={
                                user?.role === 'admin' ? <AdminDashboard /> :
                                    user?.role === 'broker' ? <BrokerDashboard /> :
                                        user?.role === 'regulator' ? <AuditTimeline /> :
                                            <TraderDashboard />
                            } />
                            <Route path="strategies" element={<Strategies />} />
                            <Route path="orders" element={<Orders />} />
                            <Route path="positions" element={<Positions />} />
                            <Route path="compliance" element={<Compliance />} />
                            <Route path="audit" element={<AuditLogs />} />
                            <Route path="settings" element={<Settings />} />
                            {/* New Enterprise Routes */}
                            <Route path="audit-timeline" element={<AuditTimeline />} />
                            <Route path="broker-health" element={<BrokerHealth />} />
                            <Route path="strategy-compliance" element={<StrategyCompliance />} />
                            <Route path="how-it-works" element={<HowItWorks />} />
                            <Route path="security" element={<SecurityCompliance />} />
                            <Route path="help" element={<Help />} />
                        </Route>
                    </Routes>
                </HashRouter>
            </UserContext.Provider>
        </ThemeContext.Provider>
    )
}

export default App
