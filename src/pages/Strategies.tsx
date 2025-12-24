import { useState } from 'react'
import { Plus, Play, Pause, Settings, Zap, MoreVertical, Search } from 'lucide-react'
import './Strategies.css'

const strategiesData = [
    {
        id: 1,
        name: 'Momentum Alpha',
        description: 'Trend-following strategy for large-cap stocks',
        status: 'active',
        pnl: 45230,
        pnlPct: 12.5,
        winRate: 72,
        trades: 156,
        signals: 1234,
        lastSignal: '2 min ago',
        broker: 'Zerodha'
    },
    {
        id: 2,
        name: 'Mean Reversion Pro',
        description: 'Counter-trend strategy for range-bound markets',
        status: 'active',
        pnl: 23450,
        pnlPct: 8.2,
        winRate: 65,
        trades: 98,
        signals: 876,
        lastSignal: '5 min ago',
        broker: 'Angel One'
    },
    {
        id: 3,
        name: 'Breakout Scanner',
        description: 'Volume-based breakout detection',
        status: 'paused',
        pnl: 8900,
        pnlPct: 3.1,
        winRate: 58,
        trades: 45,
        signals: 234,
        lastSignal: '2 hours ago',
        broker: 'Zerodha'
    },
    {
        id: 4,
        name: 'Options Hedger',
        description: 'Delta-neutral options strategy',
        status: 'active',
        pnl: -5200,
        pnlPct: -2.8,
        winRate: 45,
        trades: 23,
        signals: 156,
        lastSignal: '15 min ago',
        broker: 'Upstox'
    },
]

export default function Strategies() {
    const [strategies, setStrategies] = useState(strategiesData)
    const [searchTerm, setSearchTerm] = useState('')

    const toggleStrategy = (id: number) => {
        setStrategies(prev => prev.map(s =>
            s.id === id ? { ...s, status: s.status === 'active' ? 'paused' : 'active' } : s
        ))
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
                    <button className="btn btn-primary">
                        <Plus size={16} />
                        Add Strategy
                    </button>
                </div>
            </div>

            <div className="strategies-grid">
                {filteredStrategies.map(strategy => (
                    <div key={strategy.id} className={`strategy-card ${strategy.status}`}>
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
                            <button className="btn btn-ghost btn-sm">
                                <MoreVertical size={16} />
                            </button>
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
                            <div className="stat">
                                <span className="stat-label">Signals</span>
                                <span className="stat-value">{strategy.signals}</span>
                            </div>
                        </div>

                        <div className="strategy-meta">
                            <div className="meta-item">
                                <span className="meta-label">Broker</span>
                                <span className="meta-value">{strategy.broker}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Last Signal</span>
                                <span className="meta-value">{strategy.lastSignal}</span>
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
                                    onClick={() => toggleStrategy(strategy.id)}
                                >
                                    {strategy.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
                                </button>
                                <button className="action-btn settings">
                                    <Settings size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
