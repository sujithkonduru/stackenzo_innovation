import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, ShoppingCart } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Breadcrumb from '../../components/common/Breadcrumb';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Select from '../../components/forms/Select';
import Input from '../../components/forms/Input';
import DateInput from '../../components/forms/DateInput';
import NumberInput from '../../components/forms/NumberInput';
import FormActions from '../../components/forms/FormActions';
import { useSuppliers } from '../../hooks/useSuppliers';
import { useLocations } from '../../hooks/useLocations';
import { useProducts } from '../../hooks/useProducts';
import { useBatches } from '../../hooks/useBatches';
import { createPurchase } from '../../services/purchaseApi';
import { useToast } from '../../context/ToastContext';
import { useOrganization } from '../../context/OrganizationContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { toInputDate } from '../../utils/formatDate';

function emptyItem() {
  return { key: Math.random().toString(36).slice(2), product_id: '', batch_id: '', quantity: '1', purchase_price: '', tax_percent: '0', discount_percent: '0' };
}

export default function PurchaseCreate() {
  const navigate = useNavigate();
  const toast = useToast();
  const { currentOrganizationName } = useOrganization();
  const { session } = useAuth();

  const { data: suppliers } = useSuppliers();
  const { data: locations } = useLocations();
  const { data: products } = useProducts();
  const { data: batches } = useBatches();

  const [supplierId, setSupplierId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(toInputDate(new Date()));
  const [discount, setDiscount] = useState('0');
  const [items, setItems] = useState([emptyItem()]);
  const [submitting, setSubmitting] = useState(false);

  function updateItem(key, patch) {
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
  }

  function removeItem(key) {
    setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.key !== key) : prev));
  }

  const totals = useMemo(() => {
    let subtotal = 0;
    let tax = 0;
    let itemDiscounts = 0;

    items.forEach((it) => {
      const qty = Number(it.quantity) || 0;
      const price = Number(it.purchase_price) || 0;
      const taxPct = Number(it.tax_percent) || 0;
      const discPct = Number(it.discount_percent) || 0;

      const gross = qty * price;
      const itemDiscount = (gross * discPct) / 100;
      const taxable = gross - itemDiscount;
      const itemTax = (taxable * taxPct) / 100;

      subtotal += taxable;
      tax += itemTax;
      itemDiscounts += itemDiscount;
    });

    const flatDiscount = Number(discount) || 0;
    const grandTotal = subtotal + tax - flatDiscount;

    return { subtotal, tax, itemDiscounts, flatDiscount, grandTotal: Math.max(0, grandTotal) };
  }, [items, discount]);

  function itemTotal(it) {
    const qty = Number(it.quantity) || 0;
    const price = Number(it.purchase_price) || 0;
    const taxPct = Number(it.tax_percent) || 0;
    const discPct = Number(it.discount_percent) || 0;
    const gross = qty * price;
    const itemDiscount = (gross * discPct) / 100;
    const taxable = gross - itemDiscount;
    const itemTax = (taxable * taxPct) / 100;
    return taxable + itemTax;
  }

  function batchOptionsFor(productId) {
    return batches.filter((b) => b.product_id === productId).map((b) => ({ value: b.id, label: b.batch_number }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!locationId) return toast.error('Please select a location');
    const validItems = items.filter((it) => it.product_id && Number(it.quantity) > 0 && it.purchase_price !== '');
    if (validItems.length === 0) return toast.error('Add at least one valid item');

    setSubmitting(true);
    try {
      await createPurchase({
        organization_name: currentOrganizationName,
        supplier_id: supplierId || undefined,
        location_id: locationId,
        invoice_number: invoiceNumber || undefined,
        purchase_date: purchaseDate || undefined,
        discount: Number(discount) || 0,
        created_by: session?.userId || undefined,
        items: validItems.map((it) => ({
          product_id: it.product_id,
          batch_id: it.batch_id || undefined,
          quantity: Number(it.quantity),
          purchase_price: Number(it.purchase_price),
          tax_percent: Number(it.tax_percent) || 0,
          discount_percent: Number(it.discount_percent) || 0
        }))
      });
      toast.success('Purchase recorded successfully');
      navigate('/purchases');
    } catch (err) {
      toast.error(err.message || 'Unable to create purchase');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'Purchases', to: '/purchases' }, { label: 'New Purchase' }]} />}
        title="New Purchase Entry"
        actions={
          <Link to="/purchases">
            <Button variant="secondary" icon={ArrowLeft}>Back</Button>
          </Link>
        }
      />

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 16, alignItems: 'start' }} className="purchase-grid">
          <div>
            <Card style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 14px' }}>Purchase Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                <Select label="Supplier" value={supplierId} onChange={(e) => setSupplierId(e.target.value)} options={suppliers.map((s) => ({ value: s.id, label: s.name }))} placeholder="No supplier" />
                <Select label="Location" required value={locationId} onChange={(e) => setLocationId(e.target.value)} options={locations.map((l) => ({ value: l.id, label: l.name }))} placeholder="Select location" />
                <Input label="Invoice Number" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
                <DateInput label="Purchase Date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
              </div>
            </Card>

            <Card padding={0}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Items</h3>
                <Button type="button" size="sm" variant="secondary" icon={Plus} onClick={addItem}>Add Item</Button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
                  <thead>
                    <tr>
                      {['Product', 'Batch', 'Quantity', 'Purchase Price', 'Tax %', 'Total', ''].map((h) => (
                        <th key={h} style={{ textAlign: 'left', fontSize: 11.5, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it) => (
                      <tr key={it.key}>
                        <td style={cellStyle}>
                          <select
                            value={it.product_id}
                            onChange={(e) => updateItem(it.key, { product_id: e.target.value, batch_id: '' })}
                            style={selectCellStyle}
                          >
                            <option value="">Select product</option>
                            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                        </td>
                        <td style={cellStyle}>
                          <select
                            value={it.batch_id}
                            onChange={(e) => updateItem(it.key, { batch_id: e.target.value })}
                            style={selectCellStyle}
                            disabled={!it.product_id}
                          >
                            <option value="">No batch</option>
                            {batchOptionsFor(it.product_id).map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
                          </select>
                        </td>
                        <td style={cellStyle}>
                          <input type="number" min="0" step="1" value={it.quantity} onChange={(e) => updateItem(it.key, { quantity: e.target.value })} style={inputCellStyle} />
                        </td>
                        <td style={cellStyle}>
                          <input type="number" min="0" step="0.01" value={it.purchase_price} onChange={(e) => updateItem(it.key, { purchase_price: e.target.value })} style={inputCellStyle} />
                        </td>
                        <td style={cellStyle}>
                          <input type="number" min="0" max="100" step="0.1" value={it.tax_percent} onChange={(e) => updateItem(it.key, { tax_percent: e.target.value })} style={{ ...inputCellStyle, width: 70 }} />
                        </td>
                        <td style={{ ...cellStyle, fontWeight: 700 }}>{formatCurrency(itemTotal(it))}</td>
                        <td style={cellStyle}>
                          <button type="button" onClick={() => removeItem(it.key)} aria-label="Remove item" style={{ background: 'var(--danger-soft)', color: 'var(--danger)', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer' }}>
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <Card style={{ position: 'sticky', top: 84 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 14px' }}>Purchase Summary</h3>
            <SummaryLine label="Subtotal" value={formatCurrency(totals.subtotal)} />
            <SummaryLine label="Tax" value={formatCurrency(totals.tax)} />
            <SummaryLine label="Item Discounts" value={formatCurrency(totals.itemDiscounts)} />
            <div style={{ marginTop: 10, marginBottom: 10 }}>
              <NumberInput label="Additional Discount" prefix="₹" min="0" step="0.01" value={discount} onChange={(e) => setDiscount(e.target.value)} />
            </div>
            <div style={{ borderTop: '1px solid var(--border)', margin: '10px 0', paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: 14.5 }}>Grand Total</span>
              <span style={{ fontWeight: 800, fontSize: 16.5, color: 'var(--primary)' }}>{formatCurrency(totals.grandTotal)}</span>
            </div>
            <Button type="submit" fullWidth icon={ShoppingCart} loading={submitting} style={{ marginTop: 8 }}>
              Record Purchase
            </Button>
          </Card>
        </div>
      </form>
      <style>{`
        @media (max-width: 900px) {
          .purchase-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function SummaryLine({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, padding: '6px 0', color: 'var(--muted)' }}>
      <span>{label}</span>
      <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>{value}</span>
    </div>
  );
}

const cellStyle = { padding: '8px 10px', borderBottom: '1px solid var(--border)' };
const selectCellStyle = { width: '100%', height: 34, borderRadius: 6, border: '1px solid var(--border-strong)', background: 'var(--surface)', color: 'var(--foreground)', fontSize: 13, padding: '0 8px' };
const inputCellStyle = { width: 100, height: 34, borderRadius: 6, border: '1px solid var(--border-strong)', background: 'var(--surface)', color: 'var(--foreground)', fontSize: 13, padding: '0 8px' };
