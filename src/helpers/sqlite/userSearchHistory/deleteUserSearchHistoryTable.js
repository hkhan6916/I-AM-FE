const deleteUserSearchHistoryTable = async (db) => {
  db.transaction(
    (tx) => {
      tx.executeSql(`DROP TABLE user_search_history `);
    },
    (error) => {
      console.log("db error creating user_search_history table");
      console.log(error);
    },
    (success) => {
      console.log("delete user_search_history table");
    }
  );
};

export default deleteUserSearchHistoryTable;
