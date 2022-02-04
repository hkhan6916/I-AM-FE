import React from "react";
import { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import Input from "../../components/Input";
import apiCall from "../../helpers/apiCall";
import { TouchableOpacity } from "react-native-gesture-handler";
import themeStyle from "../../theme.style";
import validateEmail from "../../helpers/validateEmail";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);

  const createPasswordReset = async () => {
    setEmailError("");

    if (!email) {
      setEmailError("Please enter an email address");
    }

    const emailValid = await validateEmail(email);

    if (!emailValid) {
      setEmailError("Please enter a valid email address");
    }
    if (emailValid) {
      setLoading(true);
      const { success, response } = await apiCall(
        "POST",
        "/user/password/reset",
        { email }
      );
      setLoading(false);
      if (success) {
        setEmailSent(true);
      }
      if (!success && response?.found === false) {
        setEmailError("A user does not exist with that email.");
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {!emailSent ? (
        <ScrollView
          contentContainerStyle={{
            alignItems: "center",
            padding: 30,
            width: "100%",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              textAlign: "center",
              marginBottom: 20,
              fontWeight: "700",
              fontSize: 24,
            }}
          >
            Reset Password
          </Text>
          <Text
            style={{
              textAlign: "center",
              fontWeight: "700",
              fontSize: 16,
              color: themeStyle.colors.grayscale.darkGray,
              marginHorizontal: 40,
              marginBottom: 50,
            }}
          >
            Enter the email address you used to register.
          </Text>
          <Input
            value={email}
            error={emailError}
            placeholder="Email Address"
            onChangeText={(v) => setEmail(v)}
          />
          <View
            style={{
              alignItems: "center",
              marginTop: 20,
            }}
          >
            <TouchableOpacity onPress={() => createPasswordReset()}>
              {loading ? (
                <ActivityIndicator
                  animating
                  size="small"
                  color={themeStyle.colors.secondary.default}
                />
              ) : (
                <Text
                  style={{
                    color: themeStyle.colors.secondary.default,
                    fontWeight: "700",
                  }}
                >
                  Send Email
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            height: "100%",
          }}
        >
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 50,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                textAlign: "center",
                marginBottom: 50,
                color: themeStyle.colors.primary.default,
              }}
            >
              Email sent!
            </Text>
            <Text>
              We&apos;ve sent an email to{" "}
              <Text style={{ fontWeight: "700" }}>{email}</Text>
            </Text>
            <Text style={{ fontSize: 12, textAlign: "center" }}>
              Don&apos;t forget to check your spam folder :)
            </Text>
          </View>
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <Text style={{ marginBottom: 10 }}>Didn&apos;t get an email?</Text>
            <TouchableOpacity onPress={() => setEmailSent(false)}>
              <Text
                style={{
                  color: themeStyle.colors.secondary.default,
                  fontWeight: "700",
                }}
              >
                Try again
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ForgotPasswordScreen;
