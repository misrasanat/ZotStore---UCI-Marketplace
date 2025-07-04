import 'react-native-get-random-values';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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




const Stack = createNativeStackNavigator();


export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Auth" component={Auth} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Signup2" component={Signup2} />
        <Stack.Screen name="OTPVerification" component={OTPVerification} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddProduct" component={AddProductScreen} options={{ headerShown: true }} />
        <Stack.Screen name="View Listing" component={ViewListingScreen} options={{ headerShown: true }} />
        <Stack.Screen name="Edit Listing" component={EditListingScreen} options={{ headerShown: true }} />
        <Stack.Screen name="My Listings" component={MyListingsScreen} options={{headerShown: false}} />
        <Stack.Screen name="Inbox Screen" component={InboxScreen} options={{headerShown: false}} />
        <Stack.Screen name="Chat Screen" component={ChatScreen} options={{headerShown: false}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
