import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ScrollView,
  Alert,
  ActivityIndicator,
  FlatList,
  Keyboard,
  Button,
} from "react-native";
import { getItemAsync } from "expo-secure-store";
import { io } from "socket.io-client";
import * as ImagePicker from "expo-image-picker";
import { Video } from "expo-av";
import { getInfoAsync } from "expo-file-system";
import { useNavigation } from "@react-navigation/native";
import {
  Feather,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { nanoid } from "nanoid/non-secure";
import apiCall from "../../../helpers/apiCall";
import get12HourTime from "../../../helpers/get12HourTime";
import getNameDate from "../../../helpers/getNameDate";
import themeStyle from "../../../theme.style";
import CameraStandard from "../../../components/CameraStandard";
import MessageContainer from "../../../components/MessageContainer";
import Constants from "expo-constants";
import { Image as ImageCompress } from "react-native-compressor";
import { getThumbnailAsync } from "expo-video-thumbnails";
import openAppSettings from "../../../helpers/openAppSettings";
import backgroundUpload from "../../../helpers/backgroundUpload";
import { gestureHandlerRootHOC } from "react-native-gesture-handler";
import {
  DataProvider,
  LayoutProvider,
  RecyclerListView,
} from "recyclerlistview";
import usePersistedWebParams from "../../../helpers/hooks/usePersistedWebParams";
import { convertAndEncodeVideo } from "../../../helpers/convertAndEncodeVideo";
import { FFmpegKit } from "ffmpeg-kit-react-native";
import { useSelector } from "react-redux";
import getVideoCodecName from "../../../helpers/getVideoCodecName";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import queue, { Worker } from "react-native-job-queue";

const ChatScreen = (props) => {
  const [authInfo, setAuthInfo] = useState(null);
  const [socket, setSocket] = useState(null);
  const [height, setHeight] = useState(1);

  const [media, setMedia] = useState({});
  const [messageBody, setMessageBody] = useState("");
  const [messages, setMessages] = useState([]);
  const [showError, setShowError] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [recording, setRecording] = useState(false);
  const [chat, setChat] = useState(null);
  const [existingChat, setExistingChat] = useState(null);
  const [chatUserId, setChatUserId] = useState(null);
  const [chatUserFirstName, setChatUserFirstName] = useState(null);
  const [allMessagesLoaded, setAllMessagesLoaded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [recipient, setRecipient] = useState(null);
  const [userIsBlocked, setUserIsBlocked] = useState(false);
  const [userHasBlocked, setUserHasBlocked] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [thumbnail, setThumbnail] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const [compressionProgress, setCompressionProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [processedVideoUri, setProcessedVideoUri] = useState("");
  const [processingFile, setProcessingFile] = useState(false);
  const [selectedMediaType, setSelectedMediaType] = useState(false);
  const [showImageOrVideoOption, setShowImageOrVideoOption] = useState(false);
  const [error, setError] = useState("");
  const [keyboardIsShown, setKeyboardIsShown] = useState(false);

  const [port, setPort] = useState("5000");

  const inputRef = useRef();
  const offset = useSharedValue(0);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      height: offset.value,
      opacity: offset.value ? 1 : 0,
    };
  });

  const isLowendDevice = useSelector((state) => state.isLowEndDevice)?.state;

  const routeParamsObj = props.route.params;
  const persistedParams = usePersistedWebParams(routeParamsObj);

  // if route params has values then return it else null
  const params =
    routeParamsObj[Object.keys(routeParamsObj)[0]] !== "[object Object]"
      ? routeParamsObj
      : null;

  const navigation = useNavigation();

  const { width: screenWidth } = Dimensions.get("window");

  const mediaSize = screenWidth / 1.5;

  queue.configure({
    onQueueFinish: (executedJobs) => {
      console.log("Queue stopped and executed", executedJobs);
    },
    concurrency: 1,
  });

  const uploadVideo = async ({ payload, messagesArr }) => {
    const signedResponse = payload?.signedResponse;
    const media = payload?.media;
    const thumbnailUrl = await generateThumbnail(media.uri, media.duration);

    if (thumbnailUrl) {
      const newMessages = createUpdatedMessagesArray(
        {
          body: payload.messageBody,
          chatId: payload?.chatId,
          senderId: payload?.authInfo?.senderId,
          user: "sender",
          mediaUrl: media.uri,
          mediaHeaders: {}, // recieved as null if media is video
          mediaType: media.type?.split("/")[0],
          thumbnailUrl,
          stringTime: get12HourTime(new Date()),
          stringDate: getNameDate(new Date()),
          createdAt: new Date(),
          _id: payload?.response?._id,
          ready: false,
          localProcessing: false,
          messages: payload.messages,
        },
        messagesArr
      );
      setMessages(newMessages);
      await backgroundUpload({
        filePath:
          Platform.OS == "android"
            ? thumbnailUrl.replace("file://", "")
            : thumbnailUrl,
        url: signedResponse.signedUrl,
        disableLogs: true,
        failureRoute: `/chat/message/fail/${signedResponse._id}`,
      });

      // This is the thumbnail. We send this to backend which saves it as the thumbnailkey for this message
    } else {
      console.log("No thumbnail found. Cancelling message");
      return;
    }

    const mediaType = media.type?.split("/")[0];

    const convertedCodecAndCompressedUrl =
      Platform.OS === "ios"
        ? processedVideoUri
        : await convertAndEncodeVideo({
            uri: media.uri,
            setProgress: setCompressionProgress,
            videoDuration,
            useFfmpeg: true,
            disableAsync: true,
          });

    const compressedUrl = convertedCodecAndCompressedUrl;
    await handleBackgroundUpload(
      compressedUrl,
      payload.message,
      payload.response._id,
      mediaType
    ).then((success) => {
      if (!success) {
        setShowError(true);
      }

      if (socket) {
        const newMessages = createUpdatedMessagesArray(
          {
            body: payload.messageBody,
            chatId: payload.chatId,
            senderId: authInfo?.senderId,
            user: "sender",
            mediaUrl: media.uri,
            thumbnailUrl: thumbnailUrl,
            mediaHeaders: payload.response.mediaHeaders,
            mediaType,
            stringTime: get12HourTime(new Date()),
            stringDate: getNameDate(new Date()),
            createdAt: new Date(),
            _id: payload.response._id,
          },
          messagesArr
        );

        setMessages(newMessages);
        setHeight(0);
      }
    });
  };

  const setupVideoUploadQueue = async () => {
    let messagesArr = messages;
    const runningJobs = await queue.getJobs();
    const runningWorkers = await queue.registeredWorkers;
    const shouldRefreshWorker =
      (!runningJobs?.length && runningWorkers?.["message_video_upload"]) ||
      !runningWorkers?.["message_video_upload"];

    if (shouldRefreshWorker) {
      queue.removeWorker("message_video_upload", true);
      console.log("KILLING WORKER");
    }

    if (shouldRefreshWorker) {
      queue.addWorker(
        new Worker("message_video_upload", async (payload) => {
          return new Promise((resolve) => {
            setTimeout(async () => {
              await uploadVideo({ messagesArr, payload });

              resolve();
            }, payload.delay || 0);
          });
        })
      );
    }
  };

  const createUpdatedMessagesArray = (newMessage, messagesArg) => {
    const messagesArr = messagesArg || messages;
    const messageExists = messagesArr.find(
      (message) => message?._id === newMessage?._id
    );

    if (messageExists) {
      const newMessagesArr = messagesArr?.filter((message) => {
        if (message._id === newMessage?._id) {
          return { ...message, ...newMessage };
        }
        return message;
      });
      return newMessagesArr;
    }
    return [newMessage, ...messagesArr];
  };

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
    if (chat && existingChat && !allMessagesLoaded) {
      setShowError(false);
      setLoadingMessages(true);
      const { response, success } = await apiCall(
        "GET",
        `/chat/${chat._id}/messages/${messages.length}`
      );
      setLoadingMessages(false);
      if (success) {
        if (messages.length && !response?.length) {
          setAllMessagesLoaded(true);
        } else {
          setMessages([...messages, ...response]);
        }
      } else {
        setShowError(true);
      }
    }
  };
  const apiUrl = Constants.manifest.extra.apiWebSocketUrl;
  const initSocket = async (port, token) => {
    const connection = io(apiUrl, {
      auth: {
        token,
      },
      withCredentials: true,
      transports: ["websocket"],
    });

    setSocket(connection);
  };

  const generateThumbnail = async (videoUri) => {
    try {
      const { uri } = await getThumbnailAsync(videoUri, {
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
        ? compressedUrl?.replace("file://", "")
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

    const token =
      Platform.OS === "web"
        ? localStorage.getItem("authToken")
        : await getItemAsync("authToken");

    await backgroundUpload({
      filePath,
      url: signedResponse.signedUrl,
      failureRoute: `/chat/message/fail/${messageId}`,
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

  /**
   * If image - Compress, get signed url, upload in background and send mediaKey for the file to the backend and mark message as complete which then gets sent to all recepients.
   * If video - Compress, get signed url, generate and upload thumbnail, then send thumbnail key to backend. If success, compress, get signed url and upload video. Then send mediaKey to backend to update the existing message with mediaKey and mark as ready.
   */
  const handleMessageSend = async (chatId) => {
    if (media?.uri && media?.type && socket?.connected) {
      const message = {
        body: messageBody,
        chatId,
        senderId: authInfo?.senderId,
        mediaType: media.type?.split("/")[0],
        online: !!recipient?.online,
        recipientId: recipient?.userId,
        auth: authInfo?.token,
      };

      const mediaType = media.type?.split("/")[0];

      if (mediaType === "image") {
        setSendingMessage(true);
        await ImageCompress.compress(
          media.uri,
          {
            compressionMethod: "auto",
          },
          (progress) => {
            console.log({ compression: progress });
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
              const newMessages = createUpdatedMessagesArray({
                body: messageBody,
                chatId,
                senderId: authInfo?.senderId,
                user: "sender",
                mediaUrl: media.uri,
                mediaHeaders: {}, // received as null if media is video
                mediaType,
                stringTime: get12HourTime(new Date()),
                stringDate: getNameDate(new Date()),
                createdAt: new Date(),
                tempId,
                _id: tempId, // Incase we use _id anywhere, we need a unique field so we pass a temporary id
                ready: true,
              });
              setMessages(newMessages);
              setMessageBody("");
              setHeight(0);
              setMedia({});
            }
          });
        });
        setSendingMessage(false);
        return;
      }
      setSendingMessage(true);

      let postData = {};

      const { response: signedResponse, success: signedSuccess } =
        await apiCall("POST", "/files/signed-upload-url", {
          filename: `mediaThumbnail.jpeg`,
        });
      if (!signedSuccess) {
        setShowError(true);
        return;
      }

      postData.thumbnailKey = signedResponse.fileKey; // This is the thumbnail. We send this to backend which saves it as the thumbnailkey for this message

      postData = { ...postData, ...message };

      const { response, success } = await apiCall(
        "POST",
        "/chat/message/upload",
        postData
      );
      setSendingMessage(false);

      if (success) {
        const newMessages = createUpdatedMessagesArray({
          body: messageBody,
          chatId,
          senderId: authInfo?.senderId,
          user: "sender",
          mediaUrl: media.uri,
          mediaHeaders: {}, // recieved as null if media is video
          mediaType: media.type?.split("/")[0],
          stringTime: get12HourTime(new Date()),
          stringDate: getNameDate(new Date()),
          createdAt: new Date(),
          _id: response._id,
          ready: false,
          localProcessing: true,
        });

        setMessages(newMessages);
        setMessageBody("");
        setHeight(0);
        setMedia({});
        setSendingMessage(false);
        if (Platform.OS === "android") {
          queue.addJob("message_video_upload", {
            messageBody,
            authInfo,
            media,
            recipient,
            chatId: chat?._id,
            processedVideoUri,
            response,
            signedResponse,
            messages,
          });
        } else {
          await uploadVideo({
            messagesArr: messages,
            payload: {
              messageBody,
              authInfo,
              media,
              recipient,
              chatId: chat?._id,
              processedVideoUri,
              response,
              signedResponse,
              messages,
            },
          });
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
    const newMessages = createUpdatedMessagesArray({
      body: messageBody,
      chatId,
      senderId: authInfo?.senderId,
      user: "sender",
      stringTime: get12HourTime(new Date()),
      stringDate: getNameDate(new Date()),
      createdAt: new Date(),
      _id: nanoid(),
      ready: true,
    });

    setMessages(newMessages);
    setMessageBody("");
    setHeight(0);

    return true;
  };

  const cancelUpload = async (messageId) => {
    const { success } = await apiCall(
      "GET",
      `/chat/message/cancel/${messageId}`
    );

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

  const openOSCamera = async () => {
    ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
    }).then(async (file) => {
      await handleFile({ result: file, fileSelectionMethod: "camera" });
    });
  };

  const handleFile = async ({
    result,
    type: typeArg,
    fileSelectionMethod = "files",
  }) => {
    const mediaType = result.assets[0].type.split("/")[0];

    const type = typeArg || mediaType;
    setThumbnail("");
    const mediaInfo = await getInfoAsync(result.assets[0].uri);
    const mediaSizeInMb = mediaInfo.size / 1000000;
    if (mediaSizeInMb > (isLowendDevice ? 50 : 100)) {
      Alert.alert(
        `Sorry, this ${type} is too large.`,
        `Please choose a file that does not exceed ${
          isLowendDevice ? 50 : 100
        }MB in size.`,
        [
          {
            text: "Cancel",
          },
          {
            text: `Open ${fileSelectionMethod}`,
            onPress: () =>
              fileSelectionMethod === "files"
                ? pickMedia(type)
                : openOSCamera(),
          },
        ]
      );
      setLoading(false);
      return;
    }
    setShowActions(false);
    offset.value = withTiming(0, { duration: 100 });

    setProcessingFile(Platform.OS === "ios" && mediaType === "video");
    setProcessedVideoUri("");
    setCompressionProgress(0);
    setSelectedMediaType("");
    const encoding = await getVideoCodecName(mediaInfo.uri);
    const unsupportedCodec =
      encoding === "hevc" || encoding === "h265" || !encoding;
    if (unsupportedCodec && Platform.OS === "android") {
      Alert.alert(
        "Sorry, this video is unsupported.",
        `Please choose another ${type}.`,
        [
          {
            text: "Cancel",
          },
          {
            text: `Open ${fileSelectionMethod}`,
            onPress: () =>
              fileSelectionMethod === "files"
                ? pickMedia(type)
                : openOSCamera(),
          },
        ]
      );
      return;
    }
    setSelectedMediaType(mediaType);
    setMedia({ ...result.assets[0], ...mediaInfo });

    if (mediaType === "video") {
      // const thumbnailUri = await generateThumbnail(
      //   result.assets[0].uri,
      //   result.assets[0].duration
      // );
      // console.log({ thumbnailUri });
      // setThumbnail(thumbnailUri);
      setVideoDuration(result.assets[0].duration);
      if (Platform.OS === "ios") {
        await convertAndEncodeVideo({
          uri: result.assets[0].uri,
          setProgress: setCompressionProgress,
          videoDuration: result.assets[0].duration,
          setProcessedVideoUri,
          setIsRunning: setProcessingFile,
          setError, // need to use this somewhere
        });
      }
    }
  };

  const pickMedia = async (type = "image") => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Unable to access camera roll",
        "Please enable storage permissions to post media from your local files.",
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
        quality: 0.3,
        allowsMultipleSelection: false,
        selectionLimit: 1,
        allowsEditing:
          (Platform.OS === "ios" && type === "video") ||
          Platform.OS === "android",
        mediaTypes:
          type === "image"
            ? ImagePicker.MediaTypeOptions.Images
            : ImagePicker.MediaTypeOptions.Videos,
        videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
      });
      if (!result.canceled) {
        await handleFile({ result, type, fileSelectionMethod: "files" });
      }
    }
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
      r1._id !== r2._id ||
      r1.mediaUrl !== r2.mediaUrl ||
      r1.ready !== r2.ready ||
      r1.localProcessing !== r2.localProcessing ||
      r1.thumbnailUrl !== r2.thumbnailUrl
    );
  }).cloneWithRows(messages);

  useEffect(
    () => {
      // TODO: remove isMounted and implement better cleanup that works
      (async () => {
        const token =
          Platform.OS === "web"
            ? localStorage.getItem("authToken")
            : await getItemAsync("authToken");
        const senderId =
          Platform.OS === "web"
            ? localStorage.getItem("userId")
            : await getItemAsync("userId");
        setAuthInfo({ token, senderId });

        if (chat) {
          setLoading(true);
          await getChatMessages();
          setLoading(false);
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
        await initSocket(port, token);
      })();

      return () => {};
    },
    [chat, params, persistedParams] //[chat, port]
  );

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
            if (mediaType !== "video") return;
            setMessages((messages) => {
              return messages?.map((message) => {
                if (
                  message.mediaType &&
                  (message._id === _id ||
                    (message.tempId && message.tempId === tempId))
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
      }
    };
  }, [socket, authInfo, chat]);
  useEffect(() => {
    if (!existingChat) {
      const { existingChat: existing } = params || persistedParams;
      setExistingChat(existing);
      setChat(existing);
    }
    if (!chatUserFirstName || !chatUserId) {
      const { chatUserId: userId, chatUserFirstName: firstName } =
        params || persistedParams;
      setChatUserId(userId);
      setChatUserFirstName(firstName);
    }
    return () => {
      setMedia({});
      setSocket(null);
    };
  }, [persistedParams]);

  useEffect(() => {
    (async () => await setupVideoUploadQueue())();
    Keyboard.addListener(
      Platform.OS === "android" ? "keyboardDidShow" : "keyboardWillShow",
      (e) => {
        setKeyboardIsShown(true);
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    Keyboard.addListener(
      Platform.OS === "android" ? "keyboardDidHide" : "keyboardWillHide",
      () => {
        setKeyboardIsShown(false);
      }
    );
    // return () => {
    //   Keyboard.removeAllListeners(
    //     Platform.OS === "android" ? "keyboardDidShow" : "keyboardWillShow"
    //   );
    //   Keyboard.removeAllListeners(
    //     Platform.OS === "android" ? "keyboardDidHide" : "keyboardWillHide"
    //   );
    // };
  }, []);

  if (loading) {
    return (
      <View
        style={{ flex: 1, justifyContent: "flex-start", alignItems: "center" }}
      >
        <ActivityIndicator animating size="small" />
      </View>
    );
  }

  if (cameraActive) {
    return (
      <CameraStandard
        cameraActive={cameraActive}
        recording={recording}
        setCameraActive={toggleCamera}
        setFile={async (file) => {
          setMedia(file);
          setShowActions(false);
          offset.value = withTiming(0, { duration: 100 });

          await FFmpegKit.cancel();
          const mediaType = file.type?.split("/")[0];
          setProcessingFile(Platform.OS === "ios" && mediaType === "video");
          setThumbnail("");
          setCompressionProgress(0);
          setSelectedMediaType("");
          setProcessedVideoUri("");
          const mediaInfo = await getInfoAsync(file.uri);
          const mediaSizeInMb = mediaInfo.size / 1000000;
          if (mediaSizeInMb > (isLowendDevice ? 50 : 100)) {
            Alert.alert(
              `Sorry, this ${mediaType} is too large.`,
              `Please choose a file that does not exceed ${
                isLowendDevice ? 50 : 100
              }MB in size.`,
              [
                {
                  text: "Cancel",
                },
              ]
            );
            setLoading(false);
            return;
          }
          setSelectedMediaType(mediaType);
          setMedia({ ...file, ...mediaInfo });

          if (mediaType === "video") {
            const thumbnailUri = await generateThumbnail(
              file.uri,
              file.media.duration
            );
            setThumbnail(thumbnailUri);
            setVideoDuration((file.media.duration || 0) * 1000);
            if (Platform.OS === "ios") {
              await convertAndEncodeVideo({
                uri: file.uri,
                setProgress: setCompressionProgress,
                videoDuration: (file.media.duration || 0) * 1000,
                setProcessedVideoUri,
                setIsRunning: setProcessingFile,
                setError,
              });
            }
          }
        }}
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
          onPress={() => setPort("5000")}
        >
          <Text style={{ color: "white" }}>5000</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: "green", margin: 20 }}
          onPress={() => setPort("5001")}
        >
          <Text style={{ color: "white" }}>5001</Text>
        </TouchableOpacity> */}
        <ActivityIndicator
          size="small"
          animating={loadingMessages}
          color={themeStyle.colors.secondary.default}
        />
        {messages.length && Platform.OS !== "web" ? (
          <RecyclerListView
            style={{ minHeight: 1, minWidth: 1, transform: [{ scaleY: -1 }] }}
            rowRenderer={rowRenderer}
            dataProvider={dataProvider}
            onEndReached={() => getChatMessages()}
            layoutProvider={layoutProvider}
            onEndReachedThreshold={0.5}
            forceNonDeterministicRendering
          />
        ) : messages.length && Platform.OS === "web" ? (
          <FlatList
            data={messages}
            onEndReached={() => getChatMessages()}
            onEndReachedThreshold={0.9}
            inverted
            disableVirtualization={true}
            keyExtractor={(item, i) => item._id + i}
            style={{ flex: 1 }}
            renderItem={({ item, i }) => (
              <View
                style={{
                  width: "100%",
                  maxWidth: 900,
                  alignSelf: "center",
                }}
              >
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
                  isWeb={Platform.OS === "web"}
                />
              </View>
            )}
          />
        ) : (
          <View style={{ flex: 1 }} />
        )}
        {showError ? (
          <Text
            style={{
              color: themeStyle.colors.error.default,
              textAlign: "center",
            }}
          >
            Something has gone wrong... {"\n"}Please try again later.
          </Text>
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
            You have blocked this user.
          </Text>
        ) : null}
        {Platform.OS !== "web" ? (
          <View
            style={{
              flexDirection: "row",
              height: Math.max(height, 70),
              // maxHeight: 100,
              alignItems: "flex-end",
              paddingVertical: 10,
              justifyContent: "center",
            }}
          >
            {Platform.OS !== "web" ? (
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
                onPress={() => {
                  const showActionsState = !showActions;
                  if (showActionsState) {
                    Keyboard.dismiss();
                    offset.value = withTiming(keyboardHeight || 300, {
                      duration: 300,
                    });
                  } else {
                    offset.value = withTiming(0, { duration: 100 });
                    setTimeout(() => {
                      inputRef?.current?.focus();
                    }, 150);
                  }
                  setShowActions(!showActions);
                }}
              >
                <Ionicons
                  name={showActions ? "close" : "add"}
                  size={26}
                  color={themeStyle.colors.grayscale.lowest}
                />
              </TouchableOpacity>
            ) : null}
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
                maxWidth: 900,
                alignSelf: "center",
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
                    ref={inputRef}
                    onFocus={() => {
                      setShowActions(false);
                      offset.value = withTiming(0, { duration: 100 });
                    }}
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
                    userIsBlocked ||
                    processingFile
                      ? 0.5
                      : 1,
                }}
                disabled={
                  !!(
                    ((!media?.uri || !media.type) && !messageBody) ||
                    userIsBlocked ||
                    creatingChat ||
                    sendingMessage ||
                    processingFile
                  )
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
        ) : null}

        <View
          style={[
            {
              alignItems: "center",
              position: "relative",
              backgroundColor: themeStyle.colors.grayscale.transparentHighest50,
              borderRadius: 10,
              width: "90%",
              alignSelf: "center",
              marginVertical: 10,
            },
            media.uri && { margin: 20 },
          ]}
        >
          {media.uri ? (
            <>
              {compressionProgress && selectedMediaType === "video" ? (
                <View style={{ width: "95%", alignSelf: "center", padding: 5 }}>
                  {processingFile ? (
                    <Text
                      style={{
                        color: themeStyle.colors.grayscale.lowest,
                        textAlign: "center",
                        fontWeight: "700",
                      }}
                    >
                      {`Processing - ${Math.min(compressionProgress, 90)}%`}
                    </Text>
                  ) : (
                    <Text
                      style={{
                        color: themeStyle.colors.grayscale.lowest,
                        textAlign: "center",
                        fontWeight: "700",
                      }}
                    >
                      Ready
                    </Text>
                  )}
                  <View
                    style={{
                      width: `${compressionProgress || 100}%`,
                      height: 5,
                      backgroundColor: themeStyle.colors.secondary.default,
                      borderRadius: 5,
                    }}
                  />
                </View>
              ) : null}
              <TouchableOpacity
                onPress={() => {
                  setShowActions(false);
                  offset.value = withTiming(0, { duration: 100 });
                  Keyboard.dismiss();
                }}
                style={{
                  padding: 10,
                  alignSelf: "flex-end",
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                {keyboardIsShown || showActions ? (
                  <Text
                    style={{
                      textAlign: "center",
                      color: themeStyle.colors.grayscale.lowest,
                      fontWeight: "700",
                    }}
                  >
                    {media?.type?.includes("image") ? "Image" : "Video"}
                  </Text>
                ) : (
                  <View />
                )}
                <Ionicons
                  name="close"
                  color={themeStyle.colors.grayscale.lowest}
                  size={30}
                  onPress={() => {
                    setMedia({});
                  }}
                />
              </TouchableOpacity>
            </>
          ) : null}
          {media.uri &&
          (keyboardIsShown ||
            showActions ||
            offset.value) ? null : media?.type?.includes("image") ? (
            <View
              style={{
                height: 200,
                alignItems: "center",
                padding: 5,
                aspectRatio: 1,
              }}
            >
              <Image
                resizeMode="contain"
                source={{ uri: media.uri }}
                aspectRatio={1 / 1}
                style={{
                  height: "100%",
                  backgroundColor: themeStyle.colors.black,
                }}
              />
            </View>
          ) : media?.type?.includes("video") ? (
            <View style={{ aspectRatio: 1, height: 200 }}>
              <Video
                useNativeControls
                source={{ uri: media.uri }}
                resizeMode="cover"
                style={{ width: "100%", height: "100%", alignSelf: "center" }}
              />
            </View>
          ) : null}
        </View>
        <Animated.View
          style={[
            {
              backgroundColor: "rgba(19, 130, 148, 1)",
              width: screenWidth - 20,
              alignSelf: "center",
              borderRadius: 10,
            },
            animatedStyles,
          ]}
        >
          <View style={{ marginVertical: 20, paddingHorizontal: 10 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginHorizontal: 10,
                marginBottom: 30,
              }}
            >
              <TouchableOpacity
                onPress={() => pickMedia("image")}
                style={{ alignItems: "center", flexDirection: "row" }}
              >
                <View
                  style={{
                    backgroundColor:
                      themeStyle.colors.grayscale.transparentHighest50,
                    height: 48,
                    width: 48,
                    borderRadius: 26,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <FontAwesome
                    name="image"
                    size={24}
                    color={themeStyle.colors.grayscale.lowest}
                  />
                </View>
                <Text
                  style={{
                    color: themeStyle.colors.grayscale.lowest,
                    fontWeight: "700",
                    marginLeft: 10,
                  }}
                >
                  Add Image
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginHorizontal: 10,
                marginBottom: 30,
              }}
            >
              <TouchableOpacity
                onPress={() => pickMedia("video")}
                style={{ alignItems: "center", flexDirection: "row" }}
              >
                <View
                  style={{
                    backgroundColor:
                      themeStyle.colors.grayscale.transparentHighest50,
                    height: 48,
                    width: 48,
                    borderRadius: 26,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      borderColor: themeStyle.colors.grayscale.highest,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <MaterialCommunityIcons
                      name="movie-open-play-outline"
                      size={26}
                      color={themeStyle.colors.grayscale.lowest}
                    />
                  </View>
                </View>
                <Text
                  style={{
                    color: themeStyle.colors.grayscale.lowest,
                    fontWeight: "700",
                    marginLeft: 10,
                  }}
                >
                  Add Video
                </Text>
              </TouchableOpacity>
            </View>
            {!showImageOrVideoOption ? (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginHorizontal: 10,
                    marginBottom: 30,
                  }}
                >
                  <TouchableOpacity
                    onPress={async () => {
                      navigation.setOptions({ headerShown: false });
                      if (Platform.OS === "ios") {
                        await openOSCamera();
                      } else {
                        setCameraActive(true);
                      }
                    }}
                    style={{
                      alignItems: "center",
                      flexDirection: "row",
                    }}
                  >
                    <View
                      style={{
                        backgroundColor:
                          themeStyle.colors.grayscale.transparentHighest50,
                        height: 48,
                        width: 48,
                        borderRadius: 26,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Feather
                        name="camera"
                        size={26}
                        color={themeStyle.colors.grayscale.lowest}
                      />
                    </View>
                    <Text
                      style={{
                        color: themeStyle.colors.grayscale.lowest,
                        fontWeight: "700",
                        marginLeft: 10,
                      }}
                    >
                      Use Camera
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : null}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default gestureHandlerRootHOC(ChatScreen);
