import React, { useState } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import themeStyle from "../../theme.style";
import getMonthAndYearDate from "../../helpers/getMonthAndYearDate";
import { Feather, Ionicons } from "@expo/vector-icons";
const EducationHistoryItem = ({
  education,
  showEditButton,
  setEducationToEdit,
  setShowEducationHistoryModal,
}) => {
  const [isCollapsible, setIsCollapsible] = useState(false);
  const [bodyCollapsed, setBodyCollapsed] = useState(false);

  const { width: screenWidth } = Dimensions.get("window");

  const onTextLayout = (e) => {
    setIsCollapsible(e.nativeEvent.lines.length >= 3);
  };

  if (!education) return null;
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
          marginRight: 81,
        }}
      >
        <Ionicons
          size={30}
          name="school-sharp"
          color={themeStyle.colors.slateGray}
          style={{ marginHorizontal: 20 }}
        />
        <View>
          {education.educationName ? (
            <Text
              style={{
                color: themeStyle.colors.grayscale.lowest,
                fontSize: 16,
                fontWeight: "700",
              }}
            >
              {education.educationName}
            </Text>
          ) : null}
          {education.institutionName ? (
            <Text
              style={{
                color: themeStyle.colors.grayscale.lowest,
                fontWeight: "700",
              }}
            >
              {education.institutionName}
            </Text>
          ) : null}
          <Text style={{ color: themeStyle.colors.slateGray, fontSize: 12 }}>
            {getMonthAndYearDate(education.dateFrom)} -{" "}
            {education.dateTo ? (
              getMonthAndYearDate(education.dateTo)
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
          {education.educationDescription ? (
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
                {education.educationDescription}
              </Text>
              {isCollapsible && !bodyCollapsed ? (
                <TouchableOpacity onPress={() => setBodyCollapsed(true)}>
                  <Text
                    style={{
                      color: themeStyle.colors.slateGray,
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
            setShowEducationHistoryModal(false);
            setEducationToEdit(education);
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

export default EducationHistoryItem;
