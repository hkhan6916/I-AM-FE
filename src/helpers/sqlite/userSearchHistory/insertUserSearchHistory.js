const insertUserSearchHistory = async ({ db, searchQuery }) => {
  if (!searchQuery) return;
  const date = Date.now().toString();
  db.transaction(
    (tx) => {
      tx.executeSql(
        `insert into user_search_history (
            searchQuery,
            date
            ) values (?,?)`,
        [searchQuery, date]
      );
    },
    (t, error) => {
      console.log(t, error);
    },
    (t, success) => {
      console.log("inserted into user_search_history");
    }
  );
};
export default insertUserSearchHistory;
