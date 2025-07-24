import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, query, where, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const UnreadContext = createContext();

export const useUnread = () => useContext(UnreadContext);

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
        const unreadCount = data.unreadCount?.[currentUser.uid] || 0;
        if (unreadCount > 0) {
          foundUnread = true;
          break;
        }
      }
      setHasUnread(foundUnread);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UnreadContext.Provider value={{ hasUnread }}>
      {children}
    </UnreadContext.Provider>
  );
};