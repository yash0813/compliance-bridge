import {
    Shield, Lock, Eye, FileText, Users, Building2,
    CheckCircle, ArrowRight, Zap, Activity, Server,
    Award
} from 'lucide-react'
import './HowItWorks.css'

export default function HowItWorks() {
    const stakeholders = [
        {
            icon: Zap,
            title: 'Algo Traders',
            subtitle: 'Strategy IP Protected',
            color: '#10B981',
            points: [
                'Strategies execute without exposing source code',
                'Full transparency on execution status',
                'Real-time P&L and performance tracking',
                'Version control for all strategy updates'
            ]
        },
        {
            icon: Building2,
            title: 'Brokers',
            subtitle: 'Execution Controlled',
            color: '#6366F1',
            points: [
                'Master kill switch for instant halt',
                'Individual user pause/block controls',
                'Real-time API health monitoring',
                'Granular compliance rule enforcement'
            ]
        },
        {
            icon: Users,
            title: 'Traders',
            subtitle: 'Fully Transparent',
            color: '#F59E0B',
            points: [
                'Clear visibility into all orders',
                'Real-time compliance status per strategy',
                'Complete audit trail of every signal',
                'Instant notifications on order status'
            ]
        },
        {
            icon: Shield,
            title: 'Regulators',
            subtitle: 'Completely Auditable',
            color: '#EC4899',
            points: [
                'Read-only access to all trading data',
                'Immutable audit logs with timestamps',
                'Export capabilities for investigations',
                'Full compliance rule visibility'
            ]
        }
    ]

    const complianceFeatures = [
        {
            icon: Eye,
            title: 'Real-time Monitoring',
            description: 'Every signal validated against SEBI-compliant rules before execution'
        },
        {
            icon: Lock,
            title: '100% IP Protection',
            description: 'Strategy logic never leaves trader infrastructure - only signals transmitted'
        },
        {
            icon: FileText,
            title: 'Immutable Audit Trail',
            description: 'Complete signal-to-execution timeline with cryptographic verification'
        },
        {
            icon: Activity,
            title: 'Instant Intervention',
            description: 'Master kill switch and granular controls for immediate risk management'
        }
    ]

    return (
        <div className="how-it-works-page">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-badge">
                    <Shield size={16} />
                    <span>SEBI-Compliant Infrastructure</span>
                </div>
                <h1>How Compliance-Bridge<br />Protects Everyone</h1>
                <p className="hero-subtitle">
                    The only platform where algo traders, brokers, regulators, and traders
                    all benefit from complete transparency and control.
                </p>
            </div>

            {/* Stakeholder Grid */}
            <div className="stakeholder-section">
                <div className="section-header centered">
                    <h2>Built for Every Stakeholder</h2>
                    <p>Each participant gets exactly what they need — security, control, or transparency</p>
                </div>
                <div className="stakeholder-grid">
                    {stakeholders.map((stake, idx) => {
                        const Icon = stake.icon
                        return (
                            <div key={idx} className="stakeholder-card">
                                <div className="stakeholder-header">
                                    <div className="stakeholder-icon" style={{ background: `${stake.color}15`, color: stake.color }}>
                                        <Icon size={28} />
                                    </div>
                                    <div className="stakeholder-title">
                                        <h3>{stake.title}</h3>
                                        <span style={{ color: stake.color }}>{stake.subtitle}</span>
                                    </div>
                                </div>
                                <ul className="stakeholder-points">
                                    {stake.points.map((point, i) => (
                                        <li key={i}>
                                            <CheckCircle size={16} style={{ color: stake.color }} />
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Flow Diagram */}
            <div className="flow-section">
                <div className="section-header centered">
                    <h2>The Compliance-Bridge Flow</h2>
                    <p>How every signal travels from strategy to execution with full compliance</p>
                </div>
                <div className="flow-diagram">
                    <div className="flow-step">
                        <div className="flow-icon">
                            <Zap size={24} />
                        </div>
                        <div className="flow-content">
                            <h4>1. Signal Generated</h4>
                            <p>Strategy generates trading signal on trader's infrastructure</p>
                        </div>
                        <div className="flow-arrow">
                            <ArrowRight size={20} />
                        </div>
                    </div>
                    <div className="flow-step">
                        <div className="flow-icon compliance">
                            <Shield size={24} />
                        </div>
                        <div className="flow-content">
                            <h4>2. Compliance Check</h4>
                            <p>Signal validated against all active compliance rules</p>
                        </div>
                        <div className="flow-arrow">
                            <ArrowRight size={20} />
                        </div>
                    </div>
                    <div className="flow-step">
                        <div className="flow-icon">
                            <Server size={24} />
                        </div>
                        <div className="flow-content">
                            <h4>3. Broker Routing</h4>
                            <p>Approved signal sent to broker's order gateway</p>
                        </div>
                        <div className="flow-arrow">
                            <ArrowRight size={20} />
                        </div>
                    </div>
                    <div className="flow-step">
                        <div className="flow-icon success">
                            <CheckCircle size={24} />
                        </div>
                        <div className="flow-content">
                            <h4>4. Execution & Audit</h4>
                            <p>Order executed and immutably logged for compliance</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Features */}
            <div className="features-section">
                <div className="section-header centered">
                    <h2>Compliance at Every Step</h2>
                    <p>Enterprise-grade compliance infrastructure for algorithmic trading</p>
                </div>
                <div className="features-grid">
                    {complianceFeatures.map((feature, idx) => {
                        const Icon = feature.icon
                        return (
                            <div key={idx} className="feature-card">
                                <div className="feature-icon">
                                    <Icon size={24} />
                                </div>
                                <h4>{feature.title}</h4>
                                <p>{feature.description}</p>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Certification Banner */}
            <div className="certification-banner">
                <div className="banner-content">
                    <div className="banner-icon">
                        <Award size={40} />
                    </div>
                    <div className="banner-text">
                        <h3>Enterprise-Ready Compliance</h3>
                        <p>Built to meet SEBI's algorithmic trading guidelines with full audit capabilities</p>
                    </div>
                </div>
                <div className="certification-badges">
                    <div className="cert-badge">
                        <CheckCircle size={16} />
                        <span>SEBI Compliant</span>
                    </div>
                    <div className="cert-badge">
                        <CheckCircle size={16} />
                        <span>Audit Ready</span>
                    </div>
                    <div className="cert-badge">
                        <CheckCircle size={16} />
                        <span>99.9% SLA</span>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="cta-section">
                <h2>Ready to see it in action?</h2>
                <p>Schedule a demo with our team to see how Compliance-Bridge can protect your trading operations.</p>
                <div className="cta-buttons">
                    <button className="btn btn-primary btn-lg">
                        <Zap size={18} />
                        Request Demo
                    </button>
                    <button className="btn btn-secondary btn-lg">
                        <FileText size={18} />
                        Download Whitepaper
                    </button>
                </div>
            </div>
        </div>
    )
}
