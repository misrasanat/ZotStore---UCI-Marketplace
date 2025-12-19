import { auth } from '../firebase';
import { getFirestore, doc, deleteDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { reauthenticateWithCredential, EmailAuthProvider, deleteUser } from 'firebase/auth';
import { Alert } from 'react-native';

const db = getFirestore();

/**
 * Deletes all user-related data from Firestore and Firebase Auth
 * @param {string} uid - User ID
 * @returns {Promise<boolean>} - Success status
 */
export const deleteUserAccount = async (uid) => {
  try {
    console.log('Starting account deletion for user:', uid);
    
    // Step 1: Delete user's listings
    await deleteUserListings(uid);
    
    // Step 2: Delete user's messages/chats
    await deleteUserMessages(uid);
    
    // Step 3: Delete user's reviews
    await deleteUserReviews(uid);
    
    // Step 4: Delete user document
    await deleteUserDocument(uid);
    
    // Step 5: Delete Firebase Auth user
    await deleteFirebaseAuthUser();
    
    console.log('Account deletion completed successfully');
    return true;
    
  } catch (error) {
    console.error('Error during account deletion:', error);
    throw error;
  }
};

/**
 * Deletes all listings created by the user
 */
const deleteUserListings = async (uid) => {
  try {
    const listingsRef = collection(db, 'listings');
    const q = query(listingsRef, where('userId', '==', uid));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log('No listings found for user');
      return;
    }
    
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`Deleted ${snapshot.docs.length} listings`);
  } catch (error) {
    console.error('Error deleting user listings:', error);
    throw error;
  }
};

/**
 * Deletes all messages/chats involving the user
 */
const deleteUserMessages = async (uid) => {
  try {
    // Delete messages where user is sender
    const senderQuery = query(collection(db, 'messages'), where('senderId', '==', uid));
    const senderSnapshot = await getDocs(senderQuery);
    
    // Delete messages where user is receiver
    const receiverQuery = query(collection(db, 'messages'), where('receiverId', '==', uid));
    const receiverSnapshot = await getDocs(receiverQuery);
    
    const batch = writeBatch(db);
    
    senderSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    receiverSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`Deleted ${senderSnapshot.docs.length + receiverSnapshot.docs.length} messages`);
  } catch (error) {
    console.error('Error deleting user messages:', error);
    throw error;
  }
};

/**
 * Deletes all reviews by or about the user
 */
const deleteUserReviews = async (uid) => {
  try {
    // Delete reviews written by the user
    const reviewerQuery = query(collection(db, 'reviews'), where('reviewerId', '==', uid));
    const reviewerSnapshot = await getDocs(reviewerQuery);
    
    // Delete reviews about the user
    const revieweeQuery = query(collection(db, 'reviews'), where('revieweeId', '==', uid));
    const revieweeSnapshot = await getDocs(revieweeQuery);
    
    const batch = writeBatch(db);
    
    reviewerSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    revieweeSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`Deleted ${reviewerSnapshot.docs.length + revieweeSnapshot.docs.length} reviews`);
  } catch (error) {
    console.error('Error deleting user reviews:', error);
    throw error;
  }
};

/**
 * Deletes the user document from Firestore
 */
const deleteUserDocument = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    await deleteDoc(userRef);
    console.log('User document deleted');
  } catch (error) {
    console.error('Error deleting user document:', error);
    throw error;
  }
};

/**
 * Deletes the Firebase Auth user
 */
const deleteFirebaseAuthUser = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user found');
    }
    
    await deleteUser(user);
    console.log('Firebase Auth user deleted');
  } catch (error) {
    if (error.code === 'auth/requires-recent-login') {
      throw new Error('REQUIRES_REAUTHENTICATION');
    }
    console.error('Error deleting Firebase Auth user:', error);
    throw error;
  }
};

/**
 * Reauthenticates user with email and password
 */
export const reauthenticateUser = async (email, password) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user found');
    }
    
    const credential = EmailAuthProvider.credential(email, password);
    await reauthenticateWithCredential(user, credential);
    console.log('User reauthenticated successfully');
    return true;
  } catch (error) {
    console.error('Reauthentication failed:', error);
    throw error;
  }
};

/**
 * Shows confirmation modal for account deletion
 */
export const showDeleteAccountConfirmation = (onConfirm) => {
  return new Promise((resolve) => {
    Alert.alert(
      'Delete Account?',
      'This will permanently delete your account and all associated data. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => resolve(false),
        },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            onConfirm();
            resolve(true);
          },
        },
      ],
      { cancelable: false }
    );
  });
};

/**
 * Shows reauthentication modal
 */
export const showReauthenticationModal = (userEmail) => {
  return new Promise((resolve, reject) => {
    Alert.prompt(
      'Reauthentication Required',
      'For security reasons, please enter your password to delete your account.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => reject(new Error('User cancelled reauthentication')),
        },
        {
          text: 'Confirm',
          onPress: (password) => {
            if (!password) {
              reject(new Error('Password is required'));
              return;
            }
            resolve(password);
          },
        },
      ],
      'secure-text',
      '',
      'default'
    );
  });
};