import { useAuthStore } from "../../store/authStore";

const Header = () => {
  const { user, logout } = useAuthStore();

  return (
    <header className="h-16 bg-surface-light dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shadow-sm z-10">
      <div className="flex items-center">
        {/* Mobile menu button could go here */}
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-sm text-right hidden sm:block">
          <p className="font-medium text-slate-900 dark:text-slate-100">{user?.fullName || 'User'}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.userRole || 'Role'}</p>
        </div>
        <button
          onClick={logout}
          className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-md"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
};

export default Header;