import { NavLink } from 'react-router-dom';
import { FiHome, FiMusic, FiUpload, FiUsers, FiSettings, FiX } from 'react-icons/fi';

const Sidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/songs', icon: FiMusic, label: 'Manage Songs' },
    { path: '/upload', icon: FiUpload, label: 'Upload Song' },
    { path: '/users', icon: FiUsers, label: 'Users' },
    { path: '/settings', icon: FiSettings, label: 'Settings' },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-black border-r border-[#282828]
          transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="lg:hidden flex justify-end p-4">
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <FiX size={24} />
          </button>
        </div>

        <nav className="px-4 py-6">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                      isActive
                        ? 'bg-[#1DB954] text-black font-semibold'
                        : 'text-gray-400 hover:text-white hover:bg-[#181818]'
                    }`
                  }
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-[#282828]">
          <p className="text-xs text-gray-500 text-center">
            © 2024 Music Player
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
