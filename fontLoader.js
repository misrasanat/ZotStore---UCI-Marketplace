import * as Font from 'expo-font';
import { Feather } from '@expo/vector-icons';

export const loadFonts = async () => {
  await Font.loadAsync(Feather.font);
};