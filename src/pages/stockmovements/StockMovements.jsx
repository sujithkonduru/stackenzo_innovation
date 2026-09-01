import { ArrowLeftRight, ExternalLink } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';

export default function StockMovements() {
  return (
    <div>
      <PageHeader
        title="Stock Movements"
        description="A ledger of every purchase, sale, issue, return, and scrap event."
      />
      <Card>
        <EmptyState
          icon={ArrowLeftRight}
          title="Backend endpoint not available yet"
          description={
            <>
              Purchases, sales, material issues, and returns all write to the <code>stock_movements</code>{' '}
              table on the backend, but no route currently reads it back (no{' '}
              <code>GET /api/inventory/movements</code> or similar exists). This page is wired up and
              ready — once the backend adds a GET endpoint for stock movements, this table will populate
              with movement type, quantity, batch, location, date, and who performed it.
            </>
          }
        />
      </Card>
    </div>
  );
}
