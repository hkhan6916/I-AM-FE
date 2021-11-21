const formatAge = (age) => {
  let ageObject = { unit: age?.days > 1 ? 'days' : 'day', age: age?.days };
  if (age?.minutes) {
    ageObject = { unit: age?.minutes > 1 ? 'minutes' : 'minute', age: age?.minutes };
  } if (age?.hours) {
    ageObject = { unit: age?.hours > 1 ? 'hours' : 'hour', age: age?.hours };
  }

  return ageObject;
};

export default formatAge;
