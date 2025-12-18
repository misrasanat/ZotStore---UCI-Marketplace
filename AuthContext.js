import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, onAuthStateChanged } from './firebase';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import LoadingScreen from './LoadingScreen';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  const isTestAccount = (email) => {
    return email?.toLowerCase() === 'testersm@uci.edu';
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const db = getFirestore();
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('User profile data:', userData);
            
            // Check if email is UCI or non-UCI
            const isUCIEmail = user.email?.toLowerCase().endsWith('@uci.edu');
            const skipVerification = !isUCIEmail || isTestAccount(user.email);
            console.log('Skip verification:', skipVerification, 'for email:', user.email);
            
            if (isUCIEmail && !user.emailVerified && !skipVerification) {
              console.log('UCI Email not verified - user cannot access app');
              setUser(null);
              setUserProfile(null);
              setLoading(false);
              return;
            }
          
            // Then check if user has essential fields (name only)
            if (userData.name) {
              console.log('Profile complete, setting user as authenticated');
              setUser(user);
              setUserProfile(userData);
            } else {
              console.log('Profile incomplete - missing name');
              setUser(null);
              setUserProfile(null);
            }
          } else {
            console.log('No profile document found for user');
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
          
          // Skip email verification for test account
          const skipVerification = isTestAccount(currentUser.email);
          console.log('Skip verification:', skipVerification, 'for email:', currentUser.email);
          
          if (!currentUser.emailVerified && !skipVerification) {
            console.log('Email not verified after refresh - user cannot access app');
            setUser(null);
            setUserProfile(null);
            return;
          }
          
          if (userData.name) {
            console.log('Profile complete, setting user as authenticated');
            setUser(currentUser);
            setUserProfile(userData);
          } else {
            console.log('Profile incomplete - missing name');
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

  const setGuestMode = () => {
    console.log('Setting guest mode');
    setIsGuest(true);
    setUser({ uid: 'guest', email: 'guest@zotstore.com' });
    setUserProfile({ 
      name: 'Guest User', 
      email: 'guest@zotstore.com', 
      uid: 'guest',
      isGuest: true 
    });
    setLoading(false);
  };

  const exitGuestMode = () => {
    console.log('Exiting guest mode');
    setIsGuest(false);
    setUser(null);
    setUserProfile(null);
    setLoading(false);
  };

  const createUserWithProfile = async (userData, profileData) => {
    try {
      // ...existing user creation logic...
      
      // Ensure terms acceptance is recorded
      const userDataWithTerms = {
        ...userData,
        termsAcceptedAt: userData.termsAcceptedAt || new Date().toISOString(),
      };

      const profileDataWithTerms = {
        ...profileData,
        termsAcceptedAt: profileData.termsAcceptedAt || new Date().toISOString(),
      };

      // ...rest of existing user creation logic...
    } catch (error) {
      // ...existing error handling...
    }
  };

  const value = {
    user,
    userProfile,
    isGuest,
    loading,
    refreshAuthState,
    setGuestMode,
    exitGuestMode,
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