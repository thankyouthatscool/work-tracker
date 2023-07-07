import { MONTHS } from "@constants";

export const getMonthInformation = (year: number, month: number) => {
  const numberOfDays = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 0).getDay();
  const lastDay = new Date(year, month, numberOfDays - 1).getDay();

  return {
    numberOfDays,
    firstDayIndex: firstDay,
    lastDayIndex: lastDay,
  };
};

export const getMonthName = (monthNumber: number) => {
  return MONTHS[monthNumber].fullMonthName || "";
};

export const getWeekdayName = (weekdayNumber: number) => {
  return (
    {
      1: "Monday",
      2: "Tuesday",
      3: "Wednesday",
      4: "Thursday",
      5: "Friday",
      6: "Saturday",
      0: "Sunday",
    }[weekdayNumber] || ""
  );
};

export const formatDateString = (date: number) => {
  switch (date) {
    default:
      return `${date}th`;
    case 1:
      return `${date}st`;
    case 2:
      return `${date}nd`;
    case 3:
      return `${date}rd`;
  }
};
