import React from 'react';

import { Text, View } from 'react-native';

const PostScreen = (props) => {
  const { post } = props.route.params;
  console.log(post);
  return (
    <View>
      <Text>
        Posts screen
      </Text>
    </View>
  );
};

export default PostScreen;
