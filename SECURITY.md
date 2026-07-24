# Security Policy

## Authentication Token Storage and Security Tradeoffs

This document outlines the security architecture regarding session management, authentication token storage, and recommendations for future security enhancements.

### Current Implementation

The Lead Sync Frontend application utilizes JWT (JSON Web Tokens) for authentication. 
- **Storage**: Tokens are stored in `sessionStorage` (with an in-memory object fallback if `sessionStorage` is disabled or unavailable) via the `TokenManager` service in `src/utils/tokenManager.js`.
- **Transmission**: The application appends the stored token as a `Bearer` token inside the HTTP `Authorization` header for all backend requests via `axiosInstance` in `src/api/axiosInstance.js`.

### Security Implications and Risk Assessment

Storing authentication tokens in `sessionStorage` or any Web Storage (such as `localStorage`) introduces the following security considerations:

1. **XSS (Cross-Site Scripting) Risks**: 
   Since JavaScript has access to `sessionStorage`, any Cross-Site Scripting (XSS) vulnerability inside the application could allow an attacker to read the token directly. Once read, an attacker can extract and use the JWT to impersonate the user.
   
2. **Mitigation of XSS Vectors**:
   To minimize the risk of XSS-based token theft, we strictly prohibit the use of unescaped or unsanitized dynamically rendered HTML elements. Specifically:
   - Dynamic user-provided or api-provided inputs must NEVER be parsed via `dangerouslySetInnerHTML` or `.innerHTML`.
   - Programmatic element generation must map text content to `element.textContent` or `element.innerText` to ensure any injected tags are treated as plain text rather than executable markup.

### Long-Term Security Roadmap (Recommended)

To completely shield session tokens from JavaScript access and XSS exploitation, we recommend transitioning to a **cookie-based authentication model**:

#### 1. HttpOnly Cookies
Move token storage from `sessionStorage` to secure, server-issued HTTP cookies. 
- The backend should set the token in a cookie with the `HttpOnly` flag enabled.
- When `HttpOnly` is active, the browser prevents client-side JavaScript from accessing the cookie (e.g., via `document.cookie`). This removes the possibility of an attacker stealing the token through XSS.

#### 2. Cookie Security Attributes
The authentication cookie should be configured with the following properties:
- **`Secure`**: Ensures the cookie is only transmitted over HTTPS connections, protecting it from interception over cleartext HTTP.
- **`SameSite=Strict`** (or `SameSite=Lax` depending on requirements): Prevents the cookie from being sent along with cross-site requests, mitigating Cross-Site Request Forgery (CSRF) attacks.

#### 3. Frontend Coordinated Changes
Once cookie-based auth is implemented:
- The frontend will no longer need to read, write, or manually attach the token to request headers.
- The browser will automatically attach the cookie to all outgoing API requests to the backend domain.
- `TokenManager` can be updated to manage local session status (e.g., boolean logged-in state, user profile metadata) rather than the token itself.

---
For any security-related queries, please coordinate with the backend development team to plan token-to-cookie migration.
