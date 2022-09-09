import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import themeStyle from "../../../theme.style";
import Input from "../../../components/Input";
import { useSelector, useDispatch } from "react-redux";
import { Entypo, Feather } from "@expo/vector-icons";
import apiCall from "../../../helpers/apiCall";
import webPersistUserData from "../../../helpers/webPersistUserData";
import getWebPersistedUserData from "../../../helpers/getWebPersistedData";

const Step1Screen = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobTitleOptions, setJobTitleOptions] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [typingStatus, setTypingStatus] = useState({
    name: "",
    typing: false,
    typingTimeout: 0,
  });

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const checkAllDetailsProvided = () => {
    if (firstName && lastName && jobTitle) {
      return true;
    }
    return false;
  };

  const existingNativeUserData = useSelector((state) => state.userData);

  const existingInfo =
    Platform.OS === "web"
      ? { state: getWebPersistedUserData() }
      : existingNativeUserData;

  const handleNext = () => {
    dispatch({
      type: "SET_USER_DATA",
      payload: { ...existingInfo.state, firstName, lastName, jobTitle },
    });
    webPersistUserData({
      ...existingInfo.state,
      firstName,
      lastName,
      jobTitle,
    });

    navigation.navigate("Step2");
  };

  const getJobTitles = async (query) => {
    if (typingStatus.typingTimeout) {
      clearTimeout(typingStatus.typingTimeout);
    }
    setTypingStatus({
      name: query,
      typing: false,
      typingTimeout: setTimeout(async () => {
        const { response } = await apiCall("GET", `/jobs/search/${query}`);
        if (response?.length) {
          response.map((jobTitle) => {
            jobTitle.title = jobTitle?.title.replace(
              /(^\w{1})|(\s+\w{1})/g,
              (letter) => letter.toUpperCase()
            );
          });
          setJobTitleOptions(response.length <= 5 ? response : []);
        }
      }, 200),
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          paddingBottom: 5,
          height: 60,
          paddingHorizontal: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Feather
                name="chevron-left"
                size={32}
                color={themeStyle.colors.primary.default}
              />
              <Text
                style={{
                  color: themeStyle.colors.primary.default,
                  fontSize: 20,
                  marginLeft: 30,
                  fontWeight: "700",
                }}
              >
                Back to login
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1 }} />
      </View>
      <View style={{ height: "100%" }}>
        <ScrollView
          style={{ marginBottom: 48 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <Text style={styles.titleText}>A bit about you</Text>
            <Input
              isOutlined
              error={validationErrors?.firstName}
              label="First Name"
              value={firstName}
              setValue={setFirstName}
              onChangeText={(v) => {
                setFirstName(v);
                if (validationErrors.firstName) {
                  setValidationErrors({
                    ...validationErrors,
                    firstName: null,
                  });
                }
              }}
            />
            <Input
              isOutlined
              error={validationErrors?.lastName}
              label="Last Name"
              value={lastName}
              setValue={setLastName}
              onChangeText={(v) => {
                setLastName(v);
                if (validationErrors.lastName) {
                  setValidationErrors({
                    ...validationErrors,
                    lastName: null,
                  });
                }
              }}
            />
            {jobTitleOptions?.length ? (
              <ScrollView
                style={{
                  // alignSelf: "flex-start",
                  position: "absolute",
                  bottom: 185,
                  zIndex: 111,
                  // left: 20,
                  backgroundColor: themeStyle.colors.grayscale.higher,
                  paddingHorizontal: 10,
                  width: "100%",
                }}
                keyboardShouldPersistTaps="handled"
              >
                <View>
                  {jobTitleOptions.map((item, i) => (
                    <TouchableOpacity
                      style={{
                        // marginVertical: 10,
                        height: 48,
                        justifyContent: "center",
                        borderTopColor: themeStyle.colors.grayscale.highest,
                        borderTopWidth: i > 0 ? 1 : 0,
                        zIndex: 999,
                      }}
                      key={`${item._id}-${i}`}
                      onPress={() => {
                        setJobTitle(item.title);
                        setJobTitleOptions([]);
                      }}
                    >
                      <Text
                        style={{
                          color: themeStyle.colors.grayscale.lowest,
                        }}
                      >
                        {item.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            ) : null}
            <Input
              isOutlined
              error={validationErrors?.jobTitle}
              label="Job Title/Education"
              value={jobTitle}
              setValue={setJobTitle}
              onBlur={() => setJobTitleOptions([])}
              onEndEditing={() => setJobTitleOptions([])}
              onClear={() => setJobTitleOptions([])}
              onChangeText={(v) => {
                if (!v) {
                  setJobTitleOptions([]);
                }
                setJobTitle(v);
                getJobTitles(v);
                if (validationErrors.jobTitle) {
                  setValidationErrors({
                    ...validationErrors,
                    jobTitle: null,
                  });
                }
              }}
            />
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeStyle.colors.grayscale.highest,
  },
  formContainer: {
    paddingHorizontal: 10,
    paddingVertical: 20,
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
    color: themeStyle.colors.white,
    textAlign: "center",
  },
  label: {
    fontWeight: "700",
  },
  titleText: {
    padding: 20,
    fontSize: 20,
    color: themeStyle.colors.primary.default,
    fontWeight: "700",
  },
});
export default React.memo(Step1Screen);
