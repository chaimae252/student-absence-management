const connection = require('./db_connection');

connection.query('SELECT 1 + 1 AS result', (err, results) => {
    if (err) {
        console.error('Query error:', err);
        return;
    }
    console.log('Test query result:', results[0].result); // Should print "2"
});

// Close the connection
connection.end();
