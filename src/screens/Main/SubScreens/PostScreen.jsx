import React from "react";
import { SafeAreaView, Text, View, StyleSheet } from "react-native";

const PostScreen = (props) => {
  const { post } = props.route.params;

  if (post) {
    return (
      <SafeAreaView style={styles.container}>
        {post.body ? <Text>{post.body}</Text> : null}
      </SafeAreaView>
    );
  }
  return <View />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "red",
  },
});

export default PostScreen;
