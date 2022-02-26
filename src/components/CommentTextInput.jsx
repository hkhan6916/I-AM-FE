import React, { useState, forwardRef } from "react";
import {
  TextInput,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
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
        {replyingToFieldsExists ? (
          <View style={styles.replyingToBanner}>
            <Text style={styles.replyingToBannerText}>
              Replying to {replyingTo.firstName} {replyingTo.lastName}
            </Text>
            <TouchableOpacity onPress={() => undoReply()}>
              <Text>Undo</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        <View
          style={[
            styles.inputBoxContainer,
            hasBorderRadius && { borderRadius: 5 },
          ]}
        >
          <ScrollView scrollEnabled={height > 48}>
            <TextInput
              maxLength={2000}
              ref={ref}
              multiline
              style={[
                styles.inputBox,
                {
                  height: height < 48 ? "100%" : height,
                },
                isFullWidth && { flex: 1 },
              ]}
              placeholder={
                replyingToFieldsExists
                  ? "Type a reply here..."
                  : "Type a comment here..."
              }
              returnKeyType="go"
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
              marginVertical: 16,
              marginLeft: 5,
            }}
          >
            {!loading ? (
              <TouchableOpacity
                disabled={!commentBody}
                onPress={() => handleSubmit()}
              >
                <Text
                  style={[styles.postTrigger, !commentBody && { opacity: 0.5 }]}
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
      </View>
    );
  }
);

CommentTextInput.displayName = "CommentTextInput";
const styles = StyleSheet.create({
  inputBox: {
    paddingVertical: 10,
  },
  inputBoxContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    borderTopWidth: 0.5,
    borderColor: themeStyle.colors.grayscale.lightGray,
  },
  postTrigger: {
    color: themeStyle.colors.secondary.default,
    fontWeight: "700",
  },
  replyingToBanner: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: themeStyle.colors.grayscale.lightGray,
  },
  replyingToBannerText: {
    color: themeStyle.colors.grayscale.white,
  },
});
export default React.memo(CommentTextInput);
