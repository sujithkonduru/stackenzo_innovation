import { useState } from 'react';
import { Tags, Plus } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import SearchInput from '../../components/common/SearchInput';
import DataTable from '../../components/tables/DataTable';
import Modal from '../../components/modals/Modal';
import Input from '../../components/forms/Input';
import { useCategories } from '../../hooks/useCategories';
import { useDebounce } from '../../hooks/useDebounce';
import { createCategory } from '../../services/categoryApi';
import { useToast } from '../../context/ToastContext';
import { useOrganization } from '../../context/OrganizationContext';
import { isRequired, validateForm, hasErrors } from '../../utils/validation';

export default function Categories() {
  const toast = useToast();
  const { currentOrganizationName } = useOrganization();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const { data, loading, refresh } = useCategories();

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = data.filter((c) => c.name?.toLowerCase().includes(debouncedSearch.toLowerCase()));

  async function handleSave(e) {
    e.preventDefault();
    const errs = validateForm({ name }, { name: isRequired });
    if (hasErrors(errs)) return setError(errs.name);
    setSaving(true);
    try {
      await createCategory({ organization_name: currentOrganizationName, name });
      toast.success('Category created successfully');
      setModalOpen(false);
      setName('');
      refresh();
    } catch (err) {
      toast.error(err.message || 'Unable to create category');
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Category',
      sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Tags size={15} />
          </div>
          <span style={{ fontWeight: 600 }}>{row.name}</span>
        </div>
      )
    },
    { key: 'product_count', header: 'Products', render: (row) => row.product_count ?? '—' }
  ];

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Group products for easier browsing and reporting. Categories cannot be edited or deactivated — the backend only supports create and list."
        actions={<Button icon={Plus} onClick={() => setModalOpen(true)}>New Category</Button>}
      />
      <Card padding={0}>
        <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search categories..." style={{ maxWidth: 320 }} />
        </div>
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyTitle="No categories found"
          emptyDescription="Create a category to start organizing your products."
          emptyAction={<Button icon={Plus} onClick={() => setModalOpen(true)}>New Category</Button>}
        />
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New Category"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>Create Category</Button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <Input label="Category name" required value={name} onChange={(e) => setName(e.target.value)} error={error} />
        </form>
      </Modal>
    </div>
  );
}
