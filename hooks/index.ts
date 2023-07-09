import { useCallback } from "react";

import { setSelectedDate } from "@store/appSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";

export * from "@store/hooks";

export const useSelectedMonth = () => {
  const dispatch = useAppDispatch();

  const {
    currentDateInformation: { CURRENT_DATE, CURRENT_MONTH, CURRENT_YEAR },
    selectedDateInformation: { SELECTED_YEAR, SELECTED_MONTH, SELECTED_DATE },
  } = useAppSelector(({ app }) => app);

  const handleSelectedDateChange = useCallback(
    (dir: "prev" | "previous" | "next" | "today") => {
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
