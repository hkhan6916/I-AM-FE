import React from "react";
import { Text, StyleSheet } from "react-native";
import formatAge from "../helpers/formatAge";
import themeStyle from "../theme.style";

const PostAge = ({ age }) => {
  const ageObject = formatAge(age);
  if (!age) return null;
  return (
    <Text style={styles.postAge}>
      {ageObject.age} {ageObject.unit} ago
    </Text>
  );
};

const styles = StyleSheet.create({
  postAge: {
    color: themeStyle.colors.slateGray,
    marginHorizontal: 10,
    marginVertical: 5,
    fontSize: 12,
  },
});

export default PostAge;
