/**
 * API Service
 * 
 * @author Yash
 * @description Centralized API client for backend communication
 */

/// <reference types="vite/client" />

// API Base URL - change this for production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

// Token management
const getToken = (): string | null => {
    return localStorage.getItem('token');
};

export const setToken = (token: string): void => {
    localStorage.setItem('token', token);
};

export const removeToken = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

// API request helper
const apiRequest = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    const token = getToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || data.message || 'API request failed');
    }

    return data;
};

// ============ AUTH API ============

interface LoginResponse {
    success: boolean;
    user: User;
    token: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    role: 'trader' | 'broker' | 'admin' | 'regulator';
    avatar?: string;
    isActive: boolean;
    isPaused: boolean;
    whitelistedIPs?: {
        _id: string;
        ip: string;
        label: string;
        location?: string;
        verified: boolean;
        addedAt: string;
    }[];
}

export const authAPI = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const data = await apiRequest<LoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        setToken(data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
    },

    register: async (name: string, email: string, password: string, role: string = 'trader'): Promise<LoginResponse> => {
        const data = await apiRequest<LoginResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password, role }),
        });
        setToken(data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
    },

    logout: async (): Promise<void> => {
        try {
            await apiRequest('/auth/logout', { method: 'POST' });
        } catch (e) {
            // Ignore logout errors
        }
        removeToken();
    },

    me: async (): Promise<{ success: boolean; user: User; tradingMode?: string }> => {
        return apiRequest('/auth/me');
    },

    addIP: async (ip: string, label: string, location?: string): Promise<{ success: boolean; ips: any[] }> => {
        return apiRequest('/auth/me/ips', {
            method: 'POST',
            body: JSON.stringify({ ip, label, location }),
        });
    },

    removeIP: async (ipId: string): Promise<{ success: boolean; ips: any[] }> => {
        return apiRequest(`/auth/me/ips/${ipId}`, { method: 'DELETE' });
    },

    updateSettings: async (riskSettings: any): Promise<{ success: boolean; user: User }> => {
        return apiRequest('/auth/me/settings', {
            method: 'PUT',
            body: JSON.stringify({ riskSettings })
        });
    },

    pauseAccount: async (userId: string): Promise<void> => {
        return apiRequest(`/users/${userId}/pause`, { method: 'PUT' });
    }
};

// ============ MARKET DATA API ============

export interface MarketQuote {
    symbol: string;
    lastPrice: number;
    change: number;
    changePercent: number;
    timestamp: string;
}

export const marketAPI = {
    getQuote: async (symbol: string): Promise<MarketQuote> => {
        return apiRequest(`/market/quote/${symbol}`);
    },

    getIndices: async (): Promise<MarketQuote[]> => {
        return apiRequest('/market/indices');
    }
};

// ============ ORDERS API ============

interface Order {
    _id: string;
    orderId: string;
    symbol: string;
    side: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    status: string;
    broker: string;
    createdAt: string;
}

export const ordersAPI = {
    getAll: async (params?: { status?: string; symbol?: string; limit?: number }): Promise<{ orders: Order[]; total: number }> => {
        const query = new URLSearchParams(params as Record<string, string>).toString();
        return apiRequest(`/orders${query ? `?${query}` : ''}`);
    },

    create: async (order: { symbol: string; side: string; quantity: number; price?: number }): Promise<{ order: Order }> => {
        return apiRequest('/orders', {
            method: 'POST',
            body: JSON.stringify(order),
        });
    },

    cancel: async (orderId: string): Promise<void> => {
        return apiRequest(`/orders/${orderId}`, { method: 'DELETE' });
    },

    getStats: async (): Promise<{ stats: { totalOrders: number; executedOrders: number; rejectedOrders: number } }> => {
        return apiRequest('/orders/stats/summary');
    },
};

// ============ POSITIONS API ============

interface Position {
    _id: string;
    symbol: string;
    side: 'LONG' | 'SHORT';
    quantity: number;
    avgEntryPrice: number;
    currentPrice: number;
    unrealizedPnL: number;
    pnlPercentage: number;
}

export const positionsAPI = {
    getAll: async (): Promise<{ positions: Position[]; totalUnrealizedPnL: number }> => {
        return apiRequest('/positions');
    },

    getSummary: async (): Promise<{ summary: { totalPositions: number; unrealizedPnL: number; realizedPnL: number } }> => {
        return apiRequest('/positions/summary');
    },

    close: async (positionId: string, exitPrice: number): Promise<void> => {
        return apiRequest(`/positions/${positionId}/close`, {
            method: 'PUT',
            body: JSON.stringify({ exitPrice }),
        });
    },
};

// ============ STRATEGIES API ============

interface Strategy {
    _id: string;
    name: string;
    description?: string;
    type: string;
    isActive: boolean;
    isPaused: boolean;
    certification: { status: string };
    version: string;
    metrics: { totalTrades: number; winRate: number; totalPnL?: number; roi?: number };
}

export const strategiesAPI = {
    getAll: async (): Promise<{ strategies: Strategy[] }> => {
        return apiRequest('/strategies');
    },

    create: async (strategy: { name: string; description?: string; type?: string }): Promise<{ strategy: Strategy }> => {
        return apiRequest('/strategies', {
            method: 'POST',
            body: JSON.stringify(strategy),
        });
    },

    updateStatus: async (strategyId: string, status: 'active' | 'paused'): Promise<void> => {
        return apiRequest(`/strategies/${strategyId}`, {
            method: 'PUT',
            body: JSON.stringify({
                isPaused: status === 'paused',
                isActive: true // Ensure it remains active (not archived)
            }),
        });
    },

    certify: async (strategyId: string): Promise<void> => {
        return apiRequest(`/strategies/${strategyId}/certify`, { method: 'PUT' });
    },

    delete: async (strategyId: string): Promise<void> => {
        return apiRequest(`/strategies/${strategyId}`, { method: 'DELETE' });
    },

    getById: async (strategyId: string): Promise<{ strategy: Strategy }> => {
        return apiRequest(`/strategies/${strategyId}`);
    },

    update: async (strategyId: string, updates: Partial<Strategy>): Promise<{ strategy: Strategy }> => {
        return apiRequest(`/strategies/${strategyId}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    },
};

// ============ AUDIT API ============

interface AuditLog {
    _id: string;
    eventType: string;
    userName: string;
    description: string;
    timestamp: string;
    severity: string;
    hash: string;
}

export const auditAPI = {
    getAll: async (params?: { eventType?: string; limit?: number }): Promise<{ logs: AuditLog[] }> => {
        const query = new URLSearchParams(params as Record<string, string>).toString();
        return apiRequest(`/audit${query ? `?${query}` : ''}`);
    },

    getTimeline: async (hours: number = 24): Promise<{ logs: AuditLog[] }> => {
        return apiRequest(`/audit/timeline?hours=${hours}`);
    },

    getStats: async (): Promise<{ totalToday: number; criticalAlerts: number }> => {
        return apiRequest('/audit/stats');
    },
};

// ============ USERS API ============

export const usersAPI = {
    getAll: async (): Promise<{ users: User[] }> => {
        return apiRequest('/users');
    },

    block: async (userId: string): Promise<void> => {
        return apiRequest(`/users/${userId}/block`, { method: 'PUT' });
    },

    unblock: async (userId: string): Promise<void> => {
        return apiRequest(`/users/${userId}/unblock`, { method: 'PUT' });
    },

    pause: async (userId: string): Promise<void> => {
        return apiRequest(`/users/${userId}/pause`, { method: 'PUT' });
    },

    resume: async (userId: string): Promise<void> => {
        return apiRequest(`/users/${userId}/resume`, { method: 'PUT' });
    },
};

// ============ HEALTH CHECK ============

export const checkAPIHealth = async (): Promise<boolean> => {
    try {
        await apiRequest('/health');
        return true;
    } catch {
        return false;
    }
};

// ============ SYSTEM API ============

export const systemAPI = {
    getSettings: async (): Promise<{ success: boolean; settings: any }> => {
        return apiRequest('/system/settings');
    },
    toggleKillSwitch: async (active: boolean): Promise<{ success: boolean; masterKillSwitch: boolean }> => {
        return apiRequest('/system/kill-switch', {
            method: 'POST',
            body: JSON.stringify({ active })
        });
    }
};

export default {
    auth: authAPI,
    orders: ordersAPI,
    positions: positionsAPI,
    strategies: strategiesAPI,
    audit: auditAPI,
    users: usersAPI,
    system: systemAPI,
    checkHealth: checkAPIHealth,
};
