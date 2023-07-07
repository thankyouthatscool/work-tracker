import * as SQLite from "expo-sqlite";

export type CurrentDateInformation = {
  CURRENT_YEAR: number;
  CURRENT_MONTH: number;
  CURRENT_DATE: number;
  CURRENT_WEEK_DAY: number;
  CURRENT_MONTH_NUMBER_OF_DAYS: number;
  CURRENT_MONTH_FIRST_DAY: number;
  CURRENT_MONTH_LAST_DAY: number;
};

export type SelectedDateInformation = {
  SELECTED_DATE: number;
  SELECTED_MONTH: number;
  SELECTED_YEAR: number;
};

export type TouchedDateInformation = {
  SELECTED_DATE: number;
  SELECTED_MONTH: number;
  SELECTED_YEAR: number;
} | null;

export type AppState = {
  currentDateInformation: CurrentDateInformation;
  databaseInstance: SQLite.WebSQLDatabase;
  isLoading: boolean;
  selectedDateInformation: SelectedDateInformation;
  touchedDateInformation: TouchedDateInformation;
};
