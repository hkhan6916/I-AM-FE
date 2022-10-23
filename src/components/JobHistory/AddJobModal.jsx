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

const AddJobModal = ({
  setShowModal = () => null,
  setJobToEdit = () => null,
  setShowJobHistoryModal = () => null,
  jobToEdit,
  ...rest
}) => {
  const [roleName, setRoleName] = useState(null);
  const [companyName, setCompanyName] = useState(null);
  const [description, setDescription] = useState(null);
  const [city, setCity] = useState(null);
  const [country, setCountry] = useState(null);
  const [roleType, setRoleType] = useState(null);
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [dateToLiveSelection, setDateToLiveSelection] = useState(null);
  const [dateFromLiveSelection, setDateFromLiveSelection] = useState(null);
  const [present, setPresent] = useState(false);
  const [showDateFromPicker, setShowDateFromPicker] = useState(false);
  const [showDateToPicker, setShowDateToPicker] = useState(false);
  const [errors, setErrors] = useState({
    dateTo: "",
    dateFrom: "",
  });
  const [submissionError, setSubmissionError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);

  const { width: screenWidth } = Dimensions.get("window");

  const currentDate = resetHoursOnDate(new Date());

  const handleSubmit = async () => {
    setLoading(true);
    setSubmissionError("");
    const { success } = await apiCall(
      "POST",
      jobToEdit
        ? `/user/job-history/update/${jobToEdit._id}`
        : "/user/job-history/add",
      {
        roleName,
        companyName,
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
        if (jobToEdit) {
          setShowJobHistoryModal(true);
        }
        setJobToEdit(null);
      }, 1000);
    }
  };

  const handleDelete = async () => {
    setShowDeleteOptions(false);
    const { success } = await apiCall(
      "POST",
      `/user/job-history/remove/${jobToEdit._id}`,
      {}
    );
    if (success) {
      setDeleted(true);
      setTimeout(() => {
        setShowModal(false);
        setJobToEdit(null);
      }, 1000);
    } else {
      setSubmissionError(
        "There was an error deleting this role. Please try again later."
      );
    }
  };

  const infoIsInvalid = () => {
    const noErrors = Object.values(errors).every((x) => x == null || x === "");

    if (!jobToEdit) {
      return (
        loading ||
        success ||
        !noErrors ||
        !companyName ||
        !roleName ||
        !dateFrom
      );
    }

    return loading || success || !noErrors;
  };

  useEffect(() => {
    if (jobToEdit) {
      setDateFrom(jobToEdit.dateFrom);
      setDateTo(jobToEdit.dateTo);
      setDateFromLiveSelection(jobToEdit.dateFrom);
      setDateToLiveSelection(jobToEdit.dateTo);
      setPresent(!jobToEdit?.dateTo);
    } else {
      setDateTo(currentDate);
      setDateFrom(jobToEdit?.dateFrom);
      setDateToLiveSelection(currentDate);
      setDateFromLiveSelection(currentDate);
    }
  }, [jobToEdit]);

  useEffect(() => {
    const _dateFrom = resetHoursOnDate(dateFrom || currentDate);
    const _dateTo = resetHoursOnDate(dateTo || currentDate);
    let errorObj = errors;
    if (present && currentDate < _dateFrom) {
      errorObj = {
        ...errorObj,
        dateFrom:
          "Your start date cannot be in the future if you're still in this role.",
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
        if (jobToEdit) {
          setShowJobHistoryModal(true);
        }
        setJobToEdit(null);
      }}
      animationType={"slide"}
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
                    if (jobToEdit) {
                      setShowJobHistoryModal(true);
                    }
                    setJobToEdit(null);
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
                    {jobToEdit ? "Edit Role" : "Work History"}
                  </Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                style={{ paddingHorizontal: 15 }}
              >
                {jobToEdit ? (
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
                          Delete this role
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
                      onChangeText={(value) => setRoleName(value)}
                      setValue={setRoleName}
                      value={
                        roleName !== null ? roleName : jobToEdit?.roleName || ""
                      }
                      maxLength={40}
                    />
                  </View>
                  <View style={{ paddingHorizontal: 10 }}>
                    <Input
                      borderColor={themeStyle.colors.grayscale.lowest}
                      label={"Company Name*"}
                      placeholder={"Company Name*"}
                      onChangeText={(value) => setCompanyName(value)}
                      setValue={setCompanyName}
                      value={
                        companyName !== null
                          ? companyName
                          : jobToEdit?.companyName || ""
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
                                textColor={themeStyle.colors.secondary.default}
                                value={
                                  new Date(
                                    dateFromLiveSelection ||
                                      dateFrom ||
                                      jobToEdit?.dateFrom ||
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
                                      setPresent(false);
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
                                      setPresent(false);
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
                            new Date(
                              dateFrom || jobToEdit?.dateFrom || currentDate
                            )
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
                                textColor={themeStyle.colors.secondary.default}
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
                                      setPresent(false);
                                    }
                                  }
                                  setDateToLiveSelection(date);
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
                                      Close
                                    </Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    onPress={() => {
                                      setDateTo(
                                        dateToLiveSelection || currentDate
                                      );
                                      setShowDateToPicker(false);
                                      setPresent(false);
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
                      onPress={() => setShowDateToPicker(true)}
                      style={{ height: 48 }}
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
                          {!present && (dateTo || jobToEdit?.dateTo)
                            ? getDayMonthYear(
                                dateTo
                                  ? dateTo
                                  : jobToEdit?.dateTo
                                  ? new Date(jobToEdit?.dateTo)
                                  : ""
                              )
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
                        checked={present || (!dateTo && !jobToEdit?.dateTo)}
                        setChecked={(checked) => {
                          setPresent(checked);
                          if (!checked) {
                            setDateTo(currentDate);
                          } else {
                            setDateTo("");
                          }
                        }}
                        label={"I still work here"}
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
                      label={"Role Description"}
                      placeholder={"Role Description"}
                      onChangeText={(value) => setDescription(value)}
                      value={
                        description !== null
                          ? description
                          : jobToEdit?.roleDescription || ""
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
                      value={city !== null ? city : jobToEdit?.city || ""}
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
                        country !== null ? country : jobToEdit?.country || ""
                      }
                      maxLength={40}
                    />
                  </View>
                  <View style={{ paddingHorizontal: 10, paddingBottom: 10 }}>
                    <Text
                      style={{
                        color: themeStyle.colors.grayscale.lowest,
                        marginBottom: 10,
                      }}
                    >
                      This role{" "}
                      {dateTo !== null && !present
                        ? "was"
                        : jobToEdit?.dateTo
                        ? "was"
                        : "is"}
                      :
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
                            color:
                              roleType === "onsite"
                                ? themeStyle.colors.white
                                : themeStyle.colors.grayscale.lowest,
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
                            color:
                              roleType === "remote"
                                ? themeStyle.colors.white
                                : themeStyle.colors.grayscale.lowest,
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
                            color:
                              roleType === "hybrid"
                                ? themeStyle.colors.white
                                : themeStyle.colors.grayscale.lowest,
                            textAlign: "center",
                          }}
                        >
                          Hybrid
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                {submissionError ? (
                  <Text
                    style={{
                      color: themeStyle.colors.error.default,
                      marginVertical: 10,
                      paddingHorizontal: 5,
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
                        {jobToEdit ? "Role updated" : "Role added"}
                      </Text>
                    ) : (
                      <Text style={{ color: themeStyle.colors.white }}>
                        {jobToEdit ? "Update role" : "Add role"}
                      </Text>
                    )}
                  </TouchableOpacity>
                ) : null}
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
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
          ) : null}
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default AddJobModal;
