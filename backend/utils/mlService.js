import axios from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Get song recommendations based on song ID
export const getRecommendations = async (songId, limit = 10) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/recommend`, {
      song_id: songId,
      limit: limit,
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('ML Service Error:', error.message);
    return {
      success: false,
      error: error.response?.data?.detail || 'Failed to get recommendations',
    };
  }
};

// Get personalized recommendations for a user
export const getPersonalizedRecommendations = async (userId, limit = 10) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/recommend/personalized`, {
      user_id: userId,
      limit: limit,
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('ML Service Error:', error.message);
    return {
      success: false,
      error: error.response?.data?.detail || 'Failed to get personalized recommendations',
    };
  }
};

// Get similar songs based on audio features
export const getSimilarSongs = async (features, limit = 10) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/recommend/similar`, {
      features: features,
      limit: limit,
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('ML Service Error:', error.message);
    return {
      success: false,
      error: error.response?.data?.detail || 'Failed to get similar songs',
    };
  }
};

// Train or retrain the model
export const trainModel = async () => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/train`);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('ML Service Error:', error.message);
    return {
      success: false,
      error: error.response?.data?.detail || 'Failed to train model',
    };
  }
};

// Check ML service health
export const checkMLServiceHealth = async () => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/health`);
    return {
      success: true,
      status: response.data,
    };
  } catch (error) {
    console.error('ML Service is down:', error.message);
    return {
      success: false,
      error: 'ML Service is unavailable',
    };
  }
};

export default {
  getRecommendations,
  getPersonalizedRecommendations,
  getSimilarSongs,
  trainModel,
  checkMLServiceHealth,
};