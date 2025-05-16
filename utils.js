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
        // Vérifier si la date est au format ISO (YYYY-MM-DD)
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

module.exports = {
    getStudents,
    saveStudents,
    formatDate,
};
