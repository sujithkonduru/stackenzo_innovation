import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleProtectedRoute from './RoleProtectedRoute';
import AppLayout from '../components/layout/AppLayout';

import Login from '../pages/auth/Login';
import Dashboard from '../pages/dashboard/Dashboard';

import Organization from '../pages/organization/Organization';

import Locations from '../pages/locations/Locations';

import Categories from '../pages/categories/Categories';

import Products from '../pages/products/Products';
import ProductForm from '../pages/products/ProductForm';
import ProductDetails from '../pages/products/ProductDetails';

import Batches from '../pages/batches/Batches';

import Inventory from '../pages/inventory/Inventory';
import StockMovements from '../pages/stockmovements/StockMovements';

import Suppliers from '../pages/suppliers/Suppliers';
import SupplierDetails from '../pages/suppliers/SupplierDetails';

import Purchases from '../pages/purchases/Purchases';
import PurchaseCreate from '../pages/purchases/PurchaseCreate';

import POS from '../pages/sales/POS';
import Sales from '../pages/sales/Sales';
import SaleDetails from '../pages/sales/SaleDetails';

import Requests from '../pages/requests/Requests';
import RequestCreate from '../pages/requests/RequestCreate';
import RequestDetails from '../pages/requests/RequestDetails';

import Returns from '../pages/returns/Returns';
import ReturnCreate from '../pages/returns/ReturnCreate';

import Users from '../pages/users/Users';

import Reports from '../pages/reports/Reports';
import InventoryReport from '../pages/reports/InventoryReport';
import LowStockReport from '../pages/reports/LowStockReport';
import ExpiryReport from '../pages/reports/ExpiryReport';
import UnavailableReport from '../pages/reports/UnavailableReport';

import Settings from '../pages/settings/Settings';

import NotFound from '../pages/errors/NotFound';
import Unauthorized from '../pages/errors/Unauthorized';

import { USER_ROLES } from '../utils/constants';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/organization" element={<Organization />} />

          <Route path="/locations" element={<Locations />} />

          <Route path="/categories" element={<Categories />} />

          <Route path="/products" element={<Products />} />
          <Route path="/products/create" element={<ProductForm />} />
          <Route path="/products/edit/:id" element={<ProductForm />} />
          <Route path="/products/:id" element={<ProductDetails />} />

          <Route path="/batches" element={<Batches />} />

          <Route path="/inventory" element={<Inventory />} />
          <Route path="/stock-movements" element={<StockMovements />} />

          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/suppliers/:id" element={<SupplierDetails />} />

          <Route path="/purchases" element={<Purchases />} />
          <Route path="/purchases/create" element={<PurchaseCreate />} />

          <Route path="/pos" element={<POS />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/sales/:id" element={<SaleDetails />} />

          <Route path="/requests" element={<Requests />} />
          <Route path="/requests/create" element={<RequestCreate />} />
          <Route path="/requests/:id" element={<RequestDetails />} />

          <Route path="/returns" element={<Returns />} />
          <Route path="/returns/create" element={<ReturnCreate />} />

          <Route element={<RoleProtectedRoute allowedRoles={[USER_ROLES.ADMIN]} />}>
            <Route path="/users" element={<Users />} />
          </Route>

          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/inventory" element={<InventoryReport />} />
          <Route path="/reports/low-stock" element={<LowStockReport />} />
          <Route path="/reports/expiry" element={<ExpiryReport />} />
          <Route path="/reports/purchases" element={<UnavailableReport title="Purchase Reports" />} />
          <Route path="/reports/sales" element={<UnavailableReport title="Sales Reports" />} />
          <Route path="/reports/stock-movements" element={<UnavailableReport title="Stock Movement Reports" />} />

          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
