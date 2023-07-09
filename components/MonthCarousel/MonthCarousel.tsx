import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useState } from "react";
import { Dimensions, Pressable, View } from "react-native";
import {
  Button,
  Dialog,
  IconButton,
  Modal,
  Portal,
  Snackbar,
  Text,
  TextInput,
} from "react-native-paper";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

import { MonthSummary } from "@components/MonthSummary";
import {
  DEFAULT_HOURS_WORKED,
  DEFAULT_HOURLY_RATE,
  TRANSLATION_X_THRESHOLD,
  VELOCITY_X_THRESHOLD,
  DEFAULT_COMMENT,
} from "@constants";
import { useAppDispatch, useAppSelector } from "@hooks";
import {
  setDbMonthData,
  setSelectedDate,
  setTouchedDateInformation,
} from "@store";
import {
  APP_PADDING,
  artisanGold,
  forbiddenBlackberry,
  walledGreen,
  xmasCandy,
} from "@theme";
import { DbMonthData } from "@types";
import {
  formatDateString,
  getMonthInformation,
  getMonthName,
  getWeekdayName,
} from "@utils";

import {
  BottomButtonWrapper,
  CalendarWrapper,
  ModalButtonWrapper,
  MonthCarouselWrapper,
} from "./Styled";

const { width: WINDOW_WIDTH } = Dimensions.get("window");

export const MonthCarousel = () => {
  const dispatch = useAppDispatch();

  const { dbMonthData } = useAppSelector(({ app }) => app);

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

  // Snackbar state
  const [isSnackbarVisible, setIsSnackbarVisible] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

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
              const targetRecord = dbMonthData.find(
                (record) =>
                  record.dayId ===
                  `${touchedDateInformation?.SELECTED_DATE}/${touchedDateInformation?.SELECTED_MONTH}/${touchedDateInformation?.SELECTED_YEAR}`
              );

              let newData: DbMonthData[];

              if (!!targetRecord) {
                newData = [
                  { ...targetRecord, hoursWorked, hourlyRate, comment },
                  ...dbMonthData.filter(
                    (record) =>
                      record.dayId !==
                      `${touchedDateInformation?.SELECTED_DATE}/${touchedDateInformation?.SELECTED_MONTH}/${touchedDateInformation?.SELECTED_YEAR}`
                  ),
                ];
              } else {
                newData = [
                  ...dbMonthData,
                  {
                    dayId: `${touchedDateInformation?.SELECTED_DATE}/${touchedDateInformation?.SELECTED_MONTH}/${touchedDateInformation?.SELECTED_YEAR}`,
                    monthId: `${touchedDateInformation?.SELECTED_MONTH}/${touchedDateInformation?.SELECTED_YEAR}`,
                    hoursWorked,
                    hourlyRate,
                    comment,
                  },
                ];
              }

              dispatch(setDbMonthData(newData));

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

  const handleInsertDefaults = useCallback(
    (
      dayId: string,
      monthId: string,
      hoursWorked: number[],
      hourlyRate: number[],
      comment: string
    ) => {
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
              dayId,
              monthId,
              JSON.stringify(hoursWorked),
              JSON.stringify(hourlyRate),
              comment,
            ]
          );
        },
        (err) => console.log(err),
        () => {
          const targetRecord = dbMonthData.find(
            (record) => record.dayId === dayId
          );

          let newData: DbMonthData[];

          if (!!targetRecord) {
            newData = [
              { dayId, monthId, hoursWorked, hourlyRate, comment },
              ...dbMonthData.filter((record) => record.dayId !== dayId),
            ];
          } else {
            newData = [
              ...dbMonthData,
              { dayId, monthId, hoursWorked, hourlyRate, comment },
            ];
          }

          dispatch(setDbMonthData(newData));
        }
      );
    },
    [dbMonthData]
  );

  const handleDeleteRecord = useCallback(
    (dayId: string) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            `
            DELETE FROM dayTracker
            WHERE dayId = ?
          `,
            [dayId]
          );
        },
        (err) => console.log(err),
        () => {
          const newMonthData = dbMonthData.filter(
            (record) => record.dayId !== dayId
          );

          dispatch(setDbMonthData(newMonthData));
        }
      );
    },
    [dbMonthData]
  );

  const panGesture = Gesture.Pan().onEnd((e) => {
    if (
      Math.abs(e.translationX) > TRANSLATION_X_THRESHOLD &&
      Math.abs(e.velocityX) > VELOCITY_X_THRESHOLD
    ) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

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

          dispatch(setDbMonthData(parsedMonthData));
        }
      );
    });
  }, [SELECTED_MONTH, SELECTED_YEAR]);

  useEffect(() => {
    if (!!touchedDateInformation) {
      const targetDate = dbMonthData.find(
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
  }, [dbMonthData, touchedDateInformation]);

  if (!!isLoading)
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );

  if (!!selectedMonthInformation)
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "space-between" }}>
        <MonthTopInformation />
        <GestureDetector gesture={panGesture}>
          <MonthCarouselWrapper>
            <View style={{ flexDirection: "row" }}>
              {["M", "T", "W", "T", "F", "S", "S"].map((letter, idx) => (
                <View
                  key={idx}
                  style={{
                    alignItems: "center",
                    borderRadius: 50,
                    height: (WINDOW_WIDTH - APP_PADDING * 2) / 7,
                    justifyContent: "center",
                    width: (WINDOW_WIDTH - APP_PADDING * 2) / 7,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: idx >= 5 ? walledGreen : "white",
                      borderColor: walledGreen,
                      borderWidth: 2,
                      padding: APP_PADDING / 2,
                      borderRadius: 5,
                    }}
                  >
                    <Text
                      style={{
                        color: idx >= 5 ? "white" : walledGreen,
                        fontWeight: "bold",
                      }}
                    >
                      {letter}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
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
                    onLongPress={async () => {
                      if (
                        idx - selectedMonthInformation.firstDayIndex >= 0 &&
                        idx - selectedMonthInformation.firstDayIndex <
                          selectedMonthInformation.numberOfDays
                      ) {
                        await Haptics.impactAsync(
                          Haptics.ImpactFeedbackStyle.Medium
                        );

                        setSnackbarMessage(
                          () =>
                            `Default values set for ${
                              idx + 1 - selectedMonthInformation.firstDayIndex
                            }/${SELECTED_MONTH}/${SELECTED_YEAR}.`
                        );

                        setIsSnackbarVisible(() => true);

                        handleInsertDefaults(
                          `${
                            idx + 1 - selectedMonthInformation.firstDayIndex
                          }/${SELECTED_MONTH}/${SELECTED_YEAR}`,
                          `${SELECTED_MONTH}/${SELECTED_YEAR}`,
                          [DEFAULT_HOURS_WORKED],
                          [DEFAULT_HOURLY_RATE],
                          DEFAULT_COMMENT
                        );
                      }
                    }}
                  >
                    <View
                      style={{
                        alignItems: "center",
                        backgroundColor: !!dbMonthData.find(
                          (record) =>
                            record.dayId ===
                            `${
                              idx + 1 - selectedMonthInformation.firstDayIndex
                            }/${SELECTED_MONTH}/${SELECTED_YEAR}`
                        )
                          ? dbMonthData
                              .find(
                                (record) =>
                                  record.dayId ===
                                  `${
                                    idx +
                                    1 -
                                    selectedMonthInformation.firstDayIndex
                                  }/${SELECTED_MONTH}/${SELECTED_YEAR}`
                              )
                              ?.hoursWorked.reduce(
                                (acc, val) => acc + val,
                                0
                              ) !== DEFAULT_HOURS_WORKED
                            ? artisanGold
                            : walledGreen
                          : "white",
                        borderColor: "white",
                        borderRadius: 50,
                        justifyContent: "center",
                        borderWidth: 1,
                        height: (WINDOW_WIDTH - APP_PADDING * 2) / 7,
                        width: (WINDOW_WIDTH - APP_PADDING * 2) / 7,
                      }}
                    >
                      {idx < selectedMonthInformation.firstDayIndex ||
                      idx - selectedMonthInformation.firstDayIndex >=
                        selectedMonthInformation.numberOfDays ? (
                        <View />
                      ) : (
                        <Text
                          style={{
                            color: !!dbMonthData.find(
                              (record) =>
                                record.dayId ===
                                `${
                                  idx +
                                  1 -
                                  selectedMonthInformation.firstDayIndex
                                }/${SELECTED_MONTH}/${SELECTED_YEAR}`
                            )
                              ? "white"
                              : "black",
                            fontWeight: "bold",
                          }}
                        >
                          {idx + 1 - selectedMonthInformation.firstDayIndex}
                        </Text>
                      )}
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
                <IconButton
                  disabled={modalData.hoursWorked[0] === DEFAULT_HOURS_WORKED}
                  icon="check"
                  mode="outlined"
                  onPress={() => {
                    setModalData((modalData) => ({
                      ...modalData,
                      hoursWorked: [DEFAULT_HOURS_WORKED],
                    }));
                  }}
                />
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
                <IconButton
                  disabled={modalData.hourlyRate[0] === DEFAULT_HOURLY_RATE}
                  icon="check"
                  mode="outlined"
                  onPress={() => {
                    setModalData((modalData) => ({
                      ...modalData,
                      hourlyRate: [DEFAULT_HOURLY_RATE],
                    }));
                  }}
                />
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
              <ModalButtonWrapper>
                <IconButton
                  disabled={
                    !dbMonthData.find(
                      (record) =>
                        record.dayId ===
                        `${touchedDateInformation?.SELECTED_DATE}/${touchedDateInformation?.SELECTED_MONTH}/${touchedDateInformation?.SELECTED_YEAR}`
                    )
                  }
                  icon="delete"
                  iconColor={xmasCandy}
                  onPress={() => {
                    setIsDialogOpen(() => true);
                  }}
                />
                <View style={{ flexDirection: "row" }}>
                  <Button
                    mode="outlined"
                    onPress={handleCancel}
                    style={{ marginRight: APP_PADDING / 2.5 }}
                    textColor={forbiddenBlackberry}
                  >
                    Cancel
                  </Button>
                  <Button
                    buttonColor={forbiddenBlackberry}
                    mode="contained"
                    onPress={() => {
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
              </ModalButtonWrapper>
              <Portal>
                <Dialog
                  onDismiss={() => {
                    setIsDialogOpen(() => false);
                  }}
                  visible={isDialogOpen}
                >
                  <Dialog.Title>Confirm Delete</Dialog.Title>
                  <Dialog.Content>
                    <Text style={{ marginBottom: APP_PADDING }}>
                      Are you sure you want to delete information for{" "}
                      {touchedDateInformation?.SELECTED_DATE}/
                      {touchedDateInformation?.SELECTED_MONTH}/
                      {touchedDateInformation?.SELECTED_YEAR}?
                    </Text>
                    <Text style={{ fontWeight: "bold" }}>
                      This action cannot be undone!
                    </Text>
                  </Dialog.Content>
                  <Dialog.Actions>
                    <Button
                      mode="outlined"
                      onPress={() => {
                        setIsDialogOpen(() => false);
                      }}
                      textColor={xmasCandy}
                    >
                      Cancel
                    </Button>
                    <Button
                      buttonColor={xmasCandy}
                      mode="contained"
                      onPress={() => {
                        setIsDialogOpen(() => false);

                        handleDeleteRecord(
                          `${touchedDateInformation?.SELECTED_DATE}/${touchedDateInformation?.SELECTED_MONTH}/${touchedDateInformation?.SELECTED_YEAR}`
                        );

                        dispatch(setTouchedDateInformation(null));
                      }}
                    >
                      Delete
                    </Button>
                  </Dialog.Actions>
                </Dialog>
              </Portal>
            </View>
          </Modal>
        </Portal>
        <Portal>
          <Snackbar
            duration={1500}
            onDismiss={() => {
              setIsSnackbarVisible(() => false);
            }}
            visible={isSnackbarVisible}
          >
            {snackbarMessage}
          </Snackbar>
        </Portal>
        <MonthSummary />
      </SafeAreaView>
    );

  return <View />;
};

export const MonthTopInformation = () => {
  return <View />;
};
