import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Send } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Breadcrumb from '../../components/common/Breadcrumb';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/forms/Input';
import Textarea from '../../components/forms/Textarea';
import FormActions from '../../components/forms/FormActions';
import { useProducts } from '../../hooks/useProducts';
import { useInventory } from '../../hooks/useInventory';
import { createMaterialRequest } from '../../services/employeeApi';
import { useToast } from '../../context/ToastContext';
import { useOrganization } from '../../context/OrganizationContext';
import { useAuth } from '../../context/AuthContext';

function emptyItem() {
  return { key: Math.random().toString(36).slice(2), product_id: '', requested_quantity: '1' };
}

export default function RequestCreate() {
  const navigate = useNavigate();
  const toast = useToast();
  const { currentOrganizationId } = useOrganization();
  const { session } = useAuth();
  const { data: products } = useProducts();
  const { data: inventory } = useInventory();

  const [projectName, setProjectName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [items, setItems] = useState([emptyItem()]);
  const [submitting, setSubmitting] = useState(false);

  function availableStock(productId) {
    return inventory.filter((i) => i.product_id === productId).reduce((s, i) => s + Number(i.quantity || 0), 0);
  }

  function updateItem(key, patch) {
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  }
  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
  }
  function removeItem(key) {
    setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.key !== key) : prev));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!session?.userId) {
      toast.error('Your session has no User ID set. Material requests need a valid users.id — set one from Settings.');
      return;
    }

    const invalid = items.find((it) => {
      if (!it.product_id || Number(it.requested_quantity) <= 0) return true;
      if (Number(it.requested_quantity) > availableStock(it.product_id)) return true;
      return false;
    });
    if (invalid) {
      toast.error('Check your items: quantity must be positive and within available stock.');
      return;
    }

    setSubmitting(true);
    try {
      await createMaterialRequest({
        organization_id: currentOrganizationId,
        requested_by: session.userId,
        project_name: projectName,
        purpose,
        items: items.map((it) => ({ product_id: it.product_id, requested_quantity: Number(it.requested_quantity) }))
      });
      toast.success('Material request submitted');
      navigate('/requests');
    } catch (err) {
      toast.error(err.message || 'Unable to submit request');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'Material Requests', to: '/requests' }, { label: 'New Request' }]} />}
        title="New Material Request"
        actions={<Link to="/requests"><Button variant="secondary" icon={ArrowLeft}>Back</Button></Link>}
      />
      <Card style={{ maxWidth: 760 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
            <Input label="Project Name" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
            <Input label="Purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Items</span>
            <Button type="button" size="sm" variant="secondary" icon={Plus} onClick={addItem}>Add Item</Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
            {items.map((it) => {
              const stock = it.product_id ? availableStock(it.product_id) : null;
              const exceeds = stock !== null && Number(it.requested_quantity) > stock;
              return (
                <div key={it.key} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ flex: 2 }}>
                    <select
                      value={it.product_id}
                      onChange={(e) => updateItem(it.key, { product_id: e.target.value })}
                      style={{ width: '100%', height: 38, borderRadius: 8, border: '1px solid var(--border-strong)', background: 'var(--surface)', color: 'var(--foreground)', fontSize: 13.5, padding: '0 10px' }}
                    >
                      <option value="">Select product</option>
                      {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    {stock !== null && (
                      <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 4 }}>Available stock: {stock}</div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <input
                      type="number"
                      min="1"
                      value={it.requested_quantity}
                      onChange={(e) => updateItem(it.key, { requested_quantity: e.target.value })}
                      style={{ width: '100%', height: 38, borderRadius: 8, border: `1px solid ${exceeds ? 'var(--danger)' : 'var(--border-strong)'}`, background: 'var(--surface)', color: 'var(--foreground)', fontSize: 13.5, padding: '0 10px' }}
                    />
                    {exceeds && <div style={{ fontSize: 11.5, color: 'var(--danger)', marginTop: 4 }}>Exceeds available stock</div>}
                  </div>
                  <button type="button" onClick={() => removeItem(it.key)} style={{ background: 'var(--danger-soft)', color: 'var(--danger)', border: 'none', borderRadius: 8, width: 38, height: 38, cursor: 'pointer', flexShrink: 0 }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>

          <FormActions>
            <Button type="button" variant="secondary" onClick={() => navigate('/requests')}>Cancel</Button>
            <Button type="submit" icon={Send} loading={submitting}>Submit Request</Button>
          </FormActions>
        </form>
      </Card>
    </div>
  );
}
