const fs = require('fs').promises;
const path = require('path');
const dayjs = require('dayjs');
require('dayjs/locale/fr');
const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(customParseFormat);
dayjs.locale('fr');

const dataFilePath = path.join(__dirname, 'Data', 'students.json');

/**
 * Récupère la liste des étudiants depuis le fichier JSON
 * @returns {Promise<Array>} La liste des étudiants
 */
async function getStudents() {
    try {
        // Vérifier si le répertoire Data existe, sinon le créer
        try {
            await fs.access(path.dirname(dataFilePath));
        } catch (error) {
            await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
        }

        // Lecture du fichier
        const data = await fs.readFile(dataFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Gestion de l'erreru si le fichier n'existe pas ou contient un JSON invalide
        console.log('Erreur lors de la lecture du fichier de données, utilisation des données par défaut:', error.message);
    }
}

/**
 * Sauvegarde la liste des étudiants dans le fichier JSON
 * @param {Array} students - La liste des étudiants à sauvegarder
 * @returns {Promise<void>}
 */
async function saveStudents(students) {
    try {
        // Vérifier si le répertoire Data existe, sinon le créer
        try {
            await fs.access(path.dirname(dataFilePath));
        } catch (error) {
            await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
        }

        // Écrire les données dans le fichier
        await fs.writeFile(dataFilePath, JSON.stringify(students, null, 2), 'utf8');
        console.log('Données sauvegardées avec succès');
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des données:', error);
        throw error;
    }
}

/**
 * Formate une date au format français (JJ/MM/AAAA)
 * @param {string} dateString - Date au format YYYY-MM-DD
 * @returns {string} Date formatée en français
 */
function formatDate(dateString) {
    try {
        // Vérifier si la date est au format ISO
        const date = dayjs(dateString);
        if (date.isValid()) {
            return date.format('DD/MM/YYYY');
        }
        
        // Essayer avec un autre format si la date n'est pas valide
        const alternateFormats = ['YYYY-DD-MM', 'DD-MM-YYYY', 'MM-DD-YYYY'];
        for (const format of alternateFormats) {
            const parsedDate = dayjs(dateString, format);
            if (parsedDate.isValid()) {
                return parsedDate.format('DD/MM/YYYY');
            }
        }
        
        // Si aucun format ne correspond, retourner la chaîne originale
        console.warn(`Format de date invalide: ${dateString}`);
        return dateString;
    } catch (error) {
        console.error('Erreur lors du formatage de la date:', error);
        return dateString;
    }
}

/**
 * Ajoute un nouvel étudiant
 * @param {string} name - Nom de l'étudiant
 * @param {string} birth - Date de naissance de l'étudiant
 * @returns {Promise<Object>} Objet résultat avec status et message
 */
async function addStudent(name, birth) {
    try {
        if (!name || !birth) {
            return { status: 'error', message: 'Tous les champs sont obligatoires' };
        }

        const students = await getStudents();
        
        // Vérifier si l'étudiant existe déjà
        if (students.some(student => student.name === name)) {
            return { status: 'error', message: 'Un étudiant avec ce nom existe déjà' };
        }
        
        // Ajouter le nouvel étudiant
        students.push({ name, birth });
        await saveStudents(students);
        
        return { 
            status: 'success', 
            message: 'Étudiant ajouté avec succès',
            students: students.map(student => ({
                ...student,
                formattedBirth: formatDate(student.birth)
            }))
        };
    } catch (error) {
        console.error('Erreur lors de l\'ajout d\'un étudiant:', error);
        return { status: 'error', message: 'Erreur lors de l\'ajout de l\'étudiant' };
    }
}

/**
 * Met à jour un étudiant existant
 * @param {string} originalName - Nom original de l'étudiant
 * @param {string} name - Nouveau nom de l'étudiant
 * @param {string} birth - Nouvelle date de naissance de l'étudiant
 * @returns {Promise<Object>} Objet résultat avec status et message
 */
async function updateStudent(originalName, name, birth) {
    try {
        if (!name || !birth) {
            return { status: 'error', message: 'Tous les champs sont obligatoires' };
        }
        
        const students = await getStudents();
        const studentIndex = students.findIndex(s => s.name === originalName);
        
        if (studentIndex === -1) {
            return { status: 'error', message: 'Étudiant non trouvé' };
        }
        
        // Vérifier si le nouveau nom existe déjà ormis l'édutiant modifié
        if (name !== originalName && students.some(s => s.name === name)) {
            return { 
                status: 'error', 
                message: 'Un étudiant avec ce nom existe déjà',
                student: { name: originalName, birth }
            };
        }
        
        // Mettre à jour l'étudiant
        students[studentIndex] = { name, birth };
        await saveStudents(students);
        
        return { 
            status: 'success', 
            message: 'Étudiant mis à jour avec succès',
            students: students.map(student => ({
                ...student,
                formattedBirth: formatDate(student.birth)
            }))
        };
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'étudiant:', error);
        return { status: 'error', message: 'Erreur lors de la mise à jour de l\'étudiant' };
    }
}

/**
 * Supprime un étudiant
 * @param {string} name - Nom de l'étudiant à supprimer
 * @returns {Promise<Object>} Objet résultat avec status et message
 */
async function deleteStudent(name) {
    try {
        let students = await getStudents();
        
        // Vérifier si l'étudiant existe
        if (!students.some(s => s.name === name)) {
            return { status: 'error', message: 'Étudiant non trouvé' };
        }
        
        students = students.filter(student => student.name !== name);
        await saveStudents(students);
        
        return { 
            status: 'success', 
            message: 'Étudiant supprimé avec succès',
            students: students.map(student => ({
                ...student,
                formattedBirth: formatDate(student.birth)
            }))
        };
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'étudiant:', error);
        return { status: 'error', message: 'Erreur lors de la suppression de l\'étudiant' };
    }
}

module.exports = {
    getStudents,
    saveStudents,
    formatDate,
    addStudent,
    updateStudent,
    deleteStudent
};
