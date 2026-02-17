import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMusic, FiMail, FiLock } from 'react-icons/fi';

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate('/dashboard');
    }

    setLoading(false);
  };

return (
  <div className="min-h-screen bg-black flex items-center justify-center px-4">
    <div className="w-full max-w-md">

      {/* Spotify Logo Style */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1DB954] rounded-full mb-6">
          <FiMusic size={32} className="text-black" />
        </div>

        <h1 className="text-3xl font-bold text-white">
          Log in to Music Player
        </h1>
      </div>

      {/* Login Card */}
      <div className="bg-[#121212] p-8 rounded-2xl shadow-2xl border border-[#282828]">

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Email address
            </label>

            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="admin@example.com"
                className="w-full bg-[#181818] text-white pl-12 pr-4 py-3 rounded-md border border-[#282828] focus:border-[#1DB954] focus:ring-0 outline-none transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Password
            </label>

            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full bg-[#181818] text-white pl-12 pr-4 py-3 rounded-md border border-[#282828] focus:border-[#1DB954] focus:ring-0 outline-none transition"
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1DB954] text-black py-3 rounded-full font-semibold hover:scale-105 hover:bg-[#1ed760] transition-all duration-300"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>

        </form>

      </div>

      {/* Footer */}
      <p className="text-center text-gray-500 text-sm mt-8">
        © 2024 Music Player
      </p>

    </div>
  </div>
);

};

export default Login;