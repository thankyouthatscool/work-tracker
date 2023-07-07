import { useCallback, useEffect } from "react";

import { MonthCarousel } from "@components/MonthCarousel";
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

  return <MonthCarousel />;
};
