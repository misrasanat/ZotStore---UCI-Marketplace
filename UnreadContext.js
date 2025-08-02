import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, query, where, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const UnreadContext = createContext();

export const useUnread = (enableRealTime = true) => {
  const context = useContext(UnreadContext);
  if (!context) {
    throw new Error('useUnread must be used within an UnreadProvider');
  }
  return context;
};

export const UnreadProvider = ({ children }) => {
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', currentUser.uid));

    const unsubscribe = onSnapshot(q, async (chatDocs) => {
      let foundUnread = false;
      for (const docSnap of chatDocs.docs) {
        const data = docSnap.data() || {};
        const participants = Array.isArray(data.participants) ? data.participants : [];
        let otherUserId = participants.find(uid => uid !== currentUser.uid);
        if (!otherUserId && participants.length === 1 && participants[0] === currentUser.uid) {
          otherUserId = currentUser.uid;
        }
        if (!otherUserId) continue;
        
        const unreadCount = data.unreadCount?.[currentUser.uid] || 0;
        
        if (unreadCount > 0) {
          foundUnread = true;
          break;
        }
      }
      
      setHasUnread(foundUnread);
    }, (error) => {
      console.error('UnreadContext: Real-time listener error:', error);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UnreadContext.Provider value={{ hasUnread }}>
      {children}
    </UnreadContext.Provider>
  );
};