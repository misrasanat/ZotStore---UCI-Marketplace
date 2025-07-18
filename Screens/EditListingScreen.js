import React, { useState } from 'react';
import { useEffect } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet, Image, ScrollView} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { serverTimestamp } from 'firebase/firestore';

const EditListingScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(item.price.toString());
  const [desc, setDesc] = useState(item.desc);
  const [image, setImage] = useState(item.image || null);
  const [newImageSelected, setNewImageSelected] = useState(false);
  const [inputHeight, setInputHeight] = useState(80);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    navigation.setOptions({ headerShown: !isLoading });
  }, [isLoading]);

  const handleUpdate = async () => {
    if (!name.trim() || !price.trim() || !desc.trim()) {
      alert('Please fill in all fields before updating.');
      return;
    }
    if (isNaN(price)) {
      alert('Price must be a valid number.');
      return;
    }

    const getImagePathFromUrl = (url) => {
      const match = decodeURIComponent(url)
        .match(/\/o\/(.*?)\?/); // captures the path after "/o/" and before "?"
      return match ? match[1] : null;
    };


    if (newImageSelected && image && item.image) {
      try {
        const oldPath = getImagePathFromUrl(item.image);
        if (oldPath) {
          const oldRef = ref(storage, oldPath);
          await deleteObject(oldRef);
          console.log('Old image deleted');
        }
      } catch (err) {
        console.warn('Failed to delete old image:', err);
      }
    }
    setIsLoading(true);

    try {
      let imageUrl = item.image;

      if (newImageSelected && image) {
        const response = await fetch(image);
        const blob = await response.blob();
        const imageRef = ref(storage, `listingImages/${uuidv4()}`);
        await uploadBytes(imageRef, blob);
        imageUrl = await getDownloadURL(imageRef);
      }

      const itemRef = doc(db, 'listings', item.id);
      await updateDoc(itemRef, {
        name,
        price: parseFloat(price).toFixed(2),
        desc,
        image: imageUrl,
        timestamp: serverTimestamp(),
      });

      alert('Listing updated!');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error updating listing: ', error);
      alert('Something went wrong while updating your listing.');
    } finally {
      setIsLoading(false); // hide overlay regardless
    }
  };

  return (
    <View style={styles.wrapper}>
    <View style={styles.container}>
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.header}>Edit Listing</Text>

      <TextInput style={styles.input} placeholder="Product Name" value={name} onChangeText={setName} />
      <TextInput
        style={styles.input}
        placeholder="Price (Ex: 49.99)"
        value={price}
        onChangeText={(text) => {
          const formatted = text.replace(/[^0-9.]/g, '');
          if (formatted === '') return setPrice('');
          const valid = formatted.match(/^(\d+)(\.\d{0,2})?$/);
          if (valid) setPrice(formatted);
        }}
        keyboardType="numeric"
      />
      
      <TextInput
        style={[styles.input, styles.descInput, { height: inputHeight }]}
        placeholder="Description"
        value={desc}
        onChangeText={setDesc}
        multiline
        onContentSizeChange={(e) =>
          setInputHeight(e.nativeEvent.contentSize.height)
        }
      />
      <TouchableOpacity
        style={styles.imageUpload}
        onPress={async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            alert('Camera roll permissions are needed!');
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
          });
          if (!result.canceled) {
            setImage(result.assets[0].uri);
            setNewImageSelected(true);
          }
        }}
      >
        <Text style={styles.imageUploadText}>Change Photo</Text>
      </TouchableOpacity>

      {image && (
        <Image
          source={{ uri: image }}
          style={{ width: '100%', height: 200, marginBottom: 16, borderRadius: 8 }}
          resizeMode="cover"
        />
      )}

      <Button title="Update" onPress={handleUpdate} />

      
    </ScrollView>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.navText}>🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Inbox Screen')}>
            <Text style={styles.navText}>📬</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('My Listings')}>
            <Text style={styles.navText}>📦</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.navText}>👤</Text>
        </TouchableOpacity>
      </View>
      
    </View>
    {isLoading && (
      <View style={styles.loadingOverlay}>
        <Text style={styles.loadingText}>Updating...</Text>
      </View>
    )}
    </View>

  );
};

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: '600', marginBottom: 16 },
  input: {
    height: 40,
    borderColor: '#aaa',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  descInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  imageUpload: {
    backgroundColor: '#194a7a',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  imageUploadText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: '40%', // room for nav bar and floating buttons
  },
  loadingOverlay: {
  ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },

  loadingText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    backgroundColor: '#fdfff5',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 26,
    color: '#444',
    fontWeight: '600',
    textAlign: 'center',
  },
  wrapper: {
    flex: 1,
    position: 'relative',
  },
});

export default EditListingScreen;