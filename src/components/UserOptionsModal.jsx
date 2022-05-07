import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import themeStyle from "../theme.style";

const UserOptionsModal = ({
  showOptions,
  setShowUserOptions,
  reportUser,
  error,
  onHide,
  user,
  removeConnection,
}) => {
  const [showReportOptions, setShowReportOptions] = useState(false);

  const reportOptions = [
    "Profile is fake or contains spam",
    "Adult content",
    "Harassment or hateful speech",
    "I think this account is hacked",
    "Self harm",
  ];
  return (
    <Modal visible={showOptions} transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" && "padding"}
        keyboardVerticalOffset={0}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            setShowUserOptions(null);
            setShowReportOptions(false);
            if (onHide) onHide();
          }}
        >
          <View
            style={{
              alignItems: "center",
              justifyContent: "flex-end",
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
          >
            <View
              style={{
                width: "100%",
                paddingVertical: 10,
                backgroundColor: themeStyle.colors.grayscale.highest,
                borderTopColor: themeStyle.colors.grayscale.high,
                borderTopWidth: 2,
              }}
            >
              {error ? (
                <Text
                  style={{
                    alignSelf: "flex-end",
                    fontSize: 12,
                    color: themeStyle.colors.error.default,
                    fontWeight: "700",
                  }}
                >
                  {error}
                </Text>
              ) : null}
              {!showReportOptions ? (
                <View style={{ alignItems: "center", paddingHorizontal: 15 }}>
                  {user.isFriend ? (
                    <TouchableOpacity
                      onPress={() => {
                        setShowUserOptions(false);
                        setShowReportOptions(false);
                        removeConnection();
                      }}
                      style={{ width: "100%" }}
                    >
                      <View
                        style={{
                          padding: 10,
                          borderRadius: 5,
                          width: "100%",
                          height: 60,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: themeStyle.colors.error.default,
                            textAlign: "center",
                          }}
                        >
                          Remove Contact
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity
                    onPress={() => setShowReportOptions(true)}
                    style={{ width: "100%" }}
                  >
                    <View
                      style={{
                        padding: 10,
                        borderRadius: 5,
                        width: "100%",
                        height: 60,
                        borderTopWidth: user.isFriend ? 0.5 : 0,
                        borderColor: themeStyle.colors.grayscale.low,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: "700",
                          color: themeStyle.colors.grayscale.lowest,
                          textAlign: "center",
                        }}
                      >
                        Report User
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  {reportOptions.map((option, i) => (
                    <TouchableOpacity
                      key={`report-option-${i}`}
                      onPress={() => reportUser(i)}
                    >
                      <View
                        style={{
                          padding: 20,
                          borderBottomWidth: 0.5,
                          borderColor: themeStyle.colors.grayscale.low,
                        }}
                      >
                        <Text
                          style={{
                            textAlign: "center",
                            color: themeStyle.colors.secondary.default,
                            fontWeight: "700",
                          }}
                        >
                          {option}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default UserOptionsModal;
