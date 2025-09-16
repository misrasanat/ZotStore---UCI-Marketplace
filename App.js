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
import MyListingsScreen from './Screens/MyListingsScreen.js';
import ChatScreen from './Screens/ChatScreen.js';
import InboxScreen from './Screens/InboxScreen.js';
import OtherUserProfileScreen from './Screens/OtherUserProfileScreen.js';
import LeaveReviewScreen from './Screens/LeaveReviewScreen';
import AllReviewsScreen from './Screens/AllReviewsScreen';
import OtherUserListingsScreen from './Screens/OtherUserListingsScreen.js';
import SettingsScreen from './Screens/SettingsScreen.js';
import SignupNonUCI from './SignupNonUCI';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UnreadProvider } from './UnreadContext';
import { ThemeProvider } from './ThemeContext';
import { useState, useEffect } from 'react';
import { loadFonts } from './fontLoader';
const Stack = createNativeStackNavigator();

function Navigation() {
  const { user, userProfile } = useAuth();

  return (
    <SafeAreaProvider>
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={user && userProfile ? "Home" : "Auth"} 
        screenOptions={{ headerShown: false }}
      >
        {user && userProfile ? (          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen name="AddProduct" component={AddProductScreen} options={{ headerShown: false }} />
            <Stack.Screen name="View Listing" component={ViewListingScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Edit Listing" component={EditListingScreen} options={{ headerShown: false }} />
            <Stack.Screen name="My Listings" component={MyListingsScreen} options={{headerShown: false}} />
            <Stack.Screen name="Inbox Screen" component={InboxScreen} options={{headerShown: false}} />
            <Stack.Screen name="Chat Screen" component={ChatScreen} options={{headerShown: false}} />
            <Stack.Screen name="Other User" component={OtherUserProfileScreen} options={{headerShown: false}} />
            <Stack.Screen name="Leave Review" component={LeaveReviewScreen} options={{headerShown: false, title: 'Leave a Review'}} />
            <Stack.Screen name="All Reviews" component={AllReviewsScreen} options={{headerShown: false}} />
            <Stack.Screen name="Other User Listings" component={OtherUserListingsScreen} options={{headerShown: false}} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
          </>
          ) : (
          // Authentication and incomplete profile screens
          <>
            <Stack.Screen name="Auth" component={Auth} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Signup" component={Signup} />
            <Stack.Screen name="SignupProfile" component={Signup2} />
            <Stack.Screen name="OTPVerification" component={OTPVerification} />
            <Stack.Screen name="SignupNonUCI" component={SignupNonUCI} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await loadFonts();
        setFontsLoaded(true);
      } catch (e) {
        console.warn(e);
      }
    }
    prepare();
  }, []);

  if (!fontsLoaded) {
    return null; // Or return a loading screen
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <UnreadProvider>
          <Navigation />
        </UnreadProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
