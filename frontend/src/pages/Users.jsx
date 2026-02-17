import { useState, useEffect } from 'react';
import { authAPI } from '../api/axios';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiCalendar, FiMusic } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getMe();
      setUsers([response.data.user]);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="bg-black min-h-screen text-white p-8 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Users</h1>
        <p className="text-gray-400">
          Manage registered users
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* Total Users */}
        <div className="bg-[#181818] border border-[#282828] rounded-xl p-6 hover:border-[#1DB954] transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Users</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
            <div className="bg-[#1DB954]/20 p-3 rounded-full">
              <FiUser size={22} className="text-[#1DB954]" />
            </div>
          </div>
        </div>

        {/* Active Today */}
        <div className="bg-[#181818] border border-[#282828] rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Active Today</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div className="bg-[#1DB954]/20 p-3 rounded-full">
              <FiUser size={22} className="text-[#1DB954]" />
            </div>
          </div>
        </div>

        {/* New This Week */}
        <div className="bg-[#181818] border border-[#282828] rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">New This Week</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div className="bg-[#1DB954]/20 p-3 rounded-full">
              <FiCalendar size={22} className="text-[#1DB954]" />
            </div>
          </div>
        </div>

        {/* Avg Songs/User */}
        <div className="bg-[#181818] border border-[#282828] rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Avg Songs/User</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div className="bg-[#1DB954]/20 p-3 rounded-full">
              <FiMusic size={22} className="text-[#1DB954]" />
            </div>
          </div>
        </div>

      </div>

      {/* Users Table */}
      <div className="bg-[#181818] border border-[#282828] rounded-xl overflow-hidden">

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">

            <thead className="bg-[#121212] border-b border-[#282828]">
              <tr className="text-gray-400 uppercase text-xs tracking-wider">
                <th className="px-6 py-4 text-left">User</th>
                <th className="px-6 py-4 text-left">Email</th>
                <th className="px-6 py-4 text-left">Role</th>
                <th className="px-6 py-4 text-left">Joined</th>
                <th className="px-6 py-4 text-left">Liked Songs</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#282828]">

              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <FiUser size={48} className="mx-auto mb-4 text-gray-600" />
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id || user._id}
                    className="hover:bg-[#121212] transition"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-[#1DB954]/20 flex items-center justify-center">
                          <span className="text-[#1DB954] font-semibold">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="ml-4 font-medium">
                          {user.name}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-gray-400 flex items-center">
                      <FiMail className="mr-2" />
                      {user.email}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin'
                            ? 'bg-purple-600/20 text-purple-400'
                            : 'bg-[#1DB954]/20 text-[#1DB954]'
                        }`}
                      >
                        {user.role || 'user'}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                      {user.likedSongs?.length || 0}
                    </td>
                  </tr>
                ))
              )}

            </tbody>
          </table>
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-[#1DB954]/10 border border-[#1DB954]/30 rounded-xl p-4">
        <p className="text-sm text-gray-300">
          <strong className="text-[#1DB954]">Note:</strong> User management API endpoints
          need to be added to backend for full functionality.
        </p>
      </div>

    </div>
  );
};

export default Users;
