class TokenManager {
  constructor() {
    this.TOKEN_KEY = 'token';
    this.USER_KEY = 'user';
    this.TOKEN_EXPIRY_KEY = 'tokenExpiry';
    this.WARNING_THRESHOLD = 5 * 60 * 1000;
    this.checkInterval = null;
  }

  parseToken(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  }

  getTokenExpiry(token) {
    const payload = this.parseToken(token);
    return payload ? payload.exp * 1000 : null;
  }

  isTokenExpired(token) {
    const expiry = this.getTokenExpiry(token);
    return !expiry || Date.now() >= expiry;
  }

  isTokenExpiringSoon(token) {
    const expiry = this.getTokenExpiry(token);
    return !expiry || Date.now() >= (expiry - this.WARNING_THRESHOLD);
  }

  getTokenRemainingTime(token) {
    const expiry = this.getTokenExpiry(token);
    return expiry ? Math.max(0, expiry - Date.now()) : 0;
  }

  formatRemainingTime(remainingMs) {
    if (remainingMs <= 0) return 'Expired';
    const minutes = Math.floor(remainingMs / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    return 'Less than 1 minute';
  }

  saveAuthData(token, user, expiresIn) {
    if (token) {
      localStorage.setItem(this.TOKEN_KEY, token);
      const expiry = this.getTokenExpiry(token);
      if (expiry) localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiry.toString());
    }
    if (user) localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    if (expiresIn) localStorage.setItem('expiresIn', expiresIn.toString());
    this.startExpiryMonitoring();
  }

  saveToken(token) {
    this.saveAuthData(token);
  }

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser() {
    const storedUser = localStorage.getItem(this.USER_KEY);
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        console.error('User parse error:', e);
      }
    }

    const token = this.getToken();
    if (!token) return null;

    const payload = this.parseToken(token);
    return payload ? {
      id: payload.id || payload.userId,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      department: payload.department
    } : null;
  }

  isCurrentTokenValid() {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  clearAuthData() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    localStorage.removeItem('expiresIn');
    this.stopExpiryMonitoring();
  }

  startExpiryMonitoring() {
    this.stopExpiryMonitoring();
    const token = this.getToken();
    if (!token) return;

    this.checkInterval = setInterval(() => {
      const currentToken = this.getToken();
      if (!currentToken || this.isTokenExpired(currentToken)) {
        this.handleTokenExpired();
      } else if (this.isTokenExpiringSoon(currentToken)) {
        this.handleTokenExpiringSoon();
      }
    }, 30000);
  }

  stopExpiryMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  handleTokenExpired() {
    this.clearAuthData();
    const currentPath = window.location.pathname;

    const dispatchExpired = () => {
      window.dispatchEvent(new CustomEvent('tokenExpired', {
        detail: { message: 'Your session has expired. Please log in again.' }
      }));
    };

    if (currentPath === '/' || currentPath === '/login' || currentPath === '/signup') {
      dispatchExpired();
      return;
    }

    window.location.href = '/';
    dispatchExpired();
  }

  handleTokenExpiringSoon() {
    const token = this.getToken();
    const remainingTime = this.getTokenRemainingTime(token);
    window.dispatchEvent(new CustomEvent('tokenExpiringSoon', {
      detail: {
        remainingTime,
        formattedTime: this.formatRemainingTime(remainingTime)
      }
    }));
  }

  getTokenStatus() {
    const token = this.getToken();
    if (!token) return { valid: false, expired: true, message: 'No token found' };

    const expiry = this.getTokenExpiry(token);
    const remainingTime = this.getTokenRemainingTime(token);

    return {
      valid: !this.isTokenExpired(token),
      expired: this.isTokenExpired(token),
      expiringSoon: this.isTokenExpiringSoon(token),
      remainingTime,
      formattedTime: this.formatRemainingTime(remainingTime),
      expiry
    };
  }

  initializeMonitoring() {
    if (this.getToken()) this.startExpiryMonitoring();
  }
}

const tokenManager = new TokenManager();
export default tokenManager;
