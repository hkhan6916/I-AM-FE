import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  Platform,
} from "react-native";
import { setItemAsync } from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import themeStyle from "../../theme.style";
import apiCall from "../../helpers/apiCall";
import Logo from "../../Logo";
import { getExpoPushTokenAsync } from "expo-notifications";
const LoginScreen = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const navigation = useNavigation();

  const authenticateUser = async () => {
    setLoading(true);
    setLoginError("");
    const { response, success, error } = await apiCall("POST", "/user/login", {
      identifier,
      password,
    });

    if (success && response.token) {
      await setItemAsync("userId", response.userId);
      await setItemAsync("authToken", response.token);
      dispatch({ type: "SET_USER_DATA", payload: response.userData });

      Object.keys(response.apiKeys)?.forEach(async (key) => {
        await setItemAsync(key, response.apiKeys[key]);
      });
      const token = (
        await getExpoPushTokenAsync({
          experienceId: "@haroonmagnet/Magnet", // TODO: Change experience id in production
        })
      )?.data;
      if (token) {
        const { success, message } = await apiCall(
          "POST",
          "/user/notifications/token/update",
          { notificationToken: token }
        );
        if (success) {
          await setItemAsync("notificationToken", token);
        }
      }
      dispatch({ type: "SET_USER_LOGGED_IN", payload: true });
    }
    if (!success) {
      if (Platform.OS === "ios") {
        Keyboard.dismiss();
      }
      setLoginError(
        error === "CONNECTION_FAILED"
          ? "Cannot connect to server. Please try again later."
          : "Unable to sign in. Please check your login details and try again."
      );
    }
    setLoading(false);
  };

  const goToSignUpScreen = () => {
    dispatch({ type: "SET_USER_DATA", payload: {} });
    navigation.navigate("Register");
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      setLoginError("");
      setShowPassword(false);
    });

    return unsubscribe;
  }, [navigation]);
  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <View style={styles.logoContainer}>
          <Logo fill={themeStyle.colors.grayscale.lowest} />
        </View>
        <TextInput
          style={styles.usernameInput}
          placeholderTextColor={themeStyle.colors.grayscale.low}
          value={identifier}
          placeholder="Username or Email"
          onChangeText={(v) => setIdentifier(v)}
        />
        <View style={styles.passwordInputContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholderTextColor={themeStyle.colors.grayscale.low}
            secureTextEntry={!showPassword}
            value={password}
            autoCorrect={false}
            onChangeText={(v) => setPassword(v)}
            placeholder="Password"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={19}
              color={themeStyle.colors.grayscale.lowest}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={() => navigation.navigate("ForgotPasswordScreen")}
        >
          <Text style={{ color: themeStyle.colors.grayscale.lowest }}>
            Forgot Password
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.loginButton,
            { opacity: !(identifier && password) ? 0.5 : 1 },
          ]}
          onPress={() => authenticateUser()}
          disabled={!(identifier && password)}
        >
          {loading ? (
            <ActivityIndicator size={"small"} color={themeStyle.colors.white} />
          ) : (
            <Text style={styles.loginButtonText}>Log me in!</Text>
          )}
        </TouchableOpacity>
        {loginError ? (
          <Text style={styles.loginError}>{loginError}</Text>
        ) : null}
      </View>
      <View style={styles.signupSection}>
        <Text style={styles.signupText}>
          Haven&apos;t signed up yet?{" "}
          <Text
            onPress={() => goToSignUpScreen()}
            style={{
              fontWeight: "700",
              color: themeStyle.colors.secondary.default,
            }}
          >
            Sign Up
          </Text>
        </Text>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: themeStyle.colors.grayscale.highest,
  },
  formContainer: {
    padding: 20,
    backgroundColor: themeStyle.colors.grayscale.highest,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    marginBottom: 20,
  },
  loginError: {
    textAlign: "center",
    color: themeStyle.colors.error.default,
    fontWeight: "500",
  },
  loginButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    margin: 20,
    borderRadius: 50,
    backgroundColor: themeStyle.colors.primary.default,
    width: 100,
  },
  loginButtonText: {
    color: themeStyle.colors.white,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginRight: 20,
  },
  registerButton: {},
  usernameInput: {
    fontSize: 15,
    height: 45,
    borderRadius: 5,
    alignSelf: "stretch",
    marginVertical: 20,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: themeStyle.colors.primary.default,
    color: themeStyle.colors.grayscale.lowest,
  },
  signupText: {
    textAlign: "center",
    color: themeStyle.colors.grayscale.lowest,
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: themeStyle.colors.grayscale.lowest,
  },
  passwordInputContainer: {
    flexDirection: "row",
    height: 45,
    borderRadius: 5,
    alignSelf: "stretch",
    marginVertical: 20,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: themeStyle.colors.primary.default,
  },
  eyeIcon: {
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  signupSection: {
    position: "relative",
    bottom: 10,
  },
});

export default LoginScreen;
