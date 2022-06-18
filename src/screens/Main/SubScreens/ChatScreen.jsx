import React, { useCallback, useEffect, useRef, useState } from "react";
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
  Alert,
  ActivityIndicator,
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

import {
  Video as VideoCompress,
  Image as ImageCompress,
} from "react-native-compressor";
import { getThumbnailAsync } from "expo-video-thumbnails";
import openAppSettings from "../../../helpers/openAppSettings";
import backgroundUpload from "../../../helpers/backgroundUpload";
import { gestureHandlerRootHOC } from "react-native-gesture-handler";

import {
  DataProvider,
  LayoutProvider,
  RecyclerListView,
} from "recyclerlistview";

const ChatScreen = (props) => {
  const [authInfo, setAuthInfo] = useState(null);
  const [socket, setSocket] = useState(null);
  const [height, setHeight] = useState(1);

  const [media, setMedia] = useState({});
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
  const [userIsBlocked, setUserIsBlocked] = useState(false);
  const [userHasBlocked, setUserHasBlocked] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

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
  const apiUrl = __DEV__
    ? "ws://192.168.5.101:5000"
    : "wss://magnet-be.herokuapp.com";
  const initSocket = async (port, token) => {
    const connection = io(`${apiUrl}`, {
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

  const handleBackgroundUpload = async (
    compressedUrl,
    message,
    messageId,
    mediaType
  ) => {
    const filePath = compressedUrl
      ? Platform.OS == "android"
        ? compressedUrl?.replace("file://", "/")
        : compressedUrl
      : Platform.OS == "android"
      ? media?.uri.replace("file://", "")
      : media?.uri;

    const { response: signedResponse, success: signedSuccess } = await apiCall(
      "POST",
      "/files/signed-upload-url",
      { filename: `media.${filePath.split(".").pop()}` }
    );
    if (!signedSuccess) {
      setShowError(true);
      return;
    }

    const token = await getItemAsync("authToken");

    await backgroundUpload({
      filePath,
      url: signedResponse.signedUrl,
      disableLogs: true,
    });

    // if we have video add the id for message as a thumbnail would have already been sent and message would already exist
    const extraFields =
      mediaType === "video"
        ? {
            _id: messageId,
          }
        : {};

    const { success } = await apiCall("POST", "/chat/message/upload", {
      mediaKey: signedResponse.fileKey,
      auth: token,
      ...message,
      ...extraFields,
    });

    return success;
  };

  const handleMessage = async () => {
    /* If first message, first create chat. The actual message will be sent on
    the joinRoomSuccess event. */
    if (socket?.connected && !messages.length && !existingChat) {
      setCreatingChat(true);
      await createChat();
      setCreatingChat(false);
      return;
    }

    // Not the first message, emit the message as standard
    if (socket?.connected && chat?._id) {
      await handleMessageSend(chat._id);
    }
  };

  const handleMessageSend = async (chatId) => {
    if (media?.uri && media?.type && socket?.connected) {
      const message = {
        body: messageBody,
        chatId,
        senderId: authInfo?.senderId,
        mediaType: media.type?.split("/")[0],
        online: (!!recipient?.online).toString(), // TODO: change to boolean instead of string here and in BE
        recipientId: recipient?.userId,
        auth: authInfo?.token,
      };

      const mediaType = media.type?.split("/")[0];

      if (mediaType === "image") {
        await ImageCompress.compress(
          media.uri,
          {
            compressionMethod: "auto",
          },
          (progress) => {
            // console.log({ compression: progress });
          }
        ).then(async (compressedUrl) => {
          const tempId = nanoid();
          await handleBackgroundUpload(
            compressedUrl,
            { ...message, tempId },
            null,
            mediaType
          ).then(() => {
            const mediaType = media.type?.split("/")[0];
            if (socket) {
              setMessages([
                {
                  body: messageBody,
                  chatId,
                  senderId: authInfo?.senderId,
                  user: "sender",
                  mediaUrl: media.uri,
                  mediaHeaders: {}, // recieved as null if media is video
                  mediaType,
                  stringTime: get12HourTime(new Date()),
                  stringDate: getNameDate(new Date()),
                  tempId,
                  _id: tempId, // Incase we use _id anywhere, we need a unique field
                  ready: false,
                },
                ...messages,
              ]);
              setMessageBody("");
              setHeight(0);
              setMedia({});
            }
          });
        });
        return;
      }

      let postData = {};
      const thumbnailUrl =
        media.type?.split("/")[0] === "video"
          ? await generateThumbnail()
          : null;
      if (thumbnailUrl) {
        const { response, success } = await apiCall(
          "POST",
          "/files/signed-upload-url",
          { filename: `mediaThumbnail.${thumbnailUrl.split(".").pop()}` }
        );
        if (!success) {
          setShowError(true);
          return;
        }
        // upload thumbnail
        await backgroundUpload({
          filePath:
            Platform.OS == "android"
              ? thumbnailUrl.replace("file://", "")
              : thumbnailUrl,
          url: response.signedUrl,
          disableLogs: true,
        });

        postData.thumbnailKey = response.fileKey; // This is the thumbnail. We send this to backend which saves it as the thumbnailkey for this message
      }
      // else if (media.type?.split("/")[0] === "image") {
      //   // We add image here and upload but also in background upload below? WHY? need to test this
      //   postData.append("file", {
      //     uri: media.uri,
      //     name: `image.${media.uri.split(".").pop()}`,
      //     type: `image/${media.uri.split(".").pop()}`,
      //   });
      // }

      postData = { ...postData, ...message };

      setSendingMessage(true);
      const { response, success } = await apiCall(
        "POST",
        "/chat/message/upload",
        postData
      );
      setSendingMessage(false);

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
        const mediaType = media.type?.split("/")[0];

        if (mediaType === "video") {
          await VideoCompress.compress(
            media.uri,
            {
              compressionMethod: "auto",
              // getCancellationId: (cancellationId) =>
              //   (cancelId = cancellationId),
            },
            (progress) => {
              // console.log({ videocompression: progress });
            }
          ).then(async (compressedUrl) => {
            await handleBackgroundUpload(
              compressedUrl,
              message,
              response._id,
              mediaType
            ).then((success) => {
              if (!success) {
                setShowError(true);
              }
              if (socket) {
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
              }
            });
          });
          return;
        }
      } else {
        console.log("Failed to upload message media");
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
    // if (media.type?.split("/")[0] === "video" && cancelId) {
    //   VideoCompress.cancelCompression(cancelId);
    // }

    // if (media.type?.split("/")[0] === "image" && cancelId) {
    //   ImageCompress.cancelCompression(cancelId);
    // }

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
    setShowMediaSizeError(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Unable access camera roll",
        "Please enable storage permissions to post media files.",
        [
          {
            text: "Cancel",
          },
          {
            text: "Settings",
            onPress: () => openAppSettings(),
          },
        ]
      );
    }

    if (status === "granted") {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 0.3,
      });
      if (!result.cancelled) {
        const mediaInfo = await getInfoAsync(result.uri);
        const mediaSizeInMb = mediaInfo.size / 1000000;
        setShowActions(false);
        if (mediaSizeInMb > 50) {
          setShowMediaSizeError(true);
          setMedia(result);
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

  const rowRenderer = useCallback(
    (_, item, i) => (
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
          item.stringDate !== messages[i + 1].stringDate
            ? messages[i].stringDate
            : null
        }
        message={item}
        belongsToSender={
          authInfo?.senderId === item.senderId.toString() ||
          item.user === "sender"
        }
      />
    ),
    [messages, authInfo]
  );

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

  const layoutProvider = useRef(
    new LayoutProvider(
      () => 0,
      (_, dim) => {
        dim.height = 60;
        dim.width = screenWidth;
      }
    )
  ).current;

  let dataProvider = new DataProvider((r1, r2) => {
    return (
      r1._id !== r2._id || r1.mediaUrl !== r2.mediaUrl || r1.ready !== r2.ready
    );
  }).cloneWithRows(messages);

  useEffect(() => {
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

    return () => {};
  }, [chat]);

  useEffect(() => {
    let isMounted = true;
    if (socket && isMounted && authInfo) {
      if (chat) {
        socket.emit("joinRoom", {
          chatId: chat?._id,
          userId: authInfo?.senderId,
        });
      }

      socket.on("userIsBlocked", () => {
        setUserIsBlocked(true);
      });

      socket.on("userHasBlocked", () => {
        setUserHasBlocked(true);
      });
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
        // console.log(userId, "left");
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
          tempId,
        }) => {
          if (senderId === authInfo.senderId) {
            setMessages((messages) => {
              return messages?.map((message) => {
                if (
                  message.mediaType &&
                  (message._id === _id || message.tempId === tempId)
                ) {
                  return {
                    ...message,
                    // mediaHeaders,
                    // mediaUrl,
                    ready: true,
                    _id,
                  };
                } else {
                  return message;
                }
              });
            });
            return;
          }
          if (!socket?.connected) {
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
        socket.off("joinRoomSuccess");
        socket.off("userIsBlocked");
        socket.off("userHasBlocked");
        socket.off("userJoinedRoom");
        socket.off("userLeftRoom");
        socket.off("receiveUserOnlineStatus");
        setSocket(null);
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
        {showError ? (
          <Text style={{ color: themeStyle.colors.grayscale.lowest }}>
            An unknown error occurred
          </Text>
        ) : null}

        {messages.length ? (
          <RecyclerListView
            style={{ minHeight: 1, minWidth: 1, transform: [{ scaleY: -1 }] }}
            rowRenderer={rowRenderer}
            dataProvider={dataProvider}
            onEndReached={() => getChatMessages()}
            layoutProvider={layoutProvider}
            onEndReachedThreshold={0.5}
            forceNonDeterministicRendering
          />
        ) : null}
        {userIsBlocked ? (
          <Text
            style={{
              textAlign: "center",
              color: themeStyle.colors.grayscale.lowest,
              marginHorizontal: 10,
            }}
          >
            This user has blocked you.
          </Text>
        ) : userHasBlocked ? (
          <Text
            style={{
              textAlign: "center",
              color: themeStyle.colors.grayscale.lowest,
              marginHorizontal: 10,
            }}
          >
            You have blocked this user. Unblock them to send a message.
          </Text>
        ) : null}
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
                  backgroundColor: "rgba(140, 140, 140, 0.3)",
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
                  backgroundColor: "rgba(140, 140, 140, 0.3)",
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
                backgroundColor: "rgba(140, 140, 140, 0.3)",
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
              opacity: userHasBlocked || userIsBlocked ? 0.3 : 1,
            }}
          >
            <ScrollView scrollEnabled={height > 48}>
              <View
                style={[
                  {
                    justifyContent: "center",
                    color: themeStyle.colors.grayscale.lowest,
                  },
                  {
                    height: height < 48 ? 48 : height,
                    paddingTop: height < 48 ? 0 : 10,
                    paddingBottom: height < 48 ? 0 : 10,
                  },
                ]}
              >
                <TextInput
                  maxLength={2000}
                  style={[
                    {
                      color: themeStyle.colors.grayscale.lowest,
                    },
                    {
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
                  editable={!userHasBlocked && !userIsBlocked}
                  onContentSizeChange={(event) => {
                    setHeight(
                      event.nativeEvent.contentSize.height < 150
                        ? event.nativeEvent.contentSize.height
                        : 150
                    );
                  }}
                />
              </View>
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
                opacity:
                  ((!media?.uri || !media.type) && !messageBody) ||
                  userIsBlocked
                    ? 0.5
                    : 1,
              }}
              disabled={
                ((!media?.uri || !media.type) && !messageBody) ||
                userIsBlocked ||
                creatingChat ||
                sendingMessage
              }
              onPress={() => handleMessage()}
            >
              {!creatingChat && !sendingMessage ? (
                <Ionicons
                  name="send-sharp"
                  size={24}
                  color={themeStyle.colors.grayscale.lowest}
                />
              ) : (
                <ActivityIndicator animating size="small" />
              )}
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
                // width: "100%",
                // width: "100%",
                height: screenWidth,
                backgroundColor: themeStyle.colors.black,
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

export default gestureHandlerRootHOC(ChatScreen);
