import { useTheme, useUser } from '../App'
import { Moon, Sun, Bell, Shield, Key, User, Building, Palette } from 'lucide-react'
import './Settings.css'

export default function Settings() {
    const { theme, toggleTheme } = useTheme()
    const { user } = useUser()

    return (
        <div className="settings-page">
            <div className="page-header">
                <div>
                    <h1>Settings</h1>
                    <p>Manage your account and platform preferences</p>
                </div>
            </div>

            <div className="settings-grid">
                {/* Profile Settings */}
                <div className="settings-section">
                    <div className="section-header">
                        <User size={20} />
                        <h2>Profile</h2>
                    </div>
                    <div className="settings-card">
                        <div className="setting-item">
                            <div className="setting-info">
                                <span className="setting-label">Display Name</span>
                                <span className="setting-value">{user?.name || 'Not set'}</span>
                            </div>
                            <button className="btn btn-ghost btn-sm">Edit</button>
                        </div>
                        <div className="setting-item">
                            <div className="setting-info">
                                <span className="setting-label">Email</span>
                                <span className="setting-value">{user?.email || 'Not set'}</span>
                            </div>
                            <button className="btn btn-ghost btn-sm">Edit</button>
                        </div>
                        <div className="setting-item">
                            <div className="setting-info">
                                <span className="setting-label">Role</span>
                                <span className="setting-value capitalize">{user?.role || 'Not set'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Appearance */}
                <div className="settings-section">
                    <div className="section-header">
                        <Palette size={20} />
                        <h2>Appearance</h2>
                    </div>
                    <div className="settings-card">
                        <div className="setting-item">
                            <div className="setting-info">
                                <span className="setting-label">Theme</span>
                                <span className="setting-description">Choose between light and dark mode</span>
                            </div>
                            <div className="theme-toggle" onClick={toggleTheme}>
                                <div className={`toggle-option ${theme === 'light' ? 'active' : ''}`}>
                                    <Sun size={16} />
                                    Light
                                </div>
                                <div className={`toggle-option ${theme === 'dark' ? 'active' : ''}`}>
                                    <Moon size={16} />
                                    Dark
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="settings-section">
                    <div className="section-header">
                        <Bell size={20} />
                        <h2>Notifications</h2>
                    </div>
                    <div className="settings-card">
                        <div className="setting-item">
                            <div className="setting-info">
                                <span className="setting-label">Order Filled</span>
                                <span className="setting-description">Get notified when orders are executed</span>
                            </div>
                            <div className="toggle active" />
                        </div>
                        <div className="setting-item">
                            <div className="setting-info">
                                <span className="setting-label">Order Rejected</span>
                                <span className="setting-description">Get notified when orders are rejected</span>
                            </div>
                            <div className="toggle active" />
                        </div>
                        <div className="setting-item">
                            <div className="setting-info">
                                <span className="setting-label">Risk Alerts</span>
                                <span className="setting-description">Receive risk limit warnings</span>
                            </div>
                            <div className="toggle active" />
                        </div>
                        <div className="setting-item">
                            <div className="setting-info">
                                <span className="setting-label">Daily Summary</span>
                                <span className="setting-description">Receive daily trading summary email</span>
                            </div>
                            <div className="toggle" />
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className="settings-section">
                    <div className="section-header">
                        <Shield size={20} />
                        <h2>Security</h2>
                    </div>
                    <div className="settings-card">
                        <div className="setting-item">
                            <div className="setting-info">
                                <span className="setting-label">Two-Factor Authentication</span>
                                <span className="setting-description">Add an extra layer of security</span>
                            </div>
                            <button className="btn btn-secondary btn-sm">Enable</button>
                        </div>
                        <div className="setting-item">
                            <div className="setting-info">
                                <span className="setting-label">Change Password</span>
                                <span className="setting-description">Update your account password</span>
                            </div>
                            <button className="btn btn-ghost btn-sm">Change</button>
                        </div>
                        <div className="setting-item">
                            <div className="setting-info">
                                <span className="setting-label">Active Sessions</span>
                                <span className="setting-description">Manage your logged-in devices</span>
                            </div>
                            <button className="btn btn-ghost btn-sm">View</button>
                        </div>
                    </div>
                </div>

                {/* API Keys */}
                <div className="settings-section">
                    <div className="section-header">
                        <Key size={20} />
                        <h2>API Keys</h2>
                    </div>
                    <div className="settings-card">
                        <div className="setting-item">
                            <div className="setting-info">
                                <span className="setting-label">Production Key</span>
                                <span className="setting-value mono">cb_live_••••••••••••xxxx</span>
                            </div>
                            <button className="btn btn-ghost btn-sm">Regenerate</button>
                        </div>
                        <div className="setting-item">
                            <div className="setting-info">
                                <span className="setting-label">Test Key</span>
                                <span className="setting-value mono">cb_test_••••••••••••yyyy</span>
                            </div>
                            <button className="btn btn-ghost btn-sm">Regenerate</button>
                        </div>
                    </div>
                </div>

                {/* Broker Connections */}
                <div className="settings-section">
                    <div className="section-header">
                        <Building size={20} />
                        <h2>Broker Connections</h2>
                    </div>
                    <div className="settings-card">
                        <div className="broker-item connected">
                            <div className="broker-icon">Z</div>
                            <div className="broker-info">
                                <span className="broker-name">Zerodha</span>
                                <span className="broker-status">Connected • Client ID: AB1234</span>
                            </div>
                            <button className="btn btn-ghost btn-sm">Disconnect</button>
                        </div>
                        <div className="broker-item">
                            <div className="broker-icon">A</div>
                            <div className="broker-info">
                                <span className="broker-name">Angel One</span>
                                <span className="broker-status">Not connected</span>
                            </div>
                            <button className="btn btn-primary btn-sm">Connect</button>
                        </div>
                        <div className="broker-item">
                            <div className="broker-icon">U</div>
                            <div className="broker-info">
                                <span className="broker-name">Upstox</span>
                                <span className="broker-status">Not connected</span>
                            </div>
                            <button className="btn btn-primary btn-sm">Connect</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
