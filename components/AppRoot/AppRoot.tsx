import { useCallback, useEffect } from "react";

import { Text, View } from "react-native";
import { Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppDispatch, useAppSelector } from "@hooks";
import { setIsLoading } from "@store";
import { createDefaultTableSQLString } from "@utils";

export const AppRoot = () => {
  const dispatch = useAppDispatch();

  const { databaseInstance: db, isLoading } = useAppSelector(({ app }) => app);

  const handleInitialLoad = useCallback(async () => {
    db.transaction(
      (tx) => {
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
    <SafeAreaView>
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
  );
};
