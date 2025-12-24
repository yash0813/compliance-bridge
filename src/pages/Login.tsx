import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../App'
import {
    ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight,
    CheckCircle, Zap, Shield, Activity, Lock as LockIcon,
    Sparkles, FileSearch
} from 'lucide-react'
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

    // Demo credentials
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

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        await new Promise(resolve => setTimeout(resolve, 1200))

        const user = demoUsers[email as keyof typeof demoUsers]
        if (user && password === 'demo123') {
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
                <div className="bg-glow bg-glow-1" />
                <div className="bg-glow bg-glow-2" />
                <div className="bg-glow bg-glow-3" />
                <div className="floating-shapes">
                    <div className="shape shape-1" />
                    <div className="shape shape-2" />
                    <div className="shape shape-3" />
                    <div className="shape shape-4" />
                    <div className="shape shape-5" />
                </div>
            </div>

            {/* Login Container */}
            <div className="login-container">
                {/* Left Panel - Branding */}
                <div className="login-branding">
                    <div className="branding-content">
                        {/* Logo */}
                        <div className="logo-section">
                            <div className="logo-large">
                                <ShieldCheck size={32} />
                            </div>
                            <div className="logo-text-large">
                                <span className="logo-title-large">Compliance</span>
                                <span className="logo-subtitle-large">Bridge</span>
                            </div>
                        </div>

                        <div className="tagline-section">
                            <h1>SEBI-Compliant Algorithmic Trading Infrastructure</h1>
                            <p>The bridge between algo traders and brokers—enabling compliant, secure, and transparent automated trading.</p>
                        </div>

                        {/* Animated Features */}
                        <div className="features-carousel">
                            {features.map((feature, index) => {
                                const Icon = feature.icon
                                return (
                                    <div
                                        key={index}
                                        className={`feature-slide ${activeFeature === index ? 'active' : ''}`}
                                    >
                                        <div className="feature-icon">
                                            <Icon size={28} />
                                        </div>
                                        <div className="feature-content">
                                            <h3>{feature.title}</h3>
                                            <p>{feature.description}</p>
                                        </div>
                                    </div>
                                )
                            })}
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
                        <div className="branding-stats">
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
                        </div>

                        {/* Trust Badges */}
                        <div className="trust-section">
                            <span className="trust-label">Trusted by leading brokers</span>
                            <div className="trust-logos">
                                <div className="trust-logo">Zerodha</div>
                                <div className="trust-logo">Angel One</div>
                                <div className="trust-logo">Upstox</div>
                                <div className="trust-logo">Groww</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Login Form */}
                <div className="login-form-panel">
                    <div className="login-form-container">
                        {/* Form Header */}
                        <div className="form-header">
                            <div className="welcome-badge">
                                <Sparkles size={14} />
                                <span>Welcome back</span>
                            </div>
                            <h2>Sign in to your account</h2>
                            <p>Enter your credentials to access the platform</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="error-message animate-shake">
                                <span className="error-icon">!</span>
                                {error}
                            </div>
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

                            <button
                                type="submit"
                                className="btn btn-primary btn-login"
                                disabled={loading}
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
                            </button>
                        </form>

                        {/* Demo Accounts */}
                        <div className="demo-section">
                            <div className="demo-divider">
                                <span>Quick Demo Access</span>
                            </div>
                            <div className="demo-buttons">
                                <button
                                    type="button"
                                    className="demo-btn trader"
                                    onClick={() => quickLogin('trader@demo.com')}
                                >
                                    <div className="demo-btn-icon">
                                        <Activity size={18} />
                                    </div>
                                    <div className="demo-btn-content">
                                        <span className="demo-btn-title">Trader</span>
                                        <span className="demo-btn-desc">View trading dashboard</span>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    className="demo-btn broker"
                                    onClick={() => quickLogin('broker@demo.com')}
                                >
                                    <div className="demo-btn-icon">
                                        <Shield size={18} />
                                    </div>
                                    <div className="demo-btn-content">
                                        <span className="demo-btn-title">Broker</span>
                                        <span className="demo-btn-desc">Control & compliance</span>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    className="demo-btn admin"
                                    onClick={() => quickLogin('admin@demo.com')}
                                >
                                    <div className="demo-btn-icon">
                                        <Zap size={18} />
                                    </div>
                                    <div className="demo-btn-content">
                                        <span className="demo-btn-title">Admin</span>
                                        <span className="demo-btn-desc">Full platform access</span>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    className="demo-btn regulator"
                                    onClick={() => quickLogin('regulator@demo.com')}
                                >
                                    <div className="demo-btn-icon">
                                        <FileSearch size={18} />
                                    </div>
                                    <div className="demo-btn-content">
                                        <span className="demo-btn-title">Regulator</span>
                                        <span className="demo-btn-desc">Read-only audit view</span>
                                    </div>
                                </button>
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
                </div>
            </div>
        </div>
    )
}
