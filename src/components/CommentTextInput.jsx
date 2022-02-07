import React, { useState, forwardRef } from "react";
import {
  TextInput,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import themeStyle from "../theme.style";

const CommentTextInput = forwardRef((props, ref) => {
  const [commentBody, setCommentBody] = useState("");
  const [loading, setLoading] = useState(false);

  const undoReply = () => {
    props.setReplyingTo(null);
    setCommentBody("");
  };
  const handleSubmit = async () => {
    setLoading(true);
    const success = await props.submitAction(commentBody);
    setLoading(false);
    if (success) {
      props.setReplyingTo(null);
      setCommentBody("");
    }
  };
  const replyingToFieldsExists =
    props.replyingTo && props.replyingTo.firstName && props.replyingTo.lastName;
  return (
    <View>
      {replyingToFieldsExists ? (
        <View style={styles.replyingToBanner}>
          <Text style={styles.replyingToBannerText}>
            Replying to {props.replyingTo.firstName} {props.replyingTo.lastName}
          </Text>
          <TouchableOpacity onPress={() => undoReply()}>
            <Text>Undo</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      <View style={styles.inputBoxContainer}>
        <TextInput
          ref={ref}
          style={styles.inputBox}
          placeholder={
            replyingToFieldsExists
              ? "Type a reply here..."
              : "Type a comment here..."
          }
          value={commentBody}
          onChangeText={(v) => setCommentBody(v)}
          returnKeyType="go"
        />
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
  );
});

CommentTextInput.displayName = "CommentTextInput";
const styles = StyleSheet.create({
  inputBox: {
    height: 48,
    flex: 1,
  },
  inputBoxContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
    borderWidth: 0.5,
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
export default CommentTextInput;
