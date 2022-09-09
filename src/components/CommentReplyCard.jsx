import React from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import themeStyle from "../theme.style";
import Avatar from "./Avatar";
import formatAge from "../helpers/formatAge";
import { Entypo } from "@expo/vector-icons";

const CommentReplyCard = ({
  reply,
  handleReplyToReply,
  setShowOptionsForComment,
  handleReaction,
}) => {
  const { width: screenWidth } = Dimensions.get("window");

  const navigation = useNavigation();

  const CommentAge = () => {
    const { age } = reply;
    const ageObject = formatAge(age);

    return (
      <Text style={styles.commentAge}>
        {ageObject.age} {ageObject.unit} ago
      </Text>
    );
  };

  if (!reply) return <View />;
  if (!reply.deleted) {
    return (
      <View
        style={[styles.replyContainer, { width: screenWidth, maxWidth: 900 }]}
      >
        <View
          style={{
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: "row",
          }}
        >
          <View style={styles.profileInfoContainer}>
            <Avatar
              userId={reply.userId}
              navigation={navigation}
              size={35}
              avatarUrl={
                reply.replyAuthor?.profileGifUrl ||
                reply.replyAuthor?.profileImageUrl
              }
              hasBorder={!!reply.replyAuthor?.profileGifUrl}
              profileGifHeaders={reply.replyAuthor?.profileGifHeaders}
              profileImageHeaders={reply.replyAuthor?.profileImageHeaders}
              flipProfileVideo={reply.replyAuthor?.flipProfileVideo}
            />
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("UserProfileScreen", {
                  userId: reply.userId,
                })
              }
            >
              <Text style={styles.replyAuthorName} numberOfLines={1}>
                {reply.replyAuthor?.firstName} {reply.replyAuthor?.lastName}
              </Text>
            </TouchableOpacity>
            {reply.edited ? (
              <Text
                style={{
                  fontSize: 12,
                  marginHorizontal: 10,
                  color: themeStyle.colors.grayscale.low,
                }}
              >
                (edited)
              </Text>
            ) : null}
          </View>
          <TouchableOpacity
            style={{
              width: 48,
              height: 48,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => setShowOptionsForComment(reply)}
          >
            <Entypo
              name="dots-three-vertical"
              size={16}
              color={themeStyle.colors.grayscale.lowest}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.replyBodyContainer}>
          {reply.replyingToObj && reply.replyingToId ? (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("UserProfileScreen", {
                  userId: reply.replyingToId,
                })
              }
            >
              <Text
                style={{
                  color: themeStyle.colors.secondary.default,
                  fontWeight: "700",
                  justifyContent: "center",
                }}
              >
                {reply.replyingToObj.firstName} {reply.replyingToObj.lastName}{" "}
              </Text>
            </TouchableOpacity>
          ) : null}
          <Text style={{ color: themeStyle.colors.grayscale.lowest }}>
            {reply.body}
          </Text>
        </View>
        <View style={styles.actionsContainer}>
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() =>
                handleReplyToReply({
                  firstName: reply.replyAuthor.firstName,
                  lastName: reply.replyAuthor.lastName,
                  commentId: reply._id,
                })
              }
              style={styles.replyTrigger}
            >
              <Text
                style={{
                  color: themeStyle.colors.grayscale.lower,
                  fontWeight: "700",
                }}
              >
                Reply
              </Text>
            </TouchableOpacity>
            {!reply.belongsToUser ? (
              <TouchableOpacity
                onPress={() => handleReaction(reply)}
                style={{
                  justifyContent: "center",
                  alignItems: "flex-end",
                  height: 48,
                  width: 48,
                }}
              >
                <MaterialCommunityIcons
                  name={reply.liked ? "thumb-up" : "thumb-up-outline"}
                  size={20}
                  color={
                    reply.liked
                      ? themeStyle.colors.secondary.default
                      : themeStyle.colors.grayscale.low
                  }
                />
              </TouchableOpacity>
            ) : null}

            {reply.likes ? ( // if likes more than 0
              <Text
                style={{
                  color: themeStyle.colors.grayscale.lowest,
                  marginLeft: 10,
                }}
              >
                {reply.likes} {reply.likes > 1 ? "likes" : "like"}
              </Text>
            ) : null}
          </View>
          <View
            style={{
              justifyContent: "space-between",
              alignItems: "center",
              flexDirection: "row",
            }}
          >
            <CommentAge />
          </View>
        </View>
      </View>
    );
  }
  return <View />;
};
const styles = StyleSheet.create({
  replyContainer: {
    width: "100%",
    paddingLeft: 70,
    marginTop: 20,
  },
  profileInfoContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    margin: 5,
  },
  replyBodyContainer: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  replyAuthorName: {
    maxWidth: 170,
    marginLeft: 10,
    color: themeStyle.colors.primary.default,
    fontWeight: "700",
  },
  actionsContainer: {
    // padding: 10,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actions: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  replyTrigger: {
    marginHorizontal: 10,
    margiHormarginHorizontal: 10,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  likeTrigger: {
    marginRight: 10,
  },
  commentAge: {
    color: themeStyle.colors.grayscale.low,
    marginHorizontal: 10,
    fontSize: 12,
  },
});
export default React.memo(CommentReplyCard);
