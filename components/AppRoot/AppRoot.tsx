import { useCallback, useEffect } from "react";
import { Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { TRANSLATION_X_THRESHOLD, VELOCITY_X_THRESHOLD } from "@constants";
import { useAppDispatch, useAppSelector } from "@hooks";
import { setIsLoading } from "@store";
import { createDefaultTableSQLString, getMonthInformation } from "@utils";

export const AppRoot = () => {
  const dispatch = useAppDispatch();

  const { databaseInstance: db, isLoading } = useAppSelector(({ app }) => app);

  const panGesture = Gesture.Pan().onEnd((e) => {
    if (
      Math.abs(e.translationX) > TRANSLATION_X_THRESHOLD &&
      Math.abs(e.velocityX) > VELOCITY_X_THRESHOLD
    ) {
      if (e.translationX > 0) {
        // Swipe right action
      } else {
        // Swipe left action
      }
    }
  });

  const handleInitialLoad = useCallback(async () => {
    db.transaction(
      (tx) => {
        tx.executeSql(createDefaultTableSQLString);
      },
      ({ code, message }) => {
        console.log(code, message);
      },
      () => {
        const monthData = getMonthInformation(2023, 6);

        console.log(monthData);

        dispatch(setIsLoading(false));
      }
    );
  }, []);

  useEffect(() => {
    handleInitialLoad();
  }, []);

  return (
    <GestureDetector gesture={panGesture}>
      <SafeAreaView
        style={{
          alignContent: "center",
          flex: 1,
          justifyContent: "center",
          padding: 100,
          width: "100%",
        }}
      >
        <View>
          <Text>{isLoading ? "Loading..." : "Not Loading..."}</Text>
          <Button
            onPress={() => {
              dispatch(setIsLoading(!isLoading));
            }}
            mode={isLoading ? "contained" : "elevated"}
          >
            {`Set Loading ${isLoading ? "FALSE" : "TRUE"}!!!`}
          </Button>
        </View>
      </SafeAreaView>
    </GestureDetector>
  );
};
