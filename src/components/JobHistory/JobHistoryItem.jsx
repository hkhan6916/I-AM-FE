import React, { useState } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import themeStyle from "../../theme.style";
import getMonthAndYearDate from "../../helpers/getMonthAndYearDate";
import { Feather, Ionicons } from "@expo/vector-icons";
const JobHistoryItem = ({
  jobRole,
  showEditButton,
  setJobToEdit,
  setShowJobHistoryModal,
}) => {
  const [isCollapsible, setIsCollapsible] = useState(false);
  const [bodyCollapsed, setBodyCollapsed] = useState(false);

  const { width: screenWidth } = Dimensions.get("window");

  const onTextLayout = (e) => {
    setIsCollapsible(e.nativeEvent.lines.length >= 3);
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        borderBottomColor: themeStyle.colors.grayscale.higher,
        borderBottomWidth: 0.5,
        flex: 1,
        justifyContent: "space-between",
      }}
    >
      <View
        style={{
          paddingVertical: 10,
          paddingHorizontal: 0,
          borderBottomColor: themeStyle.colors.grayscale.higher,
          borderBottomWidth: 0.5,
          flexDirection: "row",
          flex: 1,
          marginRight: 80,
        }}
      >
        <Ionicons
          size={30}
          name="briefcase-sharp"
          color={themeStyle.colors.grayscale.low}
          style={{ marginHorizontal: 20 }}
        />
        <View>
          {jobRole.roleName ? (
            <Text
              style={{
                color: themeStyle.colors.grayscale.lowest,
                fontSize: 16,
                fontWeight: "700",
              }}
            >
              {jobRole.roleName}
              {jobRole.roleType ? (
                <Text
                  style={{
                    color: themeStyle.colors.grayscale.low,
                    fontSize: 12,
                    fontWeight: "400",
                  }}
                >
                  {" "}
                  ({jobRole.roleType})
                </Text>
              ) : null}
            </Text>
          ) : null}
          {jobRole.companyName ? (
            <Text
              style={{
                color: themeStyle.colors.grayscale.lowest,
                fontWeight: "700",
              }}
            >
              {jobRole.companyName}
            </Text>
          ) : null}
          {jobRole.city || jobRole.country ? (
            <Text
              style={{
                color: themeStyle.colors.grayscale.lower,
                fontSize: 12,
                fontWeight: "700",
              }}
            >
              {jobRole.city && jobRole.country
                ? `${jobRole.city}, ${jobRole.country}`
                : jobRole.city || jobRole.country}
            </Text>
          ) : null}
          <Text
            style={{ color: themeStyle.colors.grayscale.low, fontSize: 12 }}
          >
            {getMonthAndYearDate(jobRole.dateFrom)} -{" "}
            {jobRole.dateTo ? (
              getMonthAndYearDate(jobRole.dateTo)
            ) : (
              <Text
                style={{
                  color: themeStyle.colors.primary.default,
                  fontWeight: "700",
                }}
              >
                Present
              </Text>
            )}
          </Text>
          {jobRole.roleDescription ? (
            <View>
              <Text
                onTextLayout={onTextLayout}
                numberOfLines={!bodyCollapsed ? 3 : null}
                style={{
                  textAlign: "left",
                  color: themeStyle.colors.grayscale.lowest,
                  maxWidth: screenWidth - 100,
                }}
              >
                {jobRole.roleDescription}
              </Text>
              {isCollapsible && !bodyCollapsed ? (
                <TouchableOpacity onPress={() => setBodyCollapsed(true)}>
                  <Text
                    style={{
                      color: themeStyle.colors.grayscale.low,
                      marginBottom: 10,
                      marginTop: 5,
                    }}
                  >
                    Read more
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
      {showEditButton ? (
        <TouchableOpacity
          onPress={() => {
            setJobToEdit(jobRole);
            setShowJobHistoryModal(false);
          }}
        >
          <View
            style={{
              backgroundColor: "rgba(140, 140, 140, 0.2)",
              padding: 5,
              width: 48,
              height: 48,
              borderRadius: 24,
              justifyContent: "center",
              alignItems: "center",
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
  );
};

export default JobHistoryItem;
