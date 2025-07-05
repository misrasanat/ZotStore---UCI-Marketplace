import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, onAuthStateChanged } from './firebase';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import LoadingScreen from './LoadingScreen';

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if user has a complete profile in Firestore
        try {
          const db = getFirestore();
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (userDoc.exists()) {
            setUser(user);
            setUserProfile(userDoc.data());
          } else {
            // User exists but no profile - they need to complete signup
            setUser(null);
            setUserProfile(null);
          }
        } catch (error) {
          console.error('Error checking user profile:', error);
          setUser(null);
          setUserProfile(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    user,
    userProfile,
    loading,
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 