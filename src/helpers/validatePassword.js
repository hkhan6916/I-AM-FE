const validatePassword = async (password) => {
  return String(password).match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/);
};

export default validatePassword;
