import { Bell, Sun, Moon, LogOut, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useContext, useState } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { APP_NAME } from '../../utils/constants';
import NotificationDropdown from './NotificationDropdown';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="md:hidden text-gray-500 dark:text-gray-400">
          <Menu size={22} />
        </button>
        <h1 className="text-lg font-bold text-primary-700 dark:text-primary-400">{APP_NAME}</h1>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={toggleTheme} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div className="relative">
          <button onClick={() => setNotifOpen((p) => !p)} className="relative text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <Bell size={18} />
          </button>
          {notifOpen && <NotificationDropdown onClose={() => setNotifOpen(false)} />}
        </div>

        <Link to="/profile" className="flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-gray-700 hover:opacity-80">
          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 text-sm font-semibold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="hidden sm:block text-sm">
            <p className="font-medium text-gray-800 dark:text-gray-100 leading-tight">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">{user?.role}</p>
          </div>
        </Link>
        <button onClick={logout} className="ml-2 text-gray-400 hover:text-red-500" title="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;