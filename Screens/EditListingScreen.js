import React, { useState, useEffect } from 'react';
import 'react-native-get-random-values';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  ScrollView, 
  ActivityIndicator, 
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { serverTimestamp } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomNavBar from './CustomNavbar.js';
import Feather from 'react-native-vector-icons/Feather';
import { uploadToCloudinary } from '../utils/cloudinary';
import DropDownPicker from 'react-native-dropdown-picker';

const SCREEN_WIDTH = Dimensions.get('window').width;
const ASPECT_RATIO = 1; // Square images
const IMAGE_HEIGHT = SCREEN_WIDTH; // Square image preview

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
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(item.category || null);
  const [categoryItems] = useState([
    { label: 'Electronics', value: 'electronics' },
    { label: 'Books', value: 'books' },
    { label: 'Accessories', value: 'accessories' }, // Changed from clothing
    { label: 'Furniture', value: 'furniture' },
    { label: 'Sports Equipment', value: 'sports' },
    { label: 'Toys & Games', value: 'toys' },
    { label: 'Home & Kitchen', value: 'home' },
    { label: 'Beauty & Personal Care', value: 'beauty' },
    { label: 'Pet Supplies', value: 'pets' },
    { label: 'Art & Crafts', value: 'art' },
    { label: 'Other', value: 'other' },
  ]);

  useEffect(() => {
    navigation.setOptions({ headerShown: false});
  }, [isLoading]);

  // Keep the existing update logic intact - DO NOT EDIT THIS SECTION
  const handleUpdate = async () => {
    if (!name.trim() || !price.trim() || !desc.trim()) {
      alert('Please fill in all fields before updating.');
      return;
    }
    if (isNaN(price)) {
      alert('Price must be a valid number.');
      return;
    }

    setIsLoading(true);

    try {
      let imageUrl = item.image;

      if (newImageSelected && image) {
        imageUrl = await uploadToCloudinary(image);
      }

      const itemRef = doc(db, 'listings', item.id);
      await updateDoc(itemRef, {
        name,
        price: parseFloat(price).toFixed(2),
        desc,
        category,
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
  // END OF UPDATE SECTION - DO NOT EDIT ABOVE

  const pickAndCropImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      try {
        setShowCropInstructions(true);
        
        // Optimize image size
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [
            { resize: { width: 600, height: 600 } }, // Fixed size for consistent results
          ],
          { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
        );
        
        setImage(manipulatedImage.uri);
        setNewImageSelected(true);
        
        setTimeout(() => {
          setShowCropInstructions(false);
        }, 3000);
      } catch (error) {
        console.error('Error manipulating image:', error);
        alert('Error processing image. Please try again.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1 }}
      >
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
        
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity 
            style={[styles.imageUpload, { height: IMAGE_HEIGHT }]}
            onPress={pickAndCropImage}
          >
            {image ? (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: image }}
                  style={styles.selectedImage}
                  resizeMode="cover"
                />
                <TouchableOpacity 
                  style={styles.editImageButton}
                  onPress={pickAndCropImage}
                >
                  <Feather name="edit-2" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Feather name="image" size={40} color="#666" />
                <Text style={styles.imagePlaceholderText}>Add Photo</Text>
                <Text style={styles.imagePlaceholderSubtext}>Tap to select and crop</Text>
              </View>
            )}
          </TouchableOpacity>

          {showCropInstructions && (
            <View style={styles.cropInstructions}>
              <Text style={styles.cropInstructionsText}>
                Move and Scale to adjust how your image appears
              </Text>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Title</Text>
              <TextInput 
                style={styles.input}
                placeholder="What are you selling?"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Price</Text>
              <TextInput 
                style={styles.input}
                placeholder="0.00"
                value={price}
                onChangeText={(text) => {
                  const formatted = text.replace(/[^0-9.]/g, '');
                  if (formatted === '') {
                    setPrice('');
                    return;
                  }
                  const decimalMatch = formatted.match(/^(\d+)(\.\d{0,2})?$/);
                  if (decimalMatch) {
                    setPrice(formatted);
                  }
                }}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.descInput, { height: Math.max(100, inputHeight) }]}
                placeholder="Describe your item..."
                value={desc}
                onChangeText={setDesc}
                multiline
                onContentSizeChange={(e) => setInputHeight(e.nativeEvent.contentSize.height)}
              />
            </View>

            <View style={[styles.inputContainer]}>
              <Text style={styles.label}>Category</Text>
              <View style={{ paddingBottom: 60 }}>
                <DropDownPicker
                  open={open}
                  value={category}
                  items={categoryItems}
                  setOpen={setOpen}
                  setValue={setCategory}
                  placeholder="Select a category..."
                  style={{
                    backgroundColor: '#F8F9FA',
                    borderRadius: 8,
                    borderColor: '#ccc',
                  }}
                  dropDownContainerStyle={{
                    backgroundColor: '#F8F9FA',
                    borderColor: '#ccc',
                  }}
                  textStyle={{
                    fontSize: 16,
                    color: '#333',
                  }}
                  listMode="SCROLLVIEW"
                />
              </View>
            </View>
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0C2340',
  },
  backButton: {
    padding: 4,
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  imageUpload: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  imagePlaceholderSubtext: {
    marginTop: 4,
    fontSize: 12,
    color: '#999',
  },
  cropInstructions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    zIndex: 1,
  },
  cropInstructionsText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    padding: 16,
    paddingBottom: 120, // Extra padding to ensure content is visible above keyboard
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  descInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    padding: 16,
  },
  submitButton: {
    backgroundColor: '#0C2340',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
  },
});

export default EditListingScreen;