const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "system",
  database: "student_absence_management",
  port: 3308,
});

module.exports = db;
