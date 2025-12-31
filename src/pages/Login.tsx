import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../App'
import {
    ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight,
    CheckCircle, Zap, Shield, Activity, Lock as LockIcon,
    Sparkles, FileSearch
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { authAPI, checkAPIHealth } from '../services/api'
import './Login.css'

export default function Login() {
    const navigate = useNavigate()
    const { setUser } = useUser()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [activeFeature, setActiveFeature] = useState(0)
    const [apiAvailable, setApiAvailable] = useState<boolean | null>(null)

    // Demo credentials (fallback when backend is not running)
    const demoUsers = {
        'trader@demo.com': { id: '1', name: 'Demo Trader', email: 'trader@demo.com', role: 'trader' as const },
        'broker@demo.com': { id: '2', name: 'Broker Admin', email: 'broker@demo.com', role: 'broker' as const },
        'admin@demo.com': { id: '3', name: 'Super Admin', email: 'admin@demo.com', role: 'admin' as const },
        'regulator@demo.com': { id: '4', name: 'SEBI Auditor', email: 'regulator@demo.com', role: 'regulator' as const },
    }

    const features = [
        {
            icon: Shield,
            title: '100% Strategy IP Protection',
            description: 'Your algo strategies remain encrypted and secure on your infrastructure'
        },
        {
            icon: Zap,
            title: 'Real-time Compliance',
            description: 'Instant SEBI-compliant validation of every trading signal'
        },
        {
            icon: Activity,
            title: 'Full Audit Trail',
            description: 'Immutable logs with complete transparency for regulators'
        },
        {
            icon: LockIcon,
            title: 'Broker Control',
            description: 'Master kill switch and granular access management'
        }
    ]

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFeature(prev => (prev + 1) % features.length)
        }, 4000)
        return () => clearInterval(interval)
    }, [])

    // Check if backend API is available on mount
    useEffect(() => {
        const checkAPI = async () => {
            const isAvailable = await checkAPIHealth()
            setApiAvailable(isAvailable)
            console.log(`🔌 Backend API: ${isAvailable ? 'Connected' : 'Not available (using demo mode)'}`)
        }
        checkAPI()
    }, [])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            // Try real API first if available
            if (apiAvailable) {
                const response = await authAPI.login(email, password)
                setUser(response.user)
                navigate('/')
                return
            }
        } catch (apiError: unknown) {
            console.log('API login failed, trying demo mode...', apiError)
        }

        // Fallback to demo mode
        await new Promise(resolve => setTimeout(resolve, 500))
        const user = demoUsers[email as keyof typeof demoUsers]
        if (user && password === 'demo123') {
            localStorage.setItem('user', JSON.stringify(user))
            setUser(user)
            navigate('/')
        } else {
            setError('Invalid credentials. Try demo accounts below.')
        }
        setLoading(false)
    }

    const quickLogin = (email: string) => {
        setEmail(email)
        setPassword('demo123')
    }

    return (
        <div className="login-page">
            {/* Animated Background */}
            <div className="login-bg">
                <div className="bg-gradient" />
                <div className="bg-grid" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 2 }}
                    className="bg-glow bg-glow-1"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 2, delay: 0.5 }}
                    className="bg-glow bg-glow-2"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 2, delay: 1 }}
                    className="bg-glow bg-glow-3"
                />
                <div className="floating-shapes">
                    {[1, 2, 3, 4, 5].map(i => (
                        <motion.div
                            key={i}
                            className={`shape shape-${i}`}
                            animate={{
                                y: [0, -20, 0],
                                rotate: [0, 10, 0],
                                scale: [1, 1.05, 1]
                            }}
                            transition={{
                                duration: 5 + i,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Login Container */}
            <motion.div
                className="login-container"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                {/* Left Panel - Branding */}
                <div className="login-branding">
                    <div className="branding-content">
                        {/* Logo */}
                        <motion.div
                            className="logo-section"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="logo-large">
                                <ShieldCheck size={32} />
                            </div>
                            <div className="logo-text-large">
                                <span className="logo-title-large">Compliance</span>
                                <span className="logo-subtitle-large">Bridge</span>
                            </div>
                        </motion.div>

                        <motion.div
                            className="tagline-section"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            <h1>SEBI-Compliant Algorithmic Trading Infrastructure</h1>
                            <p>The bridge between algo traders and brokers—enabling compliant, secure, and transparent automated trading.</p>
                        </motion.div>

                        {/* Animated Features */}
                        <div className="features-carousel">
                            <AnimatePresence mode="wait">
                                {features.map((feature, index) => {
                                    if (activeFeature !== index) return null
                                    const Icon = feature.icon
                                    return (
                                        <motion.div
                                            key={index}
                                            className="feature-slide active"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <div className="feature-icon">
                                                <Icon size={28} />
                                            </div>
                                            <div className="feature-content">
                                                <h3>{feature.title}</h3>
                                                <p>{feature.description}</p>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </AnimatePresence>
                            <div className="carousel-dots">
                                {features.map((_, index) => (
                                    <button
                                        key={index}
                                        className={`carousel-dot ${activeFeature === index ? 'active' : ''}`}
                                        onClick={() => setActiveFeature(index)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Stats */}
                        <motion.div
                            className="branding-stats"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                        >
                            <div className="stat-item">
                                <span className="stat-value">99.9%</span>
                                <span className="stat-label">Uptime SLA</span>
                            </div>
                            <div className="stat-divider" />
                            <div className="stat-item">
                                <span className="stat-value">&lt;1ms</span>
                                <span className="stat-label">Latency</span>
                            </div>
                            <div className="stat-divider" />
                            <div className="stat-item">
                                <span className="stat-value">50+</span>
                                <span className="stat-label">Brokers</span>
                            </div>
                        </motion.div>

                        {/* Trust Badges */}
                        <motion.div
                            className="trust-section"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                        >
                            <span className="trust-label">Trusted by leading brokers</span>
                            <div className="trust-logos">
                                <div className="trust-logo">Zerodha</div>
                                <div className="trust-logo">Angel One</div>
                                <div className="trust-logo">Upstox</div>
                                <div className="trust-logo">Groww</div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Right Panel - Login Form */}
                <motion.div
                    className="login-form-panel"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="login-form-container">
                        {/* Form Header */}
                        <div className="form-header">
                            <motion.div
                                className="welcome-badge"
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', damping: 12 }}
                            >
                                <Sparkles size={14} />
                                <span>Welcome back</span>
                            </motion.div>
                            <h2>Sign in to your account</h2>
                            <p>Enter your credentials to access the platform</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                className="error-message animate-shake"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                            >
                                <span className="error-icon">!</span>
                                {error}
                            </motion.div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleLogin} className="login-form">
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <div className="input-wrapper">
                                    <Mail size={18} className="input-icon" />
                                    <input
                                        type="email"
                                        className="form-input with-icon"
                                        placeholder="you@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <div className="form-label-row">
                                    <label className="form-label">Password</label>
                                    <a href="#" className="forgot-link">Forgot password?</a>
                                </div>
                                <div className="input-wrapper">
                                    <Lock size={18} className="input-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="form-input with-icon"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-options">
                                <label className="checkbox-wrapper">
                                    <input type="checkbox" className="checkbox-input" />
                                    <span className="checkbox-custom" />
                                    <span className="checkbox-label">Remember me for 30 days</span>
                                </label>
                            </div>

                            <motion.button
                                type="submit"
                                className="btn btn-primary btn-login"
                                disabled={loading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner" />
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </motion.button>
                        </form>

                        {/* Demo Accounts */}
                        <div className="demo-section">
                            <div className="demo-divider">
                                <span>Quick Demo Access</span>
                            </div>
                            <div className="demo-buttons">
                                {[
                                    { id: 'trader', email: 'trader@demo.com', title: 'Trader', desc: 'View trading dashboard', icon: Activity },
                                    { id: 'broker', email: 'broker@demo.com', title: 'Broker', desc: 'Control & compliance', icon: Shield },
                                    { id: 'admin', email: 'admin@demo.com', title: 'Admin', desc: 'Full platform access', icon: Zap },
                                    { id: 'regulator', email: 'regulator@demo.com', title: 'Regulator', desc: 'Read-only audit view', icon: FileSearch },
                                ].map((item, i) => (
                                    <motion.button
                                        key={item.id}
                                        type="button"
                                        className={`demo-btn ${item.id}`}
                                        onClick={() => quickLogin(item.email)}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 1.2 + (i * 0.1) }}
                                        whileHover={{ y: -4, backgroundColor: 'var(--surface-hover)' }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <div className="demo-btn-icon">
                                            <item.icon size={18} />
                                        </div>
                                        <div className="demo-btn-content">
                                            <span className="demo-btn-title">{item.title}</span>
                                            <span className="demo-btn-desc">{item.desc}</span>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                            <p className="demo-hint">
                                <LockIcon size={12} />
                                Password: <code>demo123</code>
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="form-footer">
                            <p>Protected by enterprise-grade security</p>
                            <div className="security-badges">
                                <span className="security-badge">
                                    <CheckCircle size={12} />
                                    256-bit SSL
                                </span>
                                <span className="security-badge">
                                    <CheckCircle size={12} />
                                    SOC 2
                                </span>
                                <span className="security-badge">
                                    <CheckCircle size={12} />
                                    ISO 27001
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    )
}
