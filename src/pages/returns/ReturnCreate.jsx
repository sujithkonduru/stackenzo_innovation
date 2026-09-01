import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Undo2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Breadcrumb from '../../components/common/Breadcrumb';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Select from '../../components/forms/Select';
import Textarea from '../../components/forms/Textarea';
import FormActions from '../../components/forms/FormActions';
import EmptyState from '../../components/common/EmptyState';
import { PageLoader } from '../../components/common/Loader';
import { useApiList } from '../../hooks/useApiList';
import { useLocations } from '../../hooks/useLocations';
import { getUserMaterialItems, returnMaterial } from '../../services/employeeApi';
import { useToast } from '../../context/ToastContext';
import { useOrganization } from '../../context/OrganizationContext';
import { useAuth } from '../../context/AuthContext';
import { MATERIAL_RETURN_CONDITIONS } from '../../utils/constants';

export default function ReturnCreate() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const { currentOrganizationId } = useOrganization();
  const { session } = useAuth();
  const { data: locations } = useLocations();

  const { data: userItems, loading } = useApiList(
    () => getUserMaterialItems({ organization_id: currentOrganizationId, user_id: session?.userId || undefined }),
    [currentOrganizationId, session?.userId],
    { skip: !currentOrganizationId }
  );

  const returnable = userItems.filter((item) => item.request_status === 'APPROVED' && Number(item.remaining_quantity) > 0);
  const requestIds = [...new Set(returnable.map((r) => r.request_id))];

  const [requestId, setRequestId] = useState(searchParams.get('request_id') || '');
  const [locationId, setLocationId] = useState('');
  const [lines, setLines] = useState({}); // product_id -> { quantity, condition, reason }
  const [submitting, setSubmitting] = useState(false);

  const itemsForRequest = returnable.filter((r) => r.request_id === requestId);

  useEffect(() => {
    if (requestId) {
      setLines((prev) => {
        const next = { ...prev };
        itemsForRequest.forEach((item) => {
          if (!next[item.product_id]) {
            next[item.product_id] = { quantity: '', condition: 'WORKING', reason: '' };
          }
        });
        return next;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  function updateLine(productId, patch) {
    setLines((prev) => ({ ...prev, [productId]: { ...prev[productId], ...patch } }));
  }

  if (loading) return <PageLoader />;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!session?.userId) {
      toast.error('Set your User ID in Settings first — returns require it and must match the original requester.');
      return;
    }
    if (!requestId) return toast.error('Select a request to return items from');
    if (!locationId) return toast.error('Select a location to return stock to');

    const items = itemsForRequest
      .filter((item) => Number(lines[item.product_id]?.quantity) > 0)
      .map((item) => {
        const line = lines[item.product_id];
        const qty = Number(line.quantity);
        return {
          product_id: item.product_id,
          quantity: qty,
          condition: line.condition,
          reason: line.reason || undefined
        };
      });

    const overLimit = itemsForRequest.find((item) => {
      const qty = Number(lines[item.product_id]?.quantity) || 0;
      return qty > Number(item.remaining_quantity);
    });
    if (overLimit) return toast.error(`Return quantity for ${overLimit.product_name} exceeds remaining quantity`);
    if (items.length === 0) return toast.error('Enter a return quantity for at least one item');

    setSubmitting(true);
    try {
      await returnMaterial({
        organization_id: currentOrganizationId,
        request_id: requestId,
        location_id: locationId,
        returned_by: session.userId,
        items
      });
      toast.success('Return submitted successfully');
      navigate('/returns');
    } catch (err) {
      toast.error(err.message || 'Unable to submit return');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'Material Returns', to: '/returns' }, { label: 'New Return' }]} />}
        title="New Material Return"
        actions={<Link to="/returns"><Button variant="secondary" icon={ArrowLeft}>Back</Button></Link>}
      />

      {requestIds.length === 0 ? (
        <Card>
          <EmptyState icon={Undo2} title="Nothing to return" description="You don't have any approved, unreturned material requests right now." />
        </Card>
      ) : (
        <Card style={{ maxWidth: 760 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
              <Select
                label="Material Request"
                required
                value={requestId}
                onChange={(e) => setRequestId(e.target.value)}
                options={requestIds.map((rid) => {
                  const item = returnable.find((r) => r.request_id === rid);
                  return { value: rid, label: item?.project_name || rid.slice(0, 8) };
                })}
              />
              <Select
                label="Return to Location"
                required
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                options={locations.map((l) => ({ value: l.id, label: l.name }))}
              />
            </div>

            {requestId && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {itemsForRequest.map((item) => (
                  <div key={item.product_id} style={{ padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ fontWeight: 600, fontSize: 13.5 }}>{item.product_name}</span>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                        Issued {item.approved_quantity} · Returned {item.returned_quantity} · Remaining {item.remaining_quantity}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.4fr', gap: 10 }}>
                      <input
                        type="number"
                        min="0"
                        max={item.remaining_quantity}
                        placeholder="Return quantity"
                        value={lines[item.product_id]?.quantity || ''}
                        onChange={(e) => updateLine(item.product_id, { quantity: e.target.value })}
                        style={{ height: 36, borderRadius: 8, border: '1px solid var(--border-strong)', background: 'var(--surface)', color: 'var(--foreground)', fontSize: 13, padding: '0 10px' }}
                      />
                      <select
                        value={lines[item.product_id]?.condition || 'WORKING'}
                        onChange={(e) => updateLine(item.product_id, { condition: e.target.value })}
                        style={{ height: 36, borderRadius: 8, border: '1px solid var(--border-strong)', background: 'var(--surface)', color: 'var(--foreground)', fontSize: 13, padding: '0 10px' }}
                      >
                        {MATERIAL_RETURN_CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <input
                        type="text"
                        placeholder="Reason (optional)"
                        value={lines[item.product_id]?.reason || ''}
                        onChange={(e) => updateLine(item.product_id, { reason: e.target.value })}
                        style={{ height: 36, borderRadius: 8, border: '1px solid var(--border-strong)', background: 'var(--surface)', color: 'var(--foreground)', fontSize: 13, padding: '0 10px' }}
                      />
                    </div>
                    {lines[item.product_id]?.condition !== 'WORKING' && (
                      <p style={{ fontSize: 11.5, color: 'var(--warning)', marginTop: 8, marginBottom: 0 }}>
                        Note: Damaged/Scrap returns currently fail on the backend — it writes to an
                        <code> inventory_scrap</code> table that doesn't exist in the database yet.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <FormActions>
              <Button type="button" variant="secondary" onClick={() => navigate('/returns')}>Cancel</Button>
              <Button type="submit" icon={Undo2} loading={submitting} disabled={!requestId}>Submit Return</Button>
            </FormActions>
          </form>
        </Card>
      )}
    </div>
  );
}
