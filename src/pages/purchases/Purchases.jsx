import { Link } from 'react-router-dom';
import { Plus, ShoppingCart } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';

export default function Purchases() {
  return (
    <div>
      <PageHeader
        title="Purchases"
        description="Record and review incoming stock from your suppliers."
        actions={
          <Link to="/purchases/create">
            <Button icon={Plus}>New Purchase</Button>
          </Link>
        }
      />
      <Card>
        <EmptyState
          icon={ShoppingCart}
          title="Purchase history isn't available yet"
          description="The backend only implements POST /purchase/create — there's no GET endpoint to list past purchases. You can still record new purchases; once the backend adds a GET route, this page will list them with search, filters, and totals."
          action={
            <Link to="/purchases/create">
              <Button icon={Plus}>Record a Purchase</Button>
            </Link>
          }
        />
      </Card>
    </div>
  );
}
