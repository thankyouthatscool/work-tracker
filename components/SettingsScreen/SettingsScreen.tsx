import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { DEFAULT_HOURS_WORKED, DEFAULT_HOURLY_RATE } from "@constants";
import { useAppDispatch, useAppSelector } from "@hooks";
import { setAppSettingDefaults } from "@store";
import { APP_PADDING, colors } from "@theme";
import { setAppDefaults as setAppDefaultsLS } from "@utils";

type LocalAppDefaultsInputs = {
  defaultHoursWorked: string;
  defaultHourlyRate: string;
  defaultComment: string;
};

export const SettingsScreen = () => {
  const dispatch = useAppDispatch();

  const { appSettings } = useAppSelector(({ app }) => app);

  const [isSaveNeeded, setIsSaveNeeded] = useState<boolean>(false);

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
  ``;
  useEffect(() => {
    console.log(appSettings);
  }, [appSettings]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingHorizontal: APP_PADDING,
        justifyContent: "space-between",
      }}
    >
      <ScrollView>
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
      </ScrollView>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          paddingVertical: APP_PADDING / 2,
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
