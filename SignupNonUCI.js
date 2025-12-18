import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { auth, createUserWithEmailAndPassword } from './firebase';
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { SafeAreaView } from 'react-native-safe-area-context';
import TermsAcceptance from './components/TermsAcceptance';
import { useTheme } from './ThemeContext';

const SignupNonUCI = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const { theme } = useTheme();

    const handleSignup = async () => {
        if (!name || !email || !password || !phone) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (!termsAccepted) {
            Alert.alert('Terms Required', 'Please accept the Terms of Service and Privacy Policy to continue.');
            return;
        }

        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            const db = getFirestore();
            const userData = {
                name,
                email,
                phone,
                isUCIStudent: false,
                canSell: false,
                termsAccepted: true,
                termsAcceptedAt: serverTimestamp(),
                createdAt: serverTimestamp(),
            };
            await setDoc(doc(db, 'users', user.uid), userData);

            Alert.alert('Success', 'Account created successfully!');
            navigation.navigate('Auth');
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Create Non-UCI Account</Text>
            
            <View style={styles.disclaimer}>
                <Text style={styles.disclaimerTitle}>Important Notice</Text>
                <Text style={styles.disclaimerText}>
                    As a non-UCI user, you can browse and contact sellers,
                    but you cannot create listings or sell items.
                </Text>
            </View>

            <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
            />

            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TermsAcceptance 
                isAccepted={termsAccepted}
                onToggle={() => setTermsAccepted(!termsAccepted)}
                theme={theme}
            />

            <TouchableOpacity
                style={[
                    styles.button,
                    { backgroundColor: theme.colors.primary },
                    !termsAccepted && { backgroundColor: theme.colors.border, opacity: 0.5 }
                ]} 
                onPress={handleSignup}
                disabled={!termsAccepted}
            >
                <Text style={styles.buttonText}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                </Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    backButton: {
        marginBottom: 20,
    },
    backButtonText: {
        fontSize: 30,
        color: '#0064a4',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#0064a4',
    },
    disclaimer: {
        backgroundColor: '#fff3cd',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ffeeba',
    },
    disclaimerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#856404',
        marginBottom: 5,
    },
    disclaimerText: {
        color: '#856404',
    },
    input: {
        backgroundColor: '#f8f9fa',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#0064a4',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default SignupNonUCI;
