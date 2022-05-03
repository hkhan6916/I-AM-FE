const secondsToHms = (seconds) => {
  return new Date(seconds * 1000).toISOString().substring(14, 19);
};

export default secondsToHms;
