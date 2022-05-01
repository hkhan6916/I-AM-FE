import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StyleSheet,
  Image,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ScrollView,
} from "react-native";
import { getItemAsync } from "expo-secure-store";
import { io } from "socket.io-client";
import * as ImagePicker from "expo-image-picker";
import { Video } from "expo-av";
import { getInfoAsync } from "expo-file-system";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { nanoid } from "nanoid/non-secure";
import apiCall from "../../../helpers/apiCall";
import get12HourTime from "../../../helpers/get12HourTime";
import getNameDate from "../../../helpers/getNameDate";
import themeStyle from "../../../theme.style";
import CameraStandard from "../../../components/CameraStandard";
import MessageContainer from "../../../components/MessageContainer";
import Upload from "react-native-background-upload";
import {
  Video as VideoCompress,
  Image as ImageCompress,
} from "react-native-compressor";
import { getThumbnailAsync } from "expo-video-thumbnails";
const ChatScreen = (props) => {
  const [authInfo, setAuthInfo] = useState(null);
  const [socket, setSocket] = useState(null);
  const [height, setHeight] = useState(1);

  const [media, setMedia] = useState({});
  const [mediaSendFail, setMediaSendFail] = useState(false);
  const [showMediaSizeError, setShowMediaSizeError] = useState(false);
  const [messageBody, setMessageBody] = useState("");
  const [messages, setMessages] = useState([]);
  const [showError, setShowError] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [recording, setRecording] = useState(false);
  const [chat, setChat] = useState(props.route.params.existingChat);
  const [allMessagesLoaded, setAllMessagesLoaded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [recipient, setRecipient] = useState(null);

  const { chatUserId, chatUserFirstName, existingChat } = props.route.params;
  const navigation = useNavigation();

  const { width: screenWidth } = Dimensions.get("window");

  const mediaSize = screenWidth / 1.5;

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
          userId: authInfo?.senderId,
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
      console.log({ response: response[1] });
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

  const initSocket = async (port, token) => {
    const connection = io(`ws://192.168.5.101:${port || 5000}`, {
      // TODO store the connection url securely and then use
      auth: {
        token,
      },
      withCredentials: true,
      transports: ["websocket"],
    });

    setSocket(connection);
  };

  const generateThumbnail = async () => {
    try {
      const { uri } = await getThumbnailAsync(media?.uri, {
        time: 0,
      });
      return uri;
    } catch (e) {
      console.warn(e);
    }
  };

  const handleBackgroundUpload = async (compressedUrl, body, messageId) => {
    const token = await getItemAsync("authToken");
    const url = compressedUrl
      ? Platform.OS == "android"
        ? compressedUrl?.replace("file://", "/")
        : compressedUrl
      : Platform.OS == "android"
      ? media?.uri.replace("file://", "")
      : media?.uri;
    const options = {
      url: "http://192.168.5.101:5000/chat/message/upload",
      path: url, // path to file
      method: "POST",
      type: "multipart",
      maxRetries: 2, // set retry count (Android only). Default 2
      headers: {
        "content-type": "multipart/form-data", // Customize content-type
        Authorization: `Bearer ${token}`,
      },
      parameters: { ...body, _id: messageId },
      field: "file",
      // Below are options only supported on Android
      notification: {
        enabled: false,
      },
      useUtf8Charset: true,
      // customUploadId: post?._id,
    };

    Upload.startUpload(options)
      .then((uploadId) => {
        // console.log("Upload started");
        Upload.addListener("progress", uploadId, (data) => {
          // console.log(`Progress: ${data.progress}%`);
          // console.log(data);
        });
        Upload.addListener("error", uploadId, async (data) => {
          // console.log({ data });
          // console.log(`Error: ${data.error}%`);
          // await apiCall("GET", "/posts/fail/" + post?._id);
        });
        Upload.addListener("cancelled", uploadId, async (data) => {
          // console.log(`Cancelled!`);
          // await apiCall("GET", "/posts/fail/" + post?._id);
        });
        Upload.addListener("completed", uploadId, (data) => {
          // console.log(data);
          // console.log("Completed!");
        });
      })
      .catch((err) => {
        console.log("Upload error!", err);
      });
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
    if (!socket?.connected) return;
    if (media?.uri && media?.type && socket.connected) {
      const formData = new FormData();
      const thumbnailUrl =
        media.type?.split("/")[0] === "video"
          ? await generateThumbnail()
          : null;
      if (thumbnailUrl) {
        formData.append("file", {
          uri: thumbnailUrl,
          name: `mediaThumbnail.${thumbnailUrl.split(".").pop()}`,
          type: `image/${thumbnailUrl.split(".").pop()}`,
        });
      } else if (media.type?.split("/")[0] === "image") {
        formData.append("file", {
          uri: media.uri,
          name: `image.${media.uri.split(".").pop()}`,
          type: `image/${media.uri.split(".").pop()}`,
        });
      }

      const message = {
        body: messageBody,
        chatId,
        senderId: authInfo?.senderId,
        mediaType: media.type?.split("/")[0],
        online: (!!recipient?.online).toString(),
        recipientId: recipient?.userId,
        auth: authInfo?.token,
      };
      Object.keys(message).forEach((key) => {
        formData.append(key, message[key]);
      });
      const { response, success } = await apiCall(
        "POST",
        "/chat/message/upload",
        formData
      );
      if (success) {
        setMessages([
          {
            body: messageBody,
            chatId,
            senderId: authInfo?.senderId,
            user: "sender",
            mediaUrl: "",
            mediaHeaders: {}, // recieved as null if media is video
            mediaType: media.type?.split("/")[0],
            thumbnailUrl:
              media.type?.split("/")[0] === "video" ? thumbnailUrl : null,
            stringTime: get12HourTime(new Date()),
            stringDate: getNameDate(new Date()),
            _id: response._id,
            ready: false,
          },
          ...messages,
        ]);
        setMessageBody("");
        setHeight(0);
        setMedia({});

        if (media.type?.split("/")[0] === "video") {
          await VideoCompress.compress(
            media.uri,
            {
              compressionMethod: "auto",
            },
            (progress) => {
              // console.log({ compression: progress });
            }
          ).then(async (compressedUrl) => {
            await handleBackgroundUpload(
              compressedUrl,
              message,
              response._id
            ).then(() => {
              const mediaType = media.type?.split("/")[0];
              setMessages([
                // update message with id once uploaded full media
                {
                  body: messageBody,
                  chatId,
                  senderId: authInfo?.senderId,
                  user: "sender",
                  mediaUrl: media.uri,
                  thumbnailUrl,
                  mediaHeaders: response.mediaHeaders,
                  mediaType,
                  stringTime: get12HourTime(new Date()),
                  stringDate: getNameDate(new Date()),
                  _id: response._id,
                },
                ...messages,
              ]);
              setMessageBody("");
              setHeight(0);
              setMedia({});
            });
          });
          return;
        }

        if (media.type?.split("/")[0] === "image") {
          await ImageCompress.compress(
            media.uri,
            {
              compressionMethod: "auto",
            },
            (progress) => {
              // console.log({ compression: progress });
            }
          ).then(async (compressedUrl) => {
            await handleBackgroundUpload(
              compressedUrl,
              message,
              response._id
            ).then(() => {
              const mediaType = media.type?.split("/")[0];
              setMessages([
                {
                  body: messageBody,
                  chatId,
                  senderId: authInfo?.senderId,
                  user: "sender",
                  mediaUrl: media.uri,
                  thumbnailUrl,
                  mediaHeaders: {}, // recieved as null if media is video
                  mediaType,
                  stringTime: get12HourTime(new Date()),
                  stringDate: getNameDate(new Date()),
                  _id: response._id,
                },
                ...messages,
              ]);
              setMessageBody("");
              setHeight(0);
              setMedia({});
            });
          });
          return;
        }
      } else {
        console.log("fail");
      }

      return true;
    }

    socket.emit("sendMessage", {
      body: messageBody,
      chatId,
      senderId: authInfo?.senderId,
      online: !!recipient?.online,
      recipientId: recipient?.userId,
    });
    setMessages([
      {
        body: messageBody,
        chatId,
        senderId: authInfo?.senderId,
        user: "sender",
        stringTime: get12HourTime(new Date()),
        stringDate: getNameDate(new Date()),
        _id: nanoid(),
        ready: true,
      },
      ...messages,
    ]);
    setMessageBody("");
    setHeight(0);

    return true;
  };

  const cancelUpload = async (messageId) => {
    const { success, response, message } = await apiCall(
      "GET",
      `/chat/message/cancel/${messageId}`
    );

    // console.log(message);

    if (success) {
      setMessages((messages) => {
        return messages.filter((message) => {
          if (message._id !== messageId) {
            return message;
          }
        });
      });
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

  const renderItem = useCallback(
    (
      { item: message, index: i } // change to be more performant like home and profile screen
    ) => (
      <MessageContainer
        cancelUpload={cancelUpload}
        mediaSize={mediaSize}
        firstMessageDate={
          allMessagesLoaded && i === messages.length - 1
            ? messages[i].stringDate
            : null
        }
        messageDate={
          i !== messages.length - 1 &&
          messages[i + 1] &&
          message.stringDate !== messages[i + 1].stringDate
            ? messages[i].stringDate
            : null
        }
        message={message}
        belongsToSender={
          authInfo?.senderId === message.senderId.toString() ||
          message.user === "sender"
        }
      />
    ),
    [messages, authInfo]
  );
  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      // TODO: remove isMounted and implement better cleanup that works
      (async () => {
        const token = await getItemAsync("authToken");
        const senderId = await getItemAsync("userId");
        setAuthInfo({ token, senderId });

        if (chat) {
          await getChatMessages();
        }

        if (chat?.users?.length) {
          setRecipient({ userId: chat?.users?.[0]._id, online: false });
          navigation.setOptions({
            title: chat?.users?.[0].firstName,
          });
        } else {
          navigation.setOptions({
            title: chatUserFirstName,
          });
        }
        // below needs to be last so we can init all other data before opening a socket connection and having things change due to incoming messages
        await initSocket(null, token);
      })();
    }
    return () => {
      isMounted = false;
    };
  }, [chat]);

  useEffect(() => {
    // TODO: implement navigation listener here to prevent notifications from being received
    let isMounted = true;
    if (socket && isMounted && authInfo) {
      if (chat) {
        socket.emit("joinRoom", {
          chatId: chat?._id,
          userId: authInfo?.senderId,
        });
      }

      socket.on("joinRoomSuccess", async ({ chatId }) => {
        /* This will send the message only if it's the first message */
        if ((messageBody || media?.uri) && !existingChat) {
          await handleMessageSend(chatId);
        }
      });

      socket.on("userJoinedRoom", async ({ userId }) => {
        setRecipient({ userId, online: true });
        navigation.setOptions({
          title: `${chat?.users?.[0].firstName} - online`,
        });
        socket.emit("sendUserOnlineStatus", {
          chatId: chat?._id,
          userId: authInfo?.senderId,
        });
      });

      socket.on("userLeftRoom", async ({ userId }) => {
        setRecipient({ userId, online: false });
        console.log(userId, "left");
        navigation.setOptions({
          title: `${chat?.users?.[0].firstName}`,
        });
      });

      socket.on("receiveUserOnlineStatus", async ({ userId }) => {
        if (userId !== authInfo?.senderId) {
          setRecipient({ userId, online: true });
          navigation.setOptions({
            title: `${chat?.users?.[0].firstName} - online`,
          });
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
          thumbnailUrl,
          thumbnailHeaders,
          mediaType,
          stringDate,
          stringTime,
          _id,
        }) => {
          if (senderId === authInfo.senderId) {
            setMessages((messages) => {
              return messages?.map((message) => {
                if (message.mediaType && message._id === _id) {
                  return {
                    ...message,
                    // mediaHeaders,
                    // mediaUrl,
                    ready: true,
                  };
                } else {
                  return message;
                }
              });
            });
            return;
          }
          if (!socket.connected) {
            setShowError(true);
          } else {
            if (senderId !== authInfo.senderId && !recipient?.online) {
              setRecipient({ userId: user?._id, online: true });
            }

            setMessages((prevMessages) => {
              if (senderId !== authInfo.senderId) {
                if (!prevMessages.find((message) => message._id === _id)) {
                  return [
                    {
                      body,
                      chatId,
                      senderId,
                      user,
                      mediaHeaders,
                      mediaUrl,
                      mediaType,
                      thumbnailUrl,
                      thumbnailHeaders,
                      stringDate,
                      stringTime,
                      _id,
                      ready: true,
                    },
                    ...prevMessages,
                  ];
                } else {
                  return prevMessages;
                }
              }
            });
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
        cameraActive={cameraActive}
        recording={recording}
        setCameraActive={toggleCamera}
        setFile={setMedia}
        setRecording={setRecording}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" && "padding"}
        keyboardVerticalOffset={93}
        style={{ flex: 1 }}
      >
        {/* <TouchableOpacity
          style={{ backgroundColor: "red", margin: 20 }}
          onPress={() => initSocket("5000")}
        >
          <Text style={{ color: "white" }}>5000</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: "green", margin: 20 }}
          onPress={() => initSocket("5001")}
        >
          <Text style={{ color: "white" }}>5001</Text>
        </TouchableOpacity> */}
        {showError ? <Text>An unknown error occurred</Text> : null}
        <FlatList
          data={messages}
          renderItem={renderItem}
          onEndReached={() => getChatMessages()}
          onEndReachedThreshold={0.9}
          inverted
          keyExtractor={(item, i) => item._id + i}
        />

        <View
          style={{
            flexDirection: "row",
            height: Math.max(height, 70),
            // maxHeight: 100,
            alignItems: "flex-end",
            paddingVertical: 10,
          }}
        >
          <View
            style={[
              {
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "center",
                height: "100%",
              },
            ]}
          >
            <TouchableOpacity
              style={[
                {
                  marginHorizontal: 5,
                  width: 48,
                  height: 48,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: themeStyle.colors.secondary.default,
                  borderRadius: 50,
                  marginBottom: 5,
                },
                !showActions && { display: "none" },
              ]}
              onPress={() => pickImage()}
            >
              <FontAwesome
                name="photo"
                size={24}
                color={themeStyle.colors.grayscale.lowest}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                {
                  marginHorizontal: 5,
                  width: 48,
                  height: 48,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: themeStyle.colors.secondary.default,
                  borderRadius: 50,
                  marginBottom: 5,
                },
                !showActions && { display: "none" },
              ]}
              onPress={() => handleActivateCamera(true)}
            >
              <Ionicons
                name="camera-outline"
                size={26}
                color={themeStyle.colors.grayscale.lowest}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: 48,
                height: 48,
                marginHorizontal: 10,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 100,
                backgroundColor: themeStyle.colors.secondary.default,
              }}
              onPress={() => setShowActions(!showActions)}
            >
              <Ionicons
                name={showActions ? "close" : "add"}
                size={26}
                color={themeStyle.colors.grayscale.lowest}
              />
            </TouchableOpacity>
          </View>
          {/* <View
            style={{
              flex: 1,
              height: 48,
              // height: "100%",
              justifyContent: "center",
              backgroundColor: themeStyle.colors.grayscale.high,
            }}
          >
            <TextInput
              style={{
                color: themeStyle.colors.grayscale.lowest,
                backgroundColor: themeStyle.colors.grayscale.high,
                paddingHorizontal: 10,
                height: height,
              }}
              value={messageBody}
              placeholderTextColor={themeStyle.colors.grayscale.lower}
              multiline
              placeholder="Type a message..."
              onChangeText={(v) => setMessageBody(v)}
              scrollEnabled
              onContentSizeChange={(event) => {
                setHeight(
                  event.nativeEvent.contentSize.height < 150
                    ? event.nativeEvent.contentSize.height
                    : 150
                );
              }}
            />
          </View> */}
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 10,
              backgroundColor: themeStyle.colors.grayscale.higher,
              borderWidth: 0.5,
              borderColor: themeStyle.colors.grayscale.low,
              borderRadius: 5,
              flex: 1,
            }}
          >
            <ScrollView scrollEnabled={height > 48}>
              <TextInput
                maxLength={2000}
                style={[
                  {
                    paddingVertical: 10,
                    color: themeStyle.colors.grayscale.lowest,
                  },
                  {
                    height: height < 48 ? 48 : height,
                    paddingTop: height < 48 ? 0 : 10,
                    paddingBottom: height < 48 ? 0 : 10,
                  },
                ]}
                value={messageBody}
                placeholderTextColor={themeStyle.colors.grayscale.lower}
                multiline
                placeholder="Type a message..."
                onChangeText={(v) => setMessageBody(v)}
                scrollEnabled
                onContentSizeChange={(event) => {
                  setHeight(
                    event.nativeEvent.contentSize.height < 150
                      ? event.nativeEvent.contentSize.height
                      : 150
                  );
                }}
              />
            </ScrollView>
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
              }}
              disabled={(!media?.uri || !media.type) && !messageBody}
              onPress={() => handleMessage()}
            >
              <Ionicons
                name="send-sharp"
                size={24}
                color={themeStyle.colors.grayscale.lowest}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={[
            { alignItems: "center", position: "relative" },
            media.uri && { margin: 20 },
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
                source={{ uri: media.uri }}
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
            <Text>Please send a file smaller than 50MB.</Text>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  horizontalLines: {
    flex: 1,
    height: 1,
    backgroundColor: themeStyle.colors.grayscale.low,
  },
});

export default ChatScreen;
