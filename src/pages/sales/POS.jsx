import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ScanBarcode, Receipt, X } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/forms/Input';
import Select from '../../components/forms/Select';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/modals/Modal';
import { useProducts } from '../../hooks/useProducts';
import { useInventory } from '../../hooks/useInventory';
import { useLocations } from '../../hooks/useLocations';
import { createSale } from '../../services/saleApi';
import { useToast } from '../../context/ToastContext';
import { useOrganization } from '../../context/OrganizationContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { PAYMENT_METHODS } from '../../utils/constants';

export default function POS() {
  const navigate = useNavigate();
  const toast = useToast();
  const { currentOrganizationId } = useOrganization();
  const { session } = useAuth();

  const { data: locations } = useLocations();
  const [locationId, setLocationId] = useState('');

  const { data: products } = useProducts();
  const { data: inventory } = useInventory({ locationId: locationId || undefined });

  const [query, setQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(() => `INV-${Date.now().toString().slice(-8)}`);
  const [discount, setDiscount] = useState('0');
  const [payments, setPayments] = useState([{ payment_method: 'CASH', amount: '', transaction_reference: '' }]);
  const [submitting, setSubmitting] = useState(false);

  const results = useMemo(() => {
    if (!query) return products.slice(0, 20);
    const q = query.toLowerCase();
    return products.filter(
      (p) => p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q) || p.barcode === query
    );
  }, [products, query]);

  function stockRowsFor(productId) {
    return inventory.filter((i) => i.product_id === productId && Number(i.quantity) > 0);
  }

  function addToCart(product) {
    const stockRows = stockRowsFor(product.id);
    const defaultBatch = stockRows[0];
    setCart((prev) => {
      const existing = prev.find((c) => c.product_id === product.id && c.batch_id === (defaultBatch?.batch_id || null));
      if (existing) {
        return prev.map((c) => (c === existing ? { ...c, quantity: c.quantity + 1 } : c));
      }
      return [
        ...prev,
        {
          key: Math.random().toString(36).slice(2),
          product_id: product.id,
          name: product.name,
          unit: product.unit,
          batch_id: defaultBatch?.batch_id || null,
          batch_number: defaultBatch?.batch_number || null,
          available: defaultBatch?.quantity || 0,
          unit_price: Number(defaultBatch?.selling_price) || 0,
          tax_percent: 0,
          quantity: 1
        }
      ];
    });
    setQuery('');
  }

  function updateCartItem(key, patch) {
    setCart((prev) => prev.map((c) => (c.key === key ? { ...c, ...patch } : c)));
  }

  function removeFromCart(key) {
    setCart((prev) => prev.filter((c) => c.key !== key));
  }

  const totals = useMemo(() => {
    let subtotal = 0;
    let tax = 0;
    cart.forEach((c) => {
      const gross = c.quantity * c.unit_price;
      const itemTax = (gross * (Number(c.tax_percent) || 0)) / 100;
      subtotal += gross;
      tax += itemTax;
    });
    const flatDiscount = Number(discount) || 0;
    const grandTotal = Math.max(0, subtotal + tax - flatDiscount);
    return { subtotal, tax, flatDiscount, grandTotal };
  }, [cart, discount]);

  const paidTotal = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);

  function addPayment() {
    setPayments((prev) => [...prev, { payment_method: 'CASH', amount: '', transaction_reference: '' }]);
  }
  function updatePayment(i, patch) {
    setPayments((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }
  function removePayment(i) {
    setPayments((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));
  }

  async function handleCheckout() {
    if (!locationId) return toast.error('Select a location first');
    if (cart.length === 0) return toast.error('Cart is empty');

    setSubmitting(true);
    try {
      await createSale({
        organization_id: currentOrganizationId,
        location_id: locationId,
        invoice_number: invoiceNumber,
        customer_name: customerName || undefined,
        customer_phone: customerPhone || undefined,
        discount: Number(discount) || 0,
        created_by: session?.userId || undefined,
        items: cart.map((c) => ({
          product_id: c.product_id,
          batch_id: c.batch_id || undefined,
          quantity: c.quantity,
          unit_price: c.unit_price,
          tax_percent: Number(c.tax_percent) || 0
        })),
        payments: payments
          .filter((p) => Number(p.amount) > 0)
          .map((p) => ({
            payment_method: p.payment_method,
            amount: Number(p.amount),
            transaction_reference: p.transaction_reference || undefined
          }))
      });
      toast.success('Sale completed successfully');
      setCart([]);
      setCheckoutOpen(false);
      setInvoiceNumber(`INV-${Date.now().toString().slice(-8)}`);
      setCustomerName('');
      setCustomerPhone('');
      setDiscount('0');
      setPayments([{ payment_method: 'CASH', amount: '', transaction_reference: '' }]);
      navigate('/sales');
    } catch (err) {
      toast.error(
        err.status === 404
          ? 'Sales endpoint unavailable: api/sale.js is not mounted on the backend yet (see Backend Integration Notes).'
          : err.message || 'Unable to complete sale'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="POS / Sales"
        description="Search or scan a product to add it to the cart."
        actions={
          <div style={{ width: 220 }}>
            <Select value={locationId} onChange={(e) => setLocationId(e.target.value)} options={locations.map((l) => ({ value: l.id, label: l.name }))} placeholder="Select location" />
          </div>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 16 }} className="pos-grid">
        <Card>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <ScanBarcode size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--muted-2)' }} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, SKU, or scan barcode..."
              style={{ width: '100%', height: 40, paddingLeft: 36, paddingRight: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)', background: 'var(--surface)', color: 'var(--foreground)', fontSize: 14 }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, maxHeight: 460, overflowY: 'auto' }}>
            {results.length === 0 && <EmptyState title="No products found" />}
            {results.map((p) => {
              const stock = stockRowsFor(p.id).reduce((s, r) => s + Number(r.quantity), 0);
              return (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  disabled={!locationId || stock <= 0}
                  style={{
                    textAlign: 'left',
                    padding: 12,
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    background: 'var(--background)',
                    cursor: !locationId || stock <= 0 ? 'not-allowed' : 'pointer',
                    opacity: !locationId || stock <= 0 ? 0.5 : 1
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{p.sku || '—'}</div>
                  <div style={{ fontSize: 11.5, color: stock > 0 ? 'var(--success)' : 'var(--danger)', marginTop: 4, fontWeight: 600 }}>
                    {stock > 0 ? `${stock} in stock` : 'Out of stock'}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 14px' }}>Cart</h3>
          {cart.length === 0 ? (
            <EmptyState title="Cart is empty" description="Add products from the search results." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14, maxHeight: 340, overflowY: 'auto' }}>
              {cart.map((c) => (
                <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{formatCurrency(c.unit_price)} / {c.unit}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <IconStepBtn onClick={() => updateCartItem(c.key, { quantity: Math.max(1, c.quantity - 1) })}><Minus size={12} /></IconStepBtn>
                    <span style={{ fontSize: 13, fontWeight: 600, width: 22, textAlign: 'center' }}>{c.quantity}</span>
                    <IconStepBtn onClick={() => updateCartItem(c.key, { quantity: c.quantity + 1 })}><Plus size={12} /></IconStepBtn>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, width: 70, textAlign: 'right' }}>{formatCurrency(c.quantity * c.unit_price)}</div>
                  <button onClick={() => removeFromCart(c.key)} aria-label="Remove" style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            <SummaryLine label="Subtotal" value={formatCurrency(totals.subtotal)} />
            <SummaryLine label="Tax" value={formatCurrency(totals.tax)} />
            <SummaryLine label="Discount" value={formatCurrency(totals.flatDiscount)} />
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, marginTop: 4, borderTop: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 700 }}>Grand Total</span>
              <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--primary)' }}>{formatCurrency(totals.grandTotal)}</span>
            </div>
            <Button fullWidth size="lg" icon={Receipt} style={{ marginTop: 14 }} disabled={cart.length === 0} onClick={() => setCheckoutOpen(true)}>
              Checkout
            </Button>
          </div>
        </Card>
      </div>

      <Modal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        title="Checkout"
        width={520}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCheckoutOpen(false)}>Cancel</Button>
            <Button onClick={handleCheckout} loading={submitting}>Complete Sale — {formatCurrency(totals.grandTotal)}</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Invoice Number" required value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            <Input label="Customer Phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Payments</span>
              <button type="button" onClick={addPayment} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Plus size={13} /> Add Payment
              </button>
            </div>
            {payments.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <Select value={p.payment_method} onChange={(e) => updatePayment(i, { payment_method: e.target.value })} options={PAYMENT_METHODS} />
                </div>
                <div style={{ width: 110 }}>
                  <input
                    type="number"
                    placeholder="Amount"
                    value={p.amount}
                    onChange={(e) => updatePayment(i, { amount: e.target.value })}
                    style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)', background: 'var(--surface)', color: 'var(--foreground)', fontSize: 13.5 }}
                  />
                </div>
                {payments.length > 1 && (
                  <button type="button" onClick={() => removePayment(i)} style={{ height: 38, width: 38, borderRadius: 8, border: 'none', background: 'var(--danger-soft)', color: 'var(--danger)', cursor: 'pointer' }}>
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
            <div style={{ fontSize: 12, color: paidTotal < totals.grandTotal ? 'var(--warning)' : 'var(--success)', fontWeight: 600 }}>
              Paid: {formatCurrency(paidTotal)} of {formatCurrency(totals.grandTotal)}
            </div>
          </div>
        </div>
      </Modal>

      <style>{`
        @media (max-width: 900px) {
          .pos-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function IconStepBtn({ children, onClick }) {
  return (
    <button onClick={onClick} style={{ width: 22, height: 22, borderRadius: 6, border: '1px solid var(--border-strong)', background: 'var(--surface)', color: 'var(--foreground)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </button>
  );
}

function SummaryLine({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', color: 'var(--muted)' }}>
      <span>{label}</span>
      <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>{value}</span>
    </div>
  );
}
