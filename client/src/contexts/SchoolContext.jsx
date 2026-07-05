import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const SchoolContext = createContext();

export const useSchool = () => useContext(SchoolContext);

export const SchoolProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth(); // Only fetch if authenticated

  const fetchSettings = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      const res = await api.get('/settings');
      if (res.data?.data?.settings) {
        setSettings(res.data.data.settings);
      }
    } catch (error) {
      console.error("Failed to fetch school settings", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  const updateSettings = async (newSettings) => {
    try {
      const res = await api.put('/settings', newSettings);
      if (res.data?.data?.settings) {
        setSettings(res.data.data.settings);
        return true;
      }
    } catch (error) {
      throw error;
    }
    return false;
  };

  return (
    <SchoolContext.Provider value={{ settings, isLoading, fetchSettings, updateSettings }}>
      {children}
    </SchoolContext.Provider>
  );
};
