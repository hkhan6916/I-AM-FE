import { AntDesign, Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
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
import TextArea from "../TextArea";
import resetHoursOnDate from "../../helpers/resetHoursOnDate";

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
  const [dateFrom, setDateFrom] = useState(null);
  const [dateFromLiveSelection, setDateFromLiveSelection] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [dateToLiveSelection, setDateToLiveSelection] = useState(null);
  const [present, setPresent] = useState(false);
  const [showDateFromPicker, setShowDateFromPicker] = useState(false);
  const [showDateToPicker, setShowDateToPicker] = useState(false);
  const [errors, setErrors] = useState({
    dateTo: "",
    dateFrom: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);

  const { width: screenWidth } = Dimensions.get("window");

  const currentDate = resetHoursOnDate(new Date());

  const handleSubmit = async () => {
    setSubmitted(true);
    setLoading(true);
    setSubmissionError("");
    const { success } = await apiCall(
      "POST",
      educationToEdit
        ? `/user/education-history/update/${educationToEdit._id}`
        : "/user/education-history/add",
      {
        educationName,
        institutionName,
        educationDescription: description,
        dateFrom,
        dateTo,
        city,
        country,
      }
    );
    if (!success) {
      setSubmissionError(
        "There was a problem saving your education history. Please try again later."
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
    const { success } = await apiCall(
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
        "There was a problem updating your education history. Please try again later."
      );
    }
  };

  const infoIsInvalid = () => {
    const noErrors = Object.values(errors).every((x) => x == null || x === "");

    if (!educationToEdit) {
      return (
        loading ||
        success ||
        !noErrors ||
        !institutionName ||
        !educationName ||
        !dateFrom
      );
    }

    return loading || success || !noErrors;
  };

  useEffect(() => {
    if (educationToEdit) {
      setDateFrom(educationToEdit.dateFrom);
      setDateFromLiveSelection(educationToEdit.dateFrom);
      setDateTo(educationToEdit.dateTo);
    } else {
      setDateTo(currentDate);
      setDateFrom(currentDate);
      setDateFromLiveSelection(currentDate);
    }
  }, []);

  useEffect(() => {
    const _dateFrom = resetHoursOnDate(dateFrom || currentDate);
    const _dateTo = resetHoursOnDate(dateTo || currentDate);
    let errorObj = errors;
    if (present && currentDate < _dateFrom && !errors.dateFrom) {
      errorObj = {
        ...errorObj,
        dateFrom:
          "Your start date cannot be in the future if you still study here.",
      };
    } else {
      errorObj = { ...errorObj, dateFrom: "" };
    }
    if (_dateTo < _dateFrom && !present) {
      errorObj = {
        ...errorObj,
        dateTo: "Your end date cannot come earlier than your start date.",
      };
    } else if (errors.dateTo) {
      errorObj = { ...errorObj, dateTo: "" };
    }
    setErrors(errorObj);
  }, [present, dateTo, dateFrom]);

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
              <View
                style={{
                  alignSelf: "flex-start",
                  marginVertical: 10,
                  marginHorizontal: 15,
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
              <ScrollView
                keyboardShouldPersistTaps="handled"
                style={{ paddingHorizontal: 15 }}
              >
                {educationToEdit ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "flex-end",
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => setShowDeleteOptions(true)}
                    >
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
                          Delete this education
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                ) : null}
                <View
                  style={{
                    borderWidth: 2,
                    borderColor: themeStyle.colors.grayscale.lowest,
                    marginVertical: 10,
                    paddingVertical: 10,
                    borderRadius: 10,
                  }}
                >
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
                      maxLength={40}
                    />
                  </View>
                  <View style={{ paddingHorizontal: 10 }}>
                    <Input
                      borderColor={themeStyle.colors.grayscale.lowest}
                      label={"Institution Name*"}
                      placeholder={"Institution Name*"}
                      onChangeText={(value) => setInstitutionName(value)}
                      setValue={setInstitutionName}
                      value={
                        institutionName !== null
                          ? institutionName
                          : educationToEdit?.institutionName || ""
                      }
                      maxLength={40}
                    />
                  </View>
                  <View style={{ paddingHorizontal: 10, marginVertical: 10 }}>
                    <Text
                      style={{
                        color: themeStyle.colors.grayscale.lowest,
                        fontWeight: "400",
                        fontSize: 12,
                      }}
                    >
                      From*
                    </Text>
                    {showDateFromPicker ? (
                      <Modal transparent>
                        <TouchableWithoutFeedback
                          onPress={() => {
                            setShowDateFromPicker(false);
                          }}
                        >
                          <SafeAreaView
                            style={{
                              flex: 1,
                              justifyContent: "flex-end",
                            }}
                          >
                            <View
                              style={{
                                backgroundColor:
                                  themeStyle.colors.grayscale.highest,
                              }}
                            >
                              <DateTimePicker
                                testID="from"
                                maximumDate={currentDate}
                                value={
                                  new Date(
                                    dateFromLiveSelection ||
                                      dateFrom ||
                                      educationToEdit?.dateFrom ||
                                      currentDate
                                  )
                                }
                                onChange={(e, date) => {
                                  if (Platform.OS === "android") {
                                    if (e.type === "dismissed") {
                                      setShowDateFromPicker(false);
                                    } else if (e.type === "set") {
                                      setDateFrom(date);
                                      setShowDateFromPicker(false);
                                    }
                                  }
                                  // setShowDateToPicker(false);
                                  setDateFromLiveSelection(date);
                                }}
                                mode="date"
                                display="spinner"
                              />
                              {Platform.OS === "ios" ? (
                                <View
                                  style={{
                                    width: "100%",
                                    justifyContent: "space-between",
                                    flexDirection: "row",
                                    marginTop: 20,
                                    paddingHorizontal: 20,
                                  }}
                                >
                                  <TouchableOpacity
                                    onPress={() => {
                                      setShowDateFromPicker(false);
                                      setDateFromLiveSelection(dateTo);
                                    }}
                                    style={{
                                      height: 48,
                                      width: 60,
                                      justifyContent: "center",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Text
                                      style={{
                                        color: themeStyle.colors.error.default,
                                        fontWeight: "700",
                                      }}
                                    >
                                      Close
                                    </Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    onPress={() => {
                                      setDateFrom(
                                        dateFromLiveSelection || currentDate
                                      );
                                      setShowDateFromPicker(false);
                                    }}
                                    style={{
                                      height: 48,
                                      width: 60,
                                      justifyContent: "center",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Text
                                      style={{
                                        color:
                                          themeStyle.colors.secondary.default,
                                        fontWeight: "700",
                                      }}
                                    >
                                      Done
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                              ) : null}
                            </View>
                          </SafeAreaView>
                        </TouchableWithoutFeedback>
                      </Modal>
                    ) : null}
                    <TouchableWithoutFeedback
                      onPress={() => {
                        setShowDateFromPicker(true);
                        setShowDateToPicker(false);
                      }}
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
                          style={{
                            color: themeStyle.colors.grayscale.lowest,
                          }}
                        >
                          {getDayMonthYear(
                            dateFrom || educationToEdit?.dateFrom || currentDate
                          )}
                        </Text>
                        <Ionicons
                          size={14}
                          name="calendar"
                          color={themeStyle.colors.grayscale.lowest}
                        />
                      </View>
                    </TouchableWithoutFeedback>
                    {errors.dateFrom ? (
                      <Text
                        style={{
                          paddingHorizontal: 5,
                          color: themeStyle.colors.error.default,
                          marginVertical: 10,
                        }}
                      >
                        {errors.dateFrom}
                      </Text>
                    ) : null}
                  </View>
                  <View
                    style={{
                      paddingHorizontal: 10,
                      marginTop: 10,
                      marginBottom: 25,
                    }}
                  >
                    <Text
                      style={{
                        color: themeStyle.colors.grayscale.lowest,
                        fontWeight: "400",
                        fontSize: 12,
                      }}
                    >
                      To
                    </Text>
                    {showDateToPicker ? (
                      <Modal transparent>
                        <TouchableWithoutFeedback
                          onPress={() => {
                            setShowDateToPicker(false);
                          }}
                        >
                          <SafeAreaView
                            style={{
                              flex: 1,
                              justifyContent: "flex-end",
                            }}
                          >
                            <View
                              style={{
                                backgroundColor:
                                  themeStyle.colors.grayscale.highest,
                              }}
                            >
                              <DateTimePicker
                                testID="to"
                                maximumDate={currentDate}
                                value={
                                  new Date(
                                    dateToLiveSelection || dateTo || currentDate
                                  )
                                }
                                onChange={(e, date) => {
                                  if (Platform.OS === "android") {
                                    if (e.type === "dismissed") {
                                      setShowDateToPicker(false);
                                    } else if (e.type === "set") {
                                      setDateTo(date);
                                      setShowDateToPicker(false);
                                    }
                                  }
                                  setDateToLiveSelection(date);
                                  setPresent(false);
                                }}
                                mode="date"
                                display="spinner"
                              />
                              {Platform.OS === "ios" ? (
                                <View
                                  style={{
                                    width: "100%",
                                    justifyContent: "space-between",
                                    flexDirection: "row",
                                    marginTop: 20,
                                    paddingHorizontal: 20,
                                  }}
                                >
                                  <TouchableOpacity
                                    onPress={() => {
                                      setShowDateToPicker(false);
                                      setDateToLiveSelection(dateTo);
                                    }}
                                    style={{
                                      height: 48,
                                      width: 60,
                                      justifyContent: "center",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Text
                                      style={{
                                        color: themeStyle.colors.error.default,
                                        fontWeight: "700",
                                      }}
                                    >
                                      Cancel
                                    </Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    onPress={() => {
                                      setDateTo(
                                        dateToLiveSelection || currentDate
                                      );
                                      setShowDateToPicker(false);
                                    }}
                                    style={{
                                      height: 48,
                                      width: 60,
                                      justifyContent: "center",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Text
                                      style={{
                                        color:
                                          themeStyle.colors.secondary.default,
                                        fontWeight: "700",
                                      }}
                                    >
                                      Done
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                              ) : null}
                            </View>
                          </SafeAreaView>
                        </TouchableWithoutFeedback>
                      </Modal>
                    ) : null}
                    <TouchableWithoutFeedback
                      style={{ height: 48 }}
                      onPress={() => {
                        setShowDateFromPicker(false);
                        setShowDateToPicker(true);
                      }}
                    >
                      <View
                        style={{
                          borderBottomColor:
                            !present &&
                            resetHoursOnDate(dateTo) <
                              resetHoursOnDate(dateFrom)
                              ? themeStyle.colors.error.default
                              : themeStyle.colors.grayscale.lowest,
                          borderBottomWidth: 1,
                          paddingVertical: 10,
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            color:
                              !present &&
                              resetHoursOnDate(dateTo) <
                                resetHoursOnDate(dateFrom)
                                ? themeStyle.colors.error.default
                                : themeStyle.colors.grayscale.lowest,
                          }}
                        >
                          {!present && (dateTo || educationToEdit?.dateTo)
                            ? getDayMonthYear(dateTo || educationToEdit?.dateTo)
                            : "Present"}
                        </Text>
                        <Ionicons
                          size={14}
                          name="calendar"
                          color={
                            !present &&
                            resetHoursOnDate(dateTo) <
                              resetHoursOnDate(dateFrom)
                              ? themeStyle.colors.error.default
                              : themeStyle.colors.grayscale.lowest
                          }
                        />
                      </View>
                    </TouchableWithoutFeedback>
                    {errors.dateTo ? (
                      <Text
                        style={{
                          paddingHorizontal: 5,
                          color: themeStyle.colors.error.default,
                          marginVertical: 10,
                        }}
                      >
                        {errors.dateTo}
                      </Text>
                    ) : null}
                    <View style={{ marginTop: 25 }}>
                      <Checkbox
                        checked={
                          present || (!dateTo && !educationToEdit?.dateTo)
                        }
                        setChecked={(checked) => {
                          setPresent(checked);
                          if (!checked) {
                            setDateTo(currentDate);
                            setDateToLiveSelection(currentDate);
                          } else {
                            setDateTo("");
                          }
                        }}
                        label={"I still study here"}
                      />
                    </View>
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
                  <View style={{ paddingHorizontal: 10, marginBottom: 20 }}>
                    <TextArea
                      borderColor={themeStyle.colors.grayscale.lowest}
                      label={"Education Description"}
                      placeholder={"Education Description"}
                      onChangeText={(value) => setDescription(value)}
                      value={
                        description !== null
                          ? description
                          : educationToEdit?.educationDescription || ""
                      }
                      maxLength={2000}
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
                      maxLength={40}
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
                      maxLength={40}
                    />
                  </View>
                </View>
                {submissionError ? (
                  <Text
                    style={{
                      paddingHorizontal: 5,
                      color: themeStyle.colors.error.default,
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
                          color: themeStyle.colors.grayscale.lowest,
                          fontWeight: "700",
                        }}
                      >
                        Education deleted
                      </Text>
                    ) : success ? (
                      <Text
                        style={{
                          color: themeStyle.colors.grayscale.lowest,
                          fontWeight: "700",
                        }}
                      >
                        {educationToEdit
                          ? "Education updated"
                          : "Education added"}
                      </Text>
                    ) : (
                      <Text style={{ color: themeStyle.colors.white }}>
                        {educationToEdit ? "Update Education" : "Add Education"}
                      </Text>
                    )}
                  </TouchableOpacity>
                ) : null}
              </ScrollView>
              {showDeleteOptions ? (
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
                    Are you sure you want to delete this from your education
                    history?
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
              ) : null}
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default AddEducationModal;
