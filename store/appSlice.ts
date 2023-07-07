import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import * as SQLite from "expo-sqlite";

import { AppState } from "@types";

const appInitialState: AppState = {
  databaseInstance: SQLite.openDatabase("work-tracker.db"),
  isLoading: true,
};

export const appSlice = createSlice({
  name: "app",
  initialState: appInitialState,
  reducers: {
    setIsLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.isLoading = payload;
    },
  },
});

export const { setIsLoading } = appSlice.actions;
