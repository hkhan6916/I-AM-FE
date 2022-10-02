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
  Dimensions,
} from "react-native";
import themeStyle from "../../theme.style";
import Input from "../Input";
import DateTimePicker from "@react-native-community/datetimepicker";
import getDayMonthYear from "../../helpers/getDayMonthYear";
import apiCall from "../../helpers/apiCall";
import Checkbox from "../Checkbox";

const AddEducationModal = ({
  setShowModal = () => null,
  setEducationToEdit = () => null,
  setShowEducationHistoryModal = () => null,
  educationToEdit,
  ...rest
}) => {
  const [educationName, setEducationName] = useState(null);
  const [institutionName, setInstitutionName] = useState(null);
  const [description, setDescription] = useState(null);
  const [city, setCity] = useState(null);
  const [country, setCountry] = useState(null);
  const [roleType, setRoleType] = useState(null);
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [present, setPresent] = useState(false);
  const [showDateFromPicker, setShowDateFromPicker] = useState(false);
  const [showDateToPicker, setShowDateToPicker] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);

  const { width: screenWidth } = Dimensions.get("window");

  const handleSubmit = async () => {
    setSubmitted(true);
    setLoading(true);
    setSubmissionError("");
    const { success } = await apiCall(
      "POST",
      educationToEdit
        ? `/user/job-history/update/${educationToEdit._id}`
        : "/user/job-history/add",
      {
        educationName,
        institutionName,
        roleDescription: description,
        dateFrom,
        dateTo: present ? "" : dateTo,
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
      setSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setEducationToEdit(null);
      }, 1000);
    }
  };

  const handleDelete = async () => {
    setShowDeleteOptions(false);
    const { success, message } = await apiCall(
      "POST",
      `/user/job-history/remove/${educationToEdit._id}`,
      {}
    );
    if (success) {
      setDeleted(true);
      setTimeout(() => {
        setShowModal(false);
        setEducationToEdit(null);
      }, 1000);
    } else {
      setSubmissionError(
        "There was an error deleting this role. Please try again later."
      );
    }
  };

  const infoIsInvalid = () => {
    if (!educationToEdit) {
      return (
        loading ||
        success ||
        error ||
        !institutionName ||
        !educationName ||
        !dateFrom
      );
    }

    return loading || success || error;
  };

  return (
    <Modal
      {...rest}
      onRequestClose={() => {
        setShowModal(false);
        if (educationToEdit) {
          setShowEducationHistoryModal(true);
        }
        setEducationToEdit(null);
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
                      if (educationToEdit) {
                        setShowEducationHistoryModal(true);
                      }
                      setEducationToEdit(null);
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
                      {educationToEdit ? "Edit Education" : "Education History"}
                    </Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => setShowDeleteOptions(true)}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "flex-end",
                    }}
                  >
                    <AntDesign
                      name="delete"
                      size={16}
                      color={themeStyle.colors.error.default}
                    />
                    <Text
                      style={{
                        color: themeStyle.colors.error.default,
                        marginLeft: 5,
                        fontWeight: "700",
                      }}
                    >
                      Delete this role
                    </Text>
                  </View>
                </TouchableOpacity>
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
                    Required information
                  </Text>
                  <View style={{ paddingHorizontal: 10 }}>
                    <Input
                      borderColor={themeStyle.colors.grayscale.lowest}
                      label={"Title*"}
                      placeholder={"Title*"}
                      onChangeText={(value) => setEducationName(value)}
                      setValue={setEducationName}
                      value={
                        educationName !== null
                          ? educationName
                          : educationToEdit?.educationName || ""
                      }
                    />
                  </View>
                  <View style={{ paddingHorizontal: 10 }}>
                    <Input
                      borderColor={themeStyle.colors.grayscale.lowest}
                      label={"Company Name*"}
                      placeholder={"Company Name*"}
                      onChangeText={(value) => setInstitutionName(value)}
                      setValue={setInstitutionName}
                      value={
                        institutionName !== null
                          ? institutionName
                          : educationToEdit?.institutionName || ""
                      }
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
                        value={
                          dateFrom !== null
                            ? dateFrom
                            : educationToEdit?.dateFrom
                            ? new Date(educationToEdit?.dateFrom)
                            : new Date()
                        }
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
                          {getDayMonthYear(
                            dateFrom !== null
                              ? dateFrom
                              : educationToEdit?.dateFrom
                              ? new Date(educationToEdit?.dateFrom)
                              : new Date()
                          )}
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
                          setPresent(false);
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
                          {!present && (dateTo || educationToEdit?.dateTo)
                            ? getDayMonthYear(
                                dateTo
                                  ? dateTo
                                  : educationToEdit?.dateTo
                                  ? new Date(educationToEdit?.dateTo)
                                  : ""
                              )
                            : "Present"}
                        </Text>
                        <Ionicons
                          size={14}
                          name="calendar"
                          color={themeStyle.colors.grayscale.lowest}
                        />
                      </View>
                    </TouchableWithoutFeedback>
                    <Checkbox
                      checked={present || (!dateTo && !educationToEdit?.dateTo)}
                      setChecked={setPresent}
                      label={"I still work here"}
                    />
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
                      setValue={setDescription}
                      multiline
                      style={{ height: 80 }}
                      value={
                        description !== null
                          ? description
                          : educationToEdit?.roleDescription || ""
                      }
                    />
                  </View>
                  <View style={{ paddingHorizontal: 10 }}>
                    <Input
                      borderColor={themeStyle.colors.grayscale.lowest}
                      label={"City"}
                      placeholder={"City"}
                      onChangeText={(value) => setCity(value)}
                      setValue={setCity}
                      value={city !== null ? city : educationToEdit?.city || ""}
                    />
                  </View>
                  <View style={{ paddingHorizontal: 10 }}>
                    <Input
                      borderColor={themeStyle.colors.grayscale.lowest}
                      label={"Country"}
                      placeholder={"Country"}
                      onChangeText={(value) => setCountry(value)}
                      setValue={setCountry}
                      value={
                        country !== null
                          ? country
                          : educationToEdit?.country || ""
                      }
                    />
                  </View>
                </View>
              </ScrollView>
              {error ? (
                <Text
                  style={{
                    color: themeStyle.colors.error.default,
                    textAlign: "center",
                    marginVertical: 10,
                  }}
                >
                  {error}
                </Text>
              ) : submissionError ? (
                <Text
                  style={{
                    color: themeStyle.colors.error.default,
                    textAlign: "center",
                    marginVertical: 10,
                  }}
                >
                  {submissionError}
                </Text>
              ) : null}
              {!showDeleteOptions ? (
                <TouchableOpacity
                  style={{
                    borderRadius: 5,
                    padding: 10,
                    height: 48,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor:
                      deleted || success
                        ? themeStyle.colors.grayscale.highest
                        : themeStyle.colors.primary.default,
                    borderWidth: 1,
                    marginTop: 5,
                    opacity: infoIsInvalid() ? 0.5 : 1,
                  }}
                  onPress={() => handleSubmit()}
                  disabled={infoIsInvalid()}
                >
                  {loading ? (
                    <ActivityIndicator
                      size={"small"}
                      color={themeStyle.colors.white}
                    />
                  ) : deleted ? (
                    <Text
                      style={{
                        color: themeStyle.colors.white,
                        fontWeight: "700",
                      }}
                    >
                      Role deleted
                    </Text>
                  ) : success ? (
                    <Text
                      style={{
                        color: themeStyle.colors.white,
                        fontWeight: "700",
                      }}
                    >
                      {educationToEdit ? "Role updated" : "Role added"}
                    </Text>
                  ) : (
                    <Text style={{ color: themeStyle.colors.white }}>
                      {educationToEdit ? "Update role" : "Add role"}
                    </Text>
                  )}
                </TouchableOpacity>
              ) : (
                <View
                  style={{
                    backgroundColor: "rgba(140, 140, 140, 0.3)",
                    width: screenWidth,
                    alignSelf: "center",
                    paddingVertical: 10,
                  }}
                >
                  <Text
                    style={{
                      color: themeStyle.colors.grayscale.lowest,
                      marginBottom: 20,
                      marginLeft: 20,
                      fontWeight: "700",
                    }}
                  >
                    Are you sure you want to delete this role?
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <TouchableOpacity
                      onPress={async () => {
                        await handleDelete();
                      }}
                      style={{ height: 48, justifyContent: "center" }}
                    >
                      <Text
                        style={{
                          color: themeStyle.colors.error.default,
                          paddingHorizontal: 20,
                          fontWeight: "700",
                        }}
                      >
                        Delete
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setShowDeleteOptions(false)}
                      style={{ height: 48, justifyContent: "center" }}
                    >
                      <Text
                        style={{
                          color: themeStyle.colors.grayscale.lowest,
                          textAlign: "center",
                          paddingHorizontal: 40,
                          fontWeight: "700",
                        }}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default AddEducationModal;
