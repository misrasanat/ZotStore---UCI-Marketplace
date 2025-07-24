import React, { useState } from 'react';
import { useEffect } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { serverTimestamp } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomNavBar from './CustomNavbar.js';
import { Feather } from '@expo/vector-icons';

const IMAGE_HEIGHT = Dimensions.get('window').width * 0.4; // Adjust as needed

const EditListingScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(item.price.toString());
  const [desc, setDesc] = useState(item.desc);
  const [image, setImage] = useState(item.image || null);
  const [newImageSelected, setNewImageSelected] = useState(false);
  const [inputHeight, setInputHeight] = useState(80);
  const [isLoading, setIsLoading] = useState(false);
  const [showCropInstructions, setShowCropInstructions] = useState(false);

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

  const pickAndCropImage = async () => {
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
      setShowCropInstructions(true);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color="#0C2340" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Listing</Text>
          <View style={styles.headerRight} />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity 
            style={[styles.imageUpload, { height: IMAGE_HEIGHT }]}
            onPress={pickAndCropImage}
          >
            <Text style={styles.imageUploadText}>Change Photo</Text>
          </TouchableOpacity>

          {showCropInstructions && (
            <View style={styles.cropInstructions}>
              <Text style={styles.cropInstructionsText}>
                Move and Scale to adjust how your image appears
              </Text>
            </View>
          )}

          <View style={styles.form}>
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.submitButton,
            (!name.trim() || !price.trim() || !desc.trim()) && styles.submitButtonDisabled
          ]}
          onPress={handleUpdate}
          disabled={!name.trim() || !price.trim() || !desc.trim()}
        >
          <Text style={styles.submitButtonText}>Update Listing</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Updating your listing...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#0C2340',
    paddingTop: Platform.OS === 'ios' ? 50 : 20, // Adjust for safe area
    paddingBottom: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 16,
    paddingBottom: 120, // Extra padding to ensure content is visible above keyboard
  },
  header: { fontSize: 22, fontWeight: '600', marginBottom: 16 },
  safeContainer2: {
      backgroundColor: '#0C2340',
  },
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
        height: 50,
        backgroundColor: '#0C2340',
        borderTopWidth: 1,
        borderTopColor: '#10253dff',
        
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
  cropInstructions: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  cropInstructionsText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButton: {
    backgroundColor: '#194a7a',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
});

export default EditListingScreen;