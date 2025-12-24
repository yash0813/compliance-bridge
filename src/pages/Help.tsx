import { HelpCircle, Mail, MessageSquare, Book, Shield, ExternalLink } from 'lucide-react'
import './Settings.css' // Reusing settings styles for consistency

export default function Help() {
    const categories = [
        {
            icon: Book,
            title: 'Documentation',
            desc: 'Browse through our detailed compliance and integration guides.',
            link: 'View Docs'
        },
        {
            icon: Shield,
            title: 'SEBI Guidelines',
            desc: 'Latest updates on algo trading regulations and mandates.',
            link: 'Read More'
        },
        {
            icon: MessageSquare,
            title: 'Priority Support',
            desc: 'Chat with our compliance experts for immediate assistance.',
            link: 'Open Chat'
        }
    ]

    return (
        <div className="settings-page">
            <div className="section-header">
                <div className="header-icon" style={{ background: 'var(--gradient-primary)' }}>
                    <HelpCircle size={28} color="white" />
                </div>
                <div>
                    <h1>Help & Support Center</h1>
                    <p>Get assistance with platform features and SEBI compliance requirements</p>
                </div>
            </div>

            <div className="settings-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
                {categories.map((cat, i) => {
                    const Icon = cat.icon
                    return (
                        <div key={i} className="settings-card card-hover">
                            <div className="card-header">
                                <Icon size={24} className="text-primary" />
                                <h3>{cat.title}</h3>
                            </div>
                            <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)', fontSize: '14px' }}>
                                {cat.desc}
                            </p>
                            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
                                {cat.link}
                                <ExternalLink size={14} />
                            </button>
                        </div>
                    )
                })}
            </div>

            <div className="settings-card" style={{ marginTop: 'var(--space-6)', textAlign: 'center', padding: 'var(--space-8)' }}>
                <Mail size={40} className="text-primary" style={{ margin: '0 auto var(--space-4)' }} />
                <h2>Still need help?</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
                    Our dedicated support team is available 24/7 for Enterprise clients.
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center' }}>
                    <a href="mailto:yash.c0813@gmail.com" className="btn btn-primary" style={{ textDecoration: 'none' }}>Contact Support</a>
                    <button className="btn btn-secondary">Email us: yash.c0813@gmail.com</button>
                </div>
            </div>
        </div>
    )
}
