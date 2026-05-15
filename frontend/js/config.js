// API Configuration
const API_CONFIG = {
    BASE_URL: 'http://127.0.0.1:5000',
    TIMEOUT: 10000,
    HEADERS: {
        'Content-Type': 'application/json'
    }
};

// Get the current user from localStorage
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// API utility class
class ApiClient {
    constructor(baseUrl = API_CONFIG.BASE_URL) {
        this.baseUrl = baseUrl;
    }

    getHeaders() {
        const headers = { ...API_CONFIG.HEADERS };
        const user = getCurrentUser();
        
        // Add user headers if user is logged in
        if (user) {
            headers['user-id'] = user.id;
            headers['user-role'] = user.role;
        }
        
        return headers;
    }

    buildUrl(endpoint) {
        if (endpoint.startsWith('http')) {
            return endpoint;
        }
        return `${this.baseUrl}${endpoint}`;
    }

    async request(endpoint, options = {}) {
        const url = this.buildUrl(endpoint);
        const headers = this.getHeaders();
        
        const config = {
            method: options.method || 'GET',
            headers: { ...headers, ...options.headers },
            timeout: options.timeout || API_CONFIG.TIMEOUT
        };

        if (options.body) {
            config.body = typeof options.body === 'string' 
                ? options.body 
                : JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json().catch(() => ({}));

            return {
                status: response.status,
                ok: response.ok,
                data,
                error: !response.ok ? (data.error || response.statusText) : null
            };
        } catch (error) {
            return {
                status: 0,
                ok: false,
                data: null,
                error: error.message || 'Network error'
            };
        }
    }

    // Convenience methods
    async get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    async post(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'POST', body });
    }

    async put(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'PUT', body });
    }

    async delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }
}

// Create default instance
const apiClient = new ApiClient();
