const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const connection = require('./db_connection');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

// Multer setup for file uploads
const upload = multer({
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only Excel files are allowed'));
        }
    },
});

// Handle file upload
app.post('/upload', upload.single('excelFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded or invalid file type' });
    }

    try {
        // Read the uploaded Excel file
        const filePath = path.join(__dirname, req.file.path);
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // Validate data and insert into the database
        const insertPromises = sheetData.map((row) => {
            const { nom, prenom, email, telephone, niveau_id } = row;

            return new Promise((resolve, reject) => {
                if (!nom || !prenom || !email || !niveau_id) {
                    return reject(new Error('Missing required fields in Excel data.'));
                }

                connection.query(
                    'INSERT INTO Etudiants (nom, prenom, email, telephone, niveau_id) VALUES (?, ?, ?, ?, ?)',
                    [nom, prenom, email, telephone || null, niveau_id],
                    (err) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve();
                    }
                );
            });
        });

        // Execute all insertions
        Promise.all(insertPromises)
            .then(() => {
                fs.unlinkSync(filePath); // Delete the uploaded file after processing
                res.status(200).json({ message: 'Data uploaded and inserted successfully' });
            })
            .catch((error) => {
                console.error('Error inserting data:', error);
                res.status(500).json({ error: 'Error inserting data into database', details: error.message });
            });
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ error: 'Error processing file' });
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
