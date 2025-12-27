import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    Layout, Shield, Activity, ChevronRight, Save,
    ArrowLeft, CheckCircle, AlertCircle, Info, Trash2, Loader2,
    Clock, IndianRupee
} from 'lucide-react'
import { strategiesAPI } from '../services/api'
import { useToast } from '../context/ToastContext'
import './StrategyBuilder.css'

interface StrategyForm {
    name: string;
    description: string;
    type: 'White Box' | 'Black Box' | 'Grey Box';
    disclosureLevel: 'Full' | 'Partial' | 'None';
    exchange: 'NSE' | 'BSE' | 'NFO' | 'MCX';
    executionWindow: {
        startTime: string;
        endTime: string;
    };
    capitalAllocation: number;
    riskSettings: {
        maxPositionSize: number;
        maxLossPerTrade: number;
        maxDailyLoss: number;
        maxOpenPositions: number;
    }
}

const STEPS = [
    { id: 1, label: 'Strategy Basics', icon: Layout, description: 'Define core identity and classification' },
    { id: 2, label: 'Execution Details', icon: Clock, description: 'Set timing and capital rules' },
    { id: 3, label: 'Risk Parameters', icon: Shield, description: 'Set safety limits and compliance rules' },
    { id: 4, label: 'Review & Launch', icon: Activity, description: 'Verify details and deploy' }
];

export default function StrategyBuilder() {
    const navigate = useNavigate()
    const { id } = useParams()
    const { showToast } = useToast()
    const [activeStep, setActiveStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const [formData, setFormData] = useState<StrategyForm>({
        name: '',
        description: '',
        type: 'White Box',
        disclosureLevel: 'Full',
        exchange: 'NSE',
        executionWindow: {
            startTime: '09:15',
            endTime: '15:30'
        },
        capitalAllocation: 100000,
        riskSettings: {
            maxPositionSize: 100,
            maxLossPerTrade: 5000,
            maxDailyLoss: 25000,
            maxOpenPositions: 5
        }
    })

    useEffect(() => {
        if (id) {
            fetchStrategy(id)
        }
    }, [id])

    const fetchStrategy = async (strategyId: string) => {
        setIsLoading(true)
        try {
            const { strategy } = await strategiesAPI.getById(strategyId) as any
            setFormData({
                name: strategy.name,
                description: strategy.description || '',
                type: strategy.type as any,
                disclosureLevel: strategy.disclosureLevel as any || 'Full',
                exchange: strategy.exchange as any || 'NSE',
                executionWindow: {
                    startTime: strategy.executionWindow?.startTime || '09:15',
                    endTime: strategy.executionWindow?.endTime || '15:30'
                },
                capitalAllocation: strategy.capitalAllocation || 100000,
                riskSettings: {
                    maxPositionSize: strategy.riskSettings?.maxPositionSize || 100,
                    maxLossPerTrade: strategy.riskSettings?.maxLossPerTrade || 5000,
                    maxDailyLoss: strategy.riskSettings?.maxDailyLoss || 25000,
                    maxOpenPositions: strategy.riskSettings?.maxOpenPositions || 5
                }
            })
        } catch (error) {
            console.error('Failed to fetch strategy:', error)
            showToast('Failed to load strategy details', 'error')
            navigate('/strategies')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!id || !window.confirm('Are you sure you want to delete this strategy? This action cannot be undone.')) return

        setIsSubmitting(true)
        try {
            await strategiesAPI.delete(id)
            showToast('Strategy deleted successfully', 'success')
            navigate('/strategies')
        } catch (error: any) {
            showToast(error.message || 'Failed to delete strategy', 'error')
            setIsSubmitting(false)
        }
    }

    const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleExecutionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        if (name === 'capitalAllocation') {
            setFormData(prev => ({ ...prev, capitalAllocation: Number(value) }))
        } else {
            setFormData(prev => ({
                ...prev,
                executionWindow: {
                    ...prev.executionWindow,
                    [name]: value
                }
            }))
        }
    }

    const handleRiskChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            riskSettings: {
                ...prev.riskSettings,
                [name]: Number(value)
            }
        }))
    }

    const validateStep = (step: number) => {
        if (step === 1) {
            return formData.name.length >= 3 && formData.description.length > 0
        }
        if (step === 2) {
            return formData.executionWindow.startTime < formData.executionWindow.endTime && formData.capitalAllocation > 0
        }
        if (step === 3) {
            return formData.riskSettings.maxPositionSize > 0 && formData.riskSettings.maxDailyLoss > 0
        }
        return true
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            if (id) {
                await strategiesAPI.update(id, formData as any)
                showToast('Strategy updated successfully', 'success')
            } else {
                await strategiesAPI.create(formData as any)
                showToast('Strategy created successfully', 'success')
            }
            navigate('/strategies')
        } catch (error: any) {
            showToast(error.message || `Failed to ${id ? 'update' : 'create'} strategy`, 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="loading-state">
                <Loader2 className="spin" size={32} />
                <p>Loading strategy details...</p>
            </div>
        )
    }

    return (
        <div className="strategy-builder">
            <header className="builder-header">
                <button className="btn-ghost" onClick={() => navigate('/strategies')} style={{ marginBottom: '16px', paddingLeft: 0 }}>
                    <ArrowLeft size={16} style={{ marginRight: '8px' }} />
                    Back to Strategies
                </button>
                <h1>{id ? 'Edit Strategy' : 'Strategy Builder'}</h1>
                <p>Design, configure, and deploy your algorithmic trading strategies with safety guardrails.</p>
            </header>

            <div className="builder-container">
                {/* Sidebar Navigation */}
                <div className="builder-nav">
                    {STEPS.map(step => (
                        <div
                            key={step.id}
                            className={`nav-step ${activeStep === step.id ? 'active' : ''} ${step.id < activeStep ? 'completed' : ''}`}
                            onClick={() => {
                                if (step.id < activeStep) setActiveStep(step.id)
                            }}
                        >
                            <div className="step-icon">
                                {step.id < activeStep ? <CheckCircle size={18} /> : <step.icon size={18} />}
                            </div>
                            <div>
                                <div style={{ fontWeight: 500 }}>{step.label}</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{step.description}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Form Content */}
                <div className="builder-content">
                    {/* STEP 1: BASICS */}
                    {activeStep === 1 && (
                        <div className="form-section fade-in">
                            <h2 className="section-title">
                                <Layout size={24} className="text-primary" />
                                Strategy Core Identity
                            </h2>

                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label className="form-label">Strategy Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="form-input"
                                        placeholder="e.g. Momentum Alpha Nifty"
                                        value={formData.name}
                                        onChange={handleBasicChange}
                                        autoFocus
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        name="description"
                                        className="form-textarea"
                                        placeholder="Describe the logic, indicators used, and intended market conditions..."
                                        value={formData.description}
                                        onChange={handleBasicChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Classification (SEBI)</label>
                                    <select
                                        name="type"
                                        className="form-select"
                                        value={formData.type}
                                        onChange={handleBasicChange}
                                    >
                                        <option value="White Box">White Box (Logic Translucent)</option>
                                        <option value="Grey Box">Grey Box (Hybrid)</option>
                                        <option value="Black Box">Black Box (Proprietary/Hidden)</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Exchange Scope</label>
                                    <select
                                        name="exchange"
                                        className="form-select"
                                        value={formData.exchange}
                                        onChange={handleBasicChange}
                                    >
                                        <option value="NSE">NSE (National Stock Exchange)</option>
                                        <option value="BSE">BSE (Bombay Stock Exchange)</option>
                                        <option value="NFO">NFO (Futures & Options)</option>
                                        <option value="MCX">MCX (Commodities)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="info-box" style={{ background: 'rgba(66, 153, 225, 0.1)', padding: '16px', borderRadius: '8px', display: 'flex', gap: '12px' }}>
                                <Info size={20} className="text-primary" style={{ flexShrink: 0 }} />
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0 }}>
                                    <strong>Compliance Note:</strong> White Box strategies are preferred for faster certification. Black Box strategies may require additional auditing steps by the risk department.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: EXECUTION */}
                    {activeStep === 2 && (
                        <div className="form-section fade-in">
                            <h2 className="section-title">
                                <Clock size={24} className="text-primary" />
                                Execution Control
                            </h2>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Execution Start Time</label>
                                    <input
                                        type="time"
                                        name="startTime"
                                        className="form-input"
                                        value={formData.executionWindow.startTime}
                                        onChange={handleExecutionChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Execution End Time</label>
                                    <input
                                        type="time"
                                        name="endTime"
                                        className="form-input"
                                        value={formData.executionWindow.endTime}
                                        onChange={handleExecutionChange}
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label className="form-label">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <IndianRupee size={16} /> Capital Allocation (₹)
                                        </div>
                                    </label>
                                    <input
                                        type="number"
                                        name="capitalAllocation"
                                        className="form-input"
                                        placeholder="e.g. 100000"
                                        value={formData.capitalAllocation}
                                        onChange={handleExecutionChange}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: RISK */}
                    {activeStep === 3 && (
                        <div className="form-section fade-in">
                            <h2 className="section-title">
                                <Shield size={24} className="text-primary" />
                                Risk Management Protocols
                            </h2>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Max Position Size (Quantity)</label>
                                    <input
                                        type="number"
                                        name="maxPositionSize"
                                        className="form-input"
                                        value={formData.riskSettings.maxPositionSize}
                                        onChange={handleRiskChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Max Open Positions</label>
                                    <input
                                        type="number"
                                        name="maxOpenPositions"
                                        className="form-input"
                                        value={formData.riskSettings.maxOpenPositions}
                                        onChange={handleRiskChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Max Loss Per Trade (₹)</label>
                                    <input
                                        type="number"
                                        name="maxLossPerTrade"
                                        className="form-input"
                                        value={formData.riskSettings.maxLossPerTrade}
                                        onChange={handleRiskChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Max Daily Loss (₹)</label>
                                    <input
                                        type="number"
                                        name="maxDailyLoss"
                                        className="form-input"
                                        value={formData.riskSettings.maxDailyLoss}
                                        onChange={handleRiskChange}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: REVIEW */}
                    {activeStep === 4 && (
                        <div className="form-section fade-in">
                            <h2 className="section-title">
                                <Activity size={24} className="text-primary" />
                                Review & Confirm
                            </h2>

                            <div className="review-card" style={{ background: 'var(--bg-tertiary)', padding: '24px', borderRadius: '12px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                    <div>
                                        <h4 style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Identity</h4>
                                        <div style={{ marginBottom: '12px' }}>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Name</div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{formData.name}</div>
                                        </div>
                                        <div style={{ marginBottom: '12px' }}>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Type</div>
                                            <div style={{ fontSize: '1rem' }}>{formData.type}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Exchange</div>
                                            <div style={{ fontSize: '1rem' }}>{formData.exchange}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Execution</h4>
                                        <div style={{ marginBottom: '12px' }}>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Window</div>
                                            <div style={{ fontSize: '1rem' }}>{formData.executionWindow.startTime} - {formData.executionWindow.endTime}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Capital</div>
                                            <div style={{ fontSize: '1rem', fontWeight: 600 }}>₹{formData.capitalAllocation.toLocaleString()}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Risk Limits</h4>
                                        <div style={{ marginBottom: '12px' }}>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Max Daily Loss</div>
                                            <div style={{ fontSize: '1.1rem', color: '#ff6b6b', fontWeight: 600 }}>₹{formData.riskSettings.maxDailyLoss.toLocaleString()}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Max Position Size</div>
                                            <div style={{ fontSize: '1rem' }}>{formData.riskSettings.maxPositionSize} Units</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <AlertCircle size={20} className="text-warning" />
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    By {id ? 'updating' : 'launching'} this strategy, you verify that it complies with current SEBI regulations. The strategy will start in <strong>{id ? 'Active' : 'Unverified'}</strong> state until audited.
                                </p>
                            </div>

                            {id && (
                                <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
                                    <h3 style={{ fontSize: '1rem', color: '#ff6b6b', marginBottom: '12px' }}>Danger Zone</h3>
                                    <button
                                        className="btn btn-outline-danger"
                                        onClick={handleDelete}
                                        style={{ borderColor: '#ff6b6b', color: '#ff6b6b', width: '100%' }}
                                    >
                                        <Trash2 size={16} />
                                        Delete Strategy Permanently
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ACTIONS */}
                    <div className="builder-actions">
                        {activeStep > 1 && (
                            <button
                                className="btn btn-secondary"
                                onClick={() => setActiveStep(prev => prev - 1)}
                            >
                                Previous
                            </button>
                        )}

                        {activeStep < 4 ? (
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    if (validateStep(activeStep)) setActiveStep(prev => prev + 1)
                                    else showToast('Please fill all required fields', 'error')
                                }}
                            >
                                Continue
                                <ChevronRight size={16} style={{ marginLeft: '8px' }} />
                            </button>
                        ) : (
                            <button
                                className="btn btn-primary"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>Creating...</>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        {id ? 'Save Changes' : 'Launch Strategy'}
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
