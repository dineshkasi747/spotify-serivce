import { FiPlay, FiHeart, FiTrash2, FiEdit } from 'react-icons/fi';

const SongCard = ({ song, onPlay, onEdit, onDelete, showActions = true }) => {
  return (
    <div className="bg-[#181818] rounded-xl overflow-hidden hover:bg-[#202020] transition-all duration-300 border border-[#282828]">

      {/* Cover */}
      <div className="relative aspect-square group">
        <img
          src={song.imageUrl || 'https://via.placeholder.com/300?text=No+Image'}
          alt={song.title}
          className="w-full h-full object-cover"
        />

        {onPlay && (
          <button
            onClick={() => onPlay(song)}
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition"
          >
            <div className="bg-[#1DB954] p-4 rounded-full shadow-lg hover:scale-110 transition">
              <FiPlay size={24} className="text-black" />
            </div>
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-white truncate">
          {song.title}
        </h3>
        <p className="text-sm text-gray-400 truncate">
          {song.artist}
        </p>

        {song.genre && (
          <span className="inline-block mt-2 px-3 py-1 bg-[#282828] text-gray-300 text-xs rounded-full">
            {song.genre}
          </span>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
          <div className="flex items-center space-x-1">
            <FiPlay size={14} />
            <span>{song.playCount || 0}</span>
          </div>
          <div className="flex items-center space-x-1">
            <FiHeart size={14} />
            <span>{song.likeCount || 0}</span>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex space-x-2 mt-4">
            {onEdit && (
              <button
                onClick={() => onEdit(song)}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-[#282828] text-white rounded-md hover:bg-[#333] transition text-sm"
              >
                <FiEdit size={16} />
                <span>Edit</span>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(song)}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-[#282828] text-white rounded-md hover:bg-red-600 transition text-sm"
              >
                <FiTrash2 size={16} />
                <span>Delete</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SongCard;
