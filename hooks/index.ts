import { useCallback } from "react";

import { setCurrentDateInformation, setSelectedDate } from "@store/appSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";

export * from "@store/hooks";

export const useSelectedMonth = () => {
  const dispatch = useAppDispatch();

  const {
    currentDateInformation: { CURRENT_DATE, CURRENT_MONTH, CURRENT_YEAR },
    selectedDateInformation: { SELECTED_YEAR, SELECTED_MONTH, SELECTED_DATE },
  } = useAppSelector(({ app }) => app);

  const checkCurrentDate = useCallback(() => {
    // console.log(
    //   "Checking the current date to make sure that it is not outdated yet."
    // );

    const dateInstance = new Date();

    const NEW_CURRENT_YEAR = dateInstance.getFullYear();
    const NEW_CURRENT_MONTH = dateInstance.getMonth();
    const NEW_CURRENT_DATE = dateInstance.getDate();
    const NEW_CURRENT_WEEK_DAY = dateInstance.getDay();
    const NEW_CURRENT_MONTH_NUMBER_OF_DAYS = new Date(
      NEW_CURRENT_YEAR,
      NEW_CURRENT_MONTH + 1,
      0
    ).getDate();
    const NEW_CURRENT_MONTH_FIRST_DAY = new Date(
      NEW_CURRENT_YEAR,
      NEW_CURRENT_MONTH,
      0
    ).getDay();
    const NEW_CURRENT_MONTH_LAST_DAY = new Date(
      NEW_CURRENT_YEAR,
      NEW_CURRENT_MONTH,
      NEW_CURRENT_MONTH_NUMBER_OF_DAYS - 1
    ).getDay();

    if (
      `${NEW_CURRENT_DATE}/${NEW_CURRENT_MONTH}/${NEW_CURRENT_YEAR}` !==
      `${CURRENT_DATE}/${CURRENT_MONTH}/${CURRENT_YEAR}`
    ) {
      dispatch(
        setCurrentDateInformation({
          CURRENT_DATE: NEW_CURRENT_DATE,
          CURRENT_MONTH: NEW_CURRENT_MONTH,
          CURRENT_YEAR: NEW_CURRENT_YEAR,
          CURRENT_MONTH_NUMBER_OF_DAYS: NEW_CURRENT_MONTH_NUMBER_OF_DAYS,
          CURRENT_WEEK_DAY: NEW_CURRENT_WEEK_DAY,
          CURRENT_MONTH_FIRST_DAY: NEW_CURRENT_MONTH_FIRST_DAY,
          CURRENT_MONTH_LAST_DAY: NEW_CURRENT_MONTH_LAST_DAY,
        })
      );
    }
  }, [CURRENT_DATE, CURRENT_MONTH, CURRENT_YEAR]);

  const handleSelectedDateChange = useCallback(
    (dir: "prev" | "previous" | "next" | "today" | "date", date?: string) => {
      checkCurrentDate();

      if (dir !== "date") {
        if (dir === "prev" || dir === "previous") {
          const DATE_STRING = `${SELECTED_YEAR}-${SELECTED_MONTH}-${SELECTED_DATE}`;

          const CURRENT_SELECTED_DATE = new Date(Date.parse(DATE_STRING));

          const newSelectedDate = new Date(
            CURRENT_SELECTED_DATE.setMonth(CURRENT_SELECTED_DATE.getMonth())
          );

          const NEW_SELECTED_DATE = newSelectedDate.getDate();
          const NEW_SELECTED_MONTH = newSelectedDate.getMonth();
          const NEW_SELECTED_YEAR = newSelectedDate.getFullYear();

          return dispatch(
            setSelectedDate({
              SELECTED_DATE: NEW_SELECTED_DATE,
              SELECTED_MONTH: NEW_SELECTED_MONTH,
              SELECTED_YEAR: NEW_SELECTED_YEAR,
            })
          );
        }

        if (dir === "next") {
          const DATE_STRING = `${SELECTED_YEAR}-${SELECTED_MONTH}-${SELECTED_DATE}`;

          const CURRENT_SELECTED_DATE = new Date(Date.parse(DATE_STRING));

          const newSelectedDate = new Date(
            CURRENT_SELECTED_DATE.setMonth(CURRENT_SELECTED_DATE.getMonth() + 2)
          );

          const NEW_SELECTED_DATE = newSelectedDate.getDate();
          const NEW_SELECTED_MONTH = newSelectedDate.getMonth();
          const NEW_SELECTED_YEAR = newSelectedDate.getFullYear();

          return dispatch(
            setSelectedDate({
              SELECTED_DATE: NEW_SELECTED_DATE,
              SELECTED_MONTH: NEW_SELECTED_MONTH,
              SELECTED_YEAR: NEW_SELECTED_YEAR,
            })
          );
        }

        return dispatch(
          setSelectedDate({
            SELECTED_DATE: CURRENT_DATE,
            SELECTED_MONTH: CURRENT_MONTH,
            SELECTED_YEAR: CURRENT_YEAR,
          })
        );
      } else {
        if (!date) return handleSelectedDateChange("today");

        return dispatch(
          setSelectedDate({
            SELECTED_DATE: 1,
            SELECTED_MONTH: parseInt(date.split("/")[0]),
            SELECTED_YEAR: parseInt(date.split("/")[1]),
          })
        );
      }
    },
    [
      CURRENT_DATE,
      CURRENT_MONTH,
      CURRENT_YEAR,
      SELECTED_DATE,
      SELECTED_MONTH,
      SELECTED_YEAR,
    ]
  );

  return { handleSelectedDateChange };
};
