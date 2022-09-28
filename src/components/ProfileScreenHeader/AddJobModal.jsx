import { AntDesign } from "@expo/vector-icons";
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
} from "react-native";
import themeStyle from "../../theme.style";
import InputNoBorder from "../InputNoBorder";
import DateTimePicker from "@react-native-community/datetimepicker";
import getDayMonthYear from "../../helpers/getDayMonthYear";

const AddJobModal = ({ setShowModal, ...rest }) => {
  const [roleName, setRoleName] = useState("");
  const [error, setError] = useState("");
  const [remote, setRemote] = useState(false);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

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
                      setFromDate("");
                      setToDate("");
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
                <View style={{ paddingHorizontal: 10 }}>
                  <InputNoBorder label={"Title"} />
                </View>
                <View style={{ paddingHorizontal: 10 }}>
                  <InputNoBorder label={"Company"} />
                </View>
                <View style={{ paddingHorizontal: 10 }}>
                  <InputNoBorder label={"Description"} />
                </View>
                <View style={{ paddingHorizontal: 10 }}>
                  <InputNoBorder label={"City"} />
                </View>
                <View style={{ paddingHorizontal: 10 }}>
                  <InputNoBorder label={"Country"} />
                </View>
                <View style={{ paddingHorizontal: 10, marginVertical: 10 }}>
                  <Text style={{ color: themeStyle.colors.grayscale.lowest }}>
                    From
                  </Text>
                  {showFromDatePicker ? (
                    <DateTimePicker
                      maximumDate={new Date()}
                      testID="from"
                      value={new Date()}
                      onChange={(_, date) => {
                        setShowFromDatePicker(false);
                        setError("");
                        if (toDate && date > toDate) {
                          setError(
                            "Your start date cannot be later than your end date."
                          );
                        }
                        setFromDate(date);
                      }}
                      mode="date"
                    />
                  ) : null}
                  <TouchableWithoutFeedback
                    onPress={() => setShowFromDatePicker(true)}
                  >
                    <View
                      style={{
                        borderBottomColor: themeStyle.colors.grayscale.lowest,
                        borderBottomWidth: 1,
                        paddingVertical: 10,
                      }}
                    >
                      <Text
                        style={{ color: themeStyle.colors.grayscale.lowest }}
                      >
                        {getDayMonthYear(fromDate)}
                      </Text>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
                <View style={{ paddingHorizontal: 10, marginVertical: 10 }}>
                  <Text style={{ color: themeStyle.colors.grayscale.lowest }}>
                    To
                  </Text>
                  {showToDatePicker ? (
                    <DateTimePicker
                      maximumDate={new Date()}
                      testID="to"
                      value={new Date()}
                      onChange={(_, date) => {
                        setShowToDatePicker(false);
                        setError("");
                        if (fromDate && date < fromDate) {
                          setError(
                            "Your end date cannot come earlier than your start date."
                          );
                        }
                        setToDate(date);
                      }}
                      mode="date"
                    />
                  ) : null}
                  <TouchableWithoutFeedback
                    onPress={() => setShowToDatePicker(true)}
                  >
                    <View
                      style={{
                        borderBottomColor: themeStyle.colors.grayscale.lowest,
                        borderBottomWidth: 1,
                        paddingVertical: 10,
                      }}
                    >
                      <Text
                        style={{ color: themeStyle.colors.grayscale.lowest }}
                      >
                        {getDayMonthYear(toDate) || "Present"}
                      </Text>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
                <View style={{ paddingHorizontal: 10, paddingBottom: 10 }}>
                  <TouchableOpacity
                    style={{
                      borderColor: remote
                        ? themeStyle.colors.secondary.default
                        : themeStyle.colors.grayscale.lowest,
                      borderWidth: 1,
                      backgroundColor: remote
                        ? themeStyle.colors.secondary.default
                        : themeStyle.colors.grayscale.highest,
                      maxWidth: 100,
                      padding: 5,
                      borderRadius: 20,
                    }}
                    onPress={() => {
                      setRemote(!remote);
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
                </View>
                {error ? (
                  <Text style={{ color: themeStyle.colors.error.default }}>
                    {error}
                  </Text>
                ) : null}
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default AddJobModal;
