class TokenManager {
  constructor() {
    this.TOKEN_KEY = 'token';
    this.USER_KEY = 'user';

    this.WARNING_THRESHOLD = 5 * 60 * 1000; // 5 minutes

    this._cachedToken = null;
    this._cachedPayload = null;

    this.expiryTimeout = null;
    this.warningTimeout = null;

    this.warned = false;
  }

  // ================================
  // 🔹 TOKEN PARSING (CACHED)
  // ================================
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
      console.error('Invalid token:', error);
      return null;
    }
  }

  getPayload(token) {
    if (this._cachedToken === token) return this._cachedPayload;

    const payload = this.parseToken(token);
    this._cachedToken = token;
    this._cachedPayload = payload;

    return payload;
  }

  // ================================
  // 🔹 TOKEN INFO
  // ================================
  getTokenExpiry(token) {
    const payload = this.getPayload(token);
    return payload?.exp ? payload.exp * 1000 : null;
  }

  getTokenRemainingTime(token) {
    const expiry = this.getTokenExpiry(token);
    return expiry ? Math.max(0, expiry - Date.now()) : 0;
  }

  isTokenExpired(token) {
    return this.getTokenRemainingTime(token) <= 0;
  }

  isTokenExpiringSoon(token) {
    return this.getTokenRemainingTime(token) <= this.WARNING_THRESHOLD;
  }

  // ================================
  // 🔹 STORAGE (Use sessionStorage if possible)
  // ================================
  saveAuthData(token, user) {
    if (token) {
      sessionStorage.setItem(this.TOKEN_KEY, token);
    }

    if (user) {
      sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }

    this.scheduleTimers();
  }

  getToken() {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  getUser() {
    const storedUser = sessionStorage.getItem(this.USER_KEY);

    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        console.error('User parse error:', e);
      }
    }

    const token = this.getToken();
    if (!token) return null;

    const payload = this.getPayload(token);

    return payload
      ? {
        id: payload.id || payload.userId,
        name: payload.name,
        email: payload.email,
        role: payload.role?.toLowerCase().trim(),
        department: payload.department
      }
      : null;
  }

  isCurrentTokenValid() {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  clearAuthData() {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);

    this.clearTimers();
  }

  // ================================
  // 🔹 TIMER-BASED EXPIRY (NO INTERVAL)
  // ================================
  scheduleTimers() {
    this.clearTimers();

    const token = this.getToken();
    if (!token) return;

    const remaining = this.getTokenRemainingTime(token);

    if (remaining <= 0) {
      this.handleTokenExpired();
      return;
    }

    // Expiry timer
    this.expiryTimeout = setTimeout(() => {
      this.handleTokenExpired();
    }, remaining);

    // Warning timer
    if (remaining > this.WARNING_THRESHOLD) {
      this.warningTimeout = setTimeout(() => {
        this.handleTokenExpiringSoon();
      }, remaining - this.WARNING_THRESHOLD);
    }
  }

  clearTimers() {
    if (this.expiryTimeout) clearTimeout(this.expiryTimeout);
    if (this.warningTimeout) clearTimeout(this.warningTimeout);

    this.expiryTimeout = null;
    this.warningTimeout = null;
    this.warned = false;
  }

  // ================================
  // 🔹 EVENTS
  // ================================
  handleTokenExpired() {
    this.clearAuthData();

    window.dispatchEvent(
      new CustomEvent('tokenExpired', {
        detail: { message: 'Session expired. Please login again.' }
      })
    );
  }

  handleTokenExpiringSoon() {
    if (this.warned) return;
    this.warned = true;

    const token = this.getToken();
    const remainingTime = this.getTokenRemainingTime(token);

    window.dispatchEvent(
      new CustomEvent('tokenExpiringSoon', {
        detail: {
          remainingTime,
          formattedTime: this.formatRemainingTime(remainingTime)
        }
      })
    );
  }

  // ================================
  // 🔹 UTIL
  // ================================
  formatRemainingTime(ms) {
    if (ms <= 0) return 'Expired';

    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;

    return 'Less than 1 minute';
  }

  getTokenStatus() {
    const token = this.getToken();

    if (!token) {
      return { valid: false, expired: true, message: 'No token' };
    }

    const remaining = this.getTokenRemainingTime(token);

    return {
      valid: remaining > 0,
      expired: remaining <= 0,
      expiringSoon: remaining <= this.WARNING_THRESHOLD,
      remainingTime: remaining,
      formattedTime: this.formatRemainingTime(remaining)
    };
  }

  initialize() {
    if (this.getToken()) {
      this.scheduleTimers();
    }
  }
}

const tokenManager = new TokenManager();
export default tokenManager;