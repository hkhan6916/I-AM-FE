import React, { useRef, useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Entypo } from "@expo/vector-icons";
import VideoPlayer from "../VideoPlayer";
import themeStyle from "../../theme.style";
// import apiCall from "../helpers/apiCall";
import RepostCard from "../RepostCard";
// import AdCard from "./AdCard";
import FastImage from "react-native-fast-image";
import CardImage from "../CardImage";
import PostAuthor from "./PostAuthor";
import Actions from "./Actions";

const PostCard = ({
  post,
  isPreview = false,
  isVisible,
  setShowPostOptions,
  // adsManager,
  screenWidth,
  screenHeight,
  // liked,
  handleReaction,
  handleNavigation,
  currentVisible,
  index,
  unmount,
}) => {
  const [bodyCollapsed, setBodyCollapsed] = useState(false);
  const [isCollapsible, setIsCollapsible] = useState(false);
  const navigation = useNavigation();

  const onTextLayout = (e) => {
    setIsCollapsible(e.nativeEvent.lines.length >= 3);
  };

  // if (unmount) {
  //   return (
  //     <View
  //       style={{
  //         aspectRatio: 1 / 1,
  //         width: screenWidth || 300,
  //         height: "100%",
  //       }}
  //     />
  //   );
  // }
  return (
    <View style={{ flex: 1 }}>
      {/* {console.log(post._id)}
      <Text style={{ color: "white" }}>{post._id}</Text> */}
      {/* {adsManager ? (
        <AdCard
          adsManager={adsManager}
          onAdLoaded={(ad) => setReadyAdsCount(readyAdsCount + 1)}
        />
      ) : null} */}
      <View style={[styles.container, isPreview && styles.preview]}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {post.postAuthor ? <PostAuthor author={post.postAuthor} /> : null}
          <TouchableOpacity
            style={{
              alignSelf: "flex-end",
              width: 48,
              height: 48,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => setShowPostOptions(post)}
          >
            <Entypo
              name="dots-three-vertical"
              size={16}
              color={themeStyle.colors.grayscale.lowest}
            />
          </TouchableOpacity>
        </View>
        {post.repostPostId ? (
          <View>
            <RepostCard
              postContent={post.repostPostObj}
              isPreview={isPreview}
            />
            {post.body ? (
              <View
                style={{
                  padding: 5,
                  marginHorizontal: 10,
                }}
              >
                <Text
                  onTextLayout={onTextLayout}
                  numberOfLines={!bodyCollapsed ? 3 : null}
                  style={{
                    textAlign: "left",
                    color: themeStyle.colors.grayscale.lowest,
                  }}
                >
                  {post.body}
                </Text>
                {isCollapsible && !bodyCollapsed ? (
                  <TouchableOpacity onPress={() => setBodyCollapsed(true)}>
                    <Text
                      style={{
                        color: themeStyle.colors.grayscale.low,
                        marginBottom: 10,
                        marginTop: 5,
                      }}
                    >
                      Read more
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}
          </View>
        ) : (
          <View>
            <TouchableOpacity
              onPress={() =>
                !post.private && !post.gif && handleNavigation(post)
              }
              underlayColor={themeStyle.colors.grayscale.high}
              delayPressIn={150}
            >
              <View>
                {post.gif ? (
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "column",
                    }}
                  >
                    <View
                      style={{
                        position: "absolute",
                        zIndex: 1,
                        bottom: 0,
                        right: 0,
                      }}
                    >
                      <Image
                        resizeMode={"contain"}
                        style={{
                          width: 70,
                          height: 20,
                        }}
                        source={require("../../../assets/via_tenor_logo_blue.png")}
                      />
                    </View>
                    <FastImage
                      resizeMode={"contain"}
                      style={{
                        aspectRatio: 1 / 1,
                        width: screenWidth || 300,
                        height: "100%",
                      }}
                      source={{
                        uri: post.gif,
                      }}
                    />
                  </View>
                ) : post.mediaType === "video" ? (
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <VideoPlayer
                      shouldPlay={isVisible}
                      mediaIsSelfie={post.mediaIsSelfie}
                      url={post.mediaUrl}
                      thumbnailUrl={post.thumbnailUrl}
                      thumbnailHeaders={post.thumbnailHeaders}
                      isUploading={post.ready === false}
                      isCancelled={post.cancelled}
                      screenHeight={screenHeight}
                      screenWidth={screenWidth}
                      height={post.height}
                      width={post.width}
                    />
                  </View>
                ) : post.mediaType === "image" ? (
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "column",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <CardImage
                      mediaHeaders={post.mediaHeaders}
                      mediaUrl={post.mediaUrl}
                      screenWidth={screenWidth}
                      screenHeight={screenHeight}
                      height={post.height}
                      width={post.width}
                    />
                    {/* {index && Math.abs(currentVisible - index) <= 3 ? (
                      <CardImage
                        mediaHeaders={post.mediaHeaders}
                        mediaUrl={post.mediaUrl}
                        screenWidth={screenWidth}
                        screenHeight={screenHeight}
                        height={post.height}
                        width={post.width}
                      />
                    ) : (
                      // <CardImage
                      //   // mediaHeaders={post.mediaHeaders}
                      //   // mediaUrl={post.mediaUrl}
                      //   screenWidth={screenWidth}
                      //   screenHeight={screenHeight}
                      //   height={post.height}
                      //   width={post.width}
                      //   style={{
                      //     backgroundColor:
                      //       themeStyle.colors.grayscale.cardsOuter,
                      //   }}
                      // />
                      <View
                        style={{
                          backgroundColor: themeStyle.colors.grayscale.low,
                          height: screenWidth,
                          width: screenWidth,
                        }}
                      />
                    )} */}
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>
            {post.body ? (
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 20,
                }}
              >
                <Text
                  onTextLayout={onTextLayout}
                  numberOfLines={!bodyCollapsed ? 3 : null}
                  style={{
                    textAlign: "left",
                    color: themeStyle.colors.grayscale.lowest,
                  }}
                >
                  {post.body}
                </Text>
                {isCollapsible && !bodyCollapsed ? (
                  <TouchableOpacity onPress={() => setBodyCollapsed(true)}>
                    <Text
                      style={{
                        color: themeStyle.colors.grayscale.low,
                        marginBottom: 10,
                        marginTop: 5,
                      }}
                    >
                      Read more
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}
          </View>
        )}
        <Actions
          navigation={navigation}
          post={post}
          handleReaction={handleReaction}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRightWidth: 0,
    borderLeftWidth: 0,
    borderColor: themeStyle.colors.grayscale.low,
    borderBottomColor: themeStyle.colors.grayscale.cardsOuter,
    borderBottomWidth: 4,
    backgroundColor: themeStyle.colors.grayscale.cards,
  },
  preview: {
    margin: 20,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderRadius: 10,
  },
});

export default React.memo(
  PostCard,
  (prevProps, nextProps) =>
    prevProps.isVisible === nextProps.isVisible &&
    prevProps.post === nextProps.post &&
    prevProps.deleted === nextProps.deleted &&
    prevProps.isVisible === nextProps.isVisible &&
    prevProps.unmount === nextProps.unmount
);
