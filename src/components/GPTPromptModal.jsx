import React, { useState } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  Text,
  SafeAreaView,
  TextInput,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import themeStyle from "../theme.style";
import SearchBar from "./SearchBar";
import { Configuration, OpenAIApi } from "openai";
import useTypewriter from "../helpers/hooks/useTypeWriter";
import { LinearGradient } from "expo-linear-gradient";

const GPTPromptModal = ({ setShowModal, active, setPostBody }) => {
  const [error, setError] = useState("");
  const [generatingText, setGeneratingText] = useState(false);
  const [generatedText, setGeneratedText] = useState("");
  const [textToComplete, setTextToComplete] = useState("");
  const [prevTextToComplete, setPrevTextToComplete] = useState("");
  const [placeholder, setPlaceholder] = useState("");

  const [disablePlaceholderTypewriter, setDisablePlaceholderTypewriter] =
    useState(false);
  const placeholderTextArray = [
    "I got promoted today...",
    "The weather is nice today...",
    "Write a motivational post...",
    "Looking to hire someone who can...",
    "I am looking for my next role in...",
  ];
  useTypewriter(
    placeholderTextArray,
    setPlaceholder,
    placeholder,
    disablePlaceholderTypewriter
  );

  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  const handleGPTTextGeneration = async () => {
    setGeneratingText(true);
    setGeneratedText("");
    setPrevTextToComplete(textToComplete);
    const configuration = new Configuration({
      apiKey: "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",
    });
    const openai = new OpenAIApi(configuration);

    try {
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        // messages: [
        //   {
        // prompt: `Create post about the following without hashtags: "${postBody}".`,
        // role: "user",
        //   },
        // ],
        messages: [
          {
            role: "user",
            content: `Create a post about the following without hashtags and without disclaimers: "${textToComplete}". Limit the response to 1000 characters.`,
          },
        ],
        temperature: 0.6,
        max_tokens: 200,
      });
      console.log(completion.data);
      // const completionString = completion.data.choices[0].text.trim();
      const completionString =
        completion.data.choices[0].message.content.trim();
      setGeneratingText(false);
      setGeneratedText(completionString);
    } catch (error) {
      setGeneratingText(false);
      if (error.response) {
        console.log(error.response.status);
        console.log(error.response.data);
      } else {
        console.log(error.message);
      }
    }
  };

  const disableWriteButton = !!(
    prevTextToComplete === textToComplete ||
    generatingText ||
    !textToComplete
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
                AI Post Generator
              </Text>
            </TouchableOpacity>
          </View>
          <Text
            style={{
              color: themeStyle.colors.grayscale.lowest,
              fontSize: 16,
            }}
          >
            What&apos;s on your mind?
          </Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: themeStyle.colors.grayscale.lowest,
              borderRadius: 5,
              padding: 5,
              flex: 1,
              marginBottom: 10,
            }}
          >
            <TextInput
              style={{
                textAlignVertical: "top",
                fontSize: 16,
                color: themeStyle.colors.grayscale.lowest,
                flex: 1,
                height: "100%",
              }}
              value={textToComplete}
              placeholder={placeholder}
              placeholderTextColor={themeStyle.colors.grayscale.high}
              multiline
              maxLength={150}
              onChangeText={(v) => setTextToComplete(v)}
              onFocus={() => {
                setDisablePlaceholderTypewriter(true);
                setPlaceholder("Keep it short and concise...");
              }}
            />
            {!!error && (
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: themeStyle.colors.error.default,
                    textAlign: "center",
                  }}
                >
                  {error}
                </Text>
              </View>
            )}
          </View>
          <Text
            style={{
              color: themeStyle.colors.grayscale.lowest,
              marginBottom: 20,
            }}
          >
            Start off your post. Keep it short and concise.
          </Text>
          {textToComplete?.length === 150 && (
            <Text
              style={{
                color: themeStyle.colors.grayscale.lowest,
                alignSelf: "flex-end",
              }}
            >
              Max 150 characters
            </Text>
          )}
          <TouchableOpacity
            onPress={() => handleGPTTextGeneration()}
            disabled={disableWriteButton}
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
          {!!(generatedText || generatingText) && (
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
              >
                {generatingText ? (
                  <ActivityIndicator
                    size={24}
                    color={themeStyle.colors.grayscale.lowest}
                  />
                ) : (
                  <Text
                    style={{
                      color: themeStyle.colors.black,
                      fontWeight: "700",
                      padding: 5,
                    }}
                  >
                    {generatedText || "Ready..."}
                  </Text>
                )}
              </ScrollView>
              <View style={{ marginBottom: 10 }}>
                <TouchableOpacity
                  onPress={() => {
                    setPostBody(generatedText);
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
                    Set As Post Body And Review
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default GPTPromptModal;
