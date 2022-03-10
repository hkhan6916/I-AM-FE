import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import themeStyle from "../../../theme.style";
import apiCall from "../../../helpers/apiCall";
import Input from "../../../components/Input";
import validateEmail from "../../../helpers/validateEmail";
import validatePassword from "../../../helpers/validatePassword";
import { useSelector, useDispatch } from "react-redux";
import PasswordInput from "../../../components/PasswordInput";

const Step2Screen = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [validationErrors, setValidationErrors] = useState({});
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const existingInfo = useSelector((state) => state.userData);

  const checkAllDetailsProvided = () => {
    if (
      (email && username && password) ||
      (existingInfo.state?.email &&
        existingInfo.state?.password &&
        existingInfo.state?.username)
    ) {
      return true;
    }
    return false;
  };

  const checkUserExists = async (type, identifier) => {
    const { response, success } = await apiCall("POST", "/user/check/exists", {
      type,
      identifier,
    });
    if (success && response[type]) {
      setValidationErrors({
        ...validationErrors,
        [type]: { exists: response[type].exists },
      });
      return { exists: response[type].exists };
    }
  };

  const validateInfo = async () => {
    const emailValid = await validateEmail(email || existingInfo.state?.email);
    const passwordValid = await validatePassword(
      password || existingInfo.state?.password
    );
    const emailMessage =
      !email && !existingInfo.state?.email
        ? "Please enter your email"
        : !emailValid
        ? "This email is not valid"
        : null;
    const passwordMessage =
      !password && !existingInfo.state?.password
        ? "Please choose a password"
        : !passwordValid
        ? "Password is not secure enough."
        : null;

    const validationResult = Object.assign(
      {},
      !username &&
        !existingInfo.state?.username && {
          username: "Please choose a username",
        },
      username.length < 3 && {
        username: "Username must be atleast 3 characters",
      },
      /\s/.test(username) && {
        username: "Username cannot have spaces",
      },
      emailMessage && { email: emailMessage },
      passwordMessage && { password: passwordMessage }
    );

    setValidationErrors(validationResult);
    return validationResult;
  };

  const handleNext = async () => {
    const validationResult = await validateInfo();
    if (!Object.keys(validationResult).length) {
      const usernameCheck = await checkUserExists("username", username);
      const emailCheck = usernameCheck?.exists
        ? null
        : await checkUserExists("email", email);
      if (usernameCheck?.exists === false && emailCheck?.exists === false) {
        dispatch({
          type: "SET_USER_DATA",
          payload: {
            ...existingInfo.state,
            username: username,
            email: email,
            password: password,
          },
        });
        navigation.navigate("Step3");
      }
    }
  };

  useEffect(() => {
    if (existingInfo) {
      setUsername(existingInfo?.state?.username || "");
      setEmail(existingInfo?.state?.email || "");
    }
  }, [existingInfo]);

  return (
    <View style={styles.container}>
      <ScrollView style={{ marginBottom: 48 }}>
        <View style={styles.formContainer}>
          <Text style={styles.titleText}>Your login info</Text>
          <Input
            isOutlined
            error={
              validationErrors.username?.exists
                ? "A user with this username already exists."
                : validationErrors?.username
            }
            label="Username"
            value={username}
            onChangeText={(v) => {
              setUsername(v);
              if (validationErrors.username) {
                setValidationErrors({
                  ...validationErrors,
                  username: null,
                });
              }
            }}
            onEndEditing={(e) =>
              checkUserExists("username", e.nativeEvent.text)
            }
          />
          <Input
            isOutlined
            error={
              validationErrors.email?.exists
                ? "A user with this email already exists."
                : validationErrors?.email
            }
            label="Email"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (validationErrors.email) {
                setValidationErrors({
                  ...validationErrors,
                  email: null,
                });
              }
            }}
            onEndEditing={(e) => checkUserExists("email", e.nativeEvent.text)}
          />
          <View style={styles.textInputContainer}>
            <PasswordInput
              isOutlined
              label={"Password"}
              error={validationErrors?.password}
              onChangeText={(v) => {
                setPassword(v);
                if (validationErrors.password) {
                  setValidationErrors({
                    ...validationErrors,
                    password: null,
                  });
                }
              }}
            />
            {validationErrors?.password && password ? (
              <View style={styles.passwordGuide}>
                <Text style={styles.errorText}>
                  - Must be at least 8 characters
                </Text>
                <Text style={styles.errorText}>
                  - Must container an uppercase character
                </Text>
                <Text style={styles.errorText}>
                  - Must container an lowercase character
                </Text>
                <Text style={styles.errorText}>- Must container a number</Text>
              </View>
            ) : null}
          </View>
          <TouchableOpacity
            style={[
              styles.registerationButton,
              {
                opacity: !checkAllDetailsProvided() ? 0.5 : 1,
              },
            ]}
            onPress={() => handleNext()}
            disabled={!checkAllDetailsProvided()}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeStyle.colors.grayscale.highest,
  },
  formContainer: {
    padding: 20,
    backgroundColor: themeStyle.colors.grayscale.highest,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  registerationButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    margin: 20,
    borderRadius: 5,
    backgroundColor: themeStyle.colors.primary.default,
    width: 100,
  },
  nextButtonText: {
    color: themeStyle.colors.grayscale.lowest,
    textAlign: "center",
  },
  errorText: {
    fontSize: 12,
    color: themeStyle.colors.error.default,
  },
  label: {
    fontWeight: "700",
  },
  textInputContainer: {
    alignSelf: "stretch",
    marginBottom: 20,
  },
  passwordGuide: {
    marginTop: 10,
  },
  titleText: {
    padding: 20,
    fontSize: 20,
    color: themeStyle.colors.primary.default,
    fontWeight: "700",
  },
});
export default React.memo(Step2Screen);
