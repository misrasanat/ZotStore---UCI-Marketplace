import { Platform } from 'react-native';

const CLOUD_NAME = 'dkx2ibvbt';
const UPLOAD_PRESET = 'zotstore_uploads'; // Change this to your unsigned upload preset name

export const uploadToCloudinary = async (uri) => {
  try {
    let filename = uri.split('/').pop();
    let match = /\.(\w+)$/.exec(filename);
    let type = match ? `image/${match[1]}` : 'image/jpeg';

    const formData = new FormData();
    formData.append('file', {
      uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
      type,
      name: filename,
    });
    formData.append('upload_preset', UPLOAD_PRESET);

    console.log('Uploading to Cloudinary...'); // Debug log

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    console.log('Cloudinary response:', data); // Debug log

    if (data.error) {
      throw new Error(data.error.message);
    }

    if (!data.secure_url) {
      throw new Error('No secure URL received from Cloudinary');
    }

    return data.secure_url;
  } catch (error) {
    console.error('Detailed upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
};
