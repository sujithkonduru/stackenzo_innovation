import { useCallback } from 'react';
import { useApiList } from './useApiList';
import { getMaterialRequests } from '../services/employeeApi';
import { useOrganization } from '../context/OrganizationContext';

export function useRequests(params = {}) {
  const { currentOrganizationId } = useOrganization();
  const fetcher = useCallback(
    () => getMaterialRequests({ organizationId: currentOrganizationId, ...params }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentOrganizationId, JSON.stringify(params)]
  );
  return useApiList(fetcher, [currentOrganizationId, JSON.stringify(params)], {
    skip: !currentOrganizationId
  });
}
