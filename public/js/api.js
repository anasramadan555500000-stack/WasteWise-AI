// WasteWise AI Enterprise API Client

const API_BASE = '/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('wastewise_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('wastewise_token', token);
    } else {
      localStorage.removeItem('wastewise_token');
    }
  }

  getToken() {
    return this.token;
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          this.setToken(null);
          window.dispatchEvent(new CustomEvent('wastewise:unauthorized'));
        }
        const error = new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      throw err;
    }
  }

  // Auth Endpoints
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async getMe() {
    return await this.request('/auth/me');
  }

  async logout() {
    if (this.token) {
      try {
        await this.request('/auth/logout', { method: 'POST' });
      } catch (e) {
        // Ignore network failure on logout
      }
    }
    this.setToken(null);
    localStorage.removeItem('wastewise_user');
    localStorage.removeItem('wastewise_token');
    sessionStorage.removeItem('wastewise_admin_tab');
  }

  // Products Endpoints
  async getProducts() {
    return await this.request('/products');
  }

  async getProduct(id) {
    return await this.request(`/products/${id}`);
  }

  async addProduct(productData) {
    return await this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  }

  async updateProduct(id, productData) {
    return await this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  }

  async deleteProduct(id) {
    return await this.request(`/products/${id}`, {
      method: 'DELETE'
    });
  }

  async applyMarkdown(id, discountPercentage) {
    return await this.request(`/products/${id}/markdown`, {
      method: 'PATCH',
      body: JSON.stringify({ discountPercentage })
    });
  }

  // POS & Transactions
  async checkout(checkoutPayload) {
    return await this.request('/checkout', {
      method: 'POST',
      body: JSON.stringify(checkoutPayload)
    });
  }

  async getTransactions() {
    return await this.request('/transactions');
  }

  // Admin Analytics & Users & Audit
  async getAnalytics() {
    return await this.request('/admin/analytics');
  }

  async getUsers() {
    return await this.request('/admin/users');
  }

  async getAuditLogs() {
    return await this.request('/admin/audit-logs');
  }

  async resetDatabase() {
    return await this.request('/admin/reset', {
      method: 'POST'
    });
  }

  async exportDatabaseBackup() {
    const response = await fetch(`${API_BASE}/admin/export`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to download database backup.');
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wastewise-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }
}

export const api = new ApiClient();
