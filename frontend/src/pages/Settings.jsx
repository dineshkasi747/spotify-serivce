import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiUser, FiLock, FiSave, FiTrash2 } from 'react-icons/fi';

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await updateProfile(profileData);

    if (result.success) {
      toast.success('Profile updated successfully!');
    } else {
      toast.error('Something went wrong');
    }

    setLoading(false);
  };

  return (
    <div className="flex-1 min-h-screen bg-black text-white p-8 space-y-10">
      
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Settings</h1>
        <p className="text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Settings */}
      <div className="bg-[#121212] rounded-2xl p-8 shadow-lg border border-gray-800">
        <div className="flex items-center gap-3 mb-8">
          <FiUser className="text-green-500" size={22} />
          <h2 className="text-2xl font-semibold">Profile Settings</h2>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-6 max-w-2xl">
          
          {/* Name */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={profileData.name}
              onChange={handleProfileChange}
              className="w-full px-4 py-3 bg-[#1e1e1e] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Email
            </label>
            <input
              type="email"
              value={profileData.email}
              disabled
              className="w-full px-4 py-3 bg-[#1e1e1e] border border-gray-700 rounded-lg opacity-70 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Email cannot be changed
            </p>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Role
            </label>
            <input
              type="text"
              value={user?.role || 'user'}
              disabled
              className="w-full px-4 py-3 bg-[#1e1e1e] border border-gray-700 rounded-lg capitalize opacity-70"
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-full transition disabled:opacity-50"
          >
            <FiSave />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Password Section */}
      <div className="bg-[#121212] rounded-2xl p-8 shadow-lg border border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <FiLock className="text-green-500" size={22} />
          <h2 className="text-2xl font-semibold">Password</h2>
        </div>

        <div className="bg-[#1e1e1e] p-5 rounded-lg border border-gray-700">
          <p className="text-gray-400">
            Password change functionality will be added in a future update.
            For now, you can reset your password from the login page.
          </p>
        </div>
      </div>

      {/* Application Info */}
      <div className="bg-[#121212] rounded-2xl p-8 shadow-lg border border-gray-800">
        <h2 className="text-2xl font-semibold mb-8">
          Application Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-[#1e1e1e] p-5 rounded-lg border border-gray-700">
            <p className="text-sm text-gray-400 mb-1">Backend API</p>
            <p className="font-mono text-green-400">
              {import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}
            </p>
          </div>

          <div className="bg-[#1e1e1e] p-5 rounded-lg border border-gray-700">
            <p className="text-sm text-gray-400 mb-1">ML Service</p>
            <p className="font-mono text-green-400">
              {import.meta.env.VITE_ML_SERVICE_URL || 'http://localhost:8000'}
            </p>
          </div>

          <div className="bg-[#1e1e1e] p-5 rounded-lg border border-gray-700">
            <p className="text-sm text-gray-400 mb-1">Version</p>
            <p className="text-white font-semibold">v1.0.0</p>
          </div>

          <div className="bg-[#1e1e1e] p-5 rounded-lg border border-gray-700">
            <p className="text-sm text-gray-400 mb-1">Environment</p>
            <p className="text-white font-semibold capitalize">
              {import.meta.env.MODE}
            </p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-[#121212] rounded-2xl p-8 shadow-lg border border-red-700">
        <h2 className="text-2xl font-semibold text-red-500 mb-6">
          Danger Zone
        </h2>

        <div className="space-y-5 max-w-2xl">

          <div className="flex items-center justify-between bg-[#1e1e1e] p-5 rounded-lg border border-gray-700">
            <div>
              <h3 className="font-semibold">Clear Cache</h3>
              <p className="text-sm text-gray-400">
                Clear application cache and local storage
              </p>
            </div>
            <button
              onClick={() => {
                localStorage.clear();
                toast.info('Cache cleared');
              }}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 rounded-full text-white transition"
            >
              Clear
            </button>
          </div>

          <div className="flex items-center justify-between bg-[#1e1e1e] p-5 rounded-lg border border-gray-700">
            <div>
              <h3 className="font-semibold">Delete Account</h3>
              <p className="text-sm text-gray-400">
                Permanently delete your account and all data
              </p>
            </div>
            <button
              onClick={() => toast.error('This feature is disabled')}
              className="flex items-center gap-2 px-5 py-2 bg-red-700 hover:bg-red-800 rounded-full text-white transition"
            >
              <FiTrash2 size={16} />
              Delete
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Settings;
