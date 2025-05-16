require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { 
  getStudents, 
  formatDate, 
  addStudent, 
  updateStudent, 
  deleteStudent 
} = require('./utils');

const app = express();
const PORT = process.env.APP_PORT || 3000;
const HOST = process.env.APP_HOST || 'localhost';

// Configuration du moteur de template
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'view'));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'assets')));

// Routes
app.get('/', (req, res) => {
  res.render('home', { currentPage: 'home' });
});

// Route pour afficher la liste des étudiants
app.get('/users', async (req, res) => {
  try {
    const students = await getStudents();
    // Formater les dates pour l'affichage
    const studentsWithFormattedDates = students.map(student => ({
      ...student,
      formattedBirth: formatDate(student.birth)
    }));
    
    res.render('users', { 
      currentPage: 'users', 
      students: studentsWithFormattedDates
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des étudiants:', error);
    res.render('users', { 
      currentPage: 'users', 
      message: 'Erreur lors de la récupération des étudiants', 
      messageType: 'error' 
    });
  }
});

// Route pour afficher le formulaire d'ajout d'un étudiant
app.post('/add-student', async (req, res) => {
  try {
    const { name, birth } = req.body;
    const result = await addStudent(name, birth);
    
    if (result.status === 'error') {
      return res.render('home', { 
        currentPage: 'home', 
        message: result.message, 
        messageType: 'error' 
      });
    }
    
    return res.render('users', {
      currentPage: 'users',
      students: result.students,
      message: result.message,
      messageType: result.status
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'un étudiant:', error);
    res.render('home', { 
      currentPage: 'home', 
      message: 'Erreur lors de l\'ajout de l\'étudiant', 
      messageType: 'error' 
    });
  }
});

// Route pour afficher le formulaire d'édition d'un étudiant
app.get('/edit/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const students = await getStudents();
    const student = students.find(s => s.name === name);
    
    if (!student) {
      return res.render('edit', { 
        currentPage: 'users', 
        message: 'Étudiant non trouvé', 
        messageType: 'error' 
      });
    }
    
    res.render('edit', { currentPage: 'users', student });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'étudiant:', error);
    res.render('edit', { 
      currentPage: 'users', 
      message: 'Erreur lors de la récupération de l\'étudiant', 
      messageType: 'error' 
    });
  }
});

// Route pour mettre à jour un étudiant
app.post('/update-student/:originalName', async (req, res) => {
  try {
    const { originalName } = req.params;
    const { name, birth } = req.body;
    
    const result = await updateStudent(originalName, name, birth);
    
    if (result.status === 'error') {
      return res.render('edit', { 
        currentPage: 'users', 
        student: result.student || { name: originalName, birth },
        message: result.message, 
        messageType: 'error' 
      });
    }
    
    return res.render('users', {
      currentPage: 'users',
      students: result.students,
      message: result.message,
      messageType: result.status
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'étudiant:', error);
    res.render('edit', { 
      currentPage: 'users', 
      message: 'Erreur lors de la mise à jour de l\'étudiant', 
      messageType: 'error' 
    });
  }
});

// Route pour supprimer un étudiant
app.post('/delete-student/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const result = await deleteStudent(name);
    
    return res.render('users', {
      currentPage: 'users',
      students: result.students,
      message: result.message,
      messageType: result.status
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'étudiant:', error);
    return res.redirect('/users');
  }
});

// Démarrer le serveur
app.listen(PORT, HOST, () => {
  console.log(`Serveur démarré sur http://${HOST}:${PORT}`);
});
