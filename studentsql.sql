
CREATE TABLE Filieres (
    id_filiere INT AUTO_INCREMENT PRIMARY KEY,
    nom_filiere VARCHAR(100) NOT NULL
);
use student_absence_management;
create TABLE Niveaux (
    id_niveau INT AUTO_INCREMENT PRIMARY KEY,
    nom_niveau VARCHAR(50) NOT NULL,
    annee_universitaire VARCHAR(9) NOT NULL,
    filiere_id INT NOT NULL
);
CREATE TABLE Etudiants (
    id_etudiant INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    telephone VARCHAR(15),
    date_naissance DATE,
    date_insertion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    niveau_id INT NOT NULL
);

ALTER TABLE Niveaux 
ADD CONSTRAINT fk_niveau_filiere 
FOREIGN KEY (filiere_id) 
REFERENCES Filieres(id_filiere) 
ON DELETE CASCADE 
ON UPDATE CASCADE;


DELIMITER $$

CREATE TRIGGER before_niveau_insert
BEFORE INSERT ON Niveaux
FOR EACH ROW
BEGIN
    DECLARE count_levels INT;

    -- Count the existing levels for the same filière
    SELECT COUNT(*) INTO count_levels
    FROM Niveaux
    WHERE filiere_id = NEW.filiere_id;

    -- Check if the count exceeds the limit of 2
    IF count_levels >= 2 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot have more than 2 levels per filière.';
    END IF;
END$$

DELIMITER ;


ALTER TABLE Etudiants 
ADD CONSTRAINT fk_etudiant_niveau 
FOREIGN KEY (niveau_id) 
REFERENCES Niveaux(id_niveau) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

