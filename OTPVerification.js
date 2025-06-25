import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function OTPVerification({ navigation, route }) {
  const { email, isSignup } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          setCanResend(true);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = () => {
    const otpString = otp.join('');
    
    // TODO: Replace with real OTP verification logic
    if (otpString.length === 6) {
      // For demo purposes, accept any 6-digit code
      const successMessage = isSignup ? 'Account created successfully!' : 'OTP verified successfully!';
      Alert.alert('Success', successMessage, [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Signup2', { email })
        }
      ]);
    } else {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP.');
    }
  };

  const handleResendOTP = () => {
    // TODO: Replace with real OTP resend logic
    Alert.alert('OTP Sent', 'A new OTP has been sent to your email.');
    setTimer(30);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
  };

  const handleBack = () => {
    if (isSignup) {
      navigation.navigate('Signup');
    } else {
      navigation.navigate('Login');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.subtitle}>
        We've sent a 6-digit code to{'\n'}
        <Text style={styles.email}>{email}</Text>
      </Text>
      
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={styles.otpInput}
            value={digit}
            onChangeText={(value) => handleOtpChange(value, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="numeric"
            maxLength={1}
            textAlign="center"
            autoFocus={index === 0}
          />
        ))}
      </View>

      <TouchableOpacity 
        style={[styles.verifyButton, otp.join('').length === 6 ? styles.verifyButtonActive : styles.verifyButtonInactive]} 
        onPress={handleVerifyOTP}
        disabled={otp.join('').length !== 6}
      >
        <Text style={styles.verifyButtonText}>Verify OTP</Text>
      </TouchableOpacity>

      <View style={styles.resendContainer}>
        <Text style={styles.timerText}>
          {canResend ? 'Didn\'t receive the code? ' : `Resend code in ${timer}s`}
        </Text>
        {canResend && (
          <TouchableOpacity onPress={handleResendOTP}>
            <Text style={styles.resendText}>Resend</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity 
        style={styles.backButton} 
        onPress={handleBack}
      >
        <Text style={styles.backButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0064a4',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  email: {
    fontWeight: 'bold',
    color: '#0064a4',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 40,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: '#fff',
  },
  verifyButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 24,
  },
  verifyButtonActive: {
    backgroundColor: '#0064a4',
  },
  verifyButtonInactive: {
    backgroundColor: '#ccc',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: 'bold',
    letterSpacing: 1.1,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  timerText: {
    fontSize: 14,
    color: '#666',
  },
  resendText: {
    fontSize: 14,
    color: '#0064a4',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  backButton: {
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#0064a4',
    fontSize: 16,
    fontWeight: '600',
  },
}); 