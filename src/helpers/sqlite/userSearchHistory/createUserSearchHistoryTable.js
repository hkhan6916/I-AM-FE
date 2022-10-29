const createUserSearchHistoryTable = async (db) => {
  db?.transaction?.(
    (tx) => {
      tx.executeSql(`
          CREATE TABLE IF NOT EXISTS user_search_history (
            id TEXT,
            searchQuery TEXT,
            date TEXT
          )
          `);
    },
    (error) => {
      console.log("db error creating user_search_history table");
      console.log(error);
    },
    (success) => {
      // console.log("created user_search_history table");
    }
  );
};

export default createUserSearchHistoryTable;
