import { createContext, useContext, useState, useCallback } from 'react';
import { LOCAL_STORAGE_KEYS, USER_ROLES } from '../utils/constants';

const AuthContext = createContext(null);

// ============================================================================
// IMPORTANT — READ BEFORE MODIFYING
//
// api/auth.js on the backend is an empty file and is not mounted in
// index.js. There is no login, no signup, no JWT, no session verification
// of any kind on the server. There IS a `users` table in Postgres with a
// `role` column, and several write endpoints have NOT NULL foreign keys
// into it (material_requests.requested_by, employeeRequest.decision's
// approved_by, employeeRequest.return's returned_by all reference
// users(id) and are required). But there is no API to create or list
// users, so those ids must already exist — created directly in the
// database by whoever administers it.
//
// Given that, this context is NOT a real authentication system. It is a
// local "session" that lets someone who already knows their organization
// and their own users.id use the app coherently, and it is presented to
// the user as exactly that on the setup screen — not as a login.
// ============================================================================

function readSession() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.SESSION);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);

  const startSession = useCallback((data) => {
    const next = {
      organizationId: data.organizationId,
      organizationName: data.organizationName,
      userId: data.userId || null,
      userName: data.userName,
      role: data.role || USER_ROLES.EMPLOYEE
    };
    localStorage.setItem(LOCAL_STORAGE_KEYS.SESSION, JSON.stringify(next));
    setSession(next);
  }, []);

  const endSession = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.SESSION);
    setSession(null);
  }, []);

  const switchOrganization = useCallback((organizationId, organizationName) => {
    setSession((prev) => {
      if (!prev) return prev;
      const next = { ...prev, organizationId, organizationName };
      localStorage.setItem(LOCAL_STORAGE_KEYS.SESSION, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = {
    session,
    isAuthenticated: Boolean(session),
    startSession,
    endSession,
    switchOrganization
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
