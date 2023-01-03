import { getItemAsync } from "expo-secure-store";

const checkPasswordChanged = async (lastPasswordChangedDateTime) => {
  const loginDateTime = await getItemAsync("loginDateTime");
  if (
    !loginDateTime ||
    new Date(loginDateTime) < new Date(lastPasswordChangedDateTime)
  ) {
    return (
      !loginDateTime ||
      new Date(loginDateTime) < new Date(lastPasswordChangedDateTime)
    );
  }
};

export default checkPasswordChanged;
