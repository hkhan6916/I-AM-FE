import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { setItemAsync } from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import themeStyle from "../../theme.style";
import apiCall from "../../helpers/apiCall";
import Logo from "../../Logo";

const LoginScreen = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const dispatch = useDispatch();

  const navigation = useNavigation();

  const authenticateUser = async () => {
    const { response, success, error } = await apiCall("POST", "/user/login", {
      identifier,
      password,
    });

    if (success && response.token) {
      await setItemAsync("userId", response.userId);
      await setItemAsync("authToken", response.token);

      dispatch({ type: "SET_USER_LOGGED_IN", payload: true });
    }
    if (!success) {
      setLoginError(
        error === "CONNECTION_FAILED"
          ? "Cannot connect to server. Please check your connection."
          : "Whoops, your credentials do not match. Please try again."
      );
    }
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
        <Logo fill={themeStyle.colors.grayscale.black} />
        <Text style={styles.formHeaderText}>SIGN IN</Text>
        <TextInput
          style={styles.usernameInput}
          placeholderTextColor={themeStyle.colors.grayscale.lightGray}
          value={identifier}
          placeholder="Username or Email..."
          onChangeText={(v) => setIdentifier(v)}
        />
        <View style={styles.passwordInputContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholderTextColor={themeStyle.colors.grayscale.lightGray}
            secureTextEntry={!showPassword}
            value={password}
            autoCorrect={false}
            onChangeText={(v) => setPassword(v)}
            placeholder="Password..."
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={19}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.forgotPassword}>
          <Text>Forgot Password</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.loginButton,
            { opacity: !(identifier && password) ? 0.5 : 1 },
          ]}
          onPress={() => authenticateUser()}
          disabled={!(identifier && password)}
        >
          <Text style={styles.loginButtonText}>Log me in!</Text>
        </TouchableOpacity>
        {loginError ? (
          <Text style={styles.loginError}>{loginError}</Text>
        ) : null}
      </View>
      <View>
        <Text style={styles.signupText}>
          Haven&apos;t signed up yet?{" "}
          <Text
            onPress={() => navigation.navigate("Register")}
            style={{ fontWeight: "700" }}
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
    backgroundColor: themeStyle.colors.grayscale.white,
  },
  formContainer: {
    padding: 20,
    backgroundColor: themeStyle.colors.grayscale.white,
    alignItems: "center",
    justifyContent: "center",
  },
  formHeaderText: {
    paddingVertical: 20,
    fontSize: 30,
    color: themeStyle.colors.primary.default,
    fontWeight: "700",
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
  },
  loginButtonText: {
    color: themeStyle.colors.grayscale.white,
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
  },
  signupText: {
    textAlign: "center",
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: themeStyle.colors.grayscale.black,
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
});

export default LoginScreen;
