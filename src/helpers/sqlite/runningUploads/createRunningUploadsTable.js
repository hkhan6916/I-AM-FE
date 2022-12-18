const createUserSearchHistoryTable = async (db) => {
  db?.transaction?.(
    (tx) => {
      tx.executeSql(`
            CREATE TABLE IF NOT EXISTS running_uploads (
              id TEXT,
              postId TEXT,
              messageId TEXT,
              date TEXT
            )
            `);
    },
    (error) => {
      console.log("db error creating running_uploads table");
      console.log(error);
    },
    (success) => {
      console.log("created running_uploads table");
    }
  );
};

export default createUserSearchHistoryTable;
