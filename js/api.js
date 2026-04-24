// ===== CONFIGURATION API COLISGO =====
//const API_BASE_URL = 'https://colisgo.cloud';
// pour que ca fonctionne sur colisgo.ca 
const API_BASE_URL = '/';

// ===== GESTION DU TOKEN =====
const TokenManager = {
    getAccessToken() {
        return localStorage.getItem('colisgo_access_token');
    },
    
    getRefreshToken() {
        return localStorage.getItem('colisgo_refresh_token');
    },
    
    setTokens(accessToken, refreshToken) {
        localStorage.setItem('colisgo_access_token', accessToken);
        localStorage.setItem('colisgo_refresh_token', refreshToken);
    },
    
    clearTokens() {
        localStorage.removeItem('colisgo_access_token');
        localStorage.removeItem('colisgo_refresh_token');
        localStorage.removeItem('colisgo_user');
    },
    
    getUser() {
        const user = localStorage.getItem('colisgo_user');
        return user ? JSON.parse(user) : null;
    },
    
    setUser(user) {
        localStorage.setItem('colisgo_user', JSON.stringify(user));
    },
    
    isLoggedIn() {
        return !!this.getAccessToken();
    }
};

// ===== FONCTION GÉNÉRIQUE D'APPEL API =====
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
        'Content-Type': 'application/json'
    };
    
    // Ajouter le token si connecté
    const token = TokenManager.getAccessToken();
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
    
    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        // Gestion des erreurs HTTP
        if (!response.ok) {
            const authErrorMessage = String(data.message || data.error || '').toLowerCase();
            const shouldRefreshToken =
                (response.status === 401 || response.status === 403) &&
                TokenManager.getRefreshToken() &&
                (response.status === 401 || authErrorMessage.includes('invalid token') || authErrorMessage.includes('token invalide'));

            if (shouldRefreshToken) {
                const refreshed = await refreshAccessToken();
                if (refreshed) {
                    return apiCall(endpoint, options);
                }
            }
            
            throw new Error(data.message || data.error || 'Erreur serveur');
        }
        
        return data;
    } catch (error) {
        console.error(`❌ Erreur API ${endpoint}:`, error.message);
        throw error;
    }
}

// ===== REFRESH TOKEN =====
async function refreshAccessToken() {
    try {
        const refreshToken = TokenManager.getRefreshToken();
        if (!refreshToken) return false;
        
        const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
        });
        
        const data = await response.json();
        
        if (data.success) {
            TokenManager.setTokens(data.data.accessToken, data.data.refreshToken);
            return true;
        }
        return false;
    } catch (error) {
        TokenManager.clearTokens();
        return false;
    }
}

// ===== AUTHENTIFICATION =====
const Auth = {
    async register(userData) {
        const response = await apiCall('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        if (response.success) {
            TokenManager.setTokens(response.data.accessToken, response.data.refreshToken);
            TokenManager.setUser(response.data.user);
        }
        return response;
    },
    
    async login(email, password, twoFactorToken = null) {
        const body = { email, password };
        if (twoFactorToken) body.twoFactorToken = twoFactorToken;
        
        const response = await apiCall('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(body)
        });
        
        if (response.success) {
            TokenManager.setTokens(response.data.accessToken, response.data.refreshToken);
            TokenManager.setUser(response.data.user);
        }
        return response;
    },
    
    async logout() {
        try {
            await apiCall('/api/auth/logout', { method: 'POST' });
        } catch (e) {
            // Ignorer erreurs de logout
        }
        TokenManager.clearTokens();
        window.location.href = 'login.html';
    },
    
    async getMe() {
        return await apiCall('/api/auth/me');
    }
};

// ===== UTILISATEUR =====
const User = {
    async getProfile() {
        return await apiCall('/api/user/profile');
    },
    
    async updateProfile(data) {
        return await apiCall('/api/user/profile', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    async getStats() {
        return await apiCall('/api/user/stats');
    },
    
    async getWallet() {
        return await apiCall('/api/user/wallet');
    },
    
    async getWalletBalance() {
        return await apiCall('/api/user/wallet/balance');
    }
};

// ===== ANNONCES (ENVOIS) =====
const Announcement = {
    async create(data) {
        return await apiCall('/api/announcement/create', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    async getById(id) {
        return await apiCall(`/api/announcement/${id}`);
    },
    
    async update(id, data) {
        return await apiCall(`/api/announcement/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    async delete(id) {
        return await apiCall(`/api/announcement/${id}`, {
            method: 'DELETE'
        });
    },
    
    async search(filters) {
        return await apiCall('/api/announcement/search', {
            method: 'POST',
            body: JSON.stringify(filters)
        });
    },
    
    async getPriceSuggestion(data) {
        return await apiCall('/api/announcement/price-suggestion', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    async uploadImages(images) {
        // images doit être un array de fichiers
        const formData = new FormData();
        images.forEach(img => formData.append('images', img));
        
        return await fetch(`${API_BASE_URL}/api/announcement/upload/images`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TokenManager.getAccessToken()}`
            },
            body: formData
        }).then(r => r.json());
    }
};

// ===== RÉSERVATIONS (LIVRAISONS) =====
const Booking = {
    async getMyBookings(userId, filters = {}) {
        const params = new URLSearchParams(filters).toString();
        const query = params ? `?${params}` : '';
        return await apiCall(`/api/booking/user/${userId}${query}`);
    },
    
    async getById(id) {
        return await apiCall(`/api/booking/${id}`);
    },
    
    async getTracking(id) {
        return await apiCall(`/api/booking/tracking/${id}`);
    },
    
    async cancel(id, reason) {
        return await apiCall(`/api/booking/${id}/cancel`, {
            method: 'POST',
            body: JSON.stringify({ reason })
        });
    },
    
    async rate(id, rating, comment) {
        return await apiCall(`/api/booking/${id}/rate`, {
            method: 'POST',
            body: JSON.stringify({ rating, comment })
        });
    }
};

// ===== PAIEMENTS =====
const Payment = {
    async create(bookingId, amount, currency = 'CAD') {
        return await apiCall('/api/payment/create', {
            method: 'POST',
            body: JSON.stringify({ bookingId, amount, currency })
        });
    },
    
    async getMyPayments(userId, filters = {}) {
        const params = new URLSearchParams(filters).toString();
        const query = params ? `?${params}` : '';
        return await apiCall(`/api/payment/user/${userId}${query}`);
    }
};

// ===== NOTIFICATIONS =====
const Notification = {
    async getUnread(userId) {
        return await apiCall(`/api/notification/unread/${userId}`);
    },
    
    async getStats(userId) {
        return await apiCall(`/api/notification/stats/${userId}`);
    },
    
    async markAsRead(notificationId) {
        return await apiCall(`/api/notification/mark-read/${notificationId}`, {
            method: 'POST'
        });
    },
    
    async markAllAsRead(userId) {
        return await apiCall(`/api/notification/mark-all-read/${userId}`, {
            method: 'POST'
        });
    }
};

// ===== EXPORT GLOBAL =====
window.ColisGoAPI = {
    Auth,
    User,
    Announcement,
    Booking,
    Payment,
    Notification,
    TokenManager,
    BASE_URL: API_BASE_URL
};

console.log('🚀 ColisGo API chargée !');
