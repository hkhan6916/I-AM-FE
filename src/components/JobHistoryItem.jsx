import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import themeStyle from "../theme.style";
import getMonthAndYearDate from "../helpers/getMonthAndYearDate";
const JobHistoryItem = ({ jobRole }) => {
  const [isCollapsible, setIsCollapsible] = useState(false);
  const [bodyCollapsed, setBodyCollapsed] = useState(false);

  const onTextLayout = (e) => {
    setIsCollapsible(e.nativeEvent.lines.length >= 3);
  };

  if (!jobRole) return null;
  return (
    <View style={{ width: "100%", padding: 20 }}>
      <Text
        style={{
          color: themeStyle.colors.grayscale.lowest,
          fontSize: 16,
          fontWeight: "700",
        }}
      >
        {jobRole.roleName || ""}
      </Text>
      <Text
        style={{ color: themeStyle.colors.grayscale.lowest, fontWeight: "700" }}
        onTextLayout={onTextLayout}
      >
        {jobRole.companyName || ""}
      </Text>
      <Text style={{ color: themeStyle.colors.grayscale.lower, fontSize: 12 }}>
        {getMonthAndYearDate(jobRole.dateFrom)} -{" "}
        {jobRole.dateTo ? getMonthAndYearDate(jobRole.dateTo) : "present"}
      </Text>
      <View>
        <Text
          onTextLayout={onTextLayout}
          numberOfLines={!bodyCollapsed ? 3 : null}
          style={{
            textAlign: "left",
            color: themeStyle.colors.grayscale.lower,
          }}
        >
          {jobRole.roleDescription || ""}
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
    </View>
  );
};

export default JobHistoryItem;
