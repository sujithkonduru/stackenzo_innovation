import { useCallback } from 'react';
import { useApiList } from './useApiList';
import { getInventory } from '../services/inventoryApi';
import { useOrganization } from '../context/OrganizationContext';

export function useInventory(params = {}) {
  const { currentOrganizationId } = useOrganization();
  const fetcher = useCallback(
    () => getInventory({ organizationId: currentOrganizationId, ...params }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentOrganizationId, JSON.stringify(params)]
  );
  return useApiList(fetcher, [currentOrganizationId, JSON.stringify(params)], {
    skip: !currentOrganizationId
  });
}
