import { FC, PropsWithChildren } from "react";
import { View, ViewStyle } from "react-native";

const BaseWrapper: FC<PropsWithChildren<{ style?: ViewStyle }>> = ({
  children,
  style,
}) => {
  return <View style={{ ...style }}>{children}</View>;
};

export const CurrentMonthSummaryWrapper: FC<PropsWithChildren> = ({
  children,
}) => {
  return <BaseWrapper>{children}</BaseWrapper>;
};

export const FutureMonthSummaryWrapper: FC<PropsWithChildren> = ({
  children,
}) => {
  return <BaseWrapper>{children}</BaseWrapper>;
};

export const PastMonthSummaryWrapper: FC<PropsWithChildren> = ({
  children,
}) => {
  return <BaseWrapper>{children}</BaseWrapper>;
};
