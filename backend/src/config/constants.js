'use strict';

// USER ROLES
const ROLES = Object.freeze({
  SYSTEM_ADMIN: 'System Admin',
  IT_MANAGER: 'IT Manager',
  TECHNICIAN: 'Technician',
  EMPLOYEE: 'Employee',
  ASSET_MANAGER: 'Asset Manager',
});

const ROLES_LIST = Object.freeze(Object.values(ROLES));

// Roles allowed to view/manage all tickets across departments
const ELEVATED_TICKET_ROLES = Object.freeze([
  ROLES.SYSTEM_ADMIN,
  ROLES.IT_MANAGER,
]);

// Roles allowed to be assigned tickets (resolvers)
const ASSIGNABLE_ROLES = Object.freeze([
  ROLES.TECHNICIAN,
  ROLES.IT_MANAGER,
]);

// Roles allowed full asset lifecycle management
const ASSET_MANAGEMENT_ROLES = Object.freeze([
  ROLES.SYSTEM_ADMIN,
  ROLES.ASSET_MANAGER,
]);

// Roles allowed to manage users
const USER_MANAGEMENT_ROLES = Object.freeze([ROLES.SYSTEM_ADMIN]);

// Roles allowed to view audit logs
const AUDIT_VIEW_ROLES = Object.freeze([
  ROLES.SYSTEM_ADMIN,
  ROLES.IT_MANAGER,
]);

// Roles allowed to manage Knowledge Base content
const KB_MANAGEMENT_ROLES = Object.freeze([
  ROLES.SYSTEM_ADMIN,
  ROLES.IT_MANAGER,
  ROLES.TECHNICIAN,
]);

// TICKET LIFECYCLE
const TICKET_STATUS = Object.freeze({
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  ON_HOLD: 'On Hold',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REOPENED: 'Reopened',
});

const TICKET_STATUS_LIST = Object.freeze(Object.values(TICKET_STATUS));

// Valid forward/backward transitions (adjacency list)
const TICKET_STATUS_TRANSITIONS = Object.freeze({
  [TICKET_STATUS.OPEN]: [TICKET_STATUS.IN_PROGRESS, TICKET_STATUS.ON_HOLD, TICKET_STATUS.CLOSED],
  [TICKET_STATUS.IN_PROGRESS]: [TICKET_STATUS.ON_HOLD, TICKET_STATUS.RESOLVED, TICKET_STATUS.OPEN],
  [TICKET_STATUS.ON_HOLD]: [TICKET_STATUS.IN_PROGRESS, TICKET_STATUS.OPEN],
  [TICKET_STATUS.RESOLVED]: [TICKET_STATUS.CLOSED, TICKET_STATUS.REOPENED],
  [TICKET_STATUS.CLOSED]: [TICKET_STATUS.REOPENED],
  [TICKET_STATUS.REOPENED]: [TICKET_STATUS.IN_PROGRESS, TICKET_STATUS.OPEN],
});

const TICKET_PRIORITY = Object.freeze({
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
});

const TICKET_PRIORITY_LIST = Object.freeze(Object.values(TICKET_PRIORITY));

const TICKET_CATEGORY = Object.freeze({
  HARDWARE: 'Hardware',
  SOFTWARE: 'Software',
  NETWORK: 'Network',
  ACCESS_MANAGEMENT: 'Access Management',
  EMAIL: 'Email',
  SECURITY: 'Security',
  ASSET_REQUEST: 'Asset Request',
  OTHER: 'Other',
});

const TICKET_CATEGORY_LIST = Object.freeze(Object.values(TICKET_CATEGORY));

const TICKET_SOURCE = Object.freeze({
  WEB_PORTAL: 'Web Portal',
  EMAIL: 'Email',
  PHONE: 'Phone',
  AI_SUGGESTED: 'AI Suggested',
});

const TICKET_SOURCE_LIST = Object.freeze(Object.values(TICKET_SOURCE));

// SLA CONFIG
// Response/resolution targets in MINUTES, keyed by priority.
const SLA_TARGETS_MINUTES = Object.freeze({
  [TICKET_PRIORITY.CRITICAL]: { response: 15, resolution: 240 },   // 4 hrs
  [TICKET_PRIORITY.HIGH]: { response: 30, resolution: 480 },       // 8 hrs
  [TICKET_PRIORITY.MEDIUM]: { response: 120, resolution: 1440 },   // 24 hrs
  [TICKET_PRIORITY.LOW]: { response: 240, resolution: 4320 },      // 72 hrs
});

const SLA_STATUS = Object.freeze({
  WITHIN_SLA: 'Within SLA',
  AT_RISK: 'At Risk',
  BREACHED: 'Breached',
  PAUSED: 'Paused',
  MET: 'Met',
});

const SLA_STATUS_LIST = Object.freeze(Object.values(SLA_STATUS));

// Percentage of elapsed target time at which a ticket becomes "At Risk"
const SLA_AT_RISK_THRESHOLD = 0.75;

// Escalation chain: how many levels, and role each level escalates to
const ESCALATION_LEVELS = Object.freeze([
  { level: 1, escalateTo: ROLES.TECHNICIAN },
  { level: 2, escalateTo: ROLES.IT_MANAGER },
  { level: 3, escalateTo: ROLES.SYSTEM_ADMIN },
]);

// ASSET LIFECYCLE
const ASSET_STATUS = Object.freeze({
  IN_STOCK: 'In Stock',
  ASSIGNED: 'Assigned',
  UNDER_MAINTENANCE: 'Under Maintenance',
  RETIRED: 'Retired',
  LOST: 'Lost',
  DISPOSED: 'Disposed',
});

const ASSET_STATUS_LIST = Object.freeze(Object.values(ASSET_STATUS));

const ASSET_CATEGORY = Object.freeze({
  LAPTOP: 'Laptop',
  DESKTOP: 'Desktop',
  MONITOR: 'Monitor',
  MOBILE_DEVICE: 'Mobile Device',
  NETWORK_EQUIPMENT: 'Network Equipment',
  PERIPHERAL: 'Peripheral',
  SOFTWARE_LICENSE: 'Software License',
  SERVER: 'Server',
  OTHER: 'Other',
});

const ASSET_CATEGORY_LIST = Object.freeze(Object.values(ASSET_CATEGORY));

const ASSET_CONDITION = Object.freeze({
  NEW: 'New',
  GOOD: 'Good',
  FAIR: 'Fair',
  POOR: 'Poor',
  DAMAGED: 'Damaged',
});

const ASSET_CONDITION_LIST = Object.freeze(Object.values(ASSET_CONDITION));

// KNOWLEDGE BASE
const KB_STATUS = Object.freeze({
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
});

const KB_STATUS_LIST = Object.freeze(Object.values(KB_STATUS));

// NOTIFICATIONS
const NOTIFICATION_TYPE = Object.freeze({
  TICKET_ASSIGNED: 'Ticket Assigned',
  TICKET_UPDATED: 'Ticket Updated',
  TICKET_COMMENT: 'Ticket Comment',
  SLA_AT_RISK: 'SLA At Risk',
  SLA_BREACHED: 'SLA Breached',
  TICKET_ESCALATED: 'Ticket Escalated',
  ASSET_ASSIGNED: 'Asset Assigned',
  ASSET_RETURNED: 'Asset Returned',
  SYSTEM: 'System',
});

const NOTIFICATION_TYPE_LIST = Object.freeze(Object.values(NOTIFICATION_TYPE));

// AUDIT LOG
const AUDIT_ACTION = Object.freeze({
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  ASSIGN: 'ASSIGN',
  STATUS_CHANGE: 'STATUS_CHANGE',
  ESCALATE: 'ESCALATE',
  AI_CLASSIFY: 'AI_CLASSIFY',
});

const AUDIT_ACTION_LIST = Object.freeze(Object.values(AUDIT_ACTION));

const AUDIT_ENTITY = Object.freeze({
  USER: 'User',
  TICKET: 'Ticket',
  ASSET: 'Asset',
  KB_ARTICLE: 'KnowledgeBaseArticle',
  DEPARTMENT: 'Department',
  SLA_POLICY: 'SLAPolicy',
});

const AUDIT_ENTITY_LIST = Object.freeze(Object.values(AUDIT_ENTITY));

// PAGINATION / MISC
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_LIMIT = 20;
const MAX_PAGE_LIMIT = 100;

const COOKIE_NAME = 'sdp_token';

const TICKET_CODE_PREFIX = 'TCK';
const ASSET_CODE_PREFIX = 'AST';

// Regex patterns
const PATTERNS = Object.freeze({
  EMPLOYEE_EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
});

module.exports = {
  ROLES,
  ROLES_LIST,
  ELEVATED_TICKET_ROLES,
  ASSIGNABLE_ROLES,
  ASSET_MANAGEMENT_ROLES,
  USER_MANAGEMENT_ROLES,
  AUDIT_VIEW_ROLES,
  KB_MANAGEMENT_ROLES,

  TICKET_STATUS,
  TICKET_STATUS_LIST,
  TICKET_STATUS_TRANSITIONS,
  TICKET_PRIORITY,
  TICKET_PRIORITY_LIST,
  TICKET_CATEGORY,
  TICKET_CATEGORY_LIST,
  TICKET_SOURCE,
  TICKET_SOURCE_LIST,

  SLA_TARGETS_MINUTES,
  SLA_STATUS,
  SLA_STATUS_LIST,
  SLA_AT_RISK_THRESHOLD,
  ESCALATION_LEVELS,

  ASSET_STATUS,
  ASSET_STATUS_LIST,
  ASSET_CATEGORY,
  ASSET_CATEGORY_LIST,
  ASSET_CONDITION,
  ASSET_CONDITION_LIST,

  KB_STATUS,
  KB_STATUS_LIST,

  NOTIFICATION_TYPE,
  NOTIFICATION_TYPE_LIST,

  AUDIT_ACTION,
  AUDIT_ACTION_LIST,
  AUDIT_ENTITY,
  AUDIT_ENTITY_LIST,

  DEFAULT_PAGE,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,

  COOKIE_NAME,
  TICKET_CODE_PREFIX,
  ASSET_CODE_PREFIX,

  PATTERNS,
};