const express = require("express");
const router = express.Router();
const db = require("../db_connection");
const bcrypt = require("bcrypt");

// Keep the same route name!
router.post('/api/student-login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [studentResults] = await db.query('SELECT * FROM Etudiants WHERE email = ?', [email]);
    if (studentResults.length === 0) {
      return res.status(401).json({ success: false, message: 'Identifiants invalides' });
    }

    const student = studentResults[0];

    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (isPasswordValid) {
      res.json({
        success: true,
        studentId: student.id_etudiant // Adjust this field name if needed
      });
    } else {
      res.status(401).json({ success: false, message: 'Mot de passe incorrect' });
    }
  } catch (error) {
    console.error('Erreur de connexion :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/api/absences/:studentId', async (req, res) => {
  const { studentId } = req.params;
  try {
    const [totalResult] = await db.query(`
      SELECT SUM(hours_absent) AS totalAbsentHours
      FROM Absences
      WHERE id_etudiant = ?
    `, [studentId]);

    const [absenceRecords] = await db.query(`
      SELECT 
        date_absence AS date,
        justification AS justification,
        hours_absent AS duree
      FROM Absences
      WHERE id_etudiant = ?
      ORDER BY date_absence DESC
    `, [studentId]);

    res.json({
      totalAbsentHours: totalResult[0].totalAbsentHours || 0,
      absences: absenceRecords
    });
  } catch (error) {
    console.error('Error fetching absence data:', error);
    res.status(500).json({ message: 'An error occurred while fetching absence data.' });
  }
});

router.get("/api/student/:id", async (req, res) => {
  const studentId = req.params.id;
  try {
    const [student] = await db.query("SELECT * FROM Etudiants WHERE id_etudiant = ?", [studentId]);
    if (student.length === 0) return res.status(404).json({ message: "Student not found" });
    res.json(student[0]);
  } catch (error) {
    console.error("Error fetching student data:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/api/absences/:id_etudiant", (req, res) => {
  const { id_etudiant } = req.params;

  const sql = "SELECT * FROM Absences WHERE id_etudiant = ?";
  db.query(sql, [id_etudiant], (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des absences:", err);
      return res.status(500).json({ message: "Erreur serveur." });
    }
    res.json(results);
  });
});

router.get("/api/dashboard/stats", async (req, res) => {
  try {
    const [rrouterorts] = await db.query("SELECT COUNT(*) as count FROM Rrouterorts");
    const [absences] = await db.query("SELECT COUNT(*) as count FROM Absences WHERE MONTH(date_absence) = MONTH(CURRENT_DATE()) AND YEAR(date_absence) = YEAR(CURRENT_DATE())");
    const [emails] = await db.query("SELECT COUNT(*) as count FROM EmailsEnvoyes");

    res.json({
      rrouterorts: rrouterorts[0].count,
      absences: absences[0].count,
      emails: emails[0].count,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des stats:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
