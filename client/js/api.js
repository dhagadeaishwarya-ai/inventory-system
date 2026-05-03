const API_BASE_URL = 'http://localhost:5000/api';

class API {
    static getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }

    static async request(endpoint, options = {}) {
        try {
            const url = `${API_BASE_URL}${endpoint}`;
            const response = await fetch(url, {
                headers: this.getHeaders(),
                ...options,
            });

            // For CSV export which doesn't return JSON
            if (options.isBlob) {
                if (!response.ok) throw new Error('Failed to download file');
                return await response.blob();
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            return data;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error.message);
            throw error;
        }
    }

    // Auth
    static login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    static register(username, email, password) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password }),
        });
    }

    static getMe() {
        return this.request('/auth/me');
    }

    // Products
    static getProducts(query = '') {
        return this.request(`/products${query}`);
    }

    static getProduct(id) {
        return this.request(`/products/${id}`);
    }

    static createProduct(productData) {
        return this.request('/products', {
            method: 'POST',
            body: JSON.stringify(productData),
        });
    }

    static updateProduct(id, productData) {
        return this.request(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData),
        });
    }

    static deleteProduct(id) {
        return this.request(`/products/${id}`, {
            method: 'DELETE',
        });
    }

    static exportCSV() {
        return this.request('/products/export/csv', { isBlob: true });
    }
}

window.API = API;
