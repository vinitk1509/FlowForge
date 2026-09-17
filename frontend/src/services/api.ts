import type { AuthSession, UserProfile } from '../types/auth';

const API_BASE = 'http://localhost:8080/api/v1'; // API Gateway route

export const DEMO_USER: UserProfile = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'alex.chen@flowforge.io',
  firstName: 'Alex',
  lastName: 'Chen',
  createdAt: '2026-01-15T09:00:00Z',
};

export class AuthService {
  private static TOKEN_KEY = 'flowforge_token';
  private static USER_KEY = 'flowforge_user';

  public static getSession(): AuthSession | null {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const userStr = localStorage.getItem(this.USER_KEY);
      if (token && userStr) {
        return { token, user: JSON.parse(userStr) };
      }
    } catch {
      // Fallback
    }
    return null;
  }

  public static saveSession(session: AuthSession) {
    localStorage.setItem(this.TOKEN_KEY, session.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(session.user));
  }

  public static clearSession() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  public static async login(email: string, password: string): Promise<AuthSession> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        const session: AuthSession = {
          token: data.data.accessToken,
          user: data.data.user,
        };
        this.saveSession(session);
        return session;
      }
    } catch {
      // Backend not running; fallback to demo mode
    }

    // Demo Mode Session
    const session: AuthSession = {
      token: 'demo-jwt-token-flowforge-2026',
      user: {
        ...DEMO_USER,
        email: email || DEMO_USER.email,
        firstName: email ? email.split('@')[0] : DEMO_USER.firstName,
      },
    };
    this.saveSession(session);
    return session;
  }

  public static async register(email: string, password: string, name: string): Promise<AuthSession> {
    const parts = name.trim().split(' ');
    const firstName = parts[0] || 'Engineer';
    const lastName = parts.slice(1).join(' ') || 'User';

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });
      if (res.ok) {
        const data = await res.json();
        const session: AuthSession = {
          token: data.data.accessToken,
          user: data.data.user,
        };
        this.saveSession(session);
        return session;
      }
    } catch {
      // Fallback to local session
    }

    const session: AuthSession = {
      token: 'demo-jwt-token-flowforge-2026',
      user: {
        id: 'user-' + Date.now().toString(36),
        email,
        firstName,
        lastName,
        createdAt: new Date().toISOString(),
      },
    };
    this.saveSession(session);
    return session;
  }
}
