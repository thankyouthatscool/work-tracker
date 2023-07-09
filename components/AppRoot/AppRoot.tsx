// import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useCallback, useEffect } from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { MonthCarousel } from "@components/MonthCarousel";
import { useAppDispatch, useAppSelector } from "@hooks";
import { setIsLoading } from "@store";
import { createDefaultTableSQLString, dropDefaultTableSQLString } from "@utils";
import { artisanGold, walledGreen, xmasCandy } from "@theme";

const Tab = createBottomTabNavigator<{
  MonthCarousel: undefined;
  Settings: undefined;
}>();

export const SettingsScreen = () => {
  return (
    <SafeAreaView>
      <Text>Settings</Text>
    </SafeAreaView>
  );
};

export const AppRoot = () => {
  const dispatch = useAppDispatch();

  const { databaseInstance: db, isLoading } = useAppSelector(({ app }) => app);

  const handleInitialLoad = useCallback(async () => {
    db.transaction(
      (tx) => {
        // tx.executeSql(dropDefaultTableSQLString);
        tx.executeSql(createDefaultTableSQLString);
      },
      ({ code, message }) => {
        console.log(code, message);
      },
      () => {
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
        initialRouteName="MonthCarousel"
        screenOptions={{ headerShown: false, tabBarShowLabel: false }}
      >
        <Tab.Screen
          component={MonthCarousel}
          name="MonthCarousel"
          options={{
            tabBarIcon: ({ color, focused, size }) => (
              <MaterialCommunityIcons
                color={focused ? walledGreen : color}
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
                color={focused ? walledGreen : color}
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
