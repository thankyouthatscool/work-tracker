import { FC, PropsWithChildren } from "react";
import { Dimensions, View } from "react-native";

import { APP_PADDING } from "@theme";

const { width: WINDOW_WIDTH } = Dimensions.get("window");

export const MonthCarouselWrapper: FC<PropsWithChildren> = ({ children }) => {
  return <View style={{ paddingHorizontal: APP_PADDING }}>{children}</View>;
};

export const CalendarWrapper: FC<PropsWithChildren> = ({ children }) => {
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        width: WINDOW_WIDTH - APP_PADDING * 2,
      }}
    >
      {children}
    </View>
  );
};

export const BottomButtonWrapper: FC<PropsWithChildren> = ({ children }) => {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-around",
      }}
    >
      {children}
    </View>
  );
};
