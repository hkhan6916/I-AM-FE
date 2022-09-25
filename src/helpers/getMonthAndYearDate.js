import getMonthName from "./getMonthName";

const getMonthAndYearDate = (date) => {
  const d = new Date(date);

  return `${getMonthName(date)} ${d.getFullYear()}`;
};

export default getMonthAndYearDate;
