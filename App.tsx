import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import { Provider as ReduxProvider } from "react-redux";

import { AppRoot } from "@components/AppRoot";
import { store } from "@store";

export default function App() {
  return (
    <ReduxProvider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PaperProvider>
          <View style={styles.container}>
            <AppRoot />
            <StatusBar style="auto" />
          </View>
        </PaperProvider>
      </GestureHandlerRootView>
    </ReduxProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
