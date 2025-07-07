import 'react-native-get-random-values';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './AuthContext';
import HomeScreen from './Screens/HomeScreen';
import AddProductScreen from './Screens/AddProductScreen';
import Auth from './Auth';
import Login from './Login';
import Signup from './Signup';
import OTPVerification from './OTPVerification';
import Profile from './profile';
import Signup2 from './SignupProfile';
import ViewListingScreen from './Screens/ViewListingScreen.js';
import EditListingScreen from './Screens/EditListingScreen.js';

const Stack = createNativeStackNavigator();

function Navigation() {
  const { user, userProfile } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={user && userProfile ? "Home" : "Auth"} 
        screenOptions={{ headerShown: false }}
      >
        {user && userProfile ? (          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen name="AddProduct" component={AddProductScreen} options={{ headerShown: true }} />
            <Stack.Screen name="View Listing" component={ViewListingScreen} options={{ headerShown: true }} />
            <Stack.Screen name="Edit Listing" component={EditListingScreen} options={{ headerShown: true }} />
          </>
          ) : (
          // Authentication and incomplete profile screens
          <>
            <Stack.Screen name="Auth" component={Auth} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Signup" component={Signup} />
            <Stack.Screen name="SignupProfile" component={Signup2} />
            <Stack.Screen name="OTPVerification" component={OTPVerification} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}
