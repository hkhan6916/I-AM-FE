const insertUserSearchHistory = async ({ db, postId, messageId }) => {
  if (!postId && !messageId) return;
  const date = Date.now().toString();
  db?.transaction?.(
    (tx) => {
      tx.executeSql(
        `insert into running_uploads (
            postId,
            messageId,
            date
            ) values (?,?,?)`,
        [postId, messageId, date]
      );
    },
    (t, error) => {
      console.log(t, error);
    },
    (t, success) => {
      console.log("inserted into running_uploads");
    }
  );
};
export default insertUserSearchHistory;
