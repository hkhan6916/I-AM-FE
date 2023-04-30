import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { useDispatch } from "react-redux";
import apiCall from "../helpers/apiCall";
import themeStyle from "../theme.style";
import GPTPromptModal from "./GPTPromptModal";
import { LinearGradient } from "expo-linear-gradient";

const UserBioModal = ({
  bio,
  setShowUserBioModal = () => null,
  userData,
  ...rest
}) => {
  const [value, setValue] = useState(bio || "");
  const [height, setHeight] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [enableAI, setEnableAI] = useState(false);

  const dispatch = useDispatch();

  const handleSubmit = async () => {
    setSuccess(false);
    setLoading(true);
    setSubmissionError("");
    const { success, message } = await apiCall("POST", "/user/update/details", {
      bio: value || null,
    });

    if (success) {
      dispatch({ type: "SET_USER_DATA", payload: { ...userData, bio: value } });

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
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: themeStyle.colors.grayscale.highest,
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" && "padding"}
          keyboardVerticalOffset={0}
          style={{
            flex: 1,
            backgroundColor: themeStyle.colors.grayscale.highest,
            padding: 15,
          }}
        >
          <GPTPromptModal
            setShowModal={setEnableAI}
            active={enableAI}
            setText={(v) => {
              setValue(v);
            }}
            isBio
          />
          <View style={{ height: "100%" }}>
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
                  maxLength={1000}
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
            <Text
              style={{
                color: themeStyle.colors.success.default,
                alignSelf: "flex-start",
                marginTop: 10,
                fontSize: 16,
              }}
            >
              {success ? (bio ? "Bio updated" : "Bio added") : ""}
            </Text>
          </View>
        </KeyboardAvoidingView>
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <TouchableOpacity
            onPress={() => setEnableAI(true)}
            style={{
              height: 60,
              width: 60,
              borderRadius: 30,
              alignSelf: "flex-end",
              marginBottom: 10,
            }}
          >
            <LinearGradient
              start={[0, 0.5]}
              end={[0, 1]}
              style={[
                {
                  width: 60,
                  height: 60,
                  alignSelf: "center",
                  padding: 2,
                  borderRadius: 30,
                },
              ]}
              colors={["#138294", "#66b5ff"]}
            >
              <View
                style={{
                  width: "100%",
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: themeStyle.colors.grayscale.highest,
                  borderRadius: 30,
                }}
              >
                <MaterialCommunityIcons
                  name="robot-happy-outline"
                  size={24}
                  color={themeStyle.colors.grayscale.lowest}
                />
                <Text
                  style={{
                    color: themeStyle.colors.grayscale.lowest,
                    fontSize: 10,
                  }}
                >
                  AI
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              borderRadius: 5,
              padding: 10,
              height: 48,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: themeStyle.colors.primary.default,
              marginTop: 5,
              marginBottom: 10,
            }}
            onPress={() => handleSubmit()}
          >
            {loading ? (
              <ActivityIndicator
                size={"small"}
                color={themeStyle.colors.white}
              />
            ) : (
              <Text style={{ color: themeStyle.colors.white }}>
                {bio ? "Update Bio" : "Add Bio"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default React.memo(UserBioModal);
