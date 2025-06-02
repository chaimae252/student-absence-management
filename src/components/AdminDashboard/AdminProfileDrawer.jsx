import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./AdminProfileDrawer.css";

const AdminProfileDrawer = ({ show, onClose }) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("id");

  const [nom, setName] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState("https://via.placeholder.com/100");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:5000/api/admins/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setName(data.admin.nom);
            setPrenom(data.admin.prenom);
            setEmail(data.admin.email);
            if (data.admin.profilePicture) {
              setProfilePicture(data.admin.profilePicture);
            }
          } else {
            console.error("Administrateur non trouvé");
          }
        })
        .catch((err) => console.error("Erreur lors de la récupération des données de l'administrateur :", err));
    }
  }, [id]);

  const handleSaveProfile = async () => {
    try {
      const updatedAdmin = {
        nom,
        prenom,
        email,
        profilePicture,
        ...(password && { password }),
      };

      const res = await fetch(`http://localhost:5000/api/admins/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedAdmin),
      });

      const result = await res.json();

      if (result.success) {
        alert("Profil mis à jour avec succès !");
        setIsEditing(false);
        setPassword("");
      } else {
        alert("Erreur lors de la mise à jour du profil");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`drawer ${show ? "show" : ""}`}>
      <div className="drawer-header">
        <h2>Profil Administrateur</h2>
        <button onClick={onClose}>&times;</button>
      </div>
      <div className="drawer-body">
        {isEditing ? (
          <>
            <input
              type="text"
              value={nom}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom"
            />
            <input 
              type="text" 
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              placeholder="Prénom"
            />
            <input
              type="emaiil"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
            <input
              type="passworrd"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nouveau mot de passe"
            />
            <button className="primary" onClick={handleSaveProfile}>
              Enregistrer
            </button>
            <button className="logout" onClick={() => setIsEditing(false)}>
              Annuler
            </button>
          </>
        ) : (
          <>
            <h3>{nom} {prenom}</h3>
            <p className="pp">{email}</p>
            <p className="role">Administrateur</p>
            <button className="primary" onClick={() => setIsEditing(true)}>
              Modifier le profil
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminProfileDrawer;
