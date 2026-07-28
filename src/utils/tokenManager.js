const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const EXPIRY_KEY = 'token_expiry';
const WARNING_THRESHOLD = 5 * 60 * 1000;
const JWT_PART_COUNT = 3;

function getStorage() {
  try {
    const test = '__tm_probe__';
    sessionStorage.setItem(test, '1');
    sessionStorage.removeItem(test);
    return sessionStorage;
  } catch {
    return {
      _store: {},
      getItem(k) { return Object.prototype.hasOwnProperty.call(this._store, k) ? this._store[k] : null; },
      setItem(k, v) { this._store[k] = String(v); },
      removeItem(k) { delete this._store[k]; },
    };
  }
}

const storage = getStorage();

function parseExpiresInToSeconds(expiresIn) {
  if (typeof expiresIn === 'number' && isFinite(expiresIn) && expiresIn > 0) {
    return expiresIn;
  }
  if (typeof expiresIn !== 'string') return null;

  const str = expiresIn.trim().toLowerCase();
  if (!str) return null;

  if (/^\d+$/.test(str)) {
    return parseInt(str, 10);
  }

  const match = str.match(/^(\d+)\s*([a-z]+)$/);
  if (match) {
    const val = parseInt(match[1], 10);
    const unit = match[2];
    if (unit === 'h' || unit === 'hrs' || unit === 'hour' || unit === 'hours') return val * 3600;
    if (unit === 'm' || unit === 'min' || unit === 'mins' || unit === 'minute' || unit === 'minutes') return val * 60;
    if (unit === 'd' || unit === 'day' || unit === 'days') return val * 86400;
    if (unit === 's' || unit === 'sec' || unit === 'secs' || unit === 'second' || unit === 'seconds') return val;
  }

  return null;
}

function parseJWTPayload(token) {
  if (typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== JWT_PART_COUNT) return null;

  try {
    const base64 = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(parts[1].length / 4) * 4, '=');

    let json;
    try {
      json = decodeURIComponent(
        Array.from(atob(base64), c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
      );
    } catch {
      json = atob(base64);
    }

    const payload = JSON.parse(json);

    if (typeof payload !== 'object' || payload === null) return null;

    return payload;
  } catch {
    return null;
  }
}

class TokenManager {
  constructor() {
    this._cachedToken = null;
    this._cachedPayload = null;
    this._expiryTimeout = null;
    this._warningTimeout = null;
    this._warned = false;
    this._initialized = false;
  }

  getPayload(token) {
    if (token === this._cachedToken) return this._cachedPayload;
    const payload = parseJWTPayload(token);
    this._cachedToken = token;
    this._cachedPayload = payload;
    return payload;
  }

  getTokenExpiry(token) {
    const payload = this.getPayload(token);
    const exp = payload?.exp;
    if (typeof exp === 'number' && isFinite(exp) && exp > 0) {
      return exp * 1000;
    }

    const storedExpiry = storage.getItem(EXPIRY_KEY);
    if (storedExpiry) {
      const parsed = parseInt(storedExpiry, 10);
      if (!isNaN(parsed) && isFinite(parsed) && parsed > 0) {
        return parsed;
      }
    }

    return null;
  }

  getTokenRemainingTime(token) {
    const expiry = this.getTokenExpiry(token);
    if (expiry === null) return 0;
    return Math.max(0, expiry - Date.now());
  }

  isTokenExpired(token) {
    return this.getTokenRemainingTime(token) <= 0;
  }

  isTokenExpiringSoon(token) {
    const remaining = this.getTokenRemainingTime(token);
    return remaining > 0 && remaining <= WARNING_THRESHOLD;
  }

  saveAuthData(token, user, expiresIn) {
    if (token) storage.setItem(TOKEN_KEY, token);
    if (user && typeof user === 'object') storage.setItem(USER_KEY, JSON.stringify(user));
    
    if (expiresIn) {
      const seconds = parseExpiresInToSeconds(expiresIn);
      let expiryTime = null;

      if (seconds !== null && seconds > 0) {
        expiryTime = Date.now() + seconds * 1000;
      } else if (typeof expiresIn === 'string') {
        const dateParsed = Date.parse(expiresIn);
        if (!isNaN(dateParsed) && isFinite(dateParsed) && dateParsed > Date.now()) {
          expiryTime = dateParsed;
        }
      }

      if (expiryTime) {
        storage.setItem(EXPIRY_KEY, String(expiryTime));
      }
    } else {
      storage.removeItem(EXPIRY_KEY);
    }
    
    this._scheduleTimers();
  }

  getToken() {
    return storage.getItem(TOKEN_KEY);
  }

  getUser() {
    const raw = storage.getItem(USER_KEY);

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (typeof parsed === 'object' && parsed !== null) return parsed;
      } catch {
        storage.removeItem(USER_KEY);
      }
    }

    const token = this.getToken();
    if (!token) return null;

    const payload = this.getPayload(token);
    if (!payload) return null;

    return {
      id: payload.id ?? payload.userId ?? null,
      name: payload.name ?? null,
      email: payload.email ?? null,
      role: typeof payload.role === 'string' ? payload.role.toLowerCase().trim() : null,
      department: payload.department ?? null,
    };
  }

  isCurrentTokenValid() {
    const token = this.getToken();
    return Boolean(token) && !this.isTokenExpired(token);
  }

  clearAuthData() {
    this._clearTimers();
    storage.removeItem(TOKEN_KEY);
    storage.removeItem(USER_KEY);
    storage.removeItem(EXPIRY_KEY);
    this._initialized = false;
  }

  _scheduleTimers() {
    this._clearTimers();

    const token = this.getToken();
    if (!token) return;

    const remaining = this.getTokenRemainingTime(token);

    if (remaining <= 0) {
      setTimeout(() => this._handleTokenExpired(), 0);
      return;
    }

    this._expiryTimeout = setTimeout(() => this._handleTokenExpired(), remaining);

    if (remaining > WARNING_THRESHOLD) {
      this._warningTimeout = setTimeout(() => this._handleTokenExpiringSoon(), remaining - WARNING_THRESHOLD);
    }
  }

  _clearTimers() {
    if (this._expiryTimeout !== null) clearTimeout(this._expiryTimeout);
    if (this._warningTimeout !== null) clearTimeout(this._warningTimeout);
    this._expiryTimeout = null;
    this._warningTimeout = null;
    this._warned = false;
  }

  _handleTokenExpired() {
    this.clearAuthData();
    this._dispatch('tokenExpired', { message: 'Session expired. Please log in again.' });
  }

  _handleTokenExpiringSoon() {
    if (this._warned) return;
    this._warned = true;

    const token = this.getToken();
    if (!token) return;

    const remainingTime = this.getTokenRemainingTime(token);
    this._dispatch('tokenExpiringSoon', { remainingTime, formattedTime: this.formatRemainingTime(remainingTime) });
  }

  _dispatch(name, detail) {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent(name, { detail }));
  }

  formatRemainingTime(ms) {
    if (!isFinite(ms) || ms <= 0) return 'Expired';

    const totalSeconds = Math.floor(ms / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalSeconds / 3600);
    const totalDays = Math.floor(totalSeconds / 86400);

    if (totalDays > 0) return `${totalDays} day${totalDays > 1 ? 's' : ''}`;
    if (totalHours > 0) return `${totalHours} hour${totalHours > 1 ? 's' : ''}`;
    if (totalMinutes > 0) return `${totalMinutes} minute${totalMinutes > 1 ? 's' : ''}`;

    return 'Less than 1 minute';
  }

  getTokenStatus() {
    const token = this.getToken();

    if (!token) return { valid: false, expired: true, message: 'No token found.' };

    const remaining = this.getTokenRemainingTime(token);

    return {
      valid: remaining > 0,
      expired: remaining <= 0,
      expiringSoon: remaining > 0 && remaining <= WARNING_THRESHOLD,
      remainingTime: remaining,
      formattedTime: this.formatRemainingTime(remaining),
    };
  }

  scheduleTimers() {
    this._scheduleTimers();
  }

  clearTimers() {
    this._clearTimers();
  }

  initialize() {
    if (this._initialized) return;
    if (this.getToken()) {
      this._scheduleTimers();
      this._initialized = true;
    }
  }
}

const tokenManager = new TokenManager();
export default tokenManager;