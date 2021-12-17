import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, ScrollView, SafeAreaView, StyleSheet, Image,
} from 'react-native';
import { getItemAsync } from 'expo-secure-store';
import { io } from 'socket.io-client';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';
import { getInfoAsync } from 'expo-file-system';
import { useNavigation } from '@react-navigation/native';
import Aes from 'react-native-aes-crypto';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import sendMessage from '../../../helpers/sendMessage';
import MessageBox from '../../../components/MessageBox';
import apiCall from '../../../helpers/apiCall';
import get12HourTime from '../../../helpers/get12HourTime';
import getNameDate from '../../../helpers/getNameDate';
import themeStyle from '../../../theme.style';
import CameraStandard from '../../../components/CameraStandard';

const ChatScreen = (props) => {
  const [authInfo, setAuthInfo] = useState(null);
  const [socket, setSocket] = useState(null);

  const [media, setMedia] = useState({});
  const [mediaSendFail, setMediaSendFail] = useState(false);
  const [showMediaSizeError, setShowMediaSizeError] = useState(false);
  const [mediaSending, setMediaSending] = useState(false);
  const [messageBody, setMessageBody] = useState('');
  const [messages, setMessages] = useState([]);
  const [showError, setShowError] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [recording, setRecording] = useState(false);

  const [chat, setChat] = useState(props.route.params.existingChat);
  const { chatUserId, existingChat } = props.route.params;
  const navigation = useNavigation();

  const createChat = async () => {
    setShowError(false);
    const { response, success } = await apiCall('POST', '/chat/new', { participants: [chatUserId] });
    if (success) {
      setChat(response);
    } else {
      setShowError(true);
    }
  };

  const getChatMessages = async () => {
    setShowError(false);
    const { response, success } = await apiCall('GET', `/chat/${existingChat._id}/messages/${messages.length}`);
    if (success) {
      setMessages(response);
    } else {
      setShowError(true);
    }
  };

  const initSocket = async () => {
    const token = await getItemAsync('authToken');
    const senderId = await getItemAsync('userId');
    setAuthInfo({ token, senderId });
    const connection = io.connect('ws://192.168.5.101:5000', {
      auth: {
        token,
      },
    });

    setSocket(connection);
  };

  const handleMessageSend = async () => {
    if (socket.connected && !messages.length && chatUserId) {
      await createChat();
    }

    if (media?.uri && socket.connected) {
      setMediaSending(true);

      const formData = new FormData();
      const mediaExtension = media.uri.split('.').pop();
      if (media.type?.split('/').length === 2) {
        formData.append('file', {
          uri: media.uri, name: media.uri, type: `${media.type}`,
        });
      } else {
        formData.append('file', {
          uri: media.uri, name: media.uri, type: `${media.type}/${mediaExtension}`,
        });
      }
      const { response, success } = await apiCall('POST', '/files/upload', formData);
      if (success) {
        await sendMessage({
          socket,
          body: messageBody,
          chatId: chat._id,
          senderId: authInfo.senderId,
          mediaUrl: response.fileUrl,
          mediaType: media.type?.split('/')[0],
        });
        setMessages([...messages, {
          body: messageBody,
          chatId: chat._id,
          senderId: authInfo.senderId,
          user: 'sender',
          mediaUrl: response.fileUrl,
          mediaHeaders: response.fileHeaders,
          mediaType: media.type?.split('/')[0],
          stringTime: get12HourTime(new Date()),
          stringDate: getNameDate(new Date()),
        }]);
        setMessageBody('');
        setMedia({});
      }
      setMediaSendFail(true);
      setMediaSending(false);
      return true;
    }
    if (socket.connected) {
      await sendMessage({
        socket, body: messageBody, chatId: chat._id, senderId: authInfo.senderId,
      });
      setMessages([...messages, {
        body: messageBody,
        chatId: chat._id,
        senderId: authInfo.senderId,
        user: 'sender',
        stringTime: get12HourTime(new Date()),
        stringDate: getNameDate(new Date()),
      }]);
      setMessageBody('');
      setMediaSending(false);

      return true;
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work.');
    }

    if (status === 'granted') {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 0.3,
      });
      if (!result.cancelled) {
        const mediaInfo = await getInfoAsync(result.uri);
        const mediaSizeInMb = mediaInfo.size / 1000000;
        if (mediaSizeInMb > 50) {
          setShowMediaSizeError(true);
        } else {
          if (showMediaSizeError) {
            setShowMediaSizeError(false);
          }
          setMedia(result);
        }
      }
    }
  };

  const handleActivateCamera = () => {
    setMedia({});
    setCameraActive(true);
  };

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      (async () => {
        if (chat) {
          await initSocket();
          await getChatMessages();
        }
        if (chat.users.length) {
          navigation.setOptions({ title: chat.users[0].firstName });
        }
      })();
    }
    return () => { isMounted = false; };
  }, [chat]);

  useEffect(() => {
    let isMounted = true;

    if (socket && isMounted && authInfo) {
      if (chat) {
        socket.emit('joinRoom', { chatId: chat._id, userId: authInfo.senderId });
      }
      socket.on('receiveMessage', ({
        body, chatId, senderId, user,
      }) => {
        if (!socket.connected) {
          setShowError(true);
        } else {
          setMessages((prevMessages) => [...prevMessages, {
            body, chatId, senderId, user,
          }]);
        }
      });
    }
    return () => {
      isMounted = false;
      if (socket) {
        socket.off('receiveMessage');
      }
    };
  }, [socket, authInfo, chat]);

  if (cameraActive) {
    return (
      <CameraStandard
        recording={recording}
        setCameraActive={setCameraActive}
        setFile={setMedia}
        setRecording={setRecording}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {showError
        ? (
          <Text>
            It hurts to say this,
            but... &quot;An error occurred sending your message.&quot;
          </Text>
        )
        : null}
      <ScrollView style={{ flex: 1 }}>
        {messages.length ? messages.map((message, i) => (
          <View key={`message-${i}`}>
            <MessageBox
              message={message}
              belongsToSender={authInfo.senderId === message.user._id || message.user === 'sender'}
            />
            {messages[i + 1] && message.stringDate !== messages[i + 1].stringDate ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.horizontalLines} />
                <Text style={{ textAlign: 'center', marginHorizontal: 10, color: themeStyle.colors.grayscale.mediumGray }}>
                  {messages[i + 1].stringDate}
                </Text>
                <View style={styles.horizontalLines} />
              </View>
            ) : null}
          </View>
        )) : (
          <View>
            <Text>Send a message to start a conversation.</Text>
          </View>
        )}
      </ScrollView>
      <View style={{
        flexDirection: 'row', minHeight: 48, maxHeight: 100, alignItems: 'center',
      }}
      >
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            style={{ marginHorizontal: 5 }}
            onPress={() => pickImage()}
          >
            <FontAwesome name="photo" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginHorizontal: 5 }}
            onPress={() => handleActivateCamera(true)}
          >
            <Ionicons name="camera-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1 }}>
          <ScrollView>
            <TextInput
              styles={styles.inputBox}
              value={messageBody}
              multiline
              placeholder="Type a message..."
              onChangeText={(v) => setMessageBody(v)}
            />
          </ScrollView>
        </View>
        <TouchableOpacity
          style={{ marginLeft: 20, marginRight: 10 }}
          onPress={() => handleMessageSend()}
        >
          <Ionicons name="send-sharp" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View style={[{ alignItems: 'center' }, mediaSending && { backgroundColor: 'grey' }]}>
        {
        media?.type?.includes('image') ? (
          <Image
            style={{
              borderRadius: 10,
              aspectRatio: 1 / 1,
              width: '100%',
            }}
            resizeMode="contain"
            source={{ uri: media.uri }}
          />
        ) : media?.type?.includes('video') ? (
          <View style={{ width: 200, height: 200 }}>
            <Video
              useNativeControls
              source={{ uri: media.uri }}
              resizeMode="cover"
              style={{ width: '100%', height: '100%', alignSelf: 'center' }}
            />
          </View>
        ) : null
        }
        {showMediaSizeError
          ? (
            <Text>
              We can&apos;t send the chosen media file as it exceeds our 50MB limit.
              Please choose a smaller file
            </Text>
          )
          : null}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  inputBox: {
    height: 48,
  },
  horizontalLines: {
    flex: 1,
    height: 1,
    backgroundColor: themeStyle.colors.grayscale.lightGray,
  },
});

export default ChatScreen;
