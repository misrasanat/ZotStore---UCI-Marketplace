import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { auth } from './firebase';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const user = auth.currentUser;
  const uid = user?.uid;

  // Load theme preference from Firestore
  useEffect(() => {
    const loadThemePreference = async () => {
      if (!uid) {
        setLoading(false);
        return;
      }

      try {
        const db = getFirestore();
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const themePreference = userData?.settings?.theme?.isDarkMode ?? false;
          setIsDarkMode(themePreference);
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      } finally {
        setLoading(false);
      }
    };

    loadThemePreference();
  }, [uid]);

  // Save theme preference to Firestore
  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);

    if (!uid) return;

    try {
      const db = getFirestore();
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, { 
        settings: { 
          theme: { 
            isDarkMode: newTheme 
          } 
        } 
      }, { merge: true });
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  // Theme colors
  const colors = {
    light: {
      // Background colors
      background: '#ffffff',
      surface: '#f8f9fa',
      card: '#ffffff',
      primary: '#0C2340',
      
      // Text colors
      text: '#495057',
      textSecondary: '#6c757d',
      textLight: '#ffffff',
      
      // Border and divider colors
      border: '#dee2e6',
      divider: '#bbb',
      
      // Status colors
      success: '#28a745',
      warning: '#ffc107',
      error: '#dc3545',
      info: '#17a2b8',
      
      // Interactive colors
      button: '#0C2340',
      buttonText: '#ffffff',
      input: '#ffffff',
      inputBorder: '#dee2e6',
      placeholder: '#6c757d',
      
      // Shadow
      shadow: '#000000',
      
      // Search bar
      searchBackground: '#F5F5F5',
      searchBorder: '#E0E0E0',
      
      // Card specific
      cardBackground: '#ffffff', // Fixed: was '#000000' which caused black cards in light theme
      price: '#2e8b57',
      noListings: '#888',
    },
    dark: {
      // Background colors
      background: '#121212',
      surface: '#1e1e1e',
      card: '#2d2d2d',
      primary: '#bb86fc', // Purple accent for dark theme
      
      // Text colors
      text: '#ffffff',
      textSecondary: '#b3b3b3',
      textLight: '#ffffff',
      
      // Border and divider colors
      border: '#404040',
      divider: '#333333',
      
      // Status colors
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336',
      info: '#2196f3',
      
      // Interactive colors
      button: '#bb86fc',
      buttonText: '#000000',
      input: '#2d2d2d',
      inputBorder: '#404040',
      placeholder: '#888888',
      
      // Shadow
      shadow: '#000000',
      
      // Search bar
      searchBackground: '#2d2d2d',
      searchBorder: '#404040',
      
      // Card specific
      cardBackground: '#2d2d2d',
      price: '#4caf50',
      noListings: '#888888',
    }
  };

  const currentColors = colors[isDarkMode ? 'dark' : 'light'];

  const value = {
    isDarkMode,
    toggleTheme,
    colors: currentColors,
    loading
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
