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
  Platform,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { v4 as uuidv4 } from 'uuid';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomNavBar from './CustomNavbar.js';
import Feather from 'react-native-vector-icons/Feather';
import DropDownPicker from 'react-native-dropdown-picker';
import { uploadToCloudinary } from '../utils/cloudinary';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../AuthContext';

const SCREEN_WIDTH = Dimensions.get('window').width;
const ASPECT_RATIO = 1; // Square images
const IMAGE_HEIGHT = SCREEN_WIDTH; // Square image preview

const AddProductScreen = ({ navigation }) => {
  const { userProfile } = useAuth();

  // Check if user is UCI student and verified
  useEffect(() => {
    const isUCIEmail = userProfile?.email?.toLowerCase().endsWith('@uci.edu');
    if (!isUCIEmail) {
        Alert.alert(
            'Access Denied',
            'Only UCI students can create listings.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
    }
}, [userProfile]);

  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(null);
  const { colors, loading: themeLoading, isDarkMode } = useTheme();
  
  const [categoryItems, setCategoryItems] = useState([
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
  const [image, setImage] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [desc, setDesc] = useState('');
  const [inputHeight, setInputHeight] = useState(100);
  const [showCropInstructions, setShowCropInstructions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
        
        setTimeout(() => {
          setShowCropInstructions(false);
        }, 3000);
      } catch (error) {
        console.error('Error manipulating image:', error);
        alert('Error processing image. Please try again.');
      }
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !price.trim() || !desc.trim()) {
      alert("Please fill in all fields before submitting.");
      return;
    }
    if (isNaN(price)) {
      alert("Price must be a valid number.");
      return;
    }

    setIsLoading(true);
    const auth = getAuth();
    const user = auth.currentUser;
    let imageUrl = '';

    try {
      if (image) {
        imageUrl = await uploadToCloudinary(image);
      }

      const docRef = await addDoc(collection(db, 'listings'), {
        name,
        price: parseFloat(price).toFixed(2),
        desc,
        category,
        image: imageUrl,
        email: user ? user.email : 'guest@zotstore.com',
        userId: user ? user.uid : null,
        timestamp: serverTimestamp(),
        status: 'active',
      });

      await addDoc(collection(db, `users/${user.uid}/listings`), {
        listingId: docRef.id,
      });

      navigation.navigate('Home');
    } catch (error) {
      console.error("Error adding listing: ", error);
      alert("Something went wrong while adding your listing.");
    } finally {
      setIsLoading(false);
    }
  };

  if (themeLoading) {
    return (
      <View style={[styles.container, { backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0C2340" />
        <Text style={{ marginTop: 12, color: '#666' }}>Loading theme...</Text>
      </View>
    );
  }

  // Use theme colors based on current theme mode
  const currentColors = isDarkMode ? colors : {
    background: '#ffffff',
    surface: '#F8F9FA',
    card: '#ffffff',
    primary: '#0C2340',
    text: '#495057',
    textSecondary: '#6c757d',
    textLight: '#ffffff',
    border: '#E0E0E0',
  };

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1 }}
        // keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
      <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: currentColors.background, borderBottomColor: currentColors.border }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color={currentColors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: currentColors.text }]}>New Listing</Text>
          <View style={styles.headerRight} />
        </View>
      </SafeAreaView>
      
      
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity 
            style={[styles.imageUpload, { height: IMAGE_HEIGHT, backgroundColor: currentColors.surface }]}
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
                <Feather name="image" size={40} color={currentColors.textSecondary} />
                <Text style={[styles.imagePlaceholderText, { color: currentColors.textSecondary }]}>Add Photo</Text>
                <Text style={[styles.imagePlaceholderSubtext, { color: currentColors.textSecondary }]}>Tap to select and crop</Text>
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
              <Text style={[styles.label, { color: currentColors.textSecondary }]}>Title</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: currentColors.surface, color: currentColors.text }]}
                placeholder="What are you selling?"
                placeholderTextColor={currentColors.textSecondary}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: currentColors.textSecondary }]}>Price</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: currentColors.surface, color: currentColors.text }]}
                placeholder="0.00"
                placeholderTextColor={currentColors.textSecondary}
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
              <Text style={[styles.label, { color: currentColors.textSecondary }]}>Description</Text>
              <TextInput
                style={[styles.input, styles.descInput, { height: Math.max(100, inputHeight), backgroundColor: currentColors.surface, color: currentColors.text }]}
                placeholder="Describe your item..."
                placeholderTextColor={currentColors.textSecondary}
                value={desc}
                onChangeText={setDesc}
                multiline
                onContentSizeChange={(e) => setInputHeight(e.nativeEvent.contentSize.height)}
              />
            </View>

            <View style={[styles.inputContainer]}>
              <Text style={[styles.label, { color: currentColors.textSecondary }]}>Category</Text>
              <View style={{ paddingBottom: 60 }}>
              <DropDownPicker
                open={open}
                value={category}
                items={categoryItems}
                setOpen={setOpen}
                setValue={setCategory}
                setItems={setCategoryItems}
                placeholder="Select a category..."
                style={{
                  backgroundColor: currentColors.surface,
                  borderRadius: 8,
                  borderColor: currentColors.border,
                }}
                dropDownContainerStyle={{
                  backgroundColor: currentColors.surface,
                  borderColor: currentColors.border,
                }}
                textStyle={{
                  fontSize: 16,
                  color: currentColors.text,
                }}
                placeholderStyle={{
                  color: currentColors.textSecondary,
                }}
                listMode="SCROLLVIEW"
              />
              </View>
            </View>
          </View>
        </ScrollView>
        </KeyboardAvoidingView>
        
      

      <SafeAreaView edges={['bottom']} style={[styles.footer, { backgroundColor: currentColors.background, borderTopColor: currentColors.border }]}>
        <TouchableOpacity 
          style={[
            styles.submitButton,
            { backgroundColor: currentColors.primary },
            (!name.trim() || !price.trim() || !desc.trim()) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!name.trim() || !price.trim() || !desc.trim()}
        >
          <Text style={[styles.submitButtonText, { color: currentColors.textLight }]}>Post Listing</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Posting your listing...</Text>
        </View>
      )}
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
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
  },
  imagePlaceholderSubtext: {
    marginTop: 4,
    fontSize: 12,
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
    marginBottom: 8,
  },
  input: {
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
  pickerInput: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  footer: {
    borderTopWidth: 1,
    padding: 16,
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  submitButtonText: {
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

export default AddProductScreen;