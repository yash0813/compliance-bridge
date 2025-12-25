/**
 * Document Control & Policy Management Page
 * 
 * @description Features:
 * - List of compliance policies (internal/external)
 * - Version control tracking
 * - "Read & Acknowledge" workflow for users
 * - Role-based visibility (Admin manages, others view/sign)
 */

import { useState } from 'react'
import {
    FileText, CheckCircle, Shield,
    Download, Search, Filter, PenTool,
    AlertCircle, FileCheck
} from 'lucide-react'
import { useUser } from '../App'
import { useToast } from '../context/ToastContext'
import './Policies.css'

interface Policy {
    id: string
    title: string
    category: 'Internal' | 'SEBI' | 'Risk' | 'Legal'
    version: string
    lastUpdated: string
    status: 'active' | 'draft' | 'archived'
    requiredAck: boolean
    userAckStatus?: 'pending' | 'signed'
    description: string
}

const MOCK_POLICIES: Policy[] = [
    {
        id: 'POL-001',
        title: 'Algo Trading Risk Controls',
        category: 'Risk',
        version: 'v2.1',
        lastUpdated: '2025-10-15',
        status: 'active',
        requiredAck: true,
        userAckStatus: 'pending',
        description: 'Mandatory risk limits and kill-switch protocols for all algo traders.'
    },
    {
        id: 'POL-002',
        title: 'SEBI Circular: SEBI/HO/MRD/2025/112',
        category: 'SEBI',
        version: 'v1.0',
        lastUpdated: '2025-12-01',
        status: 'active',
        requiredAck: true,
        userAckStatus: 'pending',
        description: 'Guidelines for "Broker as Principal" and vendor empanelment norms.'
    },
    {
        id: 'POL-003',
        title: 'Data Privacy & Audit Logs',
        category: 'Internal',
        version: 'v1.4',
        lastUpdated: '2025-08-20',
        status: 'active',
        requiredAck: false,
        userAckStatus: 'signed',
        description: 'Policy regarding immutable audit trails and data retention periods.'
    }
]

export default function Policies() {
    const { user } = useUser()
    const { showToast } = useToast()
    const [policies, setPolicies] = useState<Policy[]>(MOCK_POLICIES)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null)

    const handleAcknowledge = (id: string) => {
        setPolicies(prev => prev.map(p =>
            p.id === id ? { ...p, userAckStatus: 'signed' } : p
        ))
        showToast('Policy acknowledged successfully. Audit record created.', 'success')
        if (selectedPolicy?.id === id) {
            setSelectedPolicy(prev => prev ? { ...prev, userAckStatus: 'signed' } : null)
        }
    }

    const filteredPolicies = policies.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="policies-page">
            <div className="page-header">
                <div className="header-content">
                    <div className="header-icon policy">
                        <FileCheck size={28} />
                    </div>
                    <div>
                        <h1>Document Control & Policies</h1>
                        <p>Manage, version, and acknowledge compliance documents</p>
                    </div>
                </div>
                {user?.role === 'admin' && (
                    <button className="btn btn-primary">
                        <PenTool size={16} />
                        Draft New Policy
                    </button>
                )}
            </div>

            <div className="policies-layout">
                {/* Policy List */}
                <div className="policy-list-section">
                    <div className="filters-bar">
                        <div className="search-box">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search policies..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className="btn btn-ghost">
                            <Filter size={18} />
                        </button>
                    </div>

                    <div className="policy-cards">
                        {filteredPolicies.map(policy => (
                            <div
                                key={policy.id}
                                className={`policy-card ${selectedPolicy?.id === policy.id ? 'active' : ''}`}
                                onClick={() => setSelectedPolicy(policy)}
                            >
                                <div className="policy-card-header">
                                    <span className={`category-tag ${policy.category.toLowerCase()}`}>
                                        {policy.category}
                                    </span>
                                    {policy.requiredAck && policy.userAckStatus === 'pending' && (
                                        <span className="status-badge warning" title="Action Required">
                                            <AlertCircle size={12} /> Pending Ack
                                        </span>
                                    )}
                                    {policy.userAckStatus === 'signed' && (
                                        <span className="status-badge success">
                                            <CheckCircle size={12} /> Signed
                                        </span>
                                    )}
                                </div>
                                <h3>{policy.title}</h3>
                                <div className="policy-meta">
                                    <span>{policy.version}</span>
                                    <span>•</span>
                                    <span>{policy.lastUpdated}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Policy Detail / Viewer */}
                <div className="policy-viewer-section">
                    {selectedPolicy ? (
                        <div className="policy-viewer">
                            <div className="viewer-header">
                                <div className="viewer-title">
                                    <h2>{selectedPolicy.title}</h2>
                                    <span className="policy-id">{selectedPolicy.id}</span>
                                </div>
                                <div className="viewer-actions">
                                    <button className="btn btn-secondary">
                                        <Download size={16} /> Download PDF
                                    </button>
                                </div>
                            </div>

                            <div className="policy-content-preview">
                                <div className="preview-placeholder">
                                    <FileText size={48} />
                                    <p>Document Preview</p>
                                    <p className="preview-text">{selectedPolicy.description}</p>

                                    <div className="policy-changelog">
                                        <h4>Change Log</h4>
                                        <ul>
                                            <li><strong>{selectedPolicy.version}</strong> - Current Version (Approved by Compliance)</li>
                                            <li><strong>v1.0</strong> - Initial Draft (2024-01-10)</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="viewer-footer">
                                <div className="audit-info">
                                    <Shield size={16} />
                                    <span>This document is version-controlled. All acknowledgements are logged in the Audit Trail.</span>
                                </div>
                                {selectedPolicy.requiredAck && selectedPolicy.userAckStatus === 'pending' ? (
                                    <button
                                        className="btn btn-primary ack-btn"
                                        onClick={() => handleAcknowledge(selectedPolicy.id)}
                                    >
                                        <CheckCircle size={18} />
                                        I Read & Acknowledge
                                    </button>
                                ) : (
                                    <div className="ack-status">
                                        <CheckCircle size={18} color="var(--success-500)" />
                                        <span>Acknowledged on {new Date().toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <FileText size={48} />
                            <p>Select a policy to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
