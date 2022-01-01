import {
  getPermissionsAsync,
  requestPermissionsAsync,
  getExpoPushTokenAsync,
  setNotificationChannelAsync,
  AndroidImportance,
} from 'expo-notifications';
import { Platform } from 'react-native';
import themeStyle from '../theme.style';

const registerNotifications = async () => {
  if (Platform.OS === 'android') {
    setNotificationChannelAsync('default', {
      name: 'default',
      importance: AndroidImportance.DEFAULT, // TODO: LOOK INTO PRIORITY
      vibrationPattern: [0, 250, 250, 250],
      lightColor: themeStyle.colors.primary.light,
    });
  }

  const { status: existingStatus } = await getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    alert('Please enable notifications in permissions.');
    return;
  }
  const token = await getExpoPushTokenAsync().data;
  return token;
};

export default registerNotifications;
