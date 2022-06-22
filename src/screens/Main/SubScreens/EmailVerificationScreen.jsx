import { FontAwesome, AntDesign } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import CodeInput from "../../../components/CodeInput";
import apiCall from "../../../helpers/apiCall";
import themeStyle from "../../../theme.style";

const EmailVerificationScreen = () => {
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);
  const userData = useSelector((state) => state.userData)?.state || {};
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      const { response, success } = await apiCall(
        "GET",
        "/user/email/create-email-verification"
      );
      if (!success) {
        setError(
          "There was a problem sending your verification code. Please try again later."
        );
      }
    })();
  }, []);

  const handleVerification = async (code) => {
    const { success } = await apiCall("GET", `/user/email/verify/${code}`);
    if (!success) {
      setError(
        "There was a problem with verifying your account. Please try again later."
      );
      return;
    }

    setVerified(true);
    dispatch({
      type: "SET_USER_DATA",
      payload: { ...userData, verified: true },
    });
  };
  if (error)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <FontAwesome
          name="envelope-o"
          size={100}
          color={themeStyle.colors.grayscale.low}
        />
        <Text
          style={{
            color: themeStyle.colors.error.default,
            textAlign: "center",
            marginTop: 20,
          }}
        >
          {error}
        </Text>
      </View>
    );
  if (verified) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <AntDesign
          name="checkcircleo"
          size={100}
          color={themeStyle.colors.success.default}
        />
        <Text
          style={{
            color: themeStyle.colors.grayscale.lowest,
            textAlign: "center",
            marginTop: 24,
          }}
        >
          Your email has been verified.
        </Text>
      </View>
    );
  }
  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text
        style={{
          textAlign: "center",
          color: themeStyle.colors.grayscale.lowest,
          fontSize: 24,
        }}
      >
        We sent a code code{" "}
        {userData.email ? `to ${userData.email}` : "to your email"}
      </Text>
      <Text
        style={{
          textAlign: "center",
          color: themeStyle.colors.grayscale.lowest,
          fontSize: 14,
          marginTop: 20,
        }}
      >
        Please enter the code we sent to your email.
      </Text>
      <CodeInput onSubmit={(code) => handleVerification(code)} />
    </View>
  );
};

export default EmailVerificationScreen;
