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
            const userData = userDoc.data();
            console.log('User profile data:', userData); // Debug log
            
            // First check if email is verified
            if (!user.emailVerified) {
              console.log('Email not verified - user cannot access app');
              setUser(null);
              setUserProfile(null);
              return;
            }
          
            // Then check if user has essential fields (name and phone)
            if (userData.name && userData.phone) {
              console.log('Profile complete and email verified, setting user as authenticated');
              setUser(user);
              setUserProfile(userData);
            } else {
              console.log('Profile incomplete - missing name or phone');
              setUser(null);
              setUserProfile(null);
            }
          } else {
            console.log('No profile document found for user');
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

  const refreshAuthState = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('Refreshed user profile data:', userData);
          
          // First check if email is verified
          if (!currentUser.emailVerified) {
            console.log('Email not verified after refresh - user cannot access app');
            setUser(null);
            setUserProfile(null);
            return;
          }
          
          // Then check if user has essential fields (name and phone)
          if (userData.name && userData.phone) {
            console.log('Profile complete and email verified after refresh, setting user as authenticated');
            setUser(currentUser);
            setUserProfile(userData);
          } else {
            console.log('Profile incomplete after refresh - missing name or phone');
            setUser(null);
            setUserProfile(null);
          }
        } else {
          console.log('No profile document found after refresh');
          setUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Error refreshing auth state:', error);
        setUser(null);
        setUserProfile(null);
      }
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    refreshAuthState,
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