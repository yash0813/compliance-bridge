import { useState } from 'react'
import { Plus, Edit2, Trash2, CheckCircle, AlertCircle, Search } from 'lucide-react'
import './Compliance.css'

const rulesData = [
    { id: 1, name: 'Market Hours Check', code: 'MKT_HOURS', description: 'Reject orders outside market trading hours (9:15 AM - 3:30 PM IST)', category: 'exchange', status: 'active', priority: 10, checked: 45678, passed: 45678 },
    { id: 2, name: 'Max Order Value', code: 'MAX_ORD_VAL', description: 'Maximum single order value limit of ₹10,00,000', category: 'broker', status: 'active', priority: 20, checked: 45678, passed: 45122 },
    { id: 3, name: 'Rate Limit', code: 'RATE_LIMIT', description: 'Maximum 60 orders per minute per user', category: 'system', status: 'active', priority: 5, checked: 45678, passed: 45500 },
    { id: 4, name: 'Lot Size Validation', code: 'LOT_SIZE', description: 'Order quantity must be a multiple of lot size', category: 'exchange', status: 'active', priority: 15, checked: 45678, passed: 45678 },
    { id: 5, name: 'Circuit Breaker', code: 'CIRCUIT_BRK', description: 'Halt trading when instrument hits circuit limit', category: 'exchange', status: 'draft', priority: 10, checked: 0, passed: 0 },
    { id: 6, name: 'Daily Loss Limit', code: 'DAILY_LOSS', description: 'Stop trading when daily loss exceeds limit', category: 'user', status: 'active', priority: 25, checked: 12340, passed: 12100 },
]

export default function Compliance() {
    const [rules] = useState(rulesData)
    const [searchTerm, setSearchTerm] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('all')

    const filteredRules = rules.filter(r => {
        const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.code.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter
        return matchesSearch && matchesCategory
    })

    const categories = ['all', 'exchange', 'broker', 'user', 'system']

    return (
        <div className="compliance-page">
            <div className="page-header">
                <div>
                    <h1>Compliance Rules</h1>
                    <p>Manage and configure compliance validation rules</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary">
                        <Plus size={16} />
                        Add Rule
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="compliance-toolbar">
                <div className="category-filters">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`filter-btn ${categoryFilter === cat ? 'active' : ''}`}
                            onClick={() => setCategoryFilter(cat)}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search rules..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Rules List */}
            <div className="rules-list">
                {filteredRules.map(rule => (
                    <div key={rule.id} className={`rule-card ${rule.status}`}>
                        <div className="rule-header">
                            <div className="rule-info">
                                <div className="rule-status-icon">
                                    {rule.status === 'active' ? (
                                        <CheckCircle size={20} className="active" />
                                    ) : (
                                        <AlertCircle size={20} className="draft" />
                                    )}
                                </div>
                                <div>
                                    <h3>{rule.name}</h3>
                                    <code className="rule-code">{rule.code}</code>
                                </div>
                            </div>
                            <div className="rule-actions">
                                <button className="btn btn-ghost btn-sm">
                                    <Edit2 size={14} />
                                </button>
                                <button className="btn btn-ghost btn-sm">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>

                        <p className="rule-description">{rule.description}</p>

                        <div className="rule-meta">
                            <div className="meta-item">
                                <span className="meta-label">Category</span>
                                <span className={`category-badge ${rule.category}`}>{rule.category}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Priority</span>
                                <span className="meta-value">{rule.priority}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Checked</span>
                                <span className="meta-value">{rule.checked.toLocaleString()}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Pass Rate</span>
                                <span className="meta-value">
                                    {rule.checked > 0 ? ((rule.passed / rule.checked) * 100).toFixed(1) : 0}%
                                </span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Status</span>
                                <span className={`status-badge ${rule.status}`}>{rule.status}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
