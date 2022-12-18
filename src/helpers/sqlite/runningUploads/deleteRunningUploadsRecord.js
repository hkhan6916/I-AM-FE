const deleteRunningUploadRecord = async ({ db, postId, messageId }) => {
  if (!postId && !messageId) return;
  const condition = postId ? `postId='${postId}'` : `messageId='${messageId}'`;

  db?.transaction?.(
    (tx) => {
      tx.executeSql(
        `DELETE FROM running_uploads
          WHERE ${condition}`,
        []
      );
    },
    (t, error) => {
      console.log(t, error);
    },
    (t, success) => {
      console.log("deleted running_uploads record");
    }
  );
};
export default deleteRunningUploadRecord;
