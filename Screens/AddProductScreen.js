import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet, Image } from 'react-native';

const AddProductScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [desc, setDesc] = useState('');
  const [image, setImage] = useState(null); // hook this to an image picker later

const handleSubmit = () => {
    
    if (!name.trim() || !price.trim() || !desc.trim()) {
        alert("Please fill in all fields before submitting.");
        return;
    }
    if (isNaN(price)) {
        alert("Price must be a valid number.");
        return;
    }
    const newItem = {
        id: Date.now().toString(), // unique key
        name,
        price: parseFloat(price).toFixed(2),
    };
    navigation.navigate('Home', { newItem });
};

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add Listing</Text>

      <TextInput style={styles.input} placeholder="Product Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Price (Ex: 49.99)" value={price}
       onChangeText={(text) => {
        const formatted = text.replace(/[^0-9.]/g, ''); // remove non-numeric and non-dot
        const decimalMatch = formatted.match(/^(\d+)(\.\d{0,2})?$/); // allow up to 2 decimals
            if (decimalMatch) {
                setPrice(formatted);
            }
        }}
        keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Description" value={desc} onChangeText={setDesc} />

      <TouchableOpacity style={styles.imageUpload}>
        <Text style={styles.imageUploadText}>Upload Image</Text>
      </TouchableOpacity>

      <Button title="Submit" onPress={handleSubmit} disabled={!name.trim() || !price.trim() || !desc.trim()}/>
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
  imageUpload: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  imageUploadText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AddProductScreen;