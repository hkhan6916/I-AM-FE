const getUserSearchHistory = async (db) => {
  return new Promise((resolve, reject) => {
    db?.transaction?.((tx) => {
      tx.executeSql(
        "select * from running_uploads order by date DESC LIMIT 10",
        [],
        (tx, results) => {
          resolve(results.rows._array);
        },
        (tx, error) => {
          reject("Error SELECT: ", error.message);
        }
      );
    });
  });
};
export default getUserSearchHistory;