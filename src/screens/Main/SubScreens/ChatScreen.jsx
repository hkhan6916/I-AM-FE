import React, { useEffect, useState } from 'react';
import {
  View, Text, Button, TextInput, ScrollView, SafeAreaView, StyleSheet, Image,
} from 'react-native';
import { getItemAsync } from 'expo-secure-store';
import { io } from 'socket.io-client';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';
import { getInfoAsync } from 'expo-file-system';
import sendMessage from '../../../helpers/sendMessage';
import MessageBox from '../../../components/MessageBox';
import VideoPlayer from '../../../components/VideoPlayer';
import apiCall from '../../../helpers/apiCall';

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
  const [chat, setChat] = useState(props.route.params.existingChat);

  const { chatUserId, existingChat } = props.route.params;

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

    const connection = io.connect('http://192.168.5.101:5000', {
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
      formData.append('file', {
        uri: media.uri, name: media.uri, type: `${media.type}/${mediaExtension}`,
      });
      const { response, success } = await apiCall('POST', '/files/upload', formData);
      if (success) {
        await sendMessage({
          socket,
          body: messageBody,
          chatId: chat._id,
          senderId: authInfo.senderId,
          mediaUrl: response.fileUrl,
        });
        setMessages([...messages, {
          body: messageBody,
          chatId: chat._id,
          senderId: authInfo.senderId,
          user: 'sender',
          mediaUrl: response.fileUrl,
          mediaHeaders: response.fileHeaders,
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
        body: messageBody, chatId: chat._id, senderId: authInfo.senderId, user: 'sender',
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

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      (async () => {
        await initSocket();
        if (existingChat) {
          setChat(existingChat);
          await getChatMessages();
        }
      })();
    }
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (socket && isMounted && authInfo) {
      socket.emit('joinRoom', { chatId: chat._id, userId: authInfo.senderId });
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
          <MessageBox
            key={`message-${i}`}
            body={message.body}
            user={message.user}
            mediaUrl={message.mediaUrl}
            mediaHeaders={message.mediaHeaders}
            belongsToSender={authInfo.senderId === message.user._id || message.user === 'sender'}
          />
        )) : (
          <View>
            <Text>Send a message to start a conversation.</Text>
          </View>
        )}
      </ScrollView>
      <TextInput styles={styles.inputBox} value={messageBody} placeholder="Type a message..." onChangeText={(v) => setMessageBody(v)} />
      <View style={[{ alignItems: 'center' }, mediaSending && { backgroundColor: 'grey' }]}>
        {
        media?.type === 'image' ? (
          <Image
            style={{
              borderRadius: 10,
              aspectRatio: 1 / 1,
              width: '100%',
            }}
            resizeMode="contain"
            source={{ uri: media.uri }}
          />
        ) : media?.type === 'video' ? (
          <View style={{ width: 200, height: 200 }}>
            {/* <VideoPlayer
                url={media.uri}
              /> */}
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
