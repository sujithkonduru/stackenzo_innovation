import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Breadcrumb from '../../components/common/Breadcrumb';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/forms/Input';
import Textarea from '../../components/forms/Textarea';
import Select from '../../components/forms/Select';
import NumberInput from '../../components/forms/NumberInput';
import Switch from '../../components/forms/Switch';
import FormSection from '../../components/forms/FormSection';
import FormActions from '../../components/forms/FormActions';
import { PageLoader } from '../../components/common/Loader';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { createProduct, updateProduct } from '../../services/productApi';
import { useToast } from '../../context/ToastContext';
import { useOrganization } from '../../context/OrganizationContext';
import { UNIT_OPTIONS } from '../../utils/constants';
import { isRequired, validateForm, hasErrors } from '../../utils/validation';

const emptyForm = {
  name: '',
  sku: '',
  barcode: '',
  description: '',
  category_id: '',
  manufacturer: '',
  unit: '',
  reorder_level: '10',
  has_expiry: false
};

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const { currentOrganizationName } = useOrganization();
  const { data: products, loading: productsLoading, refresh } = useProducts();
  const { data: categories } = useCategories();

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit && products.length) {
      const product = products.find((p) => p.id === id);
      if (product) {
        setForm({
          name: product.name || '',
          sku: product.sku || '',
          barcode: product.barcode || '',
          description: product.description || '',
          category_id: product.category_id || '',
          manufacturer: product.manufacturer || '',
          unit: product.unit || '',
          reorder_level: String(product.reorder_level ?? '10'),
          has_expiry: Boolean(product.has_expiry)
        });
      }
    }
  }, [isEdit, id, products]);

  if (isEdit && productsLoading) return <PageLoader />;

  async function handleSubmit(e) {
    e.preventDefault();
    const formErrors = validateForm(form, {
      name: isRequired,
      unit: isRequired
    });
    if (hasErrors(formErrors)) return setErrors(formErrors);

    setSaving(true);
    try {
      const categoryName = categories.find((c) => c.id === form.category_id)?.name;
      if (isEdit) {
        await updateProduct({
          productId: id,
          categoryId: form.category_id || null,
          name: form.name,
          description: form.description,
          sku: form.sku,
          barcode: form.barcode,
          unit: form.unit,
          manufacturer: form.manufacturer,
          reorder_level: Number(form.reorder_level) || 0,
          has_expiry: form.has_expiry
        });
        toast.success('Product updated successfully');
      } else {
        await createProduct({
          organization_name: currentOrganizationName,
          category_name: categoryName || undefined,
          name: form.name,
          description: form.description,
          sku: form.sku,
          barcode: form.barcode,
          unit: form.unit,
          manufacturer: form.manufacturer,
          reorder_level: Number(form.reorder_level) || 0,
          has_expiry: form.has_expiry
        });
        toast.success('Product created successfully');
      }
      refresh();
      navigate('/products');
    } catch (err) {
      toast.error(err.message || 'Unable to save product');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'Products', to: '/products' }, { label: isEdit ? 'Edit' : 'Create' }]} />}
        title={isEdit ? 'Edit Product' : 'New Product'}
        actions={
          <Link to="/products">
            <Button variant="secondary" icon={ArrowLeft}>Back</Button>
          </Link>
        }
      />
      <Card style={{ maxWidth: 760 }}>
        <form onSubmit={handleSubmit}>
          <FormSection title="Basic Information">
            <Input label="Product Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
            <Input label="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            <Input label="Barcode" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
            <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ gridColumn: '1 / -1' }} />
          </FormSection>

          <FormSection title="Classification">
            <Select
              label="Category"
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="No category"
            />
            <Input label="Manufacturer" value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} />
            <Select
              label="Unit"
              required
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              options={UNIT_OPTIONS}
              error={errors.unit}
            />
          </FormSection>

          <FormSection title="Inventory Settings">
            <NumberInput
              label="Reorder Level"
              min="0"
              value={form.reorder_level}
              onChange={(e) => setForm({ ...form, reorder_level: e.target.value })}
              hint="Alerts trigger when available stock falls to or below this level."
            />
            <div style={{ display: 'flex', alignItems: 'center', paddingTop: 22 }}>
              <Switch label="Has Expiry" checked={form.has_expiry} onChange={(v) => setForm({ ...form, has_expiry: v })} />
            </div>
          </FormSection>

          <FormActions>
            <Button type="button" variant="secondary" onClick={() => navigate('/products')}>Cancel</Button>
            <Button type="submit" icon={Save} loading={saving}>{isEdit ? 'Save Changes' : 'Create Product'}</Button>
          </FormActions>
        </form>
      </Card>
    </div>
  );
}
