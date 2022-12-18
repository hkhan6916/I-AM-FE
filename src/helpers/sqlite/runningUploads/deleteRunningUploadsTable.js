const deleteRunningUploadsTable = async (db) => {
  db?.transaction?.(
    (tx) => {
      tx.executeSql(`DROP TABLE running_uploads `);
    },
    (error) => {
      console.log("db error deleting running_uploads table");
      console.log(error);
    },
    (success) => {
      console.log("delete running_uploads table");
    }
  );
};

export default deleteRunningUploadsTable;
