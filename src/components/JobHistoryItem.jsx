import React, { useState } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import themeStyle from "../theme.style";
import getMonthAndYearDate from "../helpers/getMonthAndYearDate";
import { Ionicons } from "@expo/vector-icons";
const JobHistoryItem = ({ jobRole }) => {
  const [isCollapsible, setIsCollapsible] = useState(false);
  const [bodyCollapsed, setBodyCollapsed] = useState(false);

  const { width: screenWidth } = Dimensions.get("window");

  const onTextLayout = (e) => {
    setIsCollapsible(e.nativeEvent.lines.length >= 3);
  };

  if (!jobRole) return null;
  return (
    <View
      style={{
        width: "100%",
        paddingVertical: 10,
        paddingHorizontal: 0,
        borderBottomColor: themeStyle.colors.grayscale.higher,
        borderBottomWidth: 0.5,
        flexDirection: "row",
      }}
    >
      <Ionicons
        size={30}
        name="briefcase-sharp"
        color={themeStyle.colors.grayscale.high}
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
        <Text
          style={{ color: themeStyle.colors.grayscale.lower, fontSize: 12 }}
        >
          {getMonthAndYearDate(jobRole.dateFrom)} -{" "}
          {jobRole.dateTo ? getMonthAndYearDate(jobRole.dateTo) : "present"}
        </Text>
        {jobRole.roleDescription ? (
          <View>
            <Text
              onTextLayout={onTextLayout}
              numberOfLines={!bodyCollapsed ? 3 : null}
              style={{
                textAlign: "left",
                color: themeStyle.colors.grayscale.lower,
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
  );
};

export default JobHistoryItem;
