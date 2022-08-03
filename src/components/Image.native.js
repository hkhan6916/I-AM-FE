import { Image as RNImage } from "react-native";

const Image = ({ mobileProps, ...rest }) => {
  return <RNImage {...rest} {...mobileProps} />;
};

export default Image;
