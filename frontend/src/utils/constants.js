export const ROLES = {
  SYSTEM_ADMIN: 'System Admin',
  IT_MANAGER: 'IT Manager',
  TECHNICIAN: 'Technician',
  EMPLOYEE: 'Employee',
  ASSET_MANAGER: 'Asset Manager',
};

export const ROLES_LIST = Object.values(ROLES);

export const TICKET_STATUS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  ON_HOLD: 'On Hold',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REOPENED: 'Reopened',
};

export const TICKET_STATUS_LIST = Object.values(TICKET_STATUS);

export const TICKET_PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export const TICKET_PRIORITY_LIST = Object.values(TICKET_PRIORITY);

export const TICKET_CATEGORY_LIST = [
  'Hardware',
  'Software',
  'Network',
  'Access Management',
  'Email',
  'Security',
  'Asset Request',
  'Other',
];

export const SLA_STATUS = {
  WITHIN_SLA: 'Within SLA',
  AT_RISK: 'At Risk',
  BREACHED: 'Breached',
  PAUSED: 'Paused',
  MET: 'Met',
};

export const ASSET_STATUS = {
  IN_STOCK: 'In Stock',
  ASSIGNED: 'Assigned',
  UNDER_MAINTENANCE: 'Under Maintenance',
  RETIRED: 'Retired',
  LOST: 'Lost',
  DISPOSED: 'Disposed',
};

export const ASSET_STATUS_LIST = Object.values(ASSET_STATUS);

export const ASSET_CATEGORY_LIST = [
  'Laptop',
  'Desktop',
  'Monitor',
  'Mobile Device',
  'Network Equipment',
  'Peripheral',
  'Software License',
  'Server',
  'Other',
];

export const ASSET_CONDITION_LIST = ['New', 'Good', 'Fair', 'Poor', 'Damaged'];

export const KB_STATUS = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
};

export const KB_STATUS_LIST = Object.values(KB_STATUS);

export const PRIORITY_COLORS = {
  Low: 'bg-gray-100 text-gray-700',
  Medium: 'bg-blue-100 text-blue-700',
  High: 'bg-orange-100 text-orange-700',
  Critical: 'bg-red-100 text-red-700',
};

export const STATUS_COLORS = {
  Open: 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-yellow-100 text-yellow-700',
  'On Hold': 'bg-gray-100 text-gray-700',
  Resolved: 'bg-green-100 text-green-700',
  Closed: 'bg-gray-200 text-gray-600',
  Reopened: 'bg-purple-100 text-purple-700',
};

export const SLA_COLORS = {
  'Within SLA': 'bg-green-100 text-green-700',
  'At Risk': 'bg-amber-100 text-amber-700',
  Breached: 'bg-red-100 text-red-700',
  Paused: 'bg-gray-100 text-gray-700',
  Met: 'bg-green-100 text-green-700',
};

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'ServiceDesk Pro';