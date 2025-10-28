function getTeachers() {
  const url = 'https://<project-id>.firebaseio.com/teachers.json?auth=' + ScriptProperties.getProperty('FIREBASE_DB_SECRET');
  const res = UrlFetchApp.fetch(url, { method: 'get', muteHttpExceptions: true });
  return JSON.parse(res.getContentText());
}
