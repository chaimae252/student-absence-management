const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const app = express();

// Database connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'system',
    database: 'student_absence_management'
});

// Serve static files like images and CSS
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// Route to serve the HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to load data from the database
app.get('/load-data', (req, res) => {
    const query = 'SELECT * FROM Etudiants LIMIT 5'; // Example query: change to fit your needs
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error loading data:', err);
            return res.status(500).send('Error loading data');
        }
        res.json(results); // Send the query results as JSON to the front-end
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
