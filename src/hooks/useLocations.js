import { useCallback } from 'react';
import { useApiList } from './useApiList';
import { getLocations } from '../services/locationApi';
import { useOrganization } from '../context/OrganizationContext';

export function useLocations(params = {}) {
  const { currentOrganizationId } = useOrganization();
  const fetcher = useCallback(
    () => getLocations({ organizationId: currentOrganizationId, ...params }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentOrganizationId, JSON.stringify(params)]
  );
  return useApiList(fetcher, [currentOrganizationId, JSON.stringify(params)], {
    skip: !currentOrganizationId
  });
}
