import React from "react";
import { useState } from "react";
import { View, Text, SafeAreaView, StyleSheet } from "react-native";
import Input from "../../components/Input";
import apiCall from "../../helpers/apiCall";
import { string, object } from "yup";
import { TouchableOpacity } from "react-native-gesture-handler";
import themeStyle from "../../theme.style";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");

  const schema = object().shape({
    email: string()
      .email("Please enter a valid email address")
      .required("Please enter an email address"),
  });

  const createPasswordReset = async () => {
    setEmailError("");
    await schema
      .validate({
        email,
      })
      .then(async () => {
        const { success, response } = await apiCall(
          "POST",
          "/user/password/reset",
          { email }
        );
        if (success) {
          setEmailSent(true);
        }
        if (!success && response?.found === false) {
          setEmailError("A user does not exist with that email.");
        }
      })
      .catch((err) => {
        if (err.errors?.length) {
          setEmailError(err.errors[0]);
        }
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      {!emailSent ? (
        <View style={{ padding: 20 }}>
          <Text
            style={{ textAlign: "center", marginBottom: 20, fontWeight: "700" }}
          >
            Please enter the email address you used to sign up.
          </Text>
          <Input
            label="Email Address"
            value={email}
            error={emailError}
            onChangeText={(v) => setEmail(v)}
          />
          <View style={{ alignItems: "center" }}>
            <TouchableOpacity onPress={() => createPasswordReset()}>
              <Text
                style={{
                  color: themeStyle.colors.secondary.default,
                  fontWeight: "700",
                }}
              >
                Send Email
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
