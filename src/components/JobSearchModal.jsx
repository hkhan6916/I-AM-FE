import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { useCallback, useRef } from "react";
import { useState } from "react";
import {
  Dimensions,
  Modal,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  DataProvider,
  LayoutProvider,
  RecyclerListView,
} from "recyclerlistview";
import themeStyle from "../theme.style";
import SearchBar from "./SearchBar";
import { encode } from "base-64";
import { useEffect } from "react";

import { decode as htmlDecode } from "html-entities";
import * as WebBrowser from "expo-web-browser";

const JobSearchModal = ({ setShowModal, ...rest }) => {
  const [error, setError] = useState("");
  const [jobs, setJobs] = useState([]);
  const location = useRef("");

  const { width: screen } = Dimensions.get("window");
  const screenWidth = Math.min(screen, 900);

  let dataProvider = new DataProvider((r1, r2) => {
    return r1 !== r2;
  }).cloneWithRows(jobs);

  const layoutProvider = useRef(
    new LayoutProvider(
      () => 0,
      (_, dim) => {
        dim.width = screenWidth;
      }
    )
  ).current;

  const handlePressButtonAsync = async (url) => {
    await WebBrowser.openBrowserAsync(url);
  };

  const rowRenderer = useCallback((_, item) => {
    const minimumSalary = item?.minimumSalary
      ?.toLocaleString("en-GB", {
        style: "currency",
        currency: item?.currency || "GBP",
      })
      ?.split(".")[0];

    const maximumSalary = item?.maximumSalary
      ?.toLocaleString("en-GB", {
        style: "currency",
        currency: item?.currency || "GBP",
      })
      ?.split(".")[0];

    const salary =
      minimumSalary && maximumSalary && minimumSalary !== maximumSalary
        ? `${minimumSalary} - ${maximumSalary}`
        : `${maximumSalary || minimumSalary}`;

    const splittedDate = item?.date?.split("/");
    const date = new Date(
      splittedDate[2],
      splittedDate[1] - 1,
      splittedDate[0]
    );

    const duration = new Date() - date;
    const durationInDays = new Date(duration).getDay();

    return (
      <TouchableOpacity onPress={() => handlePressButtonAsync(item?.jobUrl)}>
        <View style={{ width: "100%", padding: 10 }}>
          <View
            style={{
              borderWidth: 1,
              borderColor: themeStyle.colors.grayscale.lowest,
              padding: 10,
              borderRadius: 5,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                maxWidth: "100%",
              }}
            >
              <Text
                style={{
                  color: themeStyle.colors.primary.text,
                  fontSize: 20,
                  fontWeight: "700",
                  width: "90%",
                }}
              >
                {item?.jobTitle}
              </Text>
              <Feather
                name="external-link"
                size={24}
                color={themeStyle.colors.grayscale.lowest}
              />
            </View>
            <Text
              style={{
                color: themeStyle.colors.grayscale.lowest,
                fontWeight: "700",
              }}
            >
              {item?.employerName}
            </Text>
            <Text
              style={{
                color: themeStyle.colors.grayscale.lowest,
                marginTop: 5,
              }}
            >
              {item?.locationName}
            </Text>
            {(maximumSalary || minimumSalary) && (
              <Text
                style={{
                  color: themeStyle.colors.grayscale.lowest,
                  marginTop: 5,
                }}
              >
                {salary}
              </Text>
            )}
            <Text
              style={{
                color: themeStyle.colors.grayscale.lower,
                fontSize: 12,
                marginTop: 5,
              }}
            >
              {!item?.applications
                ? "No applicants"
                : `${item?.applications} applications`}
            </Text>
            {typeof durationInDays === "number" && (
              <Text
                style={{
                  color: themeStyle.colors.grayscale.lower,
                  fontSize: 12,
                  marginTop: 5,
                }}
              >
                {durationInDays === 0
                  ? "Just Posted"
                  : `${durationInDays} ${
                      durationInDays === 1 ? "day" : "days"
                    } ago`}
              </Text>
            )}
            <Text style={{ color: themeStyle.colors.grayscale.lowest }}>
              {htmlDecode(item?.jobDescription)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, []);
  const handleJobSearch = async (searchQuery) => {
    setError("");
    const username = "8e714d7e-cb8d-4fc3-9ebf-d73ea7d70de4";
    const password = "";

    const base64Auth = `Basic ${encode(username + ":" + password)}`;

    const apiParametersObj = {
      resultsToTake: "12",
      keywords: searchQuery,
      locationName: location.current, // city or postcode
      postedByDirectEmployer: "false",
      distanceFromLocation: 5, // number
    };
    const apiParametersString = Object.keys(apiParametersObj)
      .map(
        (parameterKey) => `${parameterKey}=${apiParametersObj[parameterKey]}`
      )
      .join("&");

    const url = `https://www.reed.co.uk/api/1.0/search?${apiParametersString}`;

    const { data, status } = await axios({
      url,
      method: "GET",
      headers: {
        Authorization: base64Auth,
      },
    });
    if (status !== 200)
      setError("There was a problem loading jobs. Please try again later.");
    if (data?.results?.length) {
      setJobs(data.results);
    }
  };

  useEffect(() => {
    (async () => {
      const username = "8e714d7e-cb8d-4fc3-9ebf-d73ea7d70de4";
      const password = "";

      const base64Auth = `Basic ${encode(username + ":" + password)}`;
      const url = `https://www.reed.co.uk/api/1.0/search?resultsToTake=15&postedByDirectEmployer=true&postedByRecruitmentAgency=false&resultsToSkip=200`;

      const { data, status } = await axios({
        url,
        method: "GET",
        headers: {
          Authorization: base64Auth,
        },
      });
      if (status !== 200)
        setError("There was a problem loading jobs. Please try again later.");
      if (data?.results?.length) {
        setJobs(data.results);
      }
    })();
  }, []);

  return (
    <Modal {...rest}>
      <SafeAreaView
        style={{
          backgroundColor: themeStyle.colors.grayscale.highest,
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: themeStyle.colors.grayscale.highest,
            // justifyContent: "center",
            maxWidth: 900,
            width: "100%",
          }}
        >
          <View
            style={{
              alignSelf: "flex-start",
              marginHorizontal: 10,
              marginVertical: 10,
            }}
          >
            <TouchableOpacity
              onPress={() => setShowModal(false)}
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
                Browse Jobs
              </Text>
            </TouchableOpacity>
          </View>
          <SearchBar
            placeholder="Search Jobs"
            onTypingEnd={(v) => handleJobSearch(v)}
          />
          <SearchBar
            placeholder="Postcode or city"
            onTypingEnd={(v) => handleJobSearch(v)}
            iconName={"home-outline"}
          />
          {error ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialIcons
                name="error-outline"
                size={120}
                color={themeStyle.colors.grayscale.high}
              />
              <Text
                style={{
                  color: themeStyle.colors.error.default,
                  textAlign: "center",
                  width: "80%",
                  marginTop: 10,
                }}
              >
                {error}
              </Text>
            </View>
          ) : (
            <RecyclerListView
              style={{
                minHeight: 1,
                minWidth: 1,
              }}
              dataProvider={dataProvider}
              layoutProvider={layoutProvider}
              rowRenderer={rowRenderer}
              forceNonDeterministicRendering
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default JobSearchModal;
