import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import * as SQLite from "expo-sqlite";

import {
  DEFAULT_HOURS_WORKED,
  DEFAULT_HOURLY_RATE,
  DEFAULT_COMMENT,
} from "@constants";
import {
  AppSettingsDefaults,
  AppState,
  CurrentDateInformation,
  DbMonthData,
  SelectedDateInformation,
  TouchedDateInformation,
} from "@types";

const dateInstance = new Date();

const CURRENT_YEAR = dateInstance.getFullYear();
const CURRENT_MONTH = dateInstance.getMonth();
const CURRENT_DATE = dateInstance.getDate();
const CURRENT_WEEK_DAY = dateInstance.getDay();
const CURRENT_MONTH_NUMBER_OF_DAYS = new Date(
  CURRENT_YEAR,
  CURRENT_MONTH + 1,
  0
).getDate();
const CURRENT_MONTH_FIRST_DAY = new Date(
  CURRENT_YEAR,
  CURRENT_MONTH,
  0
).getDay();
const CURRENT_MONTH_LAST_DAY = new Date(
  CURRENT_YEAR,
  CURRENT_MONTH,
  CURRENT_MONTH_NUMBER_OF_DAYS - 1
).getDay();

const appInitialState: AppState = {
  appSettings: {
    appSettingsDefaults: {
      defaultHoursWorked: DEFAULT_HOURS_WORKED,
      defaultComment: DEFAULT_COMMENT,
      defaultHourlyRate: DEFAULT_HOURLY_RATE,
    },
  },
  currentDateInformation: {
    CURRENT_YEAR,
    CURRENT_MONTH,
    CURRENT_DATE,
    CURRENT_MONTH_FIRST_DAY,
    CURRENT_MONTH_LAST_DAY,
    CURRENT_MONTH_NUMBER_OF_DAYS,
    CURRENT_WEEK_DAY,
  },
  databaseInstance: SQLite.openDatabase("work-tracker.db"),
  dbMonthData: [],
  isLoading: true,
  selectedDateInformation: {
    SELECTED_DATE: CURRENT_DATE,
    SELECTED_MONTH: CURRENT_MONTH,
    SELECTED_YEAR: CURRENT_YEAR,
  },
  touchedDateInformation: null,
};

export const appSlice = createSlice({
  name: "app",
  initialState: appInitialState,
  reducers: {
    // Loading state
    setIsLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.isLoading = payload;
    },

    // Current date
    setCurrentDateInformation: (
      state,
      { payload }: PayloadAction<CurrentDateInformation>
    ) => {
      state.currentDateInformation = payload;
    },

    // Selected date
    setSelectedDate: (
      state,
      { payload }: PayloadAction<SelectedDateInformation>
    ) => {
      state.selectedDateInformation = payload;
    },

    // Touched date
    setTouchedDateInformation: (
      state,
      { payload }: PayloadAction<TouchedDateInformation>
    ) => {
      state.touchedDateInformation = payload;
    },

    // DB Month Data
    setDbMonthData: (state, { payload }: PayloadAction<DbMonthData[]>) => {
      state.dbMonthData = payload;
    },

    // App Settings
    setAppSettingDefaults: (
      state,
      { payload }: PayloadAction<AppSettingsDefaults>
    ) => {
      state.appSettings.appSettingsDefaults = payload;
    },
  },
});

export const {
  setIsLoading,
  // CUrrent date
  setCurrentDateInformation,

  setSelectedDate,
  setTouchedDateInformation,

  // DB Month Data
  setDbMonthData,

  // App Settings
  setAppSettingDefaults,
} = appSlice.actions;
