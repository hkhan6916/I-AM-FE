import { AntDesign, Ionicons } from "@expo/vector-icons";
import React from "react";
import { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import themeStyle from "../../theme.style";
import Input from "../Input";
import DateTimePicker from "@react-native-community/datetimepicker";
import getDayMonthYear from "../../helpers/getDayMonthYear";
import apiCall from "../../helpers/apiCall";

const AddJobModal = ({ setShowModal, ...rest }) => {
  const [roleName, setRoleName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [roleType, setRoleType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showDateFromPicker, setShowDateFromPicker] = useState(false);
  const [showDateToPicker, setShowDateToPicker] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setSubmitted(true);
    setLoading(true);
    const { response, success, message } = await apiCall(
      "POST",
      "/user/job-history/add",
      {
        roleName,
        companyName,
        roleDescription: description,
        dateFrom,
        dateTo,
        city,
        country,
        roleType,
      }
    );
    if (!success) {
      setSubmissionError(
        "An error occurred saving your job role. Please try again later."
      );
      setLoading(false);
    }

    if (success) {
      setLoading(false);
    }
  };

  return (
    <Modal
      {...rest}
      onRequestClose={() => {
        setShowModal(false);
      }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: themeStyle.colors.grayscale.highest,
          padding: 15,
        }}
      >
        <SafeAreaView
          style={{
            backgroundColor: themeStyle.colors.grayscale.highest,
            flex: 1,
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" && "padding"}
            style={{ flex: 1 }}
          >
            <View style={{ height: "100%" }}>
              <ScrollView keyboardShouldPersistTaps="handled">
                <View
                  style={{
                    alignSelf: "flex-start",
                    marginVertical: 10,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      setShowModal(false);
                      setDateFrom("");
                      setDateTo("");
                    }}
                    style={{
                      justifyContent: "center",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <AntDesign
                      name="arrowleft"
                      size={24}
                      color={themeStyle.colors.grayscale.lowest}
                    />
                    <Text
                      style={{
                        color: themeStyle.colors.grayscale.lowest,
                        fontSize: 16,
                        marginHorizontal: 10,
                      }}
                    >
                      Work history
                    </Text>
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    borderWidth: 2,
                    borderColor: themeStyle.colors.grayscale.lowest,
                    marginVertical: 10,
                    paddingVertical: 10,
                    borderRadius: 10,
                  }}
                >
                  <Text
                    style={{
                      color: themeStyle.colors.grayscale.lowest,
                      fontSize: 18,
                      marginLeft: 10,
                      marginBottom: 10,
                    }}
                  >
                    Required fields
                  </Text>
                  <View style={{ paddingHorizontal: 10 }}>
                    <Input
                      borderColor={themeStyle.colors.grayscale.lowest}
                      label={"Title*"}
                      placeholder={"Title*"}
                      onChangeText={(value) => setRoleName(value)}
                      value={roleName}
                    />
                  </View>
                  <View style={{ paddingHorizontal: 10 }}>
                    <Input
                      borderColor={themeStyle.colors.grayscale.lowest}
                      label={"Company Name*"}
                      placeholder={"Company Name*"}
                      onChangeText={(value) => setCompanyName(value)}
                      value={companyName}
                    />
                  </View>
                  <View style={{ paddingHorizontal: 10, marginVertical: 10 }}>
                    <Text style={{ color: themeStyle.colors.grayscale.lowest }}>
                      From*
                    </Text>
                    {showDateFromPicker ? (
                      <DateTimePicker
                        maximumDate={new Date()}
                        testID="from"
                        value={new Date()}
                        onChange={(_, date) => {
                          setShowDateFromPicker(false);
                          setError("");
                          if (dateTo && date > dateTo) {
                            setError(
                              "Your start date cannot be later than your end date."
                            );
                          }
                          setDateFrom(date);
                        }}
                        mode="date"
                      />
                    ) : null}
                    <TouchableWithoutFeedback
                      onPress={() => setShowDateFromPicker(true)}
                    >
                      <View
                        style={{
                          borderBottomColor: themeStyle.colors.grayscale.lowest,
                          borderBottomWidth: 1,
                          paddingVertical: 10,
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{ color: themeStyle.colors.grayscale.lowest }}
                        >
                          {getDayMonthYear(dateFrom)}
                        </Text>
                        <Ionicons
                          size={14}
                          name="calendar"
                          color={themeStyle.colors.grayscale.lowest}
                        />
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                  <View
                    style={{
                      paddingHorizontal: 10,
                      marginTop: 10,
                      marginBottom: 25,
                    }}
                  >
                    <Text style={{ color: themeStyle.colors.grayscale.lowest }}>
                      To
                    </Text>
                    {showDateToPicker ? (
                      <DateTimePicker
                        maximumDate={new Date()}
                        testID="to"
                        value={new Date()}
                        onChange={(_, date) => {
                          setShowDateToPicker(false);
                          setError("");
                          if (dateFrom && date < dateFrom) {
                            setError(
                              "Your end date cannot come earlier than your start date."
                            );
                          }
                          setDateTo(date);
                        }}
                        mode="date"
                      />
                    ) : null}
                    <TouchableWithoutFeedback
                      onPress={() => setShowDateToPicker(true)}
                    >
                      <View
                        style={{
                          borderBottomColor: themeStyle.colors.grayscale.lowest,
                          borderBottomWidth: 1,
                          paddingVertical: 10,
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{ color: themeStyle.colors.grayscale.lowest }}
                        >
                          {getDayMonthYear(dateTo) || "Present"}
                        </Text>
                        <Ionicons
                          size={14}
                          name="calendar"
                          color={themeStyle.colors.grayscale.lowest}
                        />
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </View>
                <View
                  style={{
                    borderWidth: 2,
                    borderColor: themeStyle.colors.grayscale.lowest,
                    marginVertical: 10,
                    paddingVertical: 10,
                    borderRadius: 10,
                  }}
                >
                  <Text
                    style={{
                      color: themeStyle.colors.grayscale.lowest,
                      fontSize: 18,
                      marginLeft: 10,
                      marginBottom: 10,
                    }}
                  >
                    Additional information
                  </Text>
                  <Text
                    style={{
                      color: themeStyle.colors.grayscale.lowest,
                      fontSize: 12,
                      marginLeft: 10,
                      marginBottom: 10,
                    }}
                  >
                    (Filling these out look good on your profile.)
                  </Text>
                  <View style={{ paddingHorizontal: 10 }}>
                    <Input
                      borderColor={themeStyle.colors.grayscale.lowest}
                      label={"Role Description"}
                      placeholder={"Role Description"}
                      onChangeText={(value) => setDescription(value)}
                      value={description}
                    />
                  </View>
                  <View style={{ paddingHorizontal: 10 }}>
                    <Input
                      borderColor={themeStyle.colors.grayscale.lowest}
                      label={"City"}
                      placeholder={"City"}
                      onChangeText={(value) => setCity(value)}
                      value={city}
                    />
                  </View>
                  <View style={{ paddingHorizontal: 10 }}>
                    <Input
                      borderColor={themeStyle.colors.grayscale.lowest}
                      label={"Country"}
                      placeholder={"Country"}
                      onChangeText={(value) => setCountry(value)}
                      value={country}
                    />
                  </View>
                  <View style={{ paddingHorizontal: 10, paddingBottom: 10 }}>
                    <Text
                      style={{
                        color: themeStyle.colors.grayscale.lowest,
                        marginBottom: 10,
                      }}
                    >
                      This role {dateTo ? "was" : "is"}:
                    </Text>
                    <View style={{ flexDirection: "row", width: "100%" }}>
                      <TouchableOpacity
                        style={{
                          borderColor:
                            roleType === "onsite"
                              ? themeStyle.colors.secondary.default
                              : themeStyle.colors.grayscale.lowest,
                          borderWidth: 1,
                          backgroundColor:
                            roleType === "onsite"
                              ? themeStyle.colors.secondary.default
                              : themeStyle.colors.grayscale.highest,
                          width: 80,
                          padding: 5,
                          borderRadius: 20,
                        }}
                        onPress={() => {
                          setRoleType("onsite");
                        }}
                      >
                        <Text
                          style={{
                            color: themeStyle.colors.white,
                            textAlign: "center",
                          }}
                        >
                          On site
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          borderColor:
                            roleType === "remote"
                              ? themeStyle.colors.secondary.default
                              : themeStyle.colors.grayscale.lowest,
                          borderWidth: 1,
                          backgroundColor:
                            roleType === "remote"
                              ? themeStyle.colors.secondary.default
                              : themeStyle.colors.grayscale.highest,
                          width: 80,
                          padding: 5,
                          borderRadius: 20,
                          marginHorizontal: 10,
                        }}
                        onPress={() => {
                          setRoleType("remote");
                        }}
                      >
                        <Text
                          style={{
                            color: themeStyle.colors.white,
                            textAlign: "center",
                          }}
                        >
                          Remote
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          borderColor:
                            roleType === "hybrid"
                              ? themeStyle.colors.secondary.default
                              : themeStyle.colors.grayscale.lowest,
                          borderWidth: 1,
                          backgroundColor:
                            roleType === "hybrid"
                              ? themeStyle.colors.secondary.default
                              : themeStyle.colors.grayscale.highest,
                          width: 80,
                          padding: 5,
                          borderRadius: 20,
                        }}
                        onPress={() => {
                          setRoleType("hybrid");
                        }}
                      >
                        <Text
                          style={{
                            color: themeStyle.colors.white,
                            textAlign: "center",
                          }}
                        >
                          Hybrid
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                {error ? (
                  <Text style={{ color: themeStyle.colors.error.default }}>
                    {error}
                  </Text>
                ) : null}
              </ScrollView>
              <TouchableOpacity
                style={{
                  borderRadius: 5,
                  padding: 10,
                  height: 48,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: themeStyle.colors.primary.default,
                  borderWidth: 1,
                  marginTop: 5,
                }}
                onPress={() => handleSubmit()}
              >
                {loading ? (
                  <ActivityIndicator
                    size={"small"}
                    color={themeStyle.colors.white}
                  />
                ) : (
                  <Text style={{ color: themeStyle.colors.white }}>
                    Add role
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default AddJobModal;
