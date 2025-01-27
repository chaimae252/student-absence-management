const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const path = require("path");
const fs = require("fs");
const connection = require("./db_connection");

const app = express();
app.use(express.static(path.join(__dirname, "public")));

// Multer setup for file uploads
const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel files are allowed"));
    }
  },
});

// Insert a unique filiere
const insertUniqueFiliere = async (nomFiliere) => {
  return new Promise((resolve, reject) => {
    connection.query(
      "INSERT IGNORE INTO Filieres (nom_filiere) VALUES (?)",
      [nomFiliere],
      (err) => {
        if (err) {
          console.error("Error inserting filiere:", err.message);
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
};

// Insert a unique niveau
const insertUniqueNiveau = async (niveauData) => {
  const { nomFiliere, anneeUniversitaire, nomNiveau } = niveauData;

  return new Promise((resolve, reject) => {
    connection.query(
      `INSERT IGNORE INTO Niveaux (nom_filiere, annee_universitaire, nom_niveau) VALUES (?, ?, ?)`,
      [nomFiliere, anneeUniversitaire, nomNiveau],
      (err) => {
        if (err) {
          console.error("Error inserting niveau:", err.message);
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
};

// Insert a student
const insertStudent = async (studentData) => {
  const { nom, prenom, email, telephone, nomFiliere, nomNiveau } = studentData;

  return new Promise((resolve, reject) => {
    connection.query(
      `INSERT INTO Etudiants (nom, prenom, email, telephone, nom_filiere, nom_niveau) VALUES (?, ?, ?, ?, ?, ?)`,
      [nom, prenom, email, telephone, nomFiliere, nomNiveau],
      (err) => {
        if (err) {
          console.error("Error inserting student:", err.message);
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
};

// Handle file upload
app.post("/upload", upload.single("excelFile"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded or invalid file type" });
  }

  const filePath = path.join(__dirname, req.file.path);
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    await new Promise((resolve, reject) => {
      connection.beginTransaction(async (err) => {
        if (err) {
          console.error("Transaction start error:", err.message);
          reject(err);
          return;
        }

        try {
          for (const row of sheetData) {
            const {
              nom,
              prenom,
              email,
              telephone,
              nom_filiere: nomFiliere,
              nom_niveau: nomNiveau,
              annee_universitaire: anneeUniversitaire,
            } = row;

            const studentData = {
              nom: nom.trim(),
              prenom: prenom.trim(),
              email: email.trim(),
              telephone: telephone ? telephone.toString().trim() : null,
              nomFiliere: nomFiliere.trim(),
              nomNiveau: nomNiveau.trim(),
              anneeUniversitaire: anneeUniversitaire.trim(),
            };

            // Insert filiere and niveau before inserting the student
            await insertUniqueFiliere(studentData.nomFiliere);
            await insertUniqueNiveau({
              nomFiliere: studentData.nomFiliere,
              anneeUniversitaire: studentData.anneeUniversitaire,
              nomNiveau: studentData.nomNiveau,
            });

            // Insert student
            await insertStudent(studentData);
          }

          connection.commit((commitErr) => {
            if (commitErr) {
              connection.rollback(() => {
                console.error("Commit error:", commitErr.message);
                reject(commitErr);
              });
            } else {
              console.log("Transaction committed successfully");
              resolve();
            }
          });
        } catch (transactionError) {
          connection.rollback(() => {
            console.error("Transaction error:", transactionError.message);
            reject(transactionError);
          });
        }
      });
    });

    fs.unlinkSync(filePath); // Delete the uploaded file
    res.status(200).json({ message: "Data successfully uploaded and inserted" });
  } catch (error) {
    console.error("Error processing file:", error.message);
    res.status(500).json({ error: "Failed to process file", details: error.message });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
