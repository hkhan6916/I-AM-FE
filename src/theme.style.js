import { Appearance, Platform } from "react-native";
let colorScheme = Platform.OS !== "web" ? Appearance.getColorScheme() : "light";
const themeStyle =
  colorScheme === "dark"
    ? {
        colors: {
          primary: {
            default: "#138294",
            light: "#00cddb",
            text: "#00cddb",
          },
          secondary: {
            default: "#0085FF",
            bright: "#00ddff",
            light: "#66b5ff",
          },
          warning: {
            default: "#FFB000",
          },
          success: {
            default: "#009966",
          },
          error: {
            default: "#FF0000",
          },
          grayscale: {
            highest: "#15171F",
            higher: "#525252",
            high: "#a1a1aa",
            low: "#a3a3a3",
            lower: "#F1F1F1",
            lowest: "#FFFFFF",
            cards: "#15171F",
            cardsOuter: "#020511",
            transparentHighest50: "rgba(0,0,0,0.5)",
            transparentLowest50: "rgba(207,207,207,0.5)",
          },
          black: "#000000",
          white: "#FFFFFF",
          mediaLoad: "rgba(50,50,50,1)",
        },
      }
    : {
        colors: {
          primary: {
            default: "#138294",
            light: "#00cddb",
            text: "#138294",
          },
          secondary: {
            default: "#0085FF",
            bright: "#00ddff",
            light: "#66b5ff",
          },
          warning: {
            default: "#FFB000",
          },
          success: {
            default: "#009966",
          },
          error: {
            default: "#FF0000",
          },
          grayscale: {
            lowest: "#000000",
            lower: "#6C6C6C",
            low: "#A2A2A2",
            high: "#D2D2D2",
            higher: "#F1F1F1",
            highest: "#FFFFFF",
            cards: "#FFFFFF",
            cardsOuter: "#F1F1F1",
            transparentLowest50: "rgba(0,0,0,0.5)",
            transparentHighest50: "rgba(207,207,207,0.5)",
          },
          black: "#000000",
          white: "#FFFFFF",
          mediaLoad: "rgba(168,168,168,1)",
        },
      };
export default themeStyle;
