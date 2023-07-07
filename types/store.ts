import * as SQLite from "expo-sqlite";

export type AppState = {
  databaseInstance: SQLite.WebSQLDatabase;
  isLoading: boolean;
};
