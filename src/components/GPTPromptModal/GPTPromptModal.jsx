import React, { useState } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  Text,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import themeStyle from "../../theme.style";
import { Configuration, OpenAIApi } from "openai";
import { LinearGradient } from "expo-linear-gradient";
import Constants from "expo-constants";
import GPTTextInput from "./GPTTextInput";

const GPTPromptModal = ({ setShowModal, active, setText, isBio, userData }) => {
  const [error, setError] = useState("");
  const [generatingText, setGeneratingText] = useState(false);
  const [generatedText, setGeneratedText] = useState("");
  const [gptPrompt, setGptPrompt] = useState("");
  const [prevTextToComplete, setPrevTextToComplete] = useState("");

  const placeholderTextArray = isBio
    ? [
        "I am web developer with 5 years experience...",
        "I am a digital marketer working at...",
        "I specialise in...",
        "I am a recruiter who works with...",
        "I work as a...",
      ]
    : [
        "I got promoted today...",
        "The weather is nice today...",
        "Write a motivational post...",
        "Looking to hire someone who can...",
        "I am looking for my next role in...",
      ];

  const userLatestJobHistories = userData?.userJobHistory?.slice(0, 2);
  const userLatestEducationHistories = userData?.userEducationHistory?.slice(
    0,
    2
  );

  const handleGPTTextGeneration = async (
    useJobOrEducationHistoryForBio = false
  ) => {
    Keyboard.dismiss();
    setError("");

    const configuration = new Configuration({
      apiKey: Constants.manifest.extra.gptSecret,
    });
    const openai = new OpenAIApi(configuration);

    try {
      setGeneratingText(true);
      setGeneratedText("");
      setPrevTextToComplete(gptPrompt);

      const jobTitle = userData?.jobTitle;

      const currentJobs = userLatestJobHistories?.filter(
        (job) => job.dateTo === "present"
      );

      const pastJobs = userLatestJobHistories?.filter(
        (job) => job.dateTo !== "present"
      );

      const currentEducation = userLatestEducationHistories?.filter(
        (education) => education.dateTo === "present"
      );

      const pastEducation = userLatestEducationHistories?.filter(
        (education) => education.dateTo !== "present"
      );

      let autoGenerateBioPrompt = jobTitle ? `I work as a ${jobTitle}. ` : "";
      if (userLatestJobHistories?.length) {
        if (currentJobs?.length) {
          autoGenerateBioPrompt +=
            `I currently work ` +
            currentJobs
              .map((job) => `at ${job.companyName} as a ${job.roleName}`)
              ?.join(", ") +
            ".";
          const currentJobsPrompt =
            currentJobs
              .map((job) => `at ${job.companyName} as a ${job.roleName}`)
              ?.join(", ") + ".";
          autoGenerateBioPrompt += currentJobsPrompt;
        }

        if (pastJobs?.length) {
          autoGenerateBioPrompt += "I have previously worked ";
          const pastJobsPrompt =
            pastJobs
              .map((job) => {
                return `at ${job.companyName} as a ${job.roleName} `;
              })
              ?.join("and ") + ".";
          autoGenerateBioPrompt += pastJobsPrompt;
        }
      }
      if (
        // !userLatestJobHistories?.length &&
        userLatestEducationHistories?.length
      ) {
        if (currentEducation?.length) {
          autoGenerateBioPrompt +=
            `I currently study ` +
            currentEducation
              .map(
                (education) =>
                  `${education.educationName} at ${education.institutionName} `
              )
              ?.join(", ") +
            ".";
          const currentEducationPrompt =
            currentEducation
              .map(
                (education) =>
                  `${education.educationName} at ${education.institutionName} `
              )
              ?.join(", ") + ".";
          autoGenerateBioPrompt += currentEducationPrompt;
        }

        if (pastEducation?.length) {
          autoGenerateBioPrompt += "I have previously studied ";
          const pastEducationPrompt =
            pastEducation
              .map((job) => {
                return `at ${job.institutionName} as a ${job.educationName} `;
              })
              ?.join("and ") + ".";
          autoGenerateBioPrompt += pastEducationPrompt;
        }
      }

      console.log({ autoGenerateBioPrompt });
      // A work as a engineer. I currently work as a web dev at abc, a teacher at efg. I used to work as a tester at abc.
      // return;
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `${
              isBio
                ? "Create a bio for a user using the following"
                : "Create a post about the following"
            } in no chronological order, without hashtags and without disclaimers: "${
              useJobOrEducationHistoryForBio ? autoGenerateBioPrompt : gptPrompt
            }". Limit the response to ${
              useJobOrEducationHistoryForBio ? "1000" : "1000"
            } characters.`,
          },
        ],
        temperature: useJobOrEducationHistoryForBio ? 0.1 : 0.6,
        max_tokens: 200,
      });
      const completionString =
        completion.data.choices[0].message.content.trim();
      setGeneratingText(false);
      setGeneratedText(completionString);
    } catch (error) {
      setGeneratingText(false);
      setError(
        `There was a problem generating your ${
          isBio ? "bio" : "post body"
        }. Please try again later.`
      );
      if (error.response) {
        console.log(error.response.status);
        console.log(error.response.data);
      } else {
        console.log(error.message);
      }
    }
  };

  const disableWriteButton = !!(
    prevTextToComplete === gptPrompt ||
    generatingText ||
    !gptPrompt
  );

  return (
    <Modal
      onRequestClose={async () => {
        setShowModal(false);
      }}
      visible={active}
      animationType="slide"
    >
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
                AI {isBio ? "Bio" : "Post"} Generator
              </Text>
            </TouchableOpacity>
          </View>
          <>
            <Text
              style={{
                color: themeStyle.colors.grayscale.lowest,
                fontSize: 16,
              }}
            >
              {isBio ? "Talk about yourself." : "What's on your mind?"}
            </Text>
            <GPTTextInput
              value={gptPrompt}
              multiline
              maxLength={150}
              onChangeText={(v) => setGptPrompt(v)}
              placeholderTextArray={placeholderTextArray}
            />
            <Text
              style={{
                color: themeStyle.colors.grayscale.lowest,
                marginBottom: 20,
                paddingHorizontal: 5,
              }}
            >
              {isBio
                ? `Start off your bio. Keep it short and concise, the rest will be generated${
                    userLatestJobHistories?.length ||
                    userLatestEducationHistories?.length
                      ? ` or click "Auto Generate" to quickly generate your bio.`
                      : "."
                  }`
                : "Start off your post. Keep it short and concise."}
            </Text>
          </>
          {gptPrompt?.length === 150 && (
            <Text
              style={{
                color: themeStyle.colors.grayscale.lowest,
                alignSelf: "flex-end",
              }}
            >
              Max 150 characters
            </Text>
          )}
          {!!error && (
            <Text
              style={{
                color: themeStyle.colors.error.default,
                textAlign: "center",
                marginBottom: 10,
              }}
            >
              {error}
            </Text>
          )}
          <View style={{ flexDirection: "column" }}>
            <TouchableOpacity
              onPress={() => handleGPTTextGeneration()}
              // disabled={disableWriteButton}
              style={{
                opacity: disableWriteButton ? 0.5 : 1,
                marginBottom: 10,
                marginHorizontal: 5,
              }}
            >
              <LinearGradient
                start={[0, 0.5]}
                end={[0, 1]}
                style={{
                  height: 48,
                  borderRadius: 5,
                  justifyContent: "center",
                  alignItems: "center",
                  padding: disableWriteButton ? 0 : 2,
                }}
                colors={
                  disableWriteButton
                    ? [themeStyle.colors.slateGray, themeStyle.colors.slateGray]
                    : ["#138294", "#66b5ff"]
                }
              >
                <View
                  style={{
                    backgroundColor: themeStyle.colors.grayscale.highest,
                    flex: 1,
                    height: "100%",
                    width: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: themeStyle.colors.grayscale.lowest }}>
                    Start Writing
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
            {!!(
              userLatestJobHistories?.length ||
              userLatestEducationHistories?.length
            ) && (
              <TouchableOpacity
                onPress={() => handleGPTTextGeneration(true)}
                disabled={generatingText}
                style={{
                  opacity: generatingText ? 0.5 : 1,
                  marginBottom: 10,
                  marginHorizontal: 5,
                }}
              >
                <LinearGradient
                  start={[0, 0.5]}
                  end={[0, 1]}
                  style={{
                    height: 48,
                    borderRadius: 5,
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 2,
                  }}
                  colors={["#138294", "#66b5ff"]}
                >
                  <View
                    style={{
                      backgroundColor: themeStyle.colors.grayscale.highest,
                      flex: 1,
                      height: "100%",
                      width: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: themeStyle.colors.grayscale.lowest }}>
                      Auto Generate
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
          {generatedText || generatingText ? (
            <View
              style={{
                backgroundColor: themeStyle.colors.slateGray,
                flex: 1,
                borderRadius: 10,
                paddingHorizontal: 5,
              }}
            >
              <ScrollView
                style={{
                  flex: 1,
                }}
                contentContainerStyle={generatingText ? { flex: 1 } : {}}
              >
                {generatingText ? (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <ActivityIndicator
                      size={24}
                      color={themeStyle.colors.black}
                    />
                    <Text
                      style={{
                        color: themeStyle.colors.black,
                        marginTop: 10,
                        fontWeight: "700",
                      }}
                    >
                      Writing your {isBio ? "bio" : "post"}...
                    </Text>
                  </View>
                ) : generatedText ? (
                  <Text
                    style={{
                      color: themeStyle.colors.black,
                      fontWeight: "700",
                      padding: 5,
                    }}
                  >
                    {generatedText || "Ready..."}
                  </Text>
                ) : null}
              </ScrollView>
              {!!generatedText && (
                <View style={{ marginBottom: 10 }}>
                  <TouchableOpacity
                    onPress={() => {
                      setText(generatedText);
                      setShowModal(false);
                    }}
                    style={{
                      height: 48,
                      borderWidth: 1,
                      backgroundColor: themeStyle.colors.black,
                      borderRadius: 5,
                      justifyContent: "center",
                      alignItems: "center",
                      marginHorizontal: 5,
                    }}
                  >
                    <Text style={{ color: themeStyle.colors.grayscale.lowest }}>
                      {isBio
                        ? "Set As Bio And Review"
                        : "Set As Post Body And Review"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default GPTPromptModal;
