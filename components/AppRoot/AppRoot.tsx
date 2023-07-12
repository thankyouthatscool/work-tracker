// import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useCallback, useEffect } from "react";
import { View } from "react-native";

import { MonthCarousel } from "@components/MonthCarousel";
import { SettingsScreen } from "@components/SettingsScreen";
import { useAppDispatch, useAppSelector } from "@hooks";
import { setIsLoading, setAppSettingDefaults } from "@store";
import { createDefaultTableSQLString, dropDefaultTableSQLString } from "@utils";
import { colors } from "@theme";
import { loadAppDefaults } from "@utils";

export type TabProps = {
  MonthCarousel: { monthId?: string };
  Settings: undefined;
};

const Tab = createBottomTabNavigator<TabProps>();

export const AppRoot = () => {
  const dispatch = useAppDispatch();

  const { databaseInstance: db, isLoading } = useAppSelector(({ app }) => app);

  const handleInitialLoad = useCallback(async () => {
    db.transaction(
      (tx) => {
        // tx.executeSql(dropDefaultTableSQLString);
        tx.executeSql(createDefaultTableSQLString);
      },
      (err) => {
        {
          console.log(err);
        }
      },
      async () => {
        const DEFAULTS = await loadAppDefaults();

        if (!!DEFAULTS) dispatch(setAppSettingDefaults(DEFAULTS));

        dispatch(setIsLoading(false));
      }
    );
  }, []);

  useEffect(() => {
    handleInitialLoad();
  }, []);

  return (
    <View style={{ flex: 1, width: "100%" }}>
      <Tab.Navigator
        initialRouteName="Settings"
        screenOptions={{ headerShown: false, tabBarShowLabel: false }}
      >
        <Tab.Screen
          component={MonthCarousel}
          name="MonthCarousel"
          options={{
            tabBarIcon: ({ color, focused, size }) => (
              <MaterialCommunityIcons
                color={focused ? colors.walledGreen : color}
                name="calendar-blank-outline"
                size={size}
              />
            ),
          }}
        />
        <Tab.Screen
          component={SettingsScreen}
          name="Settings"
          options={{
            tabBarIcon: ({ color, focused, size }) => (
              <MaterialCommunityIcons
                color={focused ? colors.walledGreen : color}
                name="tune-vertical"
                size={size}
              />
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
};
