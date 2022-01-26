import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StyleSheet,
  Image,
  FlatList,
} from "react-native";
import { getItemAsync } from "expo-secure-store";
import { io } from "socket.io-client";
import * as ImagePicker from "expo-image-picker";
import { Video } from "expo-av";
import { getInfoAsync } from "expo-file-system";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { nanoid } from "nanoid/non-secure";
import sendMessage from "../../../helpers/sendMessage";
import MessageBox from "../../../components/MessageBox";
import apiCall from "../../../helpers/apiCall";
import get12HourTime from "../../../helpers/get12HourTime";
import getNameDate from "../../../helpers/getNameDate";
import themeStyle from "../../../theme.style";
import CameraStandard from "../../../components/CameraStandard";

const ChatScreen = (props) => {
  const [authInfo, setAuthInfo] = useState(null);
  const [socket, setSocket] = useState(null);

  const [roomJoined, setRoomJoined] = useState(false);

  const [media, setMedia] = useState({});
  const [mediaSendFail, setMediaSendFail] = useState(false);
  const [showMediaSizeError, setShowMediaSizeError] = useState(false);
  const [mediaSending, setMediaSending] = useState(false);
  const [messageBody, setMessageBody] = useState("");
  const [messages, setMessages] = useState([]);
  const [showError, setShowError] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [recording, setRecording] = useState(false);
  const [chat, setChat] = useState(props.route.params.existingChat);
  const [allMessagesLoaded, setAllMessagesLoaded] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const { chatUserId, existingChat } = props.route.params;
  const navigation = useNavigation();
  const createChat = async () => {
    // If the chat doesn't exist, send request
    if (!existingChat) {
      setShowError(false);
      const { response, success } = await apiCall("POST", "/chat/new", {
        participants: [chatUserId],
      });
      if (success) {
        setChat(response);
        /* Wait for the chat creation and join the room. Should get
        a joinRoomSuccess event from the backend */
        socket.emit("joinRoom", {
          chatId: response._id,
          userId: authInfo.senderId,
        });
      } else {
        setShowError(true);
      }
      return response;
    }
  };

  const getChatMessages = async () => {
    if (chat && existingChat) {
      setShowError(false);
      const { response, success } = await apiCall(
        "GET",
        `/chat/${chat._id}/messages/${messages.length}`
      );
      if (success) {
        setMessages([...messages, ...response]);
        if (messages.length && response.length === 0) {
          setAllMessagesLoaded(true);
        }
      } else {
        setShowError(true);
      }
    }
  };

  const initSocket = async () => {
    const token = await getItemAsync("authToken");
    const senderId = await getItemAsync("userId");
    setAuthInfo({ token, senderId });
    const connection = io.connect("ws://192.168.5.101:5000", {
      auth: {
        token,
      },
    });

    setSocket(connection);
  };

  const handleMessage = async () => {
    /* If first message, first create chat. The actual message will be sent on
    the joinRoomSuccess event. */
    if (socket.connected && !messages.length) {
      await createChat();
      return;
    }

    // Not the first message, emit the message as standard
    if (socket.connected && chat?._id) {
      await handleMessageSend(chat._id);
    }
  };

  const handleMessageSend = async (chatId) => {
    if (media?.uri && media?.type && socket.connected) {
      setMediaSending(true);

      const formData = new FormData();
      const mediaExtension = media.uri.split(".").pop();
      if (media.type?.split("/").length === 2) {
        formData.append("file", {
          uri: media.uri,
          name: media.uri,
          type: `${media.type}`,
        });
      } else {
        formData.append("file", {
          uri: media.uri,
          name: media.uri,
          type: `${media.type}/${mediaExtension}`,
        });
      }
      const { response, success } = await apiCall(
        "POST",
        "/files/upload",
        formData
      );
      if (success) {
        socket.emit("sendMessage", {
          body: messageBody,
          chatId,
          senderId: authInfo.senderId,
          mediaUrl: response.fileUrl,
          mediaType: media.type?.split("/")[0],
          mediaHeaders: response.fileHeaders,
        });

        setMessages([
          {
            body: messageBody,
            chatId,
            senderId: authInfo.senderId,
            user: "sender",
            mediaUrl: response.fileUrl,
            mediaHeaders: response.fileHeaders,
            mediaType: media.type?.split("/")[0],
            stringTime: get12HourTime(new Date()),
            stringDate: getNameDate(new Date()),
            _id: nanoid(),
          },
          ...messages,
        ]);
        setMessageBody("");
        setMedia({});
      } else {
        setMediaSendFail(true);
        setMediaSending(false);
        setShowActions(false);
      }
      return true;
    }
    if (socket.connected) {
      socket.emit("sendMessage", {
        body: messageBody,
        chatId,
        senderId: authInfo.senderId,
      });
      setMessages([
        {
          body: messageBody,
          chatId,
          senderId: authInfo.senderId,
          user: "sender",
          stringTime: get12HourTime(new Date()),
          stringDate: getNameDate(new Date()),
          _id: nanoid(),
        },
        ...messages,
      ]);
      setMessageBody("");
      setMediaSending(false);

      return true;
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work.");
    }

    if (status === "granted") {
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
    navigation.setOptions({ headerShown: false });
    setCameraActive(true);
  };

  const toggleCamera = (state) => {
    setCameraActive(state);
    if (!state) {
      navigation.setOptions({ headerShown: true });
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      (async () => {
        await initSocket();
        if (chat) {
          await getChatMessages();
        }

        if (socket && chat?.users?.length) {
          navigation.setOptions({ title: chat.users[0].firstName });
        }
      })();
    }
    return () => {
      isMounted = false;
    };
  }, [chat]);

  useEffect(() => {
    let isMounted = true;

    if (socket && isMounted && authInfo) {
      if (chat) {
        socket.emit("joinRoom", {
          chatId: chat?._id,
          userId: authInfo.senderId,
        });
      }

      socket.on("joinRoomSuccess", async ({ chatId }) => {
        /* This will send the message only if it's the first message */
        if ((messageBody || media?.uri) && !existingChat) {
          await handleMessageSend(chatId);
        }
      });

      socket.on(
        "receiveMessage",
        ({
          body,
          chatId,
          senderId,
          user,
          mediaHeaders,
          mediaUrl,
          mediaType,
          stringDate,
          stringTime,
        }) => {
          if (!socket.connected) {
            setShowError(true);
          } else {
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                body,
                chatId,
                senderId,
                user,
                mediaHeaders,
                mediaUrl,
                mediaType,
                stringDate,
                stringTime,
                _id: nanoid(),
              },
            ]);
          }
        }
      );
    }

    return () => {
      isMounted = false;
      if (socket) {
        socket.disconnect();
        socket.off("receiveMessage");
      }
    };
  }, [socket, authInfo, chat]);

  if (cameraActive) {
    return (
      <CameraStandard
        recording={recording}
        setCameraActive={toggleCamera}
        setFile={setMedia}
        setRecording={setRecording}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {showError ? (
        <Text>
          It hurts to say this, but... &quot;An error occurred sending your
          message.&quot;
        </Text>
      ) : null}
      <FlatList
        data={messages}
        renderItem={({ item: message, index: i }) => (
          <View key={`message-${i}`}>
            {messages[i - 1] &&
            message.stringDate !== messages[i - 1].stringDate ? (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={styles.horizontalLines} />
                <Text
                  style={{
                    textAlign: "center",
                    marginHorizontal: 10,
                    color: themeStyle.colors.grayscale.mediumGray,
                  }}
                >
                  {messages[i - 1].stringDate}
                </Text>
                <View style={styles.horizontalLines} />
              </View>
            ) : null}
            {allMessagesLoaded && i === messages.length - 1 ? (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={styles.horizontalLines} />
                <Text
                  style={{
                    textAlign: "center",
                    marginHorizontal: 10,
                    color: themeStyle.colors.grayscale.mediumGray,
                  }}
                >
                  {messages[i].stringDate}
                </Text>
                <View style={styles.horizontalLines} />
              </View>
            ) : null}
            <MessageBox
              message={message}
              belongsToSender={
                authInfo.senderId === message.user._id ||
                message.user === "sender"
              }
            />
          </View>
        )}
        onEndReached={() => getChatMessages()}
        onEndReachedThreshold={0.9}
        inverted
        keyExtractor={(item, i) => item._id + i}
      />

      <View
        style={{
          flexDirection: "row",
          minHeight: 48,
          maxHeight: 100,
          alignItems: "center",
          paddingVertical: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "flex-end",
            height: "100%",
          }}
        >
          <View
            style={[
              {
                flexDirection: "row",
                justifyContent: "flex-end",
                alignItems: "flex-end",
                height: "100%",
              },
              !showActions && { width: 0 },
            ]}
          >
            <TouchableOpacity
              style={{
                marginHorizontal: 5,
                width: 48,
                height: 48,
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => pickImage()}
            >
              <FontAwesome name="photo" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                marginHorizontal: 5,
                width: 48,
                height: 48,
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => handleActivateCamera(true)}
            >
              <Ionicons name="camera-outline" size={26} color="black" />
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity
              style={{
                width: 48,
                height: 48,
                marginHorizontal: 10,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 100,
                backgroundColor: themeStyle.colors.secondary.light,
              }}
              onPress={() => setShowActions(!showActions)}
            >
              <Ionicons
                name={showActions ? "close" : "add"}
                size={26}
                color={themeStyle.colors.grayscale.white}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            minHeight: 48,
            height: "100%",
            justifyContent: "flex-end",
          }}
        >
          <TextInput
            style={{
              minHeight: 48,
              backgroundColor: themeStyle.colors.grayscale.superLightGray,
              paddingHorizontal: 10,
            }}
            value={messageBody}
            multiline
            placeholder="Type a message..."
            onChangeText={(v) => setMessageBody(v)}
            scrollEnabled
          />
        </View>
        <View
          style={{
            justifyContent: "flex-end",
            height: "100%",
          }}
        >
          <TouchableOpacity
            style={{
              marginLeft: 10,
              marginRight: 10,
              alignItems: "center",
              justifyContent: "center",
              height: 48,
              width: 48,
              borderRadius: 100,
            }}
            onPress={() => handleMessage()}
          >
            <Ionicons name="send-sharp" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>
      <View
        style={[
          { alignItems: "center", position: "relative" },
          media.uri && { margin: 20 },
          mediaSending && { backgroundColor: "grey" },
        ]}
      >
        {media?.type?.includes("image") ? (
          <Image
            style={{
              borderRadius: 10,
              aspectRatio: 1 / 1,
              width: "100%",
            }}
            resizeMode="contain"
            source={{ uri: media.uri }}
          />
        ) : media?.type?.includes("video") ? (
          <View style={{ width: 200, height: 200 }}>
            <Video
              useNativeControls
              // source={{ uri: media.uri }}
              resizeMode="cover"
              style={{ width: "100%", height: "100%", alignSelf: "center" }}
            />
          </View>
        ) : null}
        {media.uri ? (
          <TouchableOpacity
            onPress={() => {
              setMedia({});
              setShowActions(false);
            }}
            style={{ padding: 10 }}
          >
            <Text style={{ color: themeStyle.colors.error.default }}>
              Cancel
            </Text>
          </TouchableOpacity>
        ) : null}
        {showMediaSizeError ? (
          <Text>
            We can&apos;t send the chosen media file as it exceeds our 50MB
            limit. Please choose a smaller file
          </Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  horizontalLines: {
    flex: 1,
    height: 1,
    backgroundColor: themeStyle.colors.grayscale.lightGray,
  },
});

export default ChatScreen;
