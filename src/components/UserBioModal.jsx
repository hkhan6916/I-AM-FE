import { AntDesign } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Modal,
  Dimensions,
  ActivityIndicator,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import apiCall from "../helpers/apiCall";
import themeStyle from "../theme.style";

const UserBioModal = ({ bio, setShowUserBioModal = () => null, ...rest }) => {
  const [value, setValue] = useState(bio || "");
  const [height, setHeight] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  const handleSubmit = async () => {
    setSuccess(false);
    setLoading(true);
    setSubmissionError("");
    const { success, message } = await apiCall("POST", "/user/update/details", {
      bio: value || null,
    });

    if (success) {
      setSuccess(true);
    } else {
      setSubmissionError(
        "There was a problem saving your bio. Please try again later."
      );
    }
    setLoading(false);
  };

  return (
    <Modal onRequestClose={() => setShowUserBioModal(false)} visible {...rest}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" && "padding"}
          keyboardVerticalOffset={0}
          style={{
            flex: 1,
            backgroundColor: themeStyle.colors.grayscale.highest,
            padding: 15,
          }}
        >
          <View style={{ height: "100%" }}>
            <ScrollView>
              <View
                style={{
                  alignSelf: "flex-start",
                  marginVertical: 10,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setShowUserBioModal(false);
                  }}
                  style={{
                    justifyContent: "center",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <AntDesign
                    name="arrowleft"
                    size={24}
                    color={themeStyle.colors.grayscale.lowest}
                  />
                  <Text
                    style={{
                      color: themeStyle.colors.grayscale.lowest,
                      fontSize: 16,
                      marginHorizontal: 10,
                    }}
                  >
                    Add Bio
                  </Text>
                </TouchableOpacity>
              </View>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: themeStyle.colors.grayscale.lowest,
                  borderRadius: 5,
                  padding: 5,
                  marginTop: 20,
                }}
              >
                <ScrollView style={{ maxHeight: 300 }}>
                  <TextInput
                    placeholderTextColor={themeStyle.colors.grayscale.lowest}
                    multiline
                    value={value}
                    onChangeText={(v) => setValue(v)}
                    onContentSizeChange={(event) => {
                      setHeight(
                        event.nativeEvent.contentSize.height < 300
                          ? event.nativeEvent.contentSize.height
                          : 300
                      );
                    }}
                    style={[
                      {
                        height: Math.max(48, height),
                        color: themeStyle.colors.grayscale.lowest,
                      },
                    ]}
                    placeholder={"Write a bit about yourself..."}
                  />
                </ScrollView>
              </View>
            </ScrollView>
            <TouchableOpacity
              style={{
                borderRadius: 5,
                padding: 10,
                height: 48,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: success
                  ? themeStyle.colors.grayscale.highest
                  : themeStyle.colors.primary.default,
                borderWidth: 1,
                marginTop: 5,
              }}
              onPress={() => handleSubmit()}
            >
              {loading ? (
                <ActivityIndicator
                  size={"small"}
                  color={themeStyle.colors.white}
                />
              ) : success ? (
                <Text
                  style={{
                    color: themeStyle.colors.white,
                    fontWeight: "700",
                  }}
                >
                  {bio ? "Bio updated" : "Bio added"}
                </Text>
              ) : (
                <Text style={{ color: themeStyle.colors.white }}>
                  {bio ? "Update Bio" : "Add Bio"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

export default React.memo(UserBioModal);
