const mysql = require('mysql2');

// Update with your MySQL credentials
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'system', // Replace with your actual password
    database: 'student_absence_management'
});

// Connect to the database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to the database.');
});

module.exports = connection;
