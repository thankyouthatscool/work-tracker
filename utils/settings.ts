import AsyncStorage from "@react-native-async-storage/async-storage";

import { AppSettingsDefaults } from "@types";

export const setAppDefaults = async (
  appSettingDefaults: AppSettingsDefaults
) => {
  await AsyncStorage.setItem(
    "appSettingDefaults",
    JSON.stringify(appSettingDefaults)
  );
};

export const loadAppDefaults = async () => {
  const resString = await AsyncStorage.getItem("appSettingDefaults");

  if (!!resString) return JSON.parse(resString) as AppSettingsDefaults;
};
