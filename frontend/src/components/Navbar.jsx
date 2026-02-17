import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiUser, FiMenu } from 'react-icons/fi';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-black border-b border-[#282828] px-6 py-4 flex items-center justify-between sticky top-0 z-40">

      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden text-gray-400 hover:text-white"
        >
          <FiMenu size={24} />
        </button>

        <h1 className="text-xl font-bold text-white">
          Music Admin
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-gray-300">
          <FiUser />
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 bg-[#1DB954] text-black rounded-full font-medium hover:bg-[#1ed760] transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
