import { useCallback } from 'react';
import { useApiList } from './useApiList';
import { getProducts } from '../services/productApi';
import { useOrganization } from '../context/OrganizationContext';

export function useProducts(params = {}) {
  const { currentOrganizationId } = useOrganization();
  const fetcher = useCallback(
    () => getProducts({ organizationId: currentOrganizationId, ...params }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentOrganizationId, JSON.stringify(params)]
  );
  return useApiList(fetcher, [currentOrganizationId, JSON.stringify(params)], {
    skip: !currentOrganizationId
  });
}
