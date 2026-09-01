import {
  LayoutDashboard,
  Boxes,
  Package,
  Tags,
  Layers,
  ArrowLeftRight,
  MapPin,
  Truck,
  ShoppingCart,
  Receipt,
  History,
  ClipboardList,
  Undo2,
  Building2,
  Users,
  FileBarChart,
  Settings
} from 'lucide-react';

export const NAV_SECTIONS = [
  {
    label: 'Dashboard',
    items: [{ label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard }]
  },
  {
    label: 'Inventory',
    items: [
      { label: 'Inventory', to: '/inventory', icon: Boxes },
      { label: 'Products', to: '/products', icon: Package },
      { label: 'Categories', to: '/categories', icon: Tags },
      { label: 'Product Batches', to: '/batches', icon: Layers },
      { label: 'Stock Movements', to: '/stock-movements', icon: ArrowLeftRight },
      { label: 'Locations', to: '/locations', icon: MapPin }
    ]
  },
  {
    label: 'Procurement',
    items: [
      { label: 'Suppliers', to: '/suppliers', icon: Truck },
      { label: 'Purchases', to: '/purchases', icon: ShoppingCart }
    ]
  },
  {
    label: 'Sales',
    items: [
      { label: 'POS / Sales', to: '/pos', icon: Receipt },
      { label: 'Sales History', to: '/sales', icon: History }
    ]
  },
  {
    label: 'Material Management',
    items: [
      { label: 'Material Requests', to: '/requests', icon: ClipboardList },
      { label: 'Material Returns', to: '/returns', icon: Undo2 }
    ]
  },
  {
    label: 'Organization',
    items: [
      { label: 'Organization', to: '/organization', icon: Building2 },
      { label: 'Users', to: '/users', icon: Users, roles: ['ADMIN'] }
    ]
  },
  {
    label: 'Reports',
    items: [{ label: 'Reports', to: '/reports', icon: FileBarChart }]
  },
  {
    label: 'Settings',
    items: [{ label: 'Settings', to: '/settings', icon: Settings }]
  }
];
