import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import themeStyle from "../../../theme.style";
import Input from "../../../components/Input";
import { useSelector, useDispatch } from "react-redux";
import { Entypo, Feather } from "@expo/vector-icons";

const Step1Screen = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [jobTitle, setJobTitle] = useState("");

  const [validationErrors, setValidationErrors] = useState({});

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const checkAllDetailsProvided = () => {
    if (firstName && lastName && jobTitle) {
      return true;
    }
    return false;
  };
  const existingInfo = useSelector((state) => state.userData);
  const handleNext = () => {
    dispatch({
      type: "SET_USER_DATA",
      payload: { ...existingInfo.state, firstName, lastName, jobTitle },
    });
    navigation.navigate("Step2");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          borderBottomWidth: 0.2,
          borderBottomColor: themeStyle.colors.grayscale.higher,
          paddingBottom: 5,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
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
                  fontSize: 16,
                }}
              >
                Cancel
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
          }}
        >
          <Text
            style={{
              color: themeStyle.colors.primary.default,
              fontSize: 18,
              textAlign: "center",
              fontWeight: "600",
            }}
          >
            About you
          </Text>
        </View>
        <View style={{ flex: 1 }} />
      </View>
      <View>
        <ScrollView style={{ marginBottom: 48 }}>
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
            <Input
              isOutlined
              error={validationErrors?.jobTitle}
              label="Job Title/Education"
              value={jobTitle}
              setValue={setJobTitle}
              onChangeText={(v) => {
                setJobTitle(v);
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
