const db = require('./backend6/backend/configer/db.js');
db.query('SELECT t.id, t.title, t.group_id, g.name as group_name FROM tasks t LEFT JOIN `groups` g ON t.group_id = g.id ORDER BY t.id DESC LIMIT 5', (err, res) => {
  if(err) console.error(err);
  console.log("Tasks:", res);
  db.query('SELECT * FROM group_members', (e2, r2) => {
    console.log("Group Members:", r2);
    process.exit(0);
  });
});
