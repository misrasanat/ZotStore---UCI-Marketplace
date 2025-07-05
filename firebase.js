import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendEmailVerification, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyBH2IK4Hd-_ETZolxNLsZ54Z9M_iHd8veE",
    authDomain: "zotstore-3e793.firebaseapp.com",
    projectId: "zotstore-3e793",
    storageBucket: "zotstore-3e793.firebasestorage.app",
    messagingSenderId: "909433494448",
    appId: "1:909433494448:web:8e9ad5946fdfc8f2a15475",
    measurementId: "G-6QPS424NKE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { 
    auth, 
    db, 
    storage, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    sendEmailVerification 
};