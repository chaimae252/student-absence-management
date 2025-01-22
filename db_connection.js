const mysql = require('mysql2');

// Update these values with your MySQL credentials
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',            // Replace with your MySQL username
    password: 'system',            // Replace with your MySQL password (leave empty if no password is set)
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
