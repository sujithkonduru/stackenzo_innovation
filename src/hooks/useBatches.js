import { useCallback } from 'react';
import { useApiList } from './useApiList';
import { getBatches } from '../services/batchApi';
import { useOrganization } from '../context/OrganizationContext';

export function useBatches(params = {}) {
  const { currentOrganizationId } = useOrganization();
  const fetcher = useCallback(
    () => getBatches({ organizationId: currentOrganizationId, ...params }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentOrganizationId, JSON.stringify(params)]
  );
  return useApiList(fetcher, [currentOrganizationId, JSON.stringify(params)], {
    skip: !currentOrganizationId
  });
}
