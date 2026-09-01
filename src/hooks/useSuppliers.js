import { useCallback } from 'react';
import { useApiList } from './useApiList';
import { getSuppliers } from '../services/supplierApi';
import { useOrganization } from '../context/OrganizationContext';

export function useSuppliers(params = {}) {
  const { currentOrganizationId } = useOrganization();
  const fetcher = useCallback(
    () => getSuppliers({ organizationId: currentOrganizationId, ...params }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentOrganizationId, JSON.stringify(params)]
  );
  return useApiList(fetcher, [currentOrganizationId, JSON.stringify(params)], {
    skip: !currentOrganizationId
  });
}
