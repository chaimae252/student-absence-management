DROP DATABASE IF EXISTS student_absence_management;

CREATE DATABASE student_absence_management;

USE student_absence_management;
-- Create the Filieres table
CREATE TABLE Filieres (
    id_filiere INT AUTO_INCREMENT PRIMARY KEY,
    nom_filiere VARCHAR(255) NOT NULL
);

-- Create the Niveaux table
CREATE TABLE Niveaux (
    id_niveau INT AUTO_INCREMENT PRIMARY KEY,
    annee_universitaire VARCHAR(10) NOT NULL,
    nom_filiere VARCHAR(255) NOT NULL
);

-- Create the Etudiants table
CREATE TABLE Etudiants (
    id_etudiant INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    niveau_id INT NOT NULL,
    nom_filiere VARCHAR(255) NOT NULL
);
CREATE INDEX idx_nom_filiere ON Filieres(nom_filiere);




-- Step 1: Create the index on nom_filiere in Filieres table
CREATE INDEX idx_nom_filiere ON Filieres(nom_filiere);

-- Step 2: Add foreign key constraints
ALTER TABLE Niveaux
ADD CONSTRAINT fk_niveaux_filiere
FOREIGN KEY (nom_filiere) REFERENCES Filieres(nom_filiere);

ALTER TABLE Etudiants
ADD CONSTRAINT fk_etudiants_niveau
FOREIGN KEY (niveau_id) REFERENCES Niveaux(id_niveau);

ALTER TABLE Etudiants
ADD CONSTRAINT fk_etudiants_filiere
FOREIGN KEY (nom_filiere) REFERENCES Filieres(nom_filiere);


DELIMITER //
CREATE TRIGGER limit_levels_per_filiere
BEFORE INSERT ON Niveaux
FOR EACH ROW
BEGIN
    DECLARE num_levels INT;
    SELECT COUNT(*) INTO num_levels FROM Niveaux WHERE nom_filiere = NEW.nom_filiere;
    IF num_levels >= 2 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot add more than two levels per filiere';
    END IF;
END //
DELIMITER ;


ALTER TABLE Etudiants MODIFY COLUMN niveau_id VARCHAR(255);

ALTER TABLE Etudiants DROP FOREIGN KEY fk_etudiants_niveau;
ALTER TABLE Etudiants MODIFY COLUMN niveau_id VARCHAR(255);
ALTER TABLE Niveaux MODIFY COLUMN id_niveau VARCHAR(255);





ALTER TABLE Etudiants ADD CONSTRAINT fk_etudiants_niveau FOREIGN KEY (niveau_id) REFERENCES Niveaux(id_niveau);

ALTER TABLE Niveaux
ADD COLUMN nom_niveau VARCHAR(255);
ALTER TABLE Etudiants
ADD CONSTRAINT fk_etudiants_nom_niveauu FOREIGN KEY (nom_niveau) REFERENCES Niveaux(nom_niveau);

ALTER TABLE Niveaux
ADD UNIQUE (nom_niveau);

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE Etudiants DROP FOREIGN KEY fk_etudiants_niveau;

-- Step 2: Change the `id_niveau` column in both tables to `INT`
ALTER TABLE Niveaux MODIFY COLUMN id_niveau INT;
ALTER TABLE Etudiants MODIFY COLUMN niveau_id INT;

-- Step 3: Recreate the foreign key constraint between `Etudiants` and `Niveaux`
ALTER TABLE Etudiants
ADD CONSTRAINT fk_etudiants_niveau_id FOREIGN KEY (niveau_id) REFERENCES Niveaux(id_niveau);

ALTER TABLE Etudiants DROP COLUMN niveau_id;
ALTER TABLE Niveaux MODIFY COLUMN id_niveau INT AUTO_INCREMENT;
describe niveaux;


SHOW TRIGGERS;
SHOW CREATE TABLE Niveaux;
INSERT INTO Niveaux (nom_filiere, annee_universitaire, nom_niveau)
VALUES ('iisa', '2024-2025', 'niveau 2');



DROP TRIGGER IF EXISTS limit_levels_per_filiere;
ALTER TABLE Niveaux DROP INDEX nom_niveau;




ALTER TABLE Etudiants DROP FOREIGN KEY fk_etudiants_nom_niveauu;
SHOW CREATE TABLE Etudiants;


ALTER TABLE Niveaux DROP INDEX nom_niveau;

ALTER TABLE Etudiants 
ADD CONSTRAINT fk_etudiants_nom_niveau 
FOREIGN KEY (nom_niveau) REFERENCES Niveaux (nom_niveau);
ALTER TABLE Niveaux ADD INDEX (nom_niveau);

ALTER TABLE Etudiants 
ADD CONSTRAINT fk_etudiants_nom_niveau 
FOREIGN KEY (nom_niveau) REFERENCES Niveaux (nom_niveau);



ALTER TABLE Niveaux ADD UNIQUE KEY (nom_filiere, nom_niveau, annee_universitaire);
ALTER TABLE Filieres ADD UNIQUE KEY (nom_filiere);

ALTER TABLE Etudiants
ADD COLUMN password VARCHAR(255) NOT NULL;


CREATE TABLE Admins (
    id_admin INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);
CREATE TABLE Enseignants (
    id_enseignant INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nom_filiere VARCHAR(100) NOT NULL,
    FOREIGN KEY (nom_filiere) REFERENCES Filieres(nom_filiere) ON DELETE CASCADE
);