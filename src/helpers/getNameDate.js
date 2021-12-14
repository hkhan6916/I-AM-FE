const getNameDate = (date) => {
  const ageDifMs = Date.now() - date;
  const ageDate = new Date(ageDifMs);

  const showYear = Math.abs(ageDate.getUTCFullYear() - 1970) >= 1;

  const year = date.getFullYear();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const month = monthNames[date.getMonth()];
  const day = date.getDate();

  if (showYear) {
    return `${month} ${day} ${year}`;
  }
  return `${month} ${day}`;
};

export default getNameDate;
