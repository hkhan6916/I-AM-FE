import React from "react";

import { SafeAreaView, Text } from "react-native";

const PostScreen = (props) => {
  const { post } = props.route.params;
  console.log(post);
  return (
    <SafeAreaView>
      <Text>Posts screen</Text>
    </SafeAreaView>
  );
};

export default PostScreen;
