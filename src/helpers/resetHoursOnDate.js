const resetHoursOnDate = (date) => {
  const _date = new Date(date);
  _date.setHours(0, 0, 0, 0);
  return _date;
};

export default resetHoursOnDate;
