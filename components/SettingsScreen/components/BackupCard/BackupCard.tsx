import * as FileSystem from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";
import * as MediaLibrary from "expo-media-library";
import { useCallback } from "react";
import { Button, Card, Text } from "react-native-paper";

import { useAppSelector } from "@hooks";
import { APP_PADDING, colors } from "@theme";

export const BackupCard = () => {
  const { databaseInstance: db } = useAppSelector(({ app }) => app);

  const handleBackupData = useCallback(async () => {
    const { granted } = await MediaLibrary.requestPermissionsAsync();

    if (!!granted) {
      const backupDirectory = FileSystem.documentDirectory! + "backup/";

      const BACKUP_FILE_NAME = "backup.csv";

      if ((await FileSystem.getInfoAsync(backupDirectory)).exists !== true) {
        await FileSystem.makeDirectoryAsync(backupDirectory);
      }

      db.transaction(
        (tx) => {
          tx.executeSql(
            `
            SELECT * FROM dayTracker
          `,
            [],
            async (_, { rows: { _array } }) => {
              const dataMap = _array.map(
                ({ dayId, monthId, hoursWorked, hourlyRate, comment }) => [
                  dayId,
                  monthId,
                  hoursWorked,
                  hourlyRate,
                  comment,
                ]
              );

              let csvString = `dayId, monthId, hoursWorked, hourlyRate, comment\n`;

              for (let record of dataMap) {
                const recordString = record.join(",");

                csvString += `${recordString},\n`;
              }

              await FileSystem.writeAsStringAsync(
                backupDirectory + BACKUP_FILE_NAME,
                csvString,
                { encoding: FileSystem.EncodingType.UTF8 }
              );

              const { uri } = await FileSystem.getInfoAsync(
                backupDirectory + BACKUP_FILE_NAME
              );

              FileSystem.getContentUriAsync(uri).then((uri) => {
                IntentLauncher.startActivityAsync(
                  "android.intent.action.VIEW",
                  {
                    data: uri,
                    flags: 1,
                  }
                );
              });
            }
          );
        },
        (err) => {}
      );
    }
  }, []);

  return (
    <Card
      style={{
        alignItems: "flex-start",
        margin: APP_PADDING / 2,
      }}
    >
      <Card.Content>
        <Text style={{ color: colors.walledGreen }} variant="titleLarge">
          Backup
        </Text>
        <Button
          icon="download-box"
          onPress={() => {
            handleBackupData();
          }}
          mode="contained"
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Backup All</Text>
        </Button>
      </Card.Content>
    </Card>
  );
};

// await FileSystem.writeAsStringAsync(fileUri, "Hello World", { encoding: FileSystem.EncodingType.UTF8 });
// const asset = await MediaLibrary.createAssetAsync(fileUri)
