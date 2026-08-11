import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await API.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            setProfile(res.data.profile);
          } else {
            logout();
          }
        } catch (error) {
          console.error('Failed to load user session:', error);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        // Load full user details immediately after login
        const meRes = await API.get('/auth/me');
        if (meRes.data.success) {
          setUser(meRes.data.user);
          setProfile(meRes.data.profile);
        }
        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check credentials.'
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/register', userData);
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        const meRes = await API.get('/auth/me');
        if (meRes.data.success) {
          setUser(meRes.data.user);
          setProfile(meRes.data.profile);
        }
        return { success: true };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed.'
      };
    } finally {
      setLoading(false);
    }
  };

  const onboard = async (onboardingData) => {
    setLoading(true);
    try {
      const res = await API.put('/auth/onboard', onboardingData);
      if (res.data.success) {
        setProfile(res.data.profile);
        // Refresh User to update status if necessary
        const meRes = await API.get('/auth/me');
        if (meRes.data.success) {
          setUser(meRes.data.user);
        }
        return { success: true };
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Onboarding update failed.'
      };
    } finally {
      setLoading(false);
    }
  };

  const update = async (updateData) => {
    try {
      const res = await API.put('/auth/update', updateData);
      if (res.data.success) {
        setUser(res.data.user);
        setProfile(res.data.profile);
        return { success: true };
      }
    } catch (error) {
      console.error('Update error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Profile update failed.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, onboard, update, logout, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
