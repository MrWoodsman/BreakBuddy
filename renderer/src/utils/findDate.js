export const findDate = ({ year, month, day, data }) => {
  return data.find(
    (oneDay) =>
      oneDay.year == year && oneDay.month == month && oneDay.day == day
  );
};
