import { FiEdit, FiTrash2, FiMusic } from 'react-icons/fi';

const SongTable = ({ songs, onEdit, onDelete, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12 text-gray-400">
        Loading...
      </div>
    );
  }

  if (!songs || songs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FiMusic size={48} className="mx-auto mb-4 text-gray-600" />
        <p>No songs found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-[#181818] rounded-xl border border-[#282828]">
      <table className="min-w-full text-sm text-left text-gray-400">
        <thead className="bg-[#202020] text-gray-300 uppercase text-xs">
          <tr>
            <th className="px-6 py-4">Cover</th>
            <th className="px-6 py-4">Title</th>
            <th className="px-6 py-4">Artist</th>
            <th className="px-6 py-4">Genre</th>
            <th className="px-6 py-4">Plays</th>
            <th className="px-6 py-4">Likes</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-[#282828]">
          {songs.map((song) => (
            <tr key={song._id} className="hover:bg-[#202020] transition">
              <td className="px-6 py-4">
                <img
                  src={song.imageUrl || 'https://via.placeholder.com/50?text=No+Image'}
                  alt={song.title}
                  className="w-12 h-12 rounded object-cover"
                />
              </td>
              <td className="px-6 py-4 text-white font-medium">
                {song.title}
              </td>
              <td className="px-6 py-4">{song.artist}</td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 text-xs bg-[#282828] rounded-full">
                  {song.genre}
                </span>
              </td>
              <td className="px-6 py-4">{song.playCount || 0}</td>
              <td className="px-6 py-4">{song.likeCount || 0}</td>
              <td className="px-6 py-4 text-right space-x-3">
                {onEdit && (
                  <button
                    onClick={() => onEdit(song)}
                    className="text-gray-400 hover:text-[#1DB954]"
                  >
                    <FiEdit size={18} />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(song)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <FiTrash2 size={18} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SongTable;
