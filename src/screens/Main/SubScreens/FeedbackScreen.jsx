import React from "react";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Checkbox from "../../../components/Checkbox";
import TextArea from "../../../components/TextArea";
import themeStyle from "../../../theme.style";
import apiCall from "../../../helpers/apiCall";

const FeedbackScreen = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [generalFeedback, setGeneralFeedback] = useState("");
  const [submittedGeneralFeedback, setSubmittedGeneralFeedback] = useState("");
  const [ideas, setIdeas] = useState("");
  const [submittedIdeas, setSubmittedIdeas] = useState("");
  const [type, setType] = useState("general");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);
    if (
      (type === "general" && !generalFeedback) ||
      (type === "idea" && !ideas)
    ) {
      setError(
        type === "general"
          ? "Please provide some feedback before submitting."
          : "Please list out any ideas before submitting."
      );
    }
    const { success } = await apiCall("POST", "/user/feedback/create", {
      type,
      description: type === "general" ? generalFeedback : ideas,
    });

    if (success) {
      setSuccess(true);
      if (type === "general") {
        setSubmittedGeneralFeedback(generalFeedback);
      } else {
        setSubmittedIdeas(ideas);
      }
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(
        "There was an error submitting your feedback. Please try again later."
      );
    }
    setLoading(false);
  };

  const infoIsInvalid = () => {
    const feedbackIsUnchanged =
      (type === "general" && submittedGeneralFeedback === generalFeedback) ||
      (type === "idea" && submittedIdeas === ideas);
    return (
      (type === "general" && !generalFeedback) ||
      (type === "idea" && !ideas) ||
      loading ||
      success ||
      feedbackIsUnchanged
    );
  };

  return (
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
        <View style={{ height: "100%" }}>
          <ScrollView>
            <View>
              <Text
                style={{
                  color: themeStyle.colors.primary.light,
                  fontSize: 20,
                  marginBottom: 20,
                  fontWeight: "700",
                }}
              >
                We like to listen...
              </Text>
              <Text
                style={{
                  color: themeStyle.colors.grayscale.lowest,
                  fontSize: 14,
                }}
              >
                We like to review your feedback and ideas.
              </Text>
              <Text
                style={{
                  color: themeStyle.colors.grayscale.lowest,
                  fontSize: 14,
                  marginTop: 10,
                }}
              >
                If your idea is great and fits into Magnet, we&apos;ll add it!
              </Text>
              <View
                style={{
                  width: "100%",
                  marginTop: 20,
                }}
              >
                <Checkbox
                  checked={type === "idea"}
                  setChecked={(checked) => {
                    if (!checked) {
                      setType("general");
                    } else {
                      setType("idea");
                    }
                  }}
                  label={"This is an idea for Magnet."}
                />
                {type !== "idea" ? (
                  <View style={{ marginVertical: 10 }}>
                    <TextArea
                      minHeight={48}
                      maxHeight={300}
                      label={"General feedback"}
                      placeholder="Any App related feedback or issues"
                      value={generalFeedback}
                      setValue={setGeneralFeedback}
                    />
                  </View>
                ) : (
                  <View style={{ marginVertical: 10 }}>
                    <TextArea
                      minHeight={48}
                      maxHeight={300}
                      label={"Ideas"}
                      placeholder="Ideas that could improve Magnet"
                      value={ideas}
                      setValue={setIdeas}
                    />
                  </View>
                )}
              </View>
            </View>
            <View style={{ width: "100%", paddingHorizontal: 5 }}>
              {error ? (
                <Text style={{ color: themeStyle.colors.error.default }}>
                  {error}
                </Text>
              ) : success ? (
                <Text style={{ color: themeStyle.colors.success.default }}>
                  Feedback submitted
                </Text>
              ) : null}
            </View>
            <TouchableOpacity
              onPress={() => handleSubmit()}
              disabled={infoIsInvalid()}
              style={{
                borderRadius: 5,
                padding: 10,
                height: 48,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: themeStyle.colors.primary.default,
                marginTop: 5,
                marginBottom: 10,
                opacity: infoIsInvalid() ? 0.5 : 1,
              }}
              //   onPress={() => handleSubmit()}
            >
              {loading ? (
                <ActivityIndicator
                  size={"small"}
                  color={themeStyle.colors.white}
                />
              ) : (
                <Text style={{ color: themeStyle.colors.white }}>Submit</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default FeedbackScreen;
