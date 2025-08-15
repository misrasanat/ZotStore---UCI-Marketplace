import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import fetch from 'node-fetch';
import FormData from 'form-data';

// Initialize Firebase Admin
const serviceAccount = {
  "type": "service_account",
  "project_id": "zotstore-3e793",
  "private_key_id": "c4c3a95e4465f5ff72ae1ba60c7e9a9bb5f5793e",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCu1KpQtMjVF/pp\nydfI34aed7xdzBMmKQX3bKQoQ4FfBVeluaE03XIFFkec6DIc2Mx+M3AywUFNTI6S\nUTD4LGhgsXUJR+eRtfLldcX0UxdFjSQ6zHiD1gTDt0bikOFsa6fiMOipyKq9h3BJ\n1x4s8nPBcb9xe4V91wbQREHKr+ek/4ODXRQYsop0WmjsBgMakF1RnUcM0kcF62XV\n9co4JUJw/lM16t+Z0Zyda6e1mGIBVEkgs1CIqD86Kda9ylAKa02bmv+X8rdEkNh+\n+KmsBeBeuw5sqK3co+eaj4pFG+x4eFNere8rqbRp3X6Uvto9EpmlftbXO4k54qGI\nL1WaH9ZzAgMBAAECggEACz4s17TQh3ebyGrNACNzvkQX7nY9swIHWrJ3WgmBS9GF\noegumD43Y2Fb6Ji8BEPi3qjDKdhosSZfssQa4JLGgZVX3+lqWGH5hU0OFlizkery\nLf/RLjU4qDdkjRRhEr5XlQGtLKH1bOvFSlJVo/FRhVqhw5P8cSu/SexhyL2IKYGT\nxvfEzzPmTBfde/hMHYfc3kzaEmb0aFAL4yIwOVg1t1TQ2N+e3hs5QwrjUmIal15D\n1EE2LyWdninOG2aQLx8TaB8k/RaAfHcnMrHWOP/psd4HifgzHQmYUz+P8RtUqlk9\n4QvZuV1n+/pv9nKBqfFJ4nsIfp/FUw1jgDITwGDZ/QKBgQDVp0BcJFeorwVz2U9h\nevFvTncK4gQHB1Jhw5dKWIWvLr4GxIFsodzvEzd0YGuP9z98fOQE4DlD55RQq1rK\njN/D1jcp9UJzYoa14F3TR3sX1Y1z3bnD39SA0X7UcCF99m9GMLzOed+AP2/sjhsv\nbd/ADgIfkBSYGD/uWT6apFMpRQKBgQDRe48UhzAO7vYKzHKIm6S8nl0neAnR2hBV\nLsMBxQ1stw6w/bL2pRjjdpMuD99Is677j/mLuD0gVAvs1gwM2CCCA62w3z/jABlH\n1WxIgf58f9csMF9vTaVgPBafA0cp25sndqrU/vxi6guoJK2u2hMPycl/BUp6wTGQ\nQE7as26QVwKBgQCDGJYYM8CJ46LP2/amVL7SUm4fAmIAQhDdphst5jVZMbAuDONx\nWbxsAfmT8hnuA4M0CpoLF95reSx7dzlFcb1XuBivKSu2Cy2nad2IZ6LzE/kwsEtt\nEemdhW5yQb97P/w1MHCZrRRj6AjwOJ4bsyqI+M96uHi6fp6zzJTqZIwWlQKBgQCm\nULMIWUyOjqpJaIiGbQwdtJ3A+EzTj43oE3g/r3M5HR1M6B9uMyXPchToPTHJRt9m\nWqiFhYECabgOEOMAT5d/oewEwTq3vxxTK98MsiiaL+Vl8AHVHJBwF0TeenvFf9Vv\nP4fiE4/N+IPIu1YpvHnlzw9rCYhYbYosPOJeQJdHgQKBgAbo7gqLDgUeGvphti1E\nlXg+oH0SJ/f9WVgLMfd3IS+wkDVKnpZcsy5WFU0E7WPPX1S9UTg/Fau8X+sOWKl/\nCKIMjxu4QvWAw6R8YJXPNmDyIA9mrj6ncDzm3CcXkBQ1HaawOWj2cNIncXxeAXzZ\nzZt0VIlTrBU3XIVX8QcvzwoX\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@zotstore-3e793.iam.gserviceaccount.com",
  "client_id": "113823715102340468505",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40zotstore-3e793.iam.gserviceaccount.com",
};

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: "zotstore-3e793.firebasestorage.app"
});

const db = getFirestore();
const storage = getStorage();

const CLOUD_NAME = 'dkx2ibvbt';
const UPLOAD_PRESET = 'zotstore_uploads';

async function uploadToCloudinary(imageUrl) {
    try {
        const response = await fetch(imageUrl);
        const buffer = await response.buffer();

        const formData = new FormData();
        formData.append('file', buffer, { filename: 'image.jpg' });
        formData.append('upload_preset', UPLOAD_PRESET);

        const cloudinaryResponse = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData
            }
        );

        const data = await cloudinaryResponse.json();
        console.log('Cloudinary response:', data);

        if (!data.secure_url) {
            throw new Error('No secure URL in response');
        }
        return data.secure_url;
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
}

async function migrateImages() {
    
    try {
        const querySnapshot = await db.collection('listings').get();
        console.log(`Found ${querySnapshot.size} listings to process`);

        for (const document of querySnapshot.docs) {
            const listing = document.data();
            const listingId = document.id;

            if (!listing.image || listing.image.includes('cloudinary.com')) {
                console.log(`Skipping listing ${listingId} - no image or already on Cloudinary`);
                continue;
            }

            try {
                console.log(`Processing listing ${listingId}`);
                const cloudinaryUrl = await uploadToCloudinary(listing.image);
                
                await db.collection('listings').doc(listingId).update({
                    image: cloudinaryUrl
                });
                console.log(`Successfully migrated listing ${listingId}`);
            } catch (error) {
                console.error(`Failed to migrate listing ${listingId}:`, error);
            }
        }

        console.log('Migration completed');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateImages();
