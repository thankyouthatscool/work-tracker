import { useCallback, useEffect, useState } from "react";
import { Dimensions, Pressable, View } from "react-native";
import {
  Button,
  IconButton,
  Modal,
  Portal,
  Text,
  TextInput,
} from "react-native-paper";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  DEFAULT_HOURS_WORKED,
  DEFAULT_HOURLY_RATE,
  TRANSLATION_X_THRESHOLD,
  VELOCITY_X_THRESHOLD,
} from "@constants";
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

  const [modalData, setModalData] = useState<{
    hoursWorked: number[];
    hourlyRate: number[];
    comment: string;
  }>({
    hoursWorked: [DEFAULT_HOURS_WORKED],
    hourlyRate: [DEFAULT_HOURLY_RATE],
    comment: "",
  });

  const [DBMonthData, setDBMonthData] = useState<
    {
      dayId: string;
      monthId: string;
      hoursWorked: number[];
      hourlyRate: number[];
      comment: string;
    }[]
  >([]);

  const {
    currentDateInformation: {
      CURRENT_WEEK_DAY,
      CURRENT_DATE,
      CURRENT_MONTH,
      CURRENT_YEAR,
    },
    databaseInstance: db,
    isLoading,
    selectedDateInformation: { SELECTED_DATE, SELECTED_MONTH, SELECTED_YEAR },
    touchedDateInformation,
  } = useAppSelector(({ app }) => app);

  const handleCancel = useCallback(() => {
    setModalData(() => ({
      hoursWorked: [DEFAULT_HOURS_WORKED],
      hourlyRate: [DEFAULT_HOURLY_RATE],
      comment: "",
    }));

    dispatch(setTouchedDateInformation(null));
  }, []);

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

  const handleInsertData = useCallback(
    (hoursWorked: number[], hourlyRate: number[], comment: string) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            `
            INSERT INTO dayTracker (dayId, monthId, hoursWorked, hourlyRate, comment)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT (dayId) DO UPDATE SET
              hoursWorked = excluded.hoursWorked, 
              hourlyRate = excluded.hourlyRate,
              comment = excluded.comment
            `,
            [
              `${touchedDateInformation?.SELECTED_DATE}/${touchedDateInformation?.SELECTED_MONTH}/${touchedDateInformation?.SELECTED_YEAR}`,
              `${touchedDateInformation?.SELECTED_MONTH}/${touchedDateInformation?.SELECTED_YEAR}`,
              JSON.stringify(hoursWorked),
              JSON.stringify(hourlyRate),
              comment,
            ],
            () => {
              setDBMonthData((DBMonthData) => {
                const targetRecord = DBMonthData.find(
                  (record) =>
                    record.dayId ===
                    `${touchedDateInformation?.SELECTED_DATE}/${touchedDateInformation?.SELECTED_MONTH}/${touchedDateInformation?.SELECTED_YEAR}`
                );

                if (!!targetRecord) {
                  return [
                    { ...targetRecord, hoursWorked, hourlyRate, comment },
                    ...DBMonthData.filter(
                      (record) =>
                        record.dayId !==
                        `${touchedDateInformation?.SELECTED_DATE}/${touchedDateInformation?.SELECTED_MONTH}/${touchedDateInformation?.SELECTED_YEAR}`
                    ),
                  ];
                } else {
                  return [
                    ...DBMonthData,
                    {
                      dayId: `${touchedDateInformation?.SELECTED_DATE}/${touchedDateInformation?.SELECTED_MONTH}/${touchedDateInformation?.SELECTED_YEAR}`,
                      monthId: `${touchedDateInformation?.SELECTED_MONTH}/${touchedDateInformation?.SELECTED_YEAR}`,
                      hoursWorked,
                      hourlyRate,
                      comment,
                    },
                  ];
                }
              });

              handleCancel();
            }
          );
        },
        (err) => {
          console.log(err);
        },
        () => {}
      );
    },
    [
      touchedDateInformation?.SELECTED_DATE,
      touchedDateInformation?.SELECTED_MONTH,
      touchedDateInformation?.SELECTED_YEAR,
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

  useEffect(() => {
    db.transaction((tx) => {
      console.log(
        `Looking up table data for ${SELECTED_MONTH}/${SELECTED_YEAR}...`
      );

      tx.executeSql(
        `
        SELECT * FROM dayTracker
        WHERE monthId = ?
        `,
        [`${SELECTED_MONTH}/${SELECTED_YEAR}`],
        (_, { rows: { _array } }) => {
          const parsedMonthData = _array.map((record) => ({
            ...record,
            hoursWorked: JSON.parse(record.hoursWorked),
            hourlyRate: JSON.parse(record.hourlyRate),
          })) as {
            dayId: string;
            monthId: string;
            hoursWorked: number[];
            hourlyRate: number[];
            comment: string;
          }[];

          setDBMonthData(() => parsedMonthData);
        }
      );
    });
  }, [SELECTED_MONTH, SELECTED_YEAR]);

  useEffect(() => {
    if (!!touchedDateInformation) {
      const targetDate = DBMonthData.find(
        (record) =>
          record.dayId ===
          `${touchedDateInformation.SELECTED_DATE}/${touchedDateInformation.SELECTED_MONTH}/${touchedDateInformation.SELECTED_YEAR}`
      );

      if (!!targetDate) {
        setModalData(() => ({
          hoursWorked: targetDate.hoursWorked,
          hourlyRate: targetDate.hourlyRate,
          comment: targetDate.comment,
        }));
      } else {
        setModalData(() => ({
          hoursWorked: [DEFAULT_HOURS_WORKED],
          hourlyRate: [DEFAULT_HOURLY_RATE],
          comment: "",
        }));
      }
    }
  }, [DBMonthData, touchedDateInformation]);

  if (!!isLoading)
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );

  if (!!selectedMonthInformation)
    return (
      <SafeAreaView>
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
                        backgroundColor: !!DBMonthData.find(
                          (record) =>
                            record.dayId ===
                            `${
                              idx + 1 - selectedMonthInformation.firstDayIndex
                            }/${SELECTED_MONTH}/${SELECTED_YEAR}`
                        )
                          ? "green"
                          : "white",
                        // borderColor:
                        //   idx < selectedMonthInformation.firstDayIndex
                        //     ? "rgba(1, 1, 1, 0.1)"
                        //     : idx - selectedMonthInformation.firstDayIndex >=
                        //       selectedMonthInformation.numberOfDays
                        //     ? "rgba(1, 1, 1, 0.1)"
                        //     : "rgba(1, 1, 1, 0.25)",
                        borderColor:
                          `${
                            idx + 1 - selectedMonthInformation.firstDayIndex
                          }/${SELECTED_MONTH}/${SELECTED_YEAR}` ===
                          `${CURRENT_DATE}/${CURRENT_MONTH}/${CURRENT_YEAR}`
                            ? "blue"
                            : idx < selectedMonthInformation.firstDayIndex
                            ? "rgba(1, 1, 1, 0.1)"
                            : idx - selectedMonthInformation.firstDayIndex >=
                              selectedMonthInformation.numberOfDays
                            ? "rgba(1, 1, 1, 0.1)"
                            : "rgba(1, 1, 1, 0.25)",
                        borderRadius: 50,
                        justifyContent: "center",
                        borderWidth:
                          `${
                            idx + 1 - selectedMonthInformation.firstDayIndex
                          }/${SELECTED_MONTH}/${SELECTED_YEAR}` ===
                          `${CURRENT_DATE}/${CURRENT_MONTH}/${CURRENT_YEAR}`
                            ? 3
                            : 1,
                        height: (WINDOW_WIDTH - APP_PADDING * 2) / 7,
                        width: (WINDOW_WIDTH - APP_PADDING * 2) / 7,
                      }}
                    >
                      <Text>
                        {idx < selectedMonthInformation.firstDayIndex ||
                        idx - selectedMonthInformation.firstDayIndex >=
                          selectedMonthInformation.numberOfDays
                          ? ""
                          : `${
                              idx + 1 - selectedMonthInformation.firstDayIndex
                            }`}
                      </Text>
                    </View>
                  </Pressable>
                ))}
            </CalendarWrapper>
          </MonthCarouselWrapper>
        </GestureDetector>
        <Portal>
          <Modal
            onDismiss={() => {
              dispatch(setTouchedDateInformation(null));
            }}
            visible={!!touchedDateInformation}
          >
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 5,
                margin: APP_PADDING,
                padding: APP_PADDING,
              }}
            >
              <View
                style={{
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  variant="titleLarge"
                  style={{ marginVertical: APP_PADDING / 2 }}
                >
                  {touchedDateInformation?.SELECTED_DATE}/
                  {touchedDateInformation?.SELECTED_MONTH}/
                  {touchedDateInformation?.SELECTED_YEAR}
                </Text>
              </View>
              <View style={{ alignItems: "center", flexDirection: "row" }}>
                <TextInput
                  keyboardType="numeric"
                  label="Hours worked"
                  mode="outlined"
                  onChangeText={(newHoursWorked) =>
                    setModalData((modalData) => ({
                      ...modalData,
                      hoursWorked: !!parseFloat(newHoursWorked)
                        ? [parseFloat(newHoursWorked)]
                        : [0],
                    }))
                  }
                  style={{ flex: 1 }}
                  value={modalData.hoursWorked[0].toString()}
                />
                <IconButton icon="check" mode="outlined" onPress={() => {}} />
              </View>
              <View style={{ alignItems: "center", flexDirection: "row" }}>
                <TextInput
                  keyboardType="numeric"
                  label="Hourly rate"
                  mode="outlined"
                  onChangeText={(newHourlyRate) =>
                    setModalData((modalData) => ({
                      ...modalData,
                      hourlyRate: !!parseFloat(newHourlyRate)
                        ? [parseFloat(newHourlyRate)]
                        : [0],
                    }))
                  }
                  style={{ flex: 1 }}
                  value={modalData.hourlyRate[0].toString()}
                />
                <IconButton icon="check" mode="outlined" onPress={() => {}} />
              </View>
              <TextInput
                label="Comments"
                mode="outlined"
                multiline
                numberOfLines={4}
                onChangeText={(newText) =>
                  setModalData((modalData) => ({
                    ...modalData,
                    comment: newText,
                  }))
                }
                value={modalData.comment}
              />
              <View
                style={{
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  marginTop: APP_PADDING / 2.5,
                }}
              >
                <IconButton
                  icon="delete"
                  iconColor="red"
                  mode="outlined"
                  onPress={() => {}}
                />
                <Button
                  mode="outlined"
                  onPress={handleCancel}
                  style={{ marginRight: APP_PADDING / 2.5 }}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={() => {
                    setDBMonthData((monthData) => monthData);

                    handleInsertData(
                      modalData.hoursWorked,
                      modalData.hourlyRate,
                      modalData.comment
                    );
                  }}
                >
                  Save
                </Button>
              </View>
            </View>
          </Modal>
        </Portal>
      </SafeAreaView>
    );
};
