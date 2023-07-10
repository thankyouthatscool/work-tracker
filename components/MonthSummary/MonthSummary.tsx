import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { IconButton, Text } from "react-native-paper";

import {
  DEFAULT_HOURS_WORKED,
  DEFAULT_HOURLY_RATE,
  HIGH_DISTINCTION_THRESHOLD,
} from "@constants";
import { useAppSelector, useSelectedMonth } from "@hooks";
import { APP_PADDING, colors } from "@theme";
import {
  getMonthName,
  getWeekdaysInAMonth,
  getWeekdaysInAMonthSoFar,
} from "@utils";

import {
  CurrentMonthSummaryWrapper,
  FutureMonthSummaryWrapper,
  PastMonthSummaryWrapper,
} from "./Styled";

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

  // TODO: Selected month information
  const [isSelectedMonthCurrent, setIsSelectedMonthCurrent] = useState(false);
  const [isSelectedMonthPast, setIsSelectedMonthPast] = useState(false);
  const [isSelectedMonthFuture, setIsSelectedMonthFuture] = useState(false);

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

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
    const selectedDateObject = new Date(
      selectedDateInformation.SELECTED_YEAR,
      selectedDateInformation.SELECTED_MONTH
    );

    const currentDateObject = new Date(
      currentDateInformation.CURRENT_YEAR,
      currentDateInformation.CURRENT_MONTH
    );

    if (selectedDateObject < currentDateObject) {
      setIsSelectedMonthCurrent(() => false);
      setIsSelectedMonthFuture(() => false);
      setIsSelectedMonthPast(() => true);
    } else if (selectedDateObject > currentDateObject) {
      setIsSelectedMonthCurrent(() => false);
      setIsSelectedMonthFuture(() => true);
      setIsSelectedMonthPast(() => false);
    } else {
      setIsSelectedMonthCurrent(() => true);
      setIsSelectedMonthFuture(() => false);
      setIsSelectedMonthPast(() => false);
    }
  }, [currentDateInformation, selectedDateInformation]);

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
          containerColor={colors.walledGreen}
          iconColor={colors.forbiddenBlackberry}
          icon="chevron-left"
          mode="contained"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            handleSelectedDateChange("prev");
          }}
        />
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            setIsExpanded((isExpanded) => !isExpanded);
          }}
          onLongPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            handleSelectedDateChange("today");
          }}
        >
          <Text
            style={{
              color: isSelectedMonthCurrent ? colors.walledGreen : "black",
              fontWeight: isSelectedMonthCurrent ? "bold" : "normal",
            }}
            variant="titleMedium"
          >
            {getMonthName(selectedDateInformation.SELECTED_MONTH)},{" "}
            {selectedDateInformation.SELECTED_YEAR}
          </Text>
        </Pressable>
        <IconButton
          containerColor={colors.walledGreen}
          iconColor={colors.forbiddenBlackberry}
          icon="chevron-right"
          mode="contained"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            handleSelectedDateChange("next");
          }}
        />
      </View>
      {isExpanded && (
        <View>
          {!!isSelectedMonthCurrent ? (
            <CurrentMonthSummaryWrapper>
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
                          HIGH_DISTINCTION_THRESHOLD
                            ? colors.walledGreen
                            : colors.xmasCandy,
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
                  <Text style={{ fontWeight: "bold" }}>
                    Total hours worked:{" "}
                  </Text>
                  <Text
                    style={{
                      color:
                        totalHoursWorked /
                          (DEFAULT_HOURS_WORKED *
                            NUMBER_OF_WEEKDAYS_IN_THE_MONTH_SO_FAR) >
                        HIGH_DISTINCTION_THRESHOLD
                          ? colors.walledGreen
                          : colors.xmasCandy,
                      fontWeight: "bold",
                    }}
                  >
                    {Math.round(totalHoursWorked * 100) / 100}
                  </Text>{" "}
                  (out of{" "}
                  {DEFAULT_HOURS_WORKED *
                    NUMBER_OF_WEEKDAYS_IN_THE_MONTH_SO_FAR}{" "}
                  so far) (
                  {DEFAULT_HOURS_WORKED * NUMBER_OF_WEEKDAYS_IN_THE_MONTH} month
                  max)
                </Text>
                <Text>
                  <Text style={{ fontWeight: "bold" }}>
                    Average hours worked:
                  </Text>{" "}
                  <Text
                    style={{
                      color:
                        totalHoursWorked /
                          NUMBER_OF_WEEKDAYS_IN_THE_MONTH_SO_FAR /
                          ((DEFAULT_HOURS_WORKED *
                            NUMBER_OF_WEEKDAYS_IN_THE_MONTH) /
                            NUMBER_OF_WEEKDAYS_IN_THE_MONTH) >
                        HIGH_DISTINCTION_THRESHOLD
                          ? colors.walledGreen
                          : colors.xmasCandy,
                      fontWeight: "bold",
                    }}
                  >
                    {Math.round(
                      (totalHoursWorked /
                        NUMBER_OF_WEEKDAYS_IN_THE_MONTH_SO_FAR) *
                        100
                    ) / 100}{" "}
                  </Text>
                  (on days worked{" "}
                  <Text
                    style={{
                      color:
                        totalHoursWorked /
                          dbMonthData.length /
                          ((DEFAULT_HOURS_WORKED *
                            NUMBER_OF_WEEKDAYS_IN_THE_MONTH) /
                            NUMBER_OF_WEEKDAYS_IN_THE_MONTH) >
                        HIGH_DISTINCTION_THRESHOLD
                          ? colors.walledGreen
                          : colors.xmasCandy,
                      fontWeight: "bold",
                    }}
                  >
                    {Math.round((totalHoursWorked / dbMonthData.length) * 100) /
                      100}
                  </Text>
                  {") "}
                  (optimal{" "}
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
                        HIGH_DISTINCTION_THRESHOLD
                          ? colors.walledGreen
                          : colors.xmasCandy,
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
            </CurrentMonthSummaryWrapper>
          ) : undefined}
          {!!isSelectedMonthPast ? (
            <PastMonthSummaryWrapper>
              <Text style={{ fontWeight: "bold" }}>
                Days worked:{" "}
                <Text
                  style={{
                    color:
                      dbMonthData.length / NUMBER_OF_WEEKDAYS_IN_THE_MONTH >
                      HIGH_DISTINCTION_THRESHOLD
                        ? colors.walledGreen
                        : colors.xmasCandy,
                    fontWeight: "bold",
                  }}
                >
                  {dbMonthData.length}{" "}
                  <Text>({NUMBER_OF_WEEKDAYS_IN_THE_MONTH} month max)</Text>
                </Text>
              </Text>
              <Text style={{ fontWeight: "bold" }}>
                Total hours worked:{" "}
                <Text
                  style={{
                    color:
                      totalHoursWorked /
                        (DEFAULT_HOURS_WORKED *
                          NUMBER_OF_WEEKDAYS_IN_THE_MONTH) >
                      HIGH_DISTINCTION_THRESHOLD
                        ? colors.walledGreen
                        : colors.xmasCandy,
                    fontWeight: "bold",
                  }}
                >
                  {Math.round(totalHoursWorked * 100) / 100}
                </Text>{" "}
                <Text>
                  (
                  {Math.round(
                    DEFAULT_HOURS_WORKED * NUMBER_OF_WEEKDAYS_IN_THE_MONTH * 100
                  ) / 100}{" "}
                  month max)
                </Text>
              </Text>
              <Text style={{ fontWeight: "bold" }}>
                Average hours worked:{" "}
                <Text
                  style={{
                    color:
                      totalHoursWorked /
                        NUMBER_OF_WEEKDAYS_IN_THE_MONTH /
                        ((DEFAULT_HOURS_WORKED *
                          NUMBER_OF_WEEKDAYS_IN_THE_MONTH) /
                          NUMBER_OF_WEEKDAYS_IN_THE_MONTH) >
                      HIGH_DISTINCTION_THRESHOLD
                        ? colors.walledGreen
                        : colors.xmasCandy,
                    fontWeight: "bold",
                  }}
                >
                  {Math.round(
                    (totalHoursWorked / NUMBER_OF_WEEKDAYS_IN_THE_MONTH) * 100
                  ) / 100}{" "}
                  <Text>
                    (
                    {Math.round((totalHoursWorked / dbMonthData.length) * 100) /
                      100 || 0}{" "}
                    on days worked){" "}
                  </Text>
                  <Text>
                    (optimal{" "}
                    {Math.round(
                      ((DEFAULT_HOURS_WORKED *
                        NUMBER_OF_WEEKDAYS_IN_THE_MONTH) /
                        NUMBER_OF_WEEKDAYS_IN_THE_MONTH) *
                        100
                    ) / 100}
                    )
                  </Text>
                </Text>
              </Text>
              <Text style={{ fontWeight: "bold" }}>
                Gross pay:{" "}
                <Text
                  style={{
                    color:
                      totalGrossPay /
                        (DEFAULT_HOURS_WORKED *
                          DEFAULT_HOURLY_RATE *
                          NUMBER_OF_WEEKDAYS_IN_THE_MONTH) >
                      HIGH_DISTINCTION_THRESHOLD
                        ? colors.walledGreen
                        : colors.xmasCandy,
                    fontWeight: "bold",
                  }}
                >
                  ${Math.round(totalGrossPay * 100) / 100}
                </Text>{" "}
                <Text>
                  ($
                  {Math.round(
                    DEFAULT_HOURLY_RATE *
                      DEFAULT_HOURS_WORKED *
                      NUMBER_OF_WEEKDAYS_IN_THE_MONTH *
                      100
                  ) / 100}{" "}
                  month max)
                </Text>
              </Text>
            </PastMonthSummaryWrapper>
          ) : undefined}
          {!!isSelectedMonthFuture ? (
            <FutureMonthSummaryWrapper>
              <Text style={{ fontWeight: "bold" }}>
                Available work days:{" "}
                <Text style={{ color: colors.walledGreen, fontWeight: "bold" }}>
                  {NUMBER_OF_WEEKDAYS_IN_THE_MONTH}
                </Text>
              </Text>
              <Text style={{ fontWeight: "bold" }}>
                Available work hours:{" "}
                <Text style={{ color: colors.walledGreen, fontWeight: "bold" }}>
                  {Math.round(
                    DEFAULT_HOURS_WORKED * NUMBER_OF_WEEKDAYS_IN_THE_MONTH * 100
                  ) / 100}
                </Text>
              </Text>
              <Text style={{ fontWeight: "bold" }}>
                Max possible gross pay:{" "}
                <Text style={{ color: colors.walledGreen, fontWeight: "bold" }}>
                  $
                  {Math.round(
                    DEFAULT_HOURS_WORKED *
                      DEFAULT_HOURLY_RATE *
                      NUMBER_OF_WEEKDAYS_IN_THE_MONTH *
                      100
                  ) / 100}
                </Text>
              </Text>
            </FutureMonthSummaryWrapper>
          ) : undefined}
        </View>
      )}
    </View>
  );
};
