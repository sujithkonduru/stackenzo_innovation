import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getOrganizations } from '../services/organizationApi';

const OrganizationContext = createContext(null);

export function OrganizationProvider({ children }) {
  const { session, switchOrganization } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getOrganizations();
      setOrganizations(list);
    } catch (err) {
      setError(err.message || 'Failed to load organizations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) refresh();
  }, [session, refresh]);

  const value = {
    organizations,
    loading,
    error,
    refresh,
    currentOrganizationId: session?.organizationId || null,
    currentOrganizationName: session?.organizationName || null,
    switchOrganization
  };

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
}

export function useOrganization() {
  const ctx = useContext(OrganizationContext);
  if (!ctx) throw new Error('useOrganization must be used within OrganizationProvider');
  return ctx;
}
