import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Ticket, Boxes, BookOpen, Users, ScrollText, Building2, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ROLES, APP_NAME } from '../../utils/constants';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: null },
  { to: '/tickets', label: 'Tickets', icon: Ticket, roles: null },
  { to: '/assets', label: 'Assets', icon: Boxes, roles: [ROLES.SYSTEM_ADMIN, ROLES.ASSET_MANAGER, ROLES.IT_MANAGER, ROLES.TECHNICIAN] },
  { to: '/knowledge-base', label: 'Knowledge Base', icon: BookOpen, roles: null },
  { to: '/users', label: 'Users', icon: Users, roles: [ROLES.SYSTEM_ADMIN, ROLES.IT_MANAGER] },
  { to: '/departments', label: 'Departments', icon: Building2, roles: [ROLES.SYSTEM_ADMIN] },
  { to: '/audit-logs', label: 'Audit Logs', icon: ScrollText, roles: [ROLES.SYSTEM_ADMIN, ROLES.IT_MANAGER] },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const visibleItems = navItems.filter((item) => !item.roles || item.roles.includes(user?.role));

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={onClose} />}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-200 dark:border-gray-700 md:hidden">
          <span className="font-bold text-primary-700 dark:text-primary-400">{APP_NAME}</span>
          <button onClick={onClose} className="dark:text-gray-300"><X size={20} /></button>
        </div>
        <nav className="p-3 space-y-1">
          {visibleItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;