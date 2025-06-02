const express = require("express");
const router = express.Router();
const db = require("../db_connection");
const bcrypt = require("bcrypt");

// Keep the same route name!
router.post("/api/teacher-login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [teacherResults] = await db.query(
      "SELECT * FROM enseignants WHERE email = ?",
      [email]
    );

    if (teacherResults.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const teacher = teacherResults[0];

    const isPasswordValid = await bcrypt.compare(password, teacher.password);

    if (isPasswordValid) {
      return res.json({ success: true, teacherId: teacher.id_enseignant });
    } else {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "An error occurred while logging in." });
  }
});


router.put('/api/reject-justification/:id', async (req, res) => {
  const { id } = req.params;

  const sql = 'UPDATE Absences SET justification = ?, status = ? WHERE id_absence = ?';
  const values = ['No justification', 'rejected', id];

  try {
    const [result] = await db.query(sql, values);
    res.json({ message: 'Justification rejected successfully' });
  } catch (err) {
    console.error('Error rejecting justification:', err);
    res.status(500).json({ message: 'Failed to reject justification' });
  }
});

router.get('/api/no-justification/:teacherId', async (req, res) => {
  const { teacherId } = req.params;

  try {
    // Step 1: Get the filière the teacher teaches
    const [teacherRows] = await db.query(
      'SELECT nom_filiere FROM enseignants WHERE id_enseignant = ?',
      [teacherId]
    );

    if (teacherRows.length === 0) {
      return res.status(404).json({ message: 'Enseignant non trouvé.' });
    }

    const filiere = teacherRows[0].nom_filiere;

    // Step 2: Get pending justifications for that filière
    const [results] = await db.query(
      `
      SELECT a.id_absence, a.date_absence, a.justification, e.nom AS student, e.prenom AS studentname, a.status
      FROM Absences a
      JOIN Etudiants e ON a.id_etudiant = e.id_etudiant
      WHERE a.status = 'pending'
        AND a.justification != 'No justification'
        AND e.nom_filiere = ?
      `,
      [filiere]
    );

    res.json({ absences: results });
  } catch (err) {
    console.error('Error fetching absences:', err);
    res.status(500).json({ message: 'Failed to get absences' });
  }
});


router.put('/api/routerrove-justification/:id', async (req, res) => {
  const { id } = req.params;

  const sql = 'UPDATE Absences SET status = ? WHERE id_absence = ?';
  const values = ['routerroved', id];

  try {
    const [result] = await db.query(sql, values);
    res.json({ message: 'Justification routerroved!' });
  } catch (err) {
    console.error('Error routerroving justification:', err);
    res.status(500).json({ message: 'Failed to routerrove justification' });
  }
});

router.put('/api/reject-justification/:id', (req, res) => {
  const { id } = req.params;
  const sql = `UPDATE Absences SET justification = 'No justification', status = 'rejected' WHERE id_absence = ?`;

  db.query(sql, [id], (err) => {
    if (err) {
      console.error('Error rejecting justification:', err);
      return res.status(500).json({ message: 'Failed to reject' });
    }
    res.json({ message: 'Justification rejected!' });
  });
});

router.get('/api/justifications/:studentId', async (req, res) => {
  const { studentId } = req.params;
  try {
    const [records] = await db.query(`
      SELECT 
        id_absence as id,
        date_absence AS date, 
        hours_absent AS duree,
        justification
      FROM Absences
      WHERE id_etudiant = ?
        AND (justification IS NULL OR TRIM(justification) = '' OR justification = 'No justification')
      ORDER BY date_absence DESC
    `, [studentId]);

    res.json(records.length ? records : []);
  } catch (error) {
    console.error("Error fetching justifications:", error);
    res.status(500).json({ message: "Failed to fetch justifications" });
  }
});

router.get('/api/justifications/:studentId', async (req, res) => {
  const { studentId } = req.params;
  try {
    const [records] = await db.query(`
      SELECT 
        id_absence as id,
        date_absence AS date, 
        hours_absent AS duree,
        justification
      FROM Absences
      WHERE id_etudiant = ?
        AND (justification IS NULL OR TRIM(justification) = '' OR justification = 'No justification')
      ORDER BY date_absence DESC
    `, [studentId]);

    res.json(records.length ? records : []);
  } catch (error) {
    console.error("Error fetching justifications:", error);
    res.status(500).json({ message: "Failed to fetch justifications" });
  }
});

router.get('/api/teachers/:id', async (req, res) => {
  const teacherId = req.params.id;
  console.log('Fetching teacher with ID:', teacherId);

  try {
    const [rows] = await db.query('SELECT * FROM enseignants WHERE id_enseignant = ?', [teacherId]);

    if (rows.length) {
      console.log('Found teacher:', rows[0]);
      res.json(rows[0]);
    } else {
      console.log('No teacher found with ID:', teacherId);
      res.status(404).json({ error: 'Teacher not found' });
    }
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/api/recent-activities/:id', async (req, res) => {
  const id_enseignant = req.params.id;

  try {
    // First, get the filiere(s) the teacher teaches
    const [filiereRows] = await db.query(
      `SELECT nom_filiere FROM enseignants WHERE id_enseignant = ?`,
      [id_enseignant]
    );

    if (filiereRows.length === 0) {
      return res.status(404).json({ error: 'Aucun enseignant trouvé avec cet ID.' });
    }

    const nomFiliere = filiereRows[0].nom_filiere;

    // Fetch recent activities for that filiere only
    const [results] = await db.query(
      `
      SELECT 
        a.date_absence,
        a.justification,
        a.hours_absent,
        e.nom,
        e.prenom,
        e.nom_filiere,
        e.nom_niveau
      FROM absences a
      JOIN etudiants e ON a.id_etudiant = e.id_etudiant
      WHERE e.nom_filiere = ?
      ORDER BY a.date_absence DESC
      LIMIT 5
      `,
      [nomFiliere]
    );

    const activities = results.map((row) => {
      let type = '';
      let action = '';

      if (row.justification && row.justification.trim() !== '') {
        type = 'warning';
        action = `Absence justifiée pour ${row.prenom} ${row.nom} en ${row.nom_filiere} - ${row.nom_niveau}`;
      } else if (row.hours_absent >= 3) {
        type = 'error';
        action = `Absence prolongée signalée pour ${row.prenom} ${row.nom} en ${row.nom_filiere} - ${row.nom_niveau}`;
      } else {
        type = 'success';
        action = `Absence enregistrée pour ${row.prenom} ${row.nom} en ${row.nom_filiere} - ${row.nom_niveau}`;
      }

      const date = new Date(row.date_absence);
      const timestamp = date.toLocaleDateString('fr-FR', {
        month: 'short',
        day: 'numeric',
      }) + ', ' + date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      return {
        type,
        description: action,
        timestamp,
      };
    });

    res.json(activities);
  } catch (err) {
    console.error('❌ Erreur lors de la récupération des activités :', err);
    res.status(500).json({ error: 'Échec de récupération des activités' });
  }
});

router.post('/api/save_attendance', async (req, res) => {
  const { attendanceRecords } = req.body;

  if (!attendanceRecords || !Array.isArray(attendanceRecords)) {
    return res.status(400).json({ message: 'Invalid attendance data' });
  }

  try {
    const insertQuery = `
      INSERT INTO Absences (id_etudiant, date_absence, justification, hours_absent)
      VALUES (?, ?, ?, ?)
    `;

    for (const record of attendanceRecords) {
      const { id_etudiant, date_absence, justification, hours_absent } = record;
      await db.query(insertQuery, [id_etudiant, date_absence, justification || '', hours_absent || 0]);
    }

    res.status(200).json({ message: 'Attendance saved successfully!' });
  } catch (error) {
    console.error('Error saving attendance:', error);
    res.status(500).json({ message: 'Error saving attendance' });
  }
});

router.get('/api/dashboardd/:id', async (req, res) => {
  try {
    const enseignantId = req.params.id; // 🌟 Get teacher id from URL

    const [filiereResult] = await db.query(
      `SELECT nom_filiere FROM enseignants WHERE id_enseignant = ?`,
      [enseignantId]
    );

    if (filiereResult.length === 0) {
      return res.status(404).json({ error: "Filière de l'enseignant non trouvée 😢" });
    }

    const nomFiliere = filiereResult[0].nom_filiere;

    const statsQuery = `
      SELECT
        (SELECT COUNT(*) FROM etudiants WHERE nom_filiere = ?) AS total_students,
        (SELECT COUNT(*) FROM etudiants e 
         WHERE e.nom_filiere = ? 
         AND e.id_etudiant NOT IN (
           SELECT a.id_etudiant FROM absences a 
           WHERE DATE(a.date_absence) = CURDATE()
         )
        ) AS present_today,
        (SELECT COUNT(*) FROM absences a
         JOIN etudiants e ON a.id_etudiant = e.id_etudiant
         WHERE DATE(a.date_absence) = CURDATE() AND e.nom_filiere = ?
        ) AS absent_today,
        (SELECT COUNT(*) FROM absences a
         JOIN etudiants e ON a.id_etudiant = e.id_etudiant
         WHERE a.status = 'pending' AND e.nom_filiere = ?
        ) AS pending_justifications;
    `;

    const [statsResult] = await db.query(statsQuery, [
      nomFiliere, nomFiliere, nomFiliere, nomFiliere
    ]);

    const recentAbsencesChartQuery = `
      SELECT 
        DATE(a.date_absence) AS date,
        COUNT(*) AS value
      FROM absences a
      JOIN etudiants e ON a.id_etudiant = e.id_etudiant
      WHERE e.nom_filiere = ?
      GROUP BY DATE(a.date_absence)
      ORDER BY date DESC
      LIMIT 5;
    `;

    const [chartDataResult] = await db.query(recentAbsencesChartQuery, [nomFiliere]);

    const stats = [
      { title: 'Total des étudiants', value: statsResult[0].total_students, trend: '+3%', color: 'blue' },
      { title: "Présents aujourd'hui", value: statsResult[0].present_today, trend: '✅', color: 'green' },
      { title: "Absents aujourd'hui", value: statsResult[0].absent_today, trend: '📉', color: 'red' },
      { title: 'Justifications en attente', value: statsResult[0].pending_justifications, trend: '⏳', color: 'yellow' }
    ];

    res.json({ stats, chartData: chartDataResult });

  } catch (err) {
    console.error('Dashboard query error:', err);
    res.status(500).json({ error: 'Erreur interne du serveur 😢' });
  }
});



module.exports = router;