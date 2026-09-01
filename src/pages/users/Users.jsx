import { Users as UsersIcon } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';

export default function Users() {
  return (
    <div>
      <PageHeader title="Users" description="Manage who has access to this organization." />
      <Card>
        <EmptyState
          icon={UsersIcon}
          title="No user management API yet"
          description={
            <>
              The backend has a <code>users</code> table (with <code>organization_id</code>, <code>name</code>,{' '}
              <code>email</code>, <code>role</code>, <code>is_active</code>) but no endpoint to create, list, update,
              or deactivate users — <code>api/auth.js</code> is empty and unmounted. Until that's added, user
              records have to be created directly in the database, and each person's session on this app is set
              manually from the Login screen using their existing <code>users.id</code>.
            </>
          }
        />
      </Card>
    </div>
  );
}
