import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import themeStyle from "../../theme.style";
import JobHistoryItem from "../JobHistoryItem";

const JobHistoryDropdown = ({
  showJobHistory,
  setShowJobHistory,
  userJobHistory,
  numberOfJobHistoryRecords,
  getUserJobHistory,
}) => {
  return (
    <>
      <TouchableOpacity
        onPress={() => setShowJobHistory(!showJobHistory)}
        style={{ marginVertical: 10 }}
        disabled={!userJobHistory?.length}
      >
        <View
          style={{
            borderWidth: 1,
            borderColor: themeStyle.colors.grayscale.lowest,
            borderRadius: 5,
            width: "100%",
            height: 48,
            flexDirection: "row",
            alignItems: "center",
            opacity: userJobHistory?.length ? 1 : 0.5,
          }}
        >
          <Ionicons
            name={showJobHistory ? "briefcase-outline" : "briefcase"}
            size={24}
            color={themeStyle.colors.grayscale.lower}
            style={{ marginHorizontal: 10 }}
          />
          <Text
            style={{
              fontSize: userJobHistory?.length ? 16 : 14,
              color: themeStyle.colors.grayscale.lowest,
              fontWeight: "700",
            }}
          >
            {userJobHistory?.length ? "Work" : "No work history"}
          </Text>
        </View>
      </TouchableOpacity>
      {showJobHistory && userJobHistory?.length <= 3 && (
        <>
          <View style={{ paddingHorizontal: 10 }}>
            {
              // incase for whatever reason we have more than 3 userJobHistory records in userData. Don't want to crash the app :D
              userJobHistory.map((role) => (
                <JobHistoryItem key={role._id} jobRole={role} />
              ))
            }
          </View>
        </>
      )}

      {showJobHistory && numberOfJobHistoryRecords > 3 ? (
        <View>
          <TouchableOpacity onPress={() => getUserJobHistory()}>
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

export default JobHistoryDropdown;
