import { useState, useEffect } from 'react';
import { songAPI } from '../api/axios';
import { toast } from 'react-toastify';
import SongTable from '../components/SongTable';
import { FiSearch, FiFilter } from 'react-icons/fi';

const ManageSongs = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedGenre, setSelectedGenre] = useState('');

  useEffect(() => {
    fetchSongs();
  }, [currentPage, selectedGenre]);

  const fetchSongs = async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        limit: 20,
      };

      if (selectedGenre) {
        params.genre = selectedGenre;
      }

      const response = await songAPI.getAllSongs(params);

      if (response.data.success) {
        setSongs(response.data.songs);
        setTotalPages(response.data.pages);
      }
    } catch (error) {
      console.error('Error fetching songs:', error);
      toast.error('Failed to load songs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      fetchSongs();
      return;
    }

    try {
      setLoading(true);
      const response = await songAPI.searchSongs(searchQuery);

      if (response.data.success) {
        setSongs(response.data.songs);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error searching songs:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (song) => {
    toast.info(`Edit functionality for "${song.title}" coming soon!`);
  };

  const handleDelete = async (song) => {
    if (!window.confirm(`Delete "${song.title}"?`)) return;

    try {
      const response = await songAPI.deleteSong(song._id);

      if (response.data.success) {
        toast.success('Song deleted');
        fetchSongs();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="p-8 space-y-8 bg-black min-h-screen text-white">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Manage Songs
        </h1>
        <p className="text-gray-400">
          View, search and manage your music library
        </p>
      </div>

      {/* Search + Filters */}
      <div className="bg-[#181818] border border-[#282828] rounded-xl p-6">
        <div className="flex flex-col lg:flex-row gap-4">

          {/* Search Input */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search songs..."
                className="w-full bg-[#121212] border border-[#282828] rounded-full pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
              />
            </div>
          </form>

          {/* Genre Filter */}
          <div className="flex items-center gap-3">
            <FiFilter className="text-gray-500" />

            <select
              value={selectedGenre}
              onChange={handleGenreChange}
              className="bg-[#121212] border border-[#282828] rounded-full px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
            >
              <option value="">All Genres</option>
              <option value="Pop">Pop</option>
              <option value="Rock">Rock</option>
              <option value="Hip-Hop">Hip-Hop</option>
              <option value="Electronic">Electronic</option>
              <option value="Jazz">Jazz</option>
              <option value="Classical">Classical</option>
              <option value="edm">EDM</option>
              <option value="acoustic">Acoustic</option>
            </select>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="bg-[#1DB954] text-black px-6 py-3 rounded-full font-semibold hover:bg-[#1ed760] transition"
          >
            Search
          </button>
        </div>
      </div>

      {/* Songs Table */}
      <SongTable
        songs={songs}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 pt-4">

          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-[#181818] border border-[#282828] rounded-full hover:bg-[#202020] disabled:opacity-40"
          >
            Previous
          </button>

          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;

              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-full transition ${
                      currentPage === page
                        ? 'bg-[#1DB954] text-black font-semibold'
                        : 'bg-[#181818] border border-[#282828] hover:bg-[#202020]'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (
                page === currentPage - 2 ||
                page === currentPage + 2
              ) {
                return (
                  <span key={page} className="px-2 text-gray-500">
                    ...
                  </span>
                );
              }

              return null;
            })}
          </div>

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-[#181818] border border-[#282828] rounded-full hover:bg-[#202020] disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* Footer Info */}
      <div className="text-center text-gray-500 pt-4">
        Showing page {currentPage} of {totalPages}
      </div>

    </div>
  );
};

export default ManageSongs;
