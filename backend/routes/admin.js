const express = require("express");
const router = express.Router();
const db = require("../db_connection");
const bcrypt = require("bcrypt");

// Keep the same route name!
router.get("/api/etudiants/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [studentResults] = await db.query("SELECT * FROM Etudiants WHERE id_etudiant = ?", [id]);
    if (studentResults.length === 0) return res.status(404).json({ message: "Student not found" });
    res.json({ student: studentResults[0] });
  } catch (error) {
    console.error("Error fetching student info:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/api/justifications", async (req, res) => {
  const { studentId, absenceId, reason } = req.body;
  if (!studentId || !absenceId || !reason) {
    return res.status(400).json({ message: "Missing fields in the request" });
  }

  try {
    const [existing] = await db.query("SELECT * FROM Absences WHERE id_absence = ? AND id_etudiant = ?", [absenceId, studentId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Absence not found" });
    }

    await db.query("UPDATE Absences SET justification = ? WHERE id_absence = ? AND id_etudiant = ?", [reason, absenceId, studentId]);
    res.json({ message: "Justification updated successfully!" });
  } catch (error) {
    console.error("🔥 Error updating justification:", error);
    res.status(500).json({ message: "Server error while updating justification" });
  }
});

router.put('/api/admins/:id', async (req, res) => {
  const { id } = req.params;
  const { nom, prenom, email, password, profilePicture } = req.body;

  try {
    // If password is provided, hash it
    let hashedPassword = null;
    if (password) {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    // Build the query dynamically based on which fields are being updated
    const fields = [];
    const values = [];

    if (nom) {
      fields.push('nom = ?');
      values.push(nom);
    }
    if (prenom) {
      fields.push('prenom = ?');
      values.push(prenom);
    }
    if (email) {
      fields.push('email = ?');
      values.push(email);
    }
    if (hashedPassword) {
      fields.push('password = ?');
      values.push(hashedPassword);
    }

    values.push(id); // for WHERE clause

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    const updateQuery = `UPDATE admins SET ${fields.join(', ')} WHERE id_admin = ?`;

    await db.query(updateQuery, values);

    res.json({ success: true, message: 'Admin updated successfully' });
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/api/admins/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query("SELECT * FROM admins WHERE id_admin = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    res.json({ success: true, admin: rows[0] });
  } catch (error) {
    console.error("Error fetching admin:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post('/api/admin-login', async (req, res) => {
  const { email, password } = req.body;

  console.log('🟡 Incoming login attempt');
  console.log('📧 Email entered:', email);
  console.log('🔑 Password entered:', password);

  try {
    const [rows] = await db.query('SELECT * FROM admins WHERE email = ?', [email.trim().toLowerCase()]);
    
    if (rows.length === 0) {
      console.log('❌ No admin found with that email');
      return res.json({ success: false, message: 'Invalid email or password' });
    }

    const admin = rows[0];
    console.log('✅ Admin found in DB:', admin.email);
    console.log('🔐 Stored hashed password:', admin.password);

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    console.log('🔍 Password match:', isPasswordValid);

    if (isPasswordValid) {
      console.log('✅ Login successful!');
      return res.json({ success: true, admin });
    } else {
      console.log('❌ Incorrect password');
      return res.json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('🔥 Server error during admin login:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/api/absences', async (req, res) => {
  const { absences } = req.body;

  if (!Array.isArray(absences)) {
    return res.status(400).json({ message: "Invalid data format" });
  }

  try {
    for (const absence of absences) {
      const { id_etudiant, date_absence, justification, hours_absent } = absence;

      await db.query(
        'INSERT INTO absences (id_etudiant, date_absence, justification, hours_absent) VALUES (?, ?, ?, ?)',
        [id_etudiant, date_absence, justification || null, hours_absent || 0]
      );
    }

    res.status(200).json({ message: 'Absences enregistrées avec succès' });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ message: "Erreur lors de l'enregistrement des absences" });
  }
});

router.delete("/api/absences/:id_absence", (req, res) => {
  const { id_absence } = req.params;

  const sql = "DELETE FROM Absences WHERE id_absence = ?";
  db.query(sql, [id_absence], (err, results) => {
    if (err) {
      console.error("Erreur lors de la suppression de l'absence:", err);
      return res.status(500).json({ message: "Erreur serveur." });
    }
    res.json({ message: "Absence supprimée avec succès." });
  });
});

router.get("/api/rrouterorts/absences", async (req, res) => {
  const { filiere, niveau, from, to } = req.query;

  if (!filiere || !niveau || !from || !to) {
    return res.status(400).json({ message: "Tous les paramètres sont requis (filiere, niveau, from, to)" });
  }

  try {
    const [rows] = await db.query(`
      SELECT 
        e.nom, e.prenom, e.email,
        COUNT(a.id_absence) AS total_absences,
        SUM(CASE WHEN a.justification = 'Oui' THEN 1 ELSE 0 END) AS absences_justifiees,
        MAX(a.date_absence) AS derniere_absence
      FROM Absences a
      JOIN Etudiants e ON e.id_etudiant = a.id_etudiant
      WHERE e.nom_filiere = ? AND e.nom_niveau = ? 
        AND a.date_absence BETWEEN ? AND ?
      GROUP BY e.id_etudiant
      ORDER BY total_absences DESC
    `, [filiere, niveau, from, to]);

    res.json(rows);
  } catch (err) {
    console.error("Erreur lors de la génération du rrouterort :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

router.get("/api/emails-envoyes", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.id, e.sujet, e.message, e.date_envoi, e.raison, et.nom, et.prenom 
      FROM EmailsEnvoyes e 
      JOIN Etudiants et ON et.id_etudiant = e.id_etudiant
      ORDER BY e.date_envoi DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Erreur chargement des emails:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.get("/api/emails/stats", async (req, res) => {
  try {
    const [total] = await db.query("SELECT COUNT(*) AS count FROM EmailsEnvoyes");
    const [mois] = await db.query(`
      SELECT COUNT(*) AS count FROM EmailsEnvoyes 
      WHERE MONTH(date_envoi) = MONTH(CURRENT_DATE()) 
        AND YEAR(date_envoi) = YEAR(CURRENT_DATE())
    `);
    res.json({ total: total[0].count, mois: mois[0].count });
  } catch (err) {
    console.error("Erreur chargement des stats:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


router.get("/api/absent-seuil", async (req, res) => {
  const seuil = 3;

  try {
    const [rows] = await db.query(
      `SELECT e.id_etudiant, e.nom, e.prenom, e.email, COUNT(a.id_absence) AS absences
      FROM Etudiants e
      JOIN Absences a ON e.id_etudiant = a.id_etudiant
      WHERE LOWER(TRIM(a.justification)) = 'no justification' OR TRIM(a.justification) = ''
      GROUP BY e.id_etudiant
      HAVING absences >= 3;`,
      [seuil]
    );

    console.log("🔥 Students above seuil:", rows);
    res.json(rows);
  } catch (err) {
    console.error("Error loading students with absences above threshold:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
