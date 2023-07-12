import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { FC, useCallback, useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Pressable, ScrollView, View } from "react-native";
import { Card, Button, Text, TextInput, IconButton } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { DEFAULT_HOURS_WORKED, DEFAULT_HOURLY_RATE } from "@constants";
import { useAppDispatch, useAppSelector } from "@hooks";
import { setAppSettingDefaults } from "@store";
import { APP_PADDING, colors } from "@theme";
import { setAppDefaults as setAppDefaultsLS, getMonthName } from "@utils";

import type { TabProps } from "../AppRoot";

type LocalAppDefaultsInputs = {
  defaultHoursWorked: string;
  defaultHourlyRate: string;
  defaultComment: string;
};

type MonthData = { availableMonth: string; numberOfRecords: number };

export const SettingsScreen: FC<BottomTabScreenProps<TabProps, "Settings">> = ({
  navigation,
}) => {
  const dispatch = useAppDispatch();

  const { appSettings, databaseInstance: db } = useAppSelector(
    ({ app }) => app
  );

  const [isSaveNeeded, setIsSaveNeeded] = useState<boolean>(false);
  const [isShowFullMonthDataList, setIsShowFullMonthDataList] =
    useState<boolean>(false);
  const [availableMonthData, setAvailableMonthData] = useState<MonthData[]>([]);

  const { control, handleSubmit } = useForm<LocalAppDefaultsInputs>({
    defaultValues: {
      defaultHoursWorked:
        appSettings.appSettingsDefaults.defaultHoursWorked.toString(),
      defaultHourlyRate:
        appSettings.appSettingsDefaults.defaultHourlyRate.toString(),
      defaultComment: appSettings.appSettingsDefaults.defaultComment.toString(),
    },
  });

  const onSubmit: SubmitHandler<LocalAppDefaultsInputs> = async (data) => {
    const parsedData = {
      ...data,
      defaultHoursWorked:
        parseFloat(data.defaultHoursWorked) || DEFAULT_HOURS_WORKED,
      defaultHourlyRate:
        parseFloat(data.defaultHourlyRate) || DEFAULT_HOURLY_RATE,
    };

    await setAppDefaultsLS(parsedData);

    dispatch(setAppSettingDefaults(parsedData));
  };

  const handleLoadAvailableMonths = useCallback(() => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `
            SELECT DISTINCT (monthId) as availableMonth, COUNT(*) as 'numberOfRecords'
            FROM dayTracker
            GROUP BY monthId
        `,
          [],
          (_, { rows: { _array } }) => {
            setAvailableMonthData(() => _array);
          }
        );
      },
      (err) => {},
      () => {}
    );
  }, []);

  const handleDeleteMonth = useCallback((monthId: string) => {
    console.log(monthId);

    db.transaction(
      (tx) => {
        tx.executeSql(
          `
            DELETE FROM dayTracker
            WHERE monthId = ?
        `,
          [monthId],
          () => {}
        );
      },
      (err) => console.log(err),
      () => {
        handleLoadAvailableMonths();
      }
    );
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      handleLoadAvailableMonths();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "space-between",
      }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card
          style={{
            margin: APP_PADDING / 2,
            marginBottom: 0,
          }}
        >
          <Card.Content>
            <Text style={{ color: colors.walledGreen }} variant="titleLarge">
              Defaults
            </Text>
            <View style={{ flexDirection: "row" }}>
              <Controller
                control={control}
                name="defaultHoursWorked"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    contextMenuHidden
                    keyboardType="numeric"
                    label="Hours worked"
                    mode="outlined"
                    onBlur={onBlur}
                    onChangeText={(newDefaultHoursWorked) => {
                      setIsSaveNeeded(() => true);

                      onChange(newDefaultHoursWorked);
                    }}
                    right={<TextInput.Affix text="hour(s)" />}
                    style={{ flex: 1, marginRight: APP_PADDING / 4 }}
                    value={value}
                  />
                )}
              />
              <Controller
                control={control}
                name="defaultHourlyRate"
                render={({ field: { onBlur, onChange, value } }) => (
                  <TextInput
                    contextMenuHidden
                    keyboardType="numeric"
                    label="Hourly rate"
                    left={<TextInput.Affix text="$" />}
                    mode="outlined"
                    onBlur={onBlur}
                    onChangeText={(newDefaultHourlyRate) => {
                      setIsSaveNeeded(() => true);

                      onChange(newDefaultHourlyRate);
                    }}
                    style={{ flex: 1, marginLeft: APP_PADDING / 4 }}
                    value={value}
                  />
                )}
              />
            </View>
            <Controller
              control={control}
              name="defaultComment"
              render={({ field: { onBlur, onChange, value } }) => (
                <TextInput
                  label="comment"
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  onBlur={onBlur}
                  onChangeText={(newDefaultComment) => {
                    setIsSaveNeeded(() => true);

                    onChange(newDefaultComment);
                  }}
                  value={value}
                />
              )}
            />
          </Card.Content>
        </Card>
        <Card
          style={{
            margin: APP_PADDING / 2,
          }}
        >
          <Card.Content>
            <Text style={{ color: colors.walledGreen }} variant="titleLarge">
              Data
            </Text>
            <Text style={{ color: colors.walledGreen }} variant="titleMedium">
              Available Months - {availableMonthData.length}
            </Text>
            <View>
              {availableMonthData
                .sort((a, b) => {
                  const [aMonth, aYear] = a.availableMonth
                    .split("/")
                    .map((val) => parseInt(val));
                  const [bMonth, bYear] = b.availableMonth
                    .split("/")
                    .map((val) => parseInt(val));

                  const aDate = new Date(aYear, aMonth);
                  const bDate = new Date(bYear, bMonth);

                  return aDate < bDate ? 1 : -1;
                })
                .slice(
                  0,
                  isShowFullMonthDataList ? availableMonthData.length : 4
                )
                .map((month, idx) => (
                  <Pressable
                    key={month.availableMonth}
                    onPress={() => {
                      console.log(idx);
                    }}
                    onLongPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

                      handleDeleteMonth(month.availableMonth);
                    }}
                  >
                    <View
                      style={{
                        alignItems: "center",
                        backgroundColor: `${colors.artisanGold}11`,
                        borderColor: colors.artisanGold,
                        borderWidth: 2,
                        borderRadius: 10,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        padding: APP_PADDING / 2,
                        marginTop: idx === 0 ? APP_PADDING / 4 : 0,
                        marginBottom:
                          idx !== availableMonthData.length - 1
                            ? APP_PADDING / 4
                            : 0,
                      }}
                    >
                      <View>
                        <Text>
                          {getMonthName(
                            parseInt(month.availableMonth.split("/")[0])
                          )}
                          , {month.availableMonth.split("/")[1]}
                        </Text>
                        <Text>Number of records: {month.numberOfRecords}</Text>
                      </View>
                      <MaterialCommunityIcons name="delete" size={20} />
                    </View>
                  </Pressable>
                ))}
              <View style={{ alignItems: "flex-end" }}>
                {availableMonthData.length > 4 && (
                  <IconButton
                    icon={`chevron-${isShowFullMonthDataList ? "up" : "down"}`}
                    mode="contained"
                    onPress={() => {
                      setIsShowFullMonthDataList((is) => !is);
                    }}
                  />
                )}
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          paddingVertical: APP_PADDING / 2,
          paddingHorizontal: APP_PADDING / 2,
        }}
      >
        <Button
          disabled={!isSaveNeeded}
          mode="contained"
          onPress={handleSubmit((data) => {
            setIsSaveNeeded(() => false);

            onSubmit(data);
          })}
        >
          Save
        </Button>
      </View>
    </SafeAreaView>
  );
};
