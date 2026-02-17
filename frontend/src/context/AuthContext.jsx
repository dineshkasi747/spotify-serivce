import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/axios';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        // Save to state and localStorage
        setToken(token);
        setUser(user);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        toast.success('Login successful!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Register function
  const register = async (name, email, password) => {
    try {
      const response = await authAPI.register(name, email, password);
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        setToken(token);
        setUser(user);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        toast.success('Registration successful!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.info('Logged out successfully');
  };

  // Update user profile
  const updateProfile = async (data) => {
    try {
      const response = await authAPI.updateProfile(data);
      
      if (response.data.success) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        toast.success('Profile updated successfully!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Check if user is admin
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};