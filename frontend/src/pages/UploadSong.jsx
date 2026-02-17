import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { songAPI } from '../api/axios';
import { toast } from 'react-toastify';
import { FiUpload, FiMusic, FiImage } from 'react-icons/fi';

const UploadSong = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    album: '',
    genre: '',
    duration: '',
    releaseYear: new Date().getFullYear(),
    danceability: 0.5,
    energy: 0.5,
    acousticness: 0.5,
    instrumentalness: 0.5,
    valence: 0.5,
    tempo: 120,
    speechiness: 0.5,
    liveness: 0.5,
    loudness: -10,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      toast.success('Audio file selected');
    } else {
      toast.error('Invalid audio file');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      toast.success('Cover image selected');
    } else {
      toast.error('Invalid image file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!audioFile) {
      toast.error('Please select an audio file');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('audio', audioFile);
      if (imageFile) data.append('image', imageFile);

      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      const response = await songAPI.uploadSong(data);

      if (response.data.success) {
        toast.success('Song uploaded successfully!');
        navigate('/songs');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black min-h-screen text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Upload New Song</h1>
        <p className="text-gray-400">
          Add a new track to your Spotify-style library
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* FILE UPLOAD SECTION */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Audio Upload */}
          <div className="bg-[#181818] border border-[#282828] rounded-xl p-6">
            <h3 className="flex items-center gap-2 mb-4 font-semibold">
              <FiMusic /> Audio File *
            </h3>

            <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#333] rounded-xl p-8 cursor-pointer hover:border-[#1DB954] transition">
              <FiUpload size={40} className="text-gray-500 mb-3" />
              <span className="text-gray-400">
                Click to upload MP3, WAV (Max 50MB)
              </span>
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioChange}
                className="hidden"
                required
              />
              {audioFile && (
                <span className="mt-3 text-[#1DB954] font-medium">
                  ✓ {audioFile.name}
                </span>
              )}
            </label>
          </div>

          {/* Cover Upload */}
          <div className="bg-[#181818] border border-[#282828] rounded-xl p-6">
            <h3 className="flex items-center gap-2 mb-4 font-semibold">
              <FiImage /> Cover Image
            </h3>

            <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#333] rounded-xl p-8 cursor-pointer hover:border-[#1DB954] transition">
              <FiUpload size={40} className="text-gray-500 mb-3" />
              <span className="text-gray-400">
                Click to upload PNG, JPG (Max 10MB)
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {imageFile && (
                <span className="mt-3 text-[#1DB954] font-medium">
                  ✓ {imageFile.name}
                </span>
              )}
            </label>
          </div>
        </div>

        {/* BASIC INFO */}
        <div className="bg-[#181818] border border-[#282828] rounded-xl p-6 space-y-6">
          <h2 className="text-xl font-semibold">Basic Information</h2>

          <div className="grid md:grid-cols-2 gap-4">

            {['title', 'artist', 'album', 'genre'].map((field) => (
              <div key={field}>
                <label className="block mb-2 text-sm text-gray-400 capitalize">
                  {field}
                </label>
                <input
                  type="text"
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  required={field === 'title' || field === 'artist' || field === 'genre'}
                  className="w-full bg-[#121212] border border-[#282828] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#1DB954] outline-none"
                />
              </div>
            ))}

            <div>
              <label className="block mb-2 text-sm text-gray-400">
                Duration (seconds)
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full bg-[#121212] border border-[#282828] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#1DB954] outline-none"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-gray-400">
                Release Year
              </label>
              <input
                type="number"
                name="releaseYear"
                value={formData.releaseYear}
                onChange={handleChange}
                className="w-full bg-[#121212] border border-[#282828] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#1DB954] outline-none"
              />
            </div>
          </div>
        </div>

        {/* AUDIO FEATURES */}
        <div className="bg-[#181818] border border-[#282828] rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-6">
            Audio Features (For ML)
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              'danceability',
              'energy',
              'valence',
              'tempo',
              'acousticness',
              'loudness'
            ].map((feature) => (
              <div key={feature}>
                <label className="block mb-2 text-sm text-gray-400 capitalize">
                  {feature}
                </label>
                <input
                  type="number"
                  name={feature}
                  value={formData[feature]}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full bg-[#121212] border border-[#282828] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#1DB954] outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#1DB954] text-black font-semibold py-3 rounded-full hover:bg-[#1ed760] transition disabled:opacity-50"
          >
            {loading ? 'Uploading...' : 'Upload Song'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/songs')}
            className="px-6 py-3 border border-[#282828] rounded-full hover:bg-[#181818] transition"
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
};

export default UploadSong;
