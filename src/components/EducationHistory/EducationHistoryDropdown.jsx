import { Feather, Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import themeStyle from "../../theme.style";
import EducationHistoryItem from "./EducationHistoryItem";

const EducationHistoryDropdown = ({
  showEducationHistory,
  setShowEducationHistory,
  setShowJobHistory,
  userEducationHistory,
  numberOfEducationHistoryRecords,
  getUserEducationHistory,
  setShowAddEducationModal,
  showEditButton,
}) => {
  return (
    <>
      <TouchableOpacity
        onPress={() => {
          setShowEducationHistory(!showEducationHistory);
          if (!showEducationHistory) {
            setShowJobHistory(false);
          }
        }}
        style={{ marginVertical: 10 }}
        disabled={!userEducationHistory?.length}
      >
        <View
          style={{
            borderWidth: 1,
            borderColor: showEducationHistory
              ? themeStyle.colors.primary.default
              : themeStyle.colors.grayscale.lowest,
            borderRadius: 5,
            width: "100%",
            height: 52,
            flexDirection: "row",
            alignItems: "center",
            opacity: userEducationHistory?.length ? 1 : 0.5,
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons
              name={showEducationHistory ? "school-outline" : "school"}
              size={24}
              color={themeStyle.colors.grayscale.lower}
              style={{ marginHorizontal: 10 }}
            />
            <Text
              style={{
                fontSize: userEducationHistory?.length ? 16 : 14,
                color: themeStyle.colors.grayscale.lowest,
                fontWeight: "700",
              }}
            >
              {userEducationHistory?.length
                ? "Education"
                : "No education history"}
            </Text>
          </View>
          {showEditButton && userEducationHistory?.length ? (
            <TouchableOpacity
              onPress={() => {
                getUserEducationHistory();
              }}
              style={{
                height: 48,
                width: 48,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  backgroundColor: "rgba(140, 140, 140, 0.2)",
                  padding: 5,
                  width: 38,
                  height: 38,
                  borderRadius: 24,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 10,
                }}
              >
                <Feather
                  name="edit-2"
                  color={themeStyle.colors.grayscale.lowest}
                  size={24}
                />
              </View>
            </TouchableOpacity>
          ) : null}
        </View>
      </TouchableOpacity>
      {showEducationHistory && userEducationHistory?.length <= 3 && (
        <View style={{ paddingHorizontal: 10 }}>
          {
            // incase for whatever reason we have more than 3 userEducationHistory records in userData. Don't want to crash the app :D
            userEducationHistory.map((education) => (
              <EducationHistoryItem
                key={education._id}
                education={education}
                setShowAddEducationModal={setShowAddEducationModal}
              />
            ))
          }
        </View>
      )}

      {showEducationHistory && numberOfEducationHistoryRecords > 3 ? (
        <View style={{ marginBottom: 20 }}>
          <TouchableOpacity onPress={() => getUserEducationHistory()}>
            <Text
              style={{
                color: themeStyle.colors.grayscale.lowest,
                textAlign: "center",
                marginVertical: 10,
                fontWeight: "700",
                fontSize: 16,
              }}
            >
              View all
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </>
  );
};

export default EducationHistoryDropdown;