import { useState, useEffect } from 'react';
import { FiMusic, FiUsers, FiPlay, FiHeart, FiTrendingUp } from 'react-icons/fi';
import { songAPI } from '../api/axios';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import SongCard from '../components/SongCard';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSongs: 0,
    totalUsers: 0,
    totalPlays: 0,
    totalLikes: 0,
  });

  const [trendingSongs, setTrendingSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const songsResponse = await songAPI.getAllSongs({ page: 1, limit: 1 });
      const trendingResponse = await songAPI.getTrendingSongs(6);

      setStats({
        totalSongs: songsResponse.data.total || 0,
        totalUsers: 0,
        totalPlays: 0,
        totalLikes: 0,
      });

      setTrendingSongs(trendingResponse.data.songs || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="p-8 space-y-10 bg-black min-h-screen text-white">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Good Evening
        </h1>
        <p className="text-gray-400">
          Overview of your music platform
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Total Songs */}
        <div className="bg-[#181818] p-6 rounded-xl border border-[#282828] hover:bg-[#202020] transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-2">Total Songs</p>
              <h2 className="text-3xl font-bold">{stats.totalSongs}</h2>
            </div>
            <div className="bg-[#1DB954]/20 p-4 rounded-full">
              <FiMusic className="text-[#1DB954]" size={26} />
            </div>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-[#181818] p-6 rounded-xl border border-[#282828] hover:bg-[#202020] transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-2">Total Users</p>
              <h2 className="text-3xl font-bold">{stats.totalUsers}</h2>
            </div>
            <div className="bg-[#1DB954]/20 p-4 rounded-full">
              <FiUsers className="text-[#1DB954]" size={26} />
            </div>
          </div>
        </div>

        {/* Total Plays */}
        <div className="bg-[#181818] p-6 rounded-xl border border-[#282828] hover:bg-[#202020] transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-2">Total Plays</p>
              <h2 className="text-3xl font-bold">
                {stats.totalPlays.toLocaleString()}
              </h2>
            </div>
            <div className="bg-[#1DB954]/20 p-4 rounded-full">
              <FiPlay className="text-[#1DB954]" size={26} />
            </div>
          </div>
        </div>

        {/* Total Likes */}
        <div className="bg-[#181818] p-6 rounded-xl border border-[#282828] hover:bg-[#202020] transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-2">Total Likes</p>
              <h2 className="text-3xl font-bold">
                {stats.totalLikes.toLocaleString()}
              </h2>
            </div>
            <div className="bg-[#1DB954]/20 p-4 rounded-full">
              <FiHeart className="text-[#1DB954]" size={26} />
            </div>
          </div>
        </div>

      </div>

      {/* Trending Section */}
      <div className="bg-[#181818] rounded-xl p-6 border border-[#282828]">
        <div className="flex items-center space-x-3 mb-6">
          <FiTrendingUp className="text-[#1DB954]" size={22} />
          <h2 className="text-2xl font-bold">
            Trending Now
          </h2>
        </div>

        {trendingSongs.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <FiMusic size={48} className="mx-auto mb-4 text-gray-600" />
            <p>No trending songs yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingSongs.map((song) => (
              <SongCard
                key={song._id}
                song={song}
                showActions={false}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-[#181818] rounded-xl p-6 border border-[#282828]">
        <h3 className="text-xl font-bold mb-6">
          Quick Actions
        </h3>

        <div className="flex flex-wrap gap-4">
          <a
            href="/upload"
            className="bg-[#1DB954] text-black px-6 py-2 rounded-full font-semibold hover:bg-[#1ed760] hover:scale-105 transition"
          >
            Upload Song
          </a>

          <a
            href="/songs"
            className="bg-[#282828] text-white px-6 py-2 rounded-full hover:bg-[#333] transition"
          >
            Manage Songs
          </a>

          <a
            href="/users"
            className="bg-[#282828] text-white px-6 py-2 rounded-full hover:bg-[#333] transition"
          >
            View Users
          </a>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
