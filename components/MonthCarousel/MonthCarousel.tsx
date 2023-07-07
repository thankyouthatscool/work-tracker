import { useCallback, useEffect, useState } from "react";
import { Dimensions, Pressable, View } from "react-native";
import { IconButton, Text } from "react-native-paper";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

import { TRANSLATION_X_THRESHOLD, VELOCITY_X_THRESHOLD } from "@constants";
import { useAppDispatch, useAppSelector } from "@hooks";
import { setSelectedDate, setTouchedDateInformation } from "@store";
import { APP_PADDING } from "@theme";
import {
  formatDateString,
  getMonthInformation,
  getMonthName,
  getWeekdayName,
} from "@utils";

import {
  BottomButtonWrapper,
  CalendarWrapper,
  MonthCarouselWrapper,
} from "./Styled";

const { width: WINDOW_WIDTH } = Dimensions.get("window");

export const MonthCarousel = () => {
  const dispatch = useAppDispatch();

  const [selectedMonthInformation, setSelectedMonthInformation] = useState<
    ReturnType<typeof getMonthInformation> | undefined
  >(undefined);

  const {
    currentDateInformation: {
      CURRENT_WEEK_DAY,
      CURRENT_DATE,
      CURRENT_MONTH,
      CURRENT_YEAR,
    },
    isLoading,
    selectedDateInformation: { SELECTED_DATE, SELECTED_MONTH, SELECTED_YEAR },
    touchedDateInformation,
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

  const panGesture = Gesture.Pan().onEnd((e) => {
    if (
      Math.abs(e.translationX) > TRANSLATION_X_THRESHOLD &&
      Math.abs(e.velocityX) > VELOCITY_X_THRESHOLD
    ) {
      handleSelectedDateChange(e.translationX > 0 ? "prev" : "next");
    }
  });

  useEffect(() => {
    if (!!SELECTED_MONTH && !!SELECTED_YEAR) {
      console.log(
        `Getting month information for ${SELECTED_MONTH}/${SELECTED_YEAR}...`
      );

      setSelectedMonthInformation(() =>
        getMonthInformation(SELECTED_YEAR, SELECTED_MONTH)
      );
    }
  }, [SELECTED_MONTH, SELECTED_YEAR]);

  if (!!isLoading)
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );

  if (!!selectedMonthInformation)
    return (
      <GestureDetector gesture={panGesture}>
        <MonthCarouselWrapper>
          <CalendarWrapper>
            {Array.from({
              length:
                selectedMonthInformation.numberOfDays +
                selectedMonthInformation.firstDayIndex +
                6 -
                selectedMonthInformation.lastDayIndex,
            })
              .map((_, idx) => idx)
              .map((idx) => (
                <Pressable
                  key={idx}
                  onPress={() => {
                    if (
                      idx - selectedMonthInformation.firstDayIndex >= 0 &&
                      idx - selectedMonthInformation.firstDayIndex <
                        selectedMonthInformation.numberOfDays
                    ) {
                      const NEW_SELECTED_DATE =
                        idx + 1 - selectedMonthInformation.firstDayIndex;

                      dispatch(
                        setTouchedDateInformation({
                          SELECTED_DATE: NEW_SELECTED_DATE,
                          SELECTED_MONTH,
                          SELECTED_YEAR,
                        })
                      );
                    }
                  }}
                  onLongPress={() => {
                    dispatch(setTouchedDateInformation(null));
                  }}
                >
                  <View
                    style={{
                      alignItems: "center",

                      borderColor:
                        idx < selectedMonthInformation.firstDayIndex
                          ? "rgba(1, 1, 1, 0.1)"
                          : idx - selectedMonthInformation.firstDayIndex >=
                            selectedMonthInformation.numberOfDays
                          ? "rgba(1, 1, 1, 0.1)"
                          : `${
                              idx + 1 - selectedMonthInformation.firstDayIndex
                            }-${SELECTED_MONTH}-${SELECTED_YEAR}` ===
                            `${touchedDateInformation?.SELECTED_DATE}-${touchedDateInformation?.SELECTED_MONTH}-${touchedDateInformation?.SELECTED_YEAR}`
                          ? "green"
                          : "rgba(1, 1, 1, 0.25)",

                      borderRadius: 50,
                      justifyContent: "center",
                      borderWidth: 1,
                      height: (WINDOW_WIDTH - APP_PADDING * 2) / 7,
                      width: (WINDOW_WIDTH - APP_PADDING * 2) / 7,
                    }}
                  >
                    <Text>
                      {idx < selectedMonthInformation.firstDayIndex ||
                      idx - selectedMonthInformation.firstDayIndex >=
                        selectedMonthInformation.numberOfDays
                        ? ""
                        : `${idx + 1 - selectedMonthInformation.firstDayIndex}`}
                    </Text>
                  </View>
                </Pressable>
              ))}
          </CalendarWrapper>
        </MonthCarouselWrapper>
      </GestureDetector>
    );
};
