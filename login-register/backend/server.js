require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const cors = require("cors");
const db = require("./db_connection"); // ✅ Import your database connection

const app = express();
app.use(express.json());
app.use(cors());

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

// Route to request activation email
app.post("/request-activation", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    console.log(`🔍 Checking database for email: ${email}`);

    // ✅ Query the existing db_connection.js for email existence
    const [studentResults] = await db.query("SELECT email FROM Etudiants WHERE email = ?", [email]);
    const [teacherResults] = await db.query("SELECT email FROM Enseignants WHERE email = ?", [email]);

    console.log(`📌 Student Results: `, studentResults);
    console.log(`📌 Teacher Results: `, teacherResults);

    if (studentResults.length === 0 && teacherResults.length === 0) {
      console.log(`🚨 Email not found in the database: ${email}`);
      return res.status(404).json({ message: "Email not found" });
    }

    console.log(`✅ Email found, sending activation email...`);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Activate Your Account",
      text: `Click the link to activate your account: http://localhost:3000/activate?email=${email}`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to: ${email}`);
    res.json({ message: "Activation email sent!" });
  } catch (error) {
    console.error("🔥 Error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Route to handle account activation
app.post("/activate-account", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Query the database to find the user by email
    const [studentResults] = await db.query("SELECT * FROM Etudiants WHERE email = ?", [email]);
    const [teacherResults] = await db.query("SELECT * FROM Enseignants WHERE email = ?", [email]);

    // If no user is found, send an error
    if (studentResults.length === 0 && teacherResults.length === 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Hash the password before saving it (for security)
    const hashedPassword = await bcrypt.hash(password, 10);

    let userRole;
    let updateQuery;
    let updateParams;

    // Update password for student or teacher based on where the email was found
    if (studentResults.length > 0) {
      userRole = "student";
      updateQuery = "UPDATE Etudiants SET password = ? WHERE email = ?";
      updateParams = [hashedPassword, email];
    } else if (teacherResults.length > 0) {
      userRole = "teacher";
      updateQuery = "UPDATE Enseignants SET password = ? WHERE email = ?";
      updateParams = [hashedPassword, email];
    }

    // Perform the database update
    await db.query(updateQuery, updateParams);

    // Send the success response with the user's role
    res.json({ success: true, role: userRole });
  } catch (error) {
    console.error("🔥 Error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});
