import React, { useState, forwardRef } from "react";
import {
  TextInput,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import { useSelector } from "react-redux";
import getWebPersistedUserData from "../helpers/getWebPersistedData";
import themeStyle from "../theme.style";

const CommentTextInput = forwardRef(
  (
    {
      setReplyingTo,
      submitAction,
      replyingTo,
      hasBorderRadius,
      initialCommentBody = "",
      isFullWidth = true,
    },
    ref
  ) => {
    const [commentBody, setCommentBody] = useState(initialCommentBody);
    const [loading, setLoading] = useState(false);
    const [height, setHeight] = useState(1);

    const nativeUserData = useSelector((state) => state.userData);

    const userData =
      Platform.OS === "web"
        ? { state: getWebPersistedUserData() }
        : nativeUserData;

    const undoReply = () => {
      setReplyingTo(null);
      setCommentBody("");
    };
    const handleSubmit = async () => {
      setLoading(true);
      const success = await submitAction(commentBody);
      setLoading(false);
      if (success) {
        if (setReplyingTo) {
          setReplyingTo(null);
        }
        setCommentBody("");
        setHeight(0);
      }
    };
    const replyingToFieldsExists =
      replyingTo && replyingTo.firstName && replyingTo.lastName;
    return (
      <View>
        {!userData.state?.profileVideoUrl &&
        !userData.state?.profileImageUrl ? (
          <Text
            style={{
              color: themeStyle.colors.grayscale.lowest,
              textAlign: "center",
              marginBottom: 5,
            }}
          >
            Complete your profile to comment on posts
          </Text>
        ) : null}
        {replyingToFieldsExists ? (
          <View style={styles.replyingToBanner}>
            <Text style={styles.replyingToBannerText}>
              Replying to {replyingTo.firstName} {replyingTo.lastName}
            </Text>
            <TouchableOpacity
              style={{ height: 48, justifyContent: "center" }}
              onPress={() => undoReply()}
            >
              <Text
                style={{
                  fontWeight: "700",
                  color: themeStyle.colors.secondary.default,
                }}
              >
                Undo
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
        <TouchableWithoutFeedback onPress={() => ref?.current?.focus()}>
          <View
            style={[
              styles.inputBoxContainer,
              hasBorderRadius && { borderRadius: 5 },
              !userData.state?.profileVideoUrl &&
                !userData.state?.profileImageUrl && { opacity: 0.5 },
            ]}
          >
            <ScrollView scrollEnabled={height > 48}>
              <TextInput
                editable={
                  !!(
                    userData.state?.profileVideoUrl ||
                    userData.state?.profileImageUrl
                  )
                }
                maxLength={2000}
                ref={ref}
                multiline
                placeholderTextColor={themeStyle.colors.grayscale.low}
                style={[
                  styles.inputBox,
                  {
                    height: height < 48 ? "100%" : height,
                    paddingTop: height < 48 ? 0 : 10,
                    paddingBottom: height < 48 ? 0 : 10,
                  },
                  isFullWidth && { flex: 1 },
                ]}
                placeholder={
                  replyingToFieldsExists
                    ? "Type a reply here..."
                    : "Type a comment here..."
                }
                returnKeyType="default"
                value={commentBody}
                onChangeText={(v) => setCommentBody(v)}
                onContentSizeChange={(event) => {
                  setHeight(
                    event.nativeEvent.contentSize.height < 150
                      ? event.nativeEvent.contentSize.height
                      : 150
                  );
                }}
              />
            </ScrollView>
            <View
              style={{
                alignSelf: "flex-end",
                // marginVertical: 16,
                height: 48,
                marginLeft: 5,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {!loading ? (
                <TouchableOpacity
                  disabled={
                    !commentBody ||
                    (!userData.state?.profileVideoUrl &&
                      !userData.state?.profileImageUrl)
                  }
                  onPress={() => handleSubmit()}
                  style={{
                    height: "100%",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={[
                      styles.postTrigger,
                      (!commentBody ||
                        (!userData.state?.profileVideoUrl &&
                          !userData.state?.profileImageUrl)) && {
                        opacity: 0.5,
                      },
                    ]}
                  >
                    Post
                  </Text>
                </TouchableOpacity>
              ) : (
                <ActivityIndicator
                  animating
                  size="small"
                  color={themeStyle.colors.secondary.default}
                />
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  }
);

CommentTextInput.displayName = "CommentTextInput";
const styles = StyleSheet.create({
  inputBox: {
    paddingVertical: 10,
    color: themeStyle.colors.grayscale.lowest,
  },
  inputBoxContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    backgroundColor: themeStyle.colors.grayscale.higher,
    marginHorizontal: 2,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: themeStyle.colors.grayscale.lowest,
    borderRadius: 5,
  },
  postTrigger: {
    color: themeStyle.colors.secondary.default,
    fontWeight: "700",
  },
  replyingToBanner: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    paddingHorizontal: 10,
    marginHorizontal: 5,
    marginBottom: 5,
    borderRadius: 10,
  },
  replyingToBannerText: {
    color: themeStyle.colors.grayscale.lowest,
  },
});
export default React.memo(CommentTextInput);
