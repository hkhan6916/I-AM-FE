import React, { useEffect, useState } from 'react';
import {
  View, Text, Button, TextInput, ScrollView, SafeAreaView, StyleSheet, Image,
} from 'react-native';
import { getItemAsync } from 'expo-secure-store';
import { io } from 'socket.io-client';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';
import sendMessage from '../../../helpers/sendMessage';
import MessageBox from '../../../components/MessageBox';
import VideoPlayer from '../../../components/VideoPlayer';
import apiCall from '../../../helpers/apiCall';

const ChatScreen = () => {
  const [authInfo, setAuthInfo] = useState(null);
  const [socket, setSocket] = useState(null);

  const [media, setMedia] = useState({});
  const [mediaSendFail, setMediaSendFail] = useState(false);
  const [messageBody, setMessageBody] = useState('');
  const [messages, setMessages] = useState([]);
  const [showError, setShowError] = useState(false);

  const initSocket = async () => {
    const token = await getItemAsync('authToken');
    const senderId = await getItemAsync('userId');

    setAuthInfo({ token, senderId });

    const connection = io.connect('http://192.168.5.101:5000', {
      auth: {
        token,
      },
    });

    setSocket(connection);
  };

  const handleMessageSend = async () => {
    await sendMessage({
      socket, body: messageBody, chatId: '61a674407512ac67ec03d931', senderId: authInfo.senderId,
    });
    if (media?.uri && socket.connected) {
      const formData = new FormData();
      const mediaExtension = media.uri.split('.').pop();
      formData.append('file', {
        uri: media.uri, name: media.uri, type: `${media.type}/${mediaExtension}`,
      });
      const { response, success, message } = await apiCall('POST', '/files/upload', formData);

      console.log(response, success, message);

      if (success) {
        setMessages([...messages, {
          body: messageBody, chatId: '61a674407512ac67ec03d931', senderId: authInfo.senderId, user: 'sender', mediaUrl: response.fileUrl,
        }]);
        setMessageBody('');
        setMedia({});
      }
      setMediaSendFail(true);
      return true;
    }
    if (socket.connected) {
      setMessages([...messages, {
        body: messageBody, chatId: '61a674407512ac67ec03d931', senderId: authInfo.senderId, user: 'sender',
      }]);
      setMessageBody('');
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
        quality: 1,
      });

      if (!result.cancelled) {
        setMedia(result);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      (async () => {
        await initSocket();
      })();
    }
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (socket && isMounted && authInfo) {
      socket.emit('joinRoom', { chatId: '61a674407512ac67ec03d931', userId: authInfo.senderId });
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
  }, [socket, authInfo]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TextInput styles={styles.inputBox} value={messageBody} placeholder="Type a message..." onChangeText={(v) => setMessageBody(v)} />
      {showError
        ? (
          <Text>
            It hurts to say this,
            but... &quot;An error occurred sending your message.&quot;
          </Text>
        )
        : null}
      <ScrollView>
        {messages.length ? messages.map((message, i) => (
          <MessageBox key={`message${i}`} body={message.body} user={message.user} mediaUrl={message.mediaUrl} />
        )) : null}
      </ScrollView>
      {
          media?.type === 'image' ? (
            <Image
              style={{
                borderRadius: 10,
                aspectRatio: 1 / 1,
                width: '100%',
              }}
              source={{ uri: media.uri }}
            />
          ) : media?.type === 'video' ? (
            <View style={{ width: '100%', height: 200 }}>
              {/* <VideoPlayer
                url={media.uri}
              /> */}
              <Video useNativeControls source={{ uri: media.uri }} resizeMode="cover" style={{ width: '100%', height: '100%', alignSelf: 'center' }} />
            </View>
          ) : null
      }
      <View
        style={{ margin: 20 }}
      >
        <Button title="Pick Image" onPress={() => pickImage()} />
      </View>
      <View
        style={{ margin: 20 }}
      >
        <Button
          title="send"
          onPress={() => handleMessageSend()}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  inputBox: {
    height: 48,
  },
});

export default ChatScreen;
