import React, { useState } from 'react';
import 'react-native-get-random-values';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet, Image, ScrollView} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { v4 as uuidv4 } from 'uuid';

const AddProductScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [desc, setDesc] = useState('');
  const [image, setImage] = useState(null); // hook this to an image picker later
  const [inputHeight, setInputHeight] = useState(80);


const handleSubmit = async () => {
    
    if (!name.trim() || !price.trim() || !desc.trim()) {
      alert("Please fill in all fields before submitting.");
      return;
    }
    if (isNaN(price)) {
      alert("Price must be a valid number.");
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;
    let imageUrl = '';

    try {
      if (image) {
        const response = await fetch(image);
        const blob = await response.blob();
        const imageRef = ref(storage, `listingImages/${uuidv4()}`);
        await uploadBytes(imageRef, blob);
        imageUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, 'listings'), {
        name,
        price: parseFloat(price).toFixed(2),
        desc,
        image: imageUrl,
        email: user ? user.email : 'guest@zotstore.com',
        timestamp: serverTimestamp()
      });

      alert("Listing added!");
      navigation.navigate('Home');
    } catch (error) {
      console.error("Error adding listing: ", error);
      alert("Something went wrong while adding your listing.");
    }
};

  return (
    <View style={styles.container}>
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.header}>Add Listing</Text>

      <TextInput style={styles.input} placeholder="Product Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Price (Ex: 49.99)" value={price}
       onChangeText={(text) => {
        const formatted = text.replace(/[^0-9.]/g, '');

        // Allow clearing the field entirely
        if (formatted === '') {
            setPrice('');
            return;
        }
        const decimalMatch = formatted.match(/^(\d+)(\.\d{0,2})?$/); // allow up to 2 decimals
            if (decimalMatch) {
                setPrice(formatted);
            }
        }}
        keyboardType="numeric" />

      {/* Description Input Box */}
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

        <TouchableOpacity style={styles.imageUpload} 
        onPress={async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alert('Sorry, we need camera roll permissions to make this work!');
                return;
            }

            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.8,
            });

            if (!result.canceled) {
                setImage(result.assets[0].uri);
            }
        }}
        >
        <Text style={styles.imageUploadText}>Upload Image</Text>
      </TouchableOpacity>
      {image && (
        <Image
            source={{ uri: image }}
            style={{ width: '100%', height: 200, marginBottom: 16, borderRadius: 8 }}
            resizeMode="cover"
        />
        )}

      <Button title="Submit" onPress={handleSubmit} disabled={!name.trim() || !price.trim() || !desc.trim()}/>
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
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
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
});

export default AddProductScreen;