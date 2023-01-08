import { Entypo, Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { useState } from "react";
import {
  Modal,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import apiCall from "../helpers/apiCall";
import themeStyle from "../theme.style";
import TextArea from "./TextArea";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AppSatisfactionModal = ({
  onUserFeedback = () => null,
  setShowReviewModal = () => null,
  visible,
  ...rest
}) => {
  const [isSatisfied, setIsSatisfied] = useState(null);
  const [generalFeedback, setGeneralFeedback] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);
    if (!generalFeedback) {
      setError("Please provide some feedback before submitting.");
    }
    const { success } = await apiCall("POST", "/user/feedback/create", {
      type: "general",
      description: generalFeedback,
    });

    if (success) {
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        setShowReviewModal(false);
        setGeneralFeedback("");
      }, 1000);
    } else {
      setError(
        "There was an error submitting your feedback. Please try again later."
      );
    }
    setLoading(false);
  };
  useEffect(() => {
    if (!visible) {
      setSuccess(false);
      setIsSatisfied(null);
      setShowReviewModal(false);
      setGeneralFeedback("");
    }
  }, [visible]);
  return (
    <Modal transparent visible={visible} {...rest}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
        }}
      >
        <View
          style={{
            justifyContent: "center",
            backgroundColor: themeStyle.colors.white,
            marginHorizontal: 10,
            borderRadius: 10,
            padding: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => setShowReviewModal(false)}
            style={{
              height: 48,
              width: 48,
              justifyContent: "center",
              alignItems: "center",
              alignSelf: "flex-end",
            }}
          >
            <Ionicons name="close" size={30} color={themeStyle.colors.black} />
          </TouchableOpacity>
          {isSatisfied === null ? (
            <>
              <Text
                style={{
                  color: themeStyle.colors.black,
                  fontWeight: "700",
                  fontSize: 18,
                  marginBottom: 20,
                  textAlign: "center",
                }}
              >
                Enjoying Magnet?
              </Text>
              <View style={{ flexDirection: "row", justifyContent: "center" }}>
                <TouchableOpacity
                  onPress={() => {
                    setIsSatisfied(false);
                    onUserFeedback(false);
                  }}
                  style={{
                    backgroundColor: "rgba(147,147,147,0.15)",
                    marginHorizontal: 30,
                    marginVertical: 20,
                    borderRadius: 40,
                  }}
                >
                  <View
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      height: 80,
                      width: 80,
                    }}
                  >
                    <Entypo
                      name="emoji-sad"
                      size={42}
                      color={themeStyle.colors.black}
                    />
                    <Text
                      style={{
                        color: themeStyle.colors.black,
                        fontWeight: "700",
                        fontSize: 16,
                        textAlign: "center",
                      }}
                    >
                      No
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    onUserFeedback(true);
                  }}
                  style={{
                    backgroundColor: "rgba(147,147,147,0.15)",
                    marginVertical: 20,
                    marginHorizontal: 30,
                    borderRadius: 40,
                    zIndex: 9,
                  }}
                >
                  <View
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      height: 80,
                      width: 80,
                    }}
                  >
                    <Entypo
                      name="emoji-happy"
                      size={42}
                      color={themeStyle.colors.black}
                    />
                    <Text
                      style={{
                        color: themeStyle.colors.black,
                        fontWeight: "700",
                        fontSize: 16,
                        textAlign: "center",
                      }}
                    >
                      Yes
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={{ marginHorizontal: 30, marginTop: 20 }}
                onPress={async () => {
                  try {
                    await AsyncStorage.setItem("loginCount", "0");
                  } catch (e) {
                    console.log(e);
                  }
                  setShowReviewModal(false);
                }}
              >
                <Text
                  style={{
                    color: themeStyle.colors.primary.default,
                    fontWeight: "700",
                    textAlign: "center",
                  }}
                >
                  Remind me later
                </Text>
              </TouchableOpacity>
              <Text
                style={{
                  color: themeStyle.colors.black,
                  fontWeight: "500",
                  fontSize: 14,
                  textAlign: "center",
                  marginVertical: 10,
                }}
              >
                You can let us know without leaving the App!
              </Text>
            </>
          ) : isSatisfied === false ? (
            <>
              <TextArea
                minHeight={48}
                maxHeight={300}
                label={"Feedback"}
                placeholder="Any App related feedback or issues"
                value={generalFeedback}
                labelColor={themeStyle.colors.black}
                color={themeStyle.colors.black}
                setValue={setGeneralFeedback}
              />
              <Text
                style={{
                  color: themeStyle.colors.black,
                  fontWeight: "500",
                  fontSize: 14,
                  textAlign: "center",
                  marginVertical: 10,
                }}
              >
                Let us know of anything we can improve or fix.
              </Text>
              <TouchableOpacity
                onPress={() => handleSubmit()}
                disabled={!generalFeedback || success}
                style={{
                  borderRadius: 5,
                  padding: 10,
                  height: 48,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: themeStyle.colors.primary.default,
                  marginTop: 5,
                  marginBottom: 10,
                  opacity: !generalFeedback ? 0.5 : 1,
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
            </>
          ) : null}
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
      </View>
    </Modal>
  );
};

export default AppSatisfactionModal;
