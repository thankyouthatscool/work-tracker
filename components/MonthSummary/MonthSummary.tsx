import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { IconButton, Text } from "react-native-paper";

import { DEFAULT_HOURS_WORKED, DEFAULT_HOURLY_RATE } from "@constants";
import { useAppSelector, useSelectedMonth } from "@hooks";
import { APP_PADDING } from "@theme";
import {
  getMonthName,
  getWeekdaysInAMonth,
  getWeekdaysInAMonthSoFar,
} from "@utils";

// TODO: Figure out number of working days in a month.

export const MonthSummary = () => {
  const { currentDateInformation, dbMonthData, selectedDateInformation } =
    useAppSelector(({ app }) => app);

  const { handleSelectedDateChange } = useSelectedMonth();

  const [totalHoursWorked, setTotalHoursWorked] = useState(
    dbMonthData.reduce(
      (acc, val) => acc + val.hoursWorked.reduce((acc, val) => acc + val, 0),
      0
    )
  );
  const [totalGrossPay, setTotalGrossPay] = useState(
    dbMonthData.reduce(
      (acc, val) => acc + val.hoursWorked.reduce((acc, val) => acc + val, 0),
      0
    )
  );
  const [isSelectedMonthCurrent, setIsSelectedMonthCurrent] = useState(
    `${selectedDateInformation.SELECTED_MONTH}/${selectedDateInformation.SELECTED_YEAR}` ===
      `${currentDateInformation.CURRENT_MONTH}/${currentDateInformation.CURRENT_YEAR}`
  );

  const NUMBER_OF_WEEKDAYS_IN_THE_MONTH = getWeekdaysInAMonth(
    selectedDateInformation.SELECTED_MONTH,
    selectedDateInformation.SELECTED_YEAR
  );
  const NUMBER_OF_WEEKDAYS_IN_THE_MONTH_SO_FAR = getWeekdaysInAMonthSoFar(
    selectedDateInformation.SELECTED_MONTH,
    selectedDateInformation.SELECTED_YEAR,
    currentDateInformation.CURRENT_DATE
  );

  useEffect(() => {
    setTotalHoursWorked(() =>
      dbMonthData.reduce(
        (acc, val) => acc + val.hoursWorked.reduce((acc, val) => acc + val, 0),
        0
      )
    );
  }, [dbMonthData]);

  useEffect(() => {
    const totalMonthPay = dbMonthData.reduce(
      (acc, val) => acc + val.hoursWorked[0] * val.hourlyRate[0],
      0
    );

    setTotalGrossPay(() => totalMonthPay);
  }, [dbMonthData]);

  useEffect(() => {
    setIsSelectedMonthCurrent(
      () =>
        `${selectedDateInformation.SELECTED_MONTH}/${selectedDateInformation.SELECTED_YEAR}` ===
        `${currentDateInformation.CURRENT_MONTH}/${currentDateInformation.CURRENT_YEAR}`
    );
  }, [selectedDateInformation]);

  return (
    <View
      style={{
        backgroundColor: "white",
        elevation: 10,
        paddingBottom: APP_PADDING / 2,
        paddingHorizontal: APP_PADDING / 2,
      }}
    >
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <IconButton
          icon="chevron-left"
          mode="contained"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            handleSelectedDateChange("prev");
          }}
        />
        <Pressable
          onLongPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            handleSelectedDateChange("today");
          }}
        >
          <Text
            style={{
              color: isSelectedMonthCurrent ? "green" : "black",
              fontWeight: isSelectedMonthCurrent ? "bold" : "normal",
            }}
            variant="titleMedium"
          >
            {getMonthName(selectedDateInformation.SELECTED_MONTH)},{" "}
            {selectedDateInformation.SELECTED_YEAR}
          </Text>
        </Pressable>
        <IconButton
          icon="chevron-right"
          mode="contained"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            handleSelectedDateChange("next");
          }}
        />
      </View>

      {dbMonthData.length ? (
        <View>
          <Text>
            <Text style={{ fontWeight: "bold" }}>
              Days worked:{" "}
              <Text
                style={{
                  color:
                    totalHoursWorked /
                      (DEFAULT_HOURS_WORKED *
                        NUMBER_OF_WEEKDAYS_IN_THE_MONTH_SO_FAR) >
                    0.85
                      ? "green"
                      : "red",
                  fontWeight: "bold",
                }}
              >
                {dbMonthData.length}
              </Text>
            </Text>{" "}
            (out of {NUMBER_OF_WEEKDAYS_IN_THE_MONTH_SO_FAR} so far) (
            {NUMBER_OF_WEEKDAYS_IN_THE_MONTH} month max)
          </Text>
          <Text>
            <Text style={{ fontWeight: "bold" }}>Total hours worked: </Text>
            <Text
              style={{
                color:
                  totalHoursWorked /
                    (DEFAULT_HOURS_WORKED *
                      NUMBER_OF_WEEKDAYS_IN_THE_MONTH_SO_FAR) >
                  0.85
                    ? "green"
                    : "red",
                fontWeight: "bold",
              }}
            >
              {Math.round(totalHoursWorked * 100) / 100}
            </Text>{" "}
            (out of{" "}
            {DEFAULT_HOURS_WORKED * NUMBER_OF_WEEKDAYS_IN_THE_MONTH_SO_FAR} so
            far) ({DEFAULT_HOURS_WORKED * NUMBER_OF_WEEKDAYS_IN_THE_MONTH} month
            max)
          </Text>
          <Text>
            <Text style={{ fontWeight: "bold" }}>Average hours worked:</Text>{" "}
            <Text
              style={{
                color:
                  totalHoursWorked /
                    NUMBER_OF_WEEKDAYS_IN_THE_MONTH_SO_FAR /
                    ((DEFAULT_HOURS_WORKED * NUMBER_OF_WEEKDAYS_IN_THE_MONTH) /
                      NUMBER_OF_WEEKDAYS_IN_THE_MONTH) >
                  0.85
                    ? "green"
                    : "red",
                fontWeight: "bold",
              }}
            >
              {Math.round(
                (totalHoursWorked / NUMBER_OF_WEEKDAYS_IN_THE_MONTH_SO_FAR) *
                  100
              ) / 100}{" "}
            </Text>
            (on worked days{" "}
            <Text
              style={{
                color:
                  totalHoursWorked /
                    dbMonthData.length /
                    ((DEFAULT_HOURS_WORKED * NUMBER_OF_WEEKDAYS_IN_THE_MONTH) /
                      NUMBER_OF_WEEKDAYS_IN_THE_MONTH) >
                  0.85
                    ? "green"
                    : "red",
                fontWeight: "bold",
              }}
            >
              {Math.round((totalHoursWorked / dbMonthData.length) * 100) / 100}
            </Text>
            {") "}
            (ideal{" "}
            {Math.round(
              ((DEFAULT_HOURS_WORKED * NUMBER_OF_WEEKDAYS_IN_THE_MONTH) /
                NUMBER_OF_WEEKDAYS_IN_THE_MONTH) *
                100
            ) / 100}
            )
          </Text>
          <Text>
            <Text style={{ fontWeight: "bold" }}>Gross pay: </Text>
            <Text
              style={{
                color:
                  totalGrossPay /
                    (DEFAULT_HOURS_WORKED *
                      DEFAULT_HOURLY_RATE *
                      NUMBER_OF_WEEKDAYS_IN_THE_MONTH_SO_FAR) >
                  0.85
                    ? "green"
                    : "red",
                fontWeight: "bold",
              }}
            >
              ${Math.round(totalGrossPay * 100) / 100}
            </Text>{" "}
            (out of $
            {Math.round(
              DEFAULT_HOURS_WORKED *
                DEFAULT_HOURLY_RATE *
                NUMBER_OF_WEEKDAYS_IN_THE_MONTH_SO_FAR *
                100
            ) / 100}{" "}
            so far) ($
            {Math.round(
              DEFAULT_HOURS_WORKED *
                DEFAULT_HOURLY_RATE *
                NUMBER_OF_WEEKDAYS_IN_THE_MONTH *
                100
            ) / 100}{" "}
            month max)
          </Text>
        </View>
      ) : (
        <View />
      )}
    </View>
  );
};
