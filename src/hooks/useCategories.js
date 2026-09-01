import { useCallback } from 'react';
import { useApiList } from './useApiList';
import { getCategories } from '../services/categoryApi';
import { useOrganization } from '../context/OrganizationContext';

export function useCategories() {
  const { currentOrganizationId } = useOrganization();
  const fetcher = useCallback(
    () => getCategories(currentOrganizationId),
    [currentOrganizationId]
  );
  return useApiList(fetcher, [currentOrganizationId], { skip: !currentOrganizationId });
}
