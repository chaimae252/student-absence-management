require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const cors = require("cors");
const db = require("./db_connection");
const multer = require("multer");
const xlsx = require("xlsx");
const path = require("path");
const fs = require("fs");
const ExcelJS = require("exceljs");

const app = express();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT'],
  credentials: true,
}));
app.use(express.static(path.join(__dirname, "public")));

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.EMAIL_CLIENT_ID,
    clientSecret: process.env.EMAIL_CLIENT_SECRET,
    refreshToken: process.env.EMAIL_REFRESH_TOKEN,
  },
});
// Multer setup for file uploads
const upload = multer({
  dest: "uploads/", // Temporary upload folder
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file limit
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

app.post("/api/etudiants/import", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier reçu." });
    }

    console.log("Fichier reçu :", req.file);

    // Lire le fichier Excel
    const filePath = path.join(__dirname, "uploads", req.file.filename);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1);

    console.log("Feuille lue avec succès :", worksheet.name);

    const rows = worksheet.getRows(2, worksheet.rowCount); // Lire les lignes à partir de la 2e ligne
    const students = [];

    rows.forEach((row) => {
      const nom = row.getCell(1).value;
      if (!nom) return; // Ignore empty rows

      students.push({
        nom,
        prenom: row.getCell(2).value,
        email: row.getCell(3).value,
        telephone: row.getCell(4).value,
        nom_filiere: row.getCell(5).value,
        nom_niveau: row.getCell(6).value,
      });
    });

    console.log("Nombre d'étudiants à importer :", students.length);

    // Insertion des étudiants dans la base de données
    for (let student of students) {
      await db.query(
        "INSERT INTO etudiants (nom, prenom, email, telephone, nom_filiere,nom_niveau) VALUES (?, ?, ?, ?, ?, ?)",
        [
          student.nom,
          student.prenom,
          student.email,
          student.telephone,
          student.nom_filiere,
          student.nom_niveau
        ]
      );


    }

    // Suppression du fichier après traitement
    fs.unlinkSync(filePath);

    res.status(200).json({ message: "Étudiants importés avec succès." });
  } catch (err) {
    console.error("Erreur lors de l'importation :", err);
    res.status(500).json({ error: "Erreur lors de l'importation du fichier", details: err.message });
  }
});

app.post("/api/enseignants/import", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier reçu." });
    }

    const filePath = path.join(__dirname, "uploads", req.file.filename);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1);

    const rows = worksheet.getRows(2, worksheet.rowCount);
    const enseignants = [];

    rows.forEach((row) => {
      const nom = row.getCell(1).value;
      if (!nom) return;

      enseignants.push({
        nom,
        prenom: row.getCell(2).value,
        email: row.getCell(3).value,
        nom_filiere: row.getCell(4).value
      });
    });

    for (let enseignant of enseignants) {
      await db.query(
        "INSERT INTO enseignants (nom, prenom, email, nom_filiere) VALUES (?, ?, ?, ?)",
        [enseignant.nom, enseignant.prenom, enseignant.email, enseignant.nom_filiere]
      );
    }

    fs.unlinkSync(filePath);
    res.status(200).json({ message: "Enseignants importés avec succès." });
  } catch (err) {
    console.error("Erreur lors de l'importation :", err);
    res.status(500).json({ error: "Erreur lors de l'importation du fichier", details: err.message });
  }
});
// Insert a unique "filiere" into the database
const insertUniqueFiliere = async (nomFiliere) => {
  return new Promise((resolve, reject) => {
    db.query(
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

// Insert a unique "niveau" into the database
const insertUniqueNiveau = async (niveauData) => {
  const { nomFiliere, anneeUniversitaire, nomNiveau } = niveauData;

  return new Promise((resolve, reject) => {
    db.query(
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

// Insert a student into the database
const insertStudent = async (studentData) => {
  const { nom, prenom, email, telephone, nomFiliere, nomNiveau } = studentData;

  return new Promise((resolve, reject) => {
    db.query(
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
// === Routes ===

app.post("/request-activation", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const [studentResults] = await db.query("SELECT email FROM Etudiants WHERE email = ?", [email]);
    const [teacherResults] = await db.query("SELECT email FROM Enseignants WHERE email = ?", [email]);

    if (studentResults.length === 0 && teacherResults.length === 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Activate Your Account",
      text: `Click the link to activate your account: http://localhost:3000/activate?email=${ email }`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Activation email sent!" });
  } catch (error) {
    console.error("🔥 Error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Activate account
app.post("/activate-account", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

  try {
    const [studentResults] = await db.query("SELECT * FROM Etudiants WHERE email = ?", [email]);
    const [teacherResults] = await db.query("SELECT * FROM Enseignants WHERE email = ?", [email]);

    if (studentResults.length === 0 && teacherResults.length === 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let userRole;
    let updateQuery;
    let updateParams;

    if (studentResults.length > 0) {
      userRole = "student";
      updateQuery = "UPDATE Etudiants SET password = ? WHERE email = ?";
      updateParams = [hashedPassword, email];
    } else {
      userRole = "teacher";
      updateQuery = "UPDATE Enseignants SET password = ? WHERE email = ?";
      updateParams = [hashedPassword, email];
    }

    await db.query(updateQuery, updateParams);
    res.json({ success: true, role: userRole });
  } catch (error) {
    console.error("🔥 Error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

app.post("/api/upload-excel", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);
    const worksheet = workbook.getWorksheet(1);

    // Process the Excel file (this can be customized)
    const data = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header row
        data.push({
          nom_filiere: row.getCell(1).value,
          nom_niveau: row.getCell(2).value,
          annee_universitaire: row.getCell(3).value,
          nom_etudiant: row.getCell(4).value,
          email_etudiant: row.getCell(5).value,
        });
      }
    });

    // Insert unique "filieres" and "niveaux" into the database
    for (const row of data) {
      await insertUniqueFiliere(row.nom_filiere);
      await insertUniqueNiveau({
        nomFiliere: row.nom_filiere,
        anneeUniversitaire: row.annee_universitaire,
        nomNiveau: row.nom_niveau,
      });
    }

    res.json({ message: "File processed successfully" });
  } catch (error) {
    console.error("Error processing Excel file:", error);
    res.status(500).json({ message: "Error processing the file" });
  } finally {
    fs.unlinkSync(req.file.path); // Delete the temporary file
  }
});
app.post("/api/insert-student", async (req, res) => {
  const { nom, prenom, email, telephone, nomFiliere, nomNiveau } = req.body;

  try {
    await insertStudent({ nom, prenom, email, telephone, nomFiliere, nomNiveau });
    res.json({ message: "Student inserted successfully" });
  } catch (error) {
    console.error("Error inserting student:", error);
    res.status(500).json({ message: "Error inserting student." });
  }
});
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
      db.beginTransaction(async (err) => {
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

            await insertUniqueFiliere(studentData.nomFiliere);
            await insertUniqueNiveau({
              nomFiliere: studentData.nomFiliere,
              anneeUniversitaire: studentData.anneeUniversitaire,
              nomNiveau: studentData.nomNiveau,
            });
            await insertStudent(studentData);
          }

          db.commit((commitErr) => {
            if (commitErr) {
              db.rollback(() => {
                console.error("Commit error:", commitErr.message);
                reject(commitErr);
              });
            } else {
              console.log("Transaction committed successfully");
              resolve();
            }
          });
        } catch (transactionError) {
          db.rollback(() => {
            console.error("Transaction error:", transactionError.message);
            reject(transactionError);
          });
        }
      });
    });

    fs.unlinkSync(filePath);
    res.status(200).json({ message: "Data successfully uploaded and inserted" });
  } catch (error) {
    console.error("Error processing file:", error.message);
    res.status(500).json({ error: "Failed to process file", details: error.message });
  }
});

app.get("/api/filieres_niveaux", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT DISTINCT Niveaux.nom_filiere, Niveaux.nom_niveau 
      FROM Niveaux
      JOIN Filieres ON Niveaux.nom_filiere = Filieres.nom_filiere;
    `);
    res.json(rows);
  } catch (err) {
    console.error("Erreur lors de la récupération des filières et niveaux:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});
// Node.js Express backend (example route)
app.get("/api/etudiants", async (req, res) => {
  const { filiere, niveau } = req.query;

  if (!filiere || !niveau) {
    return res.status(400).json({ message: "Filière et niveau requis." });
  }

  try {
    const [rows] = await db.query(
      "SELECT * FROM Etudiants WHERE nom_filiere = ? AND nom_niveau = ?",
      [filiere, niveau]
    );
    res.json(rows);
  } catch (err) {
    console.error("Erreur lors de la récupération des étudiants:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

const transporterr = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post('/api/send-email', async (req, res) => {
  const { id_etudiant, email, sujet, message } = req.body;

  try {
    await transporterr.sendMail({
      from: `"Administration Absences" <${ process.env.EMAIL_USER }>`,
      to: email,
      subject: sujet,
      text: message,
    });

    console.log(`✅ Mail sent to ${ email }`);

    // Optional: Save to DB
    res.json({ message: 'Email envoyé avec succès.' });
  } catch (error) {
    console.error('Erreur d\'envoi d\'email:', error);
    res.status(500).json({ message: 'Échec de l\'envoi de l\'email.' });
  }
});

app.put('/api/teachers/:id', (req, res) => {
  const teacherId = req.params.id;
  const { nom, prenom, email, nom_filiere } = req.body;

  const sql = `
    UPDATE enseignants 
    SET nom = ?, prenom = ?, email = ?, nom_filiere = ? 
    WHERE id_enseignant = ?
  `;

  console.log('🔄 PUT /api/teachers/:id called');
  console.log('🆔 ID:', teacherId);
  console.log('📦 Body received:', req.body);
  console.log('📄 SQL:', sql);
  console.log('🧮 Values:', [nom, prenom, email, nom_filiere, teacherId]);

  db.query(sql, [nom, prenom, email, nom_filiere, teacherId], (err, result) => {
    if (err) {
      console.error('❌ Error updating teacher:', err.sqlMessage || err.message || err);
      return res.status(500).json({ error: err.sqlMessage || err.message || 'Update failed' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json({ message: 'Profile updated successfully 💅' });
  });
});

app.use(require("./routes/teacher"));
app.use(require("./routes/student")); // same idea when you add this
app.use(require("./routes/admin"));

// Start server
app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});
