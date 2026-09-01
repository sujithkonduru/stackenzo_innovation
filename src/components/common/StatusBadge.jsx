import Badge from './Badge';

const MAP = {
  // Material requests
  PENDING_APPROVAL: { tone: 'warning', label: 'Pending Approval' },
  APPROVED: { tone: 'success', label: 'Approved' },
  REJECTED: { tone: 'danger', label: 'Rejected' },
  // Payment status
  PAID: { tone: 'success', label: 'Paid' },
  PARTIALLY_PAID: { tone: 'warning', label: 'Partially Paid' },
  PENDING: { tone: 'warning', label: 'Pending' },
  COMPLETED: { tone: 'success', label: 'Completed' },
  // Stock status
  IN_STOCK: { tone: 'success', label: 'In Stock' },
  LOW_STOCK: { tone: 'warning', label: 'Low Stock' },
  OUT_OF_STOCK: { tone: 'danger', label: 'Out of Stock' },
  EXPIRED: { tone: 'danger', label: 'Expired' },
  // Batch expiry
  SAFE: { tone: 'success', label: 'Safe' },
  EXPIRING_SOON: { tone: 'warning', label: 'Expiring Soon' },
  VALID: { tone: 'success', label: 'Valid' },
  // Generic
  ACTIVE: { tone: 'success', label: 'Active' },
  INACTIVE: { tone: 'neutral', label: 'Inactive' },
  // Return condition
  WORKING: { tone: 'success', label: 'Working' },
  DAMAGED: { tone: 'warning', label: 'Damaged' },
  SCRAP: { tone: 'danger', label: 'Scrap' }
};

export default function StatusBadge({ status }) {
  const cfg = MAP[status] || { tone: 'neutral', label: status || '—' };
  return (
    <Badge tone={cfg.tone} dot>
      {cfg.label}
    </Badge>
  );
}
