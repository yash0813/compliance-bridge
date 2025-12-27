import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Play, Pause, Settings, Zap, MoreVertical, Search, Loader2, Trash2, Edit, Copy } from 'lucide-react'
import { strategiesAPI } from '../services/api'
import { useToast } from '../context/ToastContext'
import './Strategies.css'

interface StrategyData {
    id: string
    name: string
    description: string
    status: 'active' | 'paused'
    pnl: number
    pnlPct: number
    winRate: number
    trades: number
    signals: number
    lastSignal: string
    broker: string
}

export default function Strategies() {
    const navigate = useNavigate()
    const [strategies, setStrategies] = useState<StrategyData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeMenu, setActiveMenu] = useState<string | null>(null)

    const { showToast } = useToast()

    useEffect(() => {
        const handleClickOutside = () => {
            setActiveMenu(null);
        }
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [])

    const handleDelete = async (id: string, name: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent document listener from firing
        e.preventDefault();

        // Close menu immediately
        setActiveMenu(null);

        // Small timeout to allow menu to close visually before alert blocks thread
        setTimeout(async () => {
            if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

            try {
                await strategiesAPI.delete(id);
                setStrategies(prev => prev.filter(s => s.id !== id));
                showToast('Strategy deleted successfully', 'success');
            } catch (error: any) {
                console.error('Failed to delete strategy:', error);
                showToast(error.message || 'Failed to delete strategy', 'error');
                fetchStrategies();
            }
        }, 50);
    }

    const toggleMenu = (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Important: Prevent document click from closing it immediately
        setActiveMenu(prev => prev === id ? null : id);
    }

    const fetchStrategies = async () => {
        setIsLoading(true)
        try {
            const response = await strategiesAPI.getAll()
            if (response.strategies) {
                const mappedData: StrategyData[] = response.strategies.map((s: any) => ({
                    id: s._id,
                    name: s.name,
                    description: s.description || 'No description provided',
                    status: s.isActive && !s.isPaused ? 'active' : 'paused',
                    pnl: s.metrics?.totalPnL || 0,
                    pnlPct: s.metrics?.roi || 0, // Assuming ROI is available or 0
                    winRate: s.metrics?.winRate || 0,
                    trades: s.metrics?.totalTrades || 0,
                    signals: 0, // Not currently tracked in basic metrics
                    lastSignal: 'Unknown',
                    broker: 'Multi-Broker' // Default for now
                }))
                setStrategies(mappedData)
            }
        } catch (error) {
            console.error('Failed to fetch strategies:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchStrategies()
    }, [])

    const toggleStrategy = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'paused' : 'active'
        try {
            // Optimistic update
            setStrategies(prev => prev.map(s =>
                s.id === id ? { ...s, status: newStatus } : s
            ))

            await strategiesAPI.updateStatus(id, newStatus)
        } catch (error) {
            console.error('Failed to update strategy status:', error)
            // Revert on error
            setStrategies(prev => prev.map(s =>
                s.id === id ? { ...s, status: currentStatus as 'active' | 'paused' } : s
            ))
        }
    }

    const filteredStrategies = strategies.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="strategies-page">
            <div className="page-header">
                <div>
                    <h1>Strategies</h1>
                    <p>Manage your algorithmic trading strategies</p>
                </div>
                <div className="header-actions">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search strategies..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={() => navigate('/strategies/new')}>
                        <Plus size={16} />
                        Add Strategy
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="loading-state">
                    <Loader2 className="spin" size={32} />
                    <p>Loading strategies...</p>
                </div>
            ) : (
                <div className="strategies-grid">
                    {filteredStrategies.map(strategy => (
                        <div key={strategy.id} className={`strategy-card ${strategy.status} ${activeMenu === strategy.id ? 'menu-open' : ''}`}>
                            <div className="strategy-header">
                                <div className="strategy-info">
                                    <div className="strategy-icon">
                                        <Zap size={20} />
                                    </div>
                                    <div>
                                        <h3>{strategy.name}</h3>
                                        <p>{strategy.description}</p>
                                    </div>
                                </div>
                                <div className="dropdown-container header-menu">
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={(e) => toggleMenu(`header-${strategy.id}`, e)}
                                    >
                                        <MoreVertical size={16} />
                                    </button>
                                    {activeMenu === `header-${strategy.id}` && (
                                        <div className="strategy-menu" onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => navigate(`/strategies/${strategy.id}/edit`)}>
                                                <Edit size={14} /> Edit
                                            </button>
                                            <button onClick={() => navigate('/strategies/new')}>
                                                <Copy size={14} /> Clone
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(strategy.id, strategy.name, e)}
                                                className="text-danger"
                                            >
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="strategy-stats">
                                <div className="stat">
                                    <span className="stat-label">Total P&L</span>
                                    <span className={`stat-value ${strategy.pnl >= 0 ? 'positive' : 'negative'}`}>
                                        {strategy.pnl >= 0 ? '+' : ''}₹{strategy.pnl.toLocaleString()}
                                    </span>
                                </div>
                                <div className="stat">
                                    <span className="stat-label">Win Rate</span>
                                    <span className="stat-value">{strategy.winRate}%</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-label">Trades</span>
                                    <span className="stat-value">{strategy.trades}</span>
                                </div>
                            </div>

                            <div className="strategy-meta">
                                <div className="meta-item">
                                    <span className="meta-label">Broker</span>
                                    <span className="meta-value">{strategy.broker}</span>
                                </div>
                            </div>

                            <div className="strategy-footer">
                                <span className={`status-badge ${strategy.status}`}>
                                    <span className="status-dot" />
                                    {strategy.status === 'active' ? 'Running' : 'Paused'}
                                </span>
                                <div className="strategy-actions">
                                    <button
                                        className={`action-btn ${strategy.status === 'active' ? 'pause' : 'play'}`}
                                        onClick={() => toggleStrategy(strategy.id, strategy.status)}
                                    >
                                        {strategy.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
                                    </button>
                                    <div className="dropdown-container">
                                        <button
                                            className="action-btn settings"
                                            onClick={(e) => toggleMenu(strategy.id, e)}
                                        >
                                            <Settings size={16} />
                                        </button>
                                        {activeMenu === strategy.id && (
                                            <div className="strategy-menu" onClick={(e) => e.stopPropagation()}>
                                                <button onClick={() => navigate(`/strategies/${strategy.id}/edit`)}>
                                                    <Edit size={14} /> Edit
                                                </button>
                                                <button onClick={() => navigate('/strategies/new')}>
                                                    <Copy size={14} /> Clone
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(strategy.id, strategy.name, e)}
                                                    className="text-danger"
                                                >
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
