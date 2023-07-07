// Crate Tables

export const createDefaultTableSQLString =
  "CREATE TABLE IF NOT EXISTS dayTracker (dayId TEXT UNIQUE NOT NULL PRIMARY KEY)";

// DROP TABLES
export const dropDefaultTableSQLString = "DROP TABLE dayTracker";
