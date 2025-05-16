require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { getStudents, saveStudents, formatDate } = require('./utils');

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

app.post('/add-student', async (req, res) => {
  try {
    const { name, birth } = req.body;
    
    if (!name || !birth) {
      return res.render('home', { 
        currentPage: 'home', 
        message: 'Tous les champs sont obligatoires', 
        messageType: 'error' 
      });
    }
    
    const students = await getStudents();
    
    // Vérifier si l'étudiant existe déjà
    if (students.some(student => student.name === name)) {
      return res.render('home', { 
        currentPage: 'home', 
        message: 'Un étudiant avec ce nom existe déjà', 
        messageType: 'error' 
      });
    }
    
    // Ajouter le nouvel étudiant
    students.push({ name, birth });
    await saveStudents(students);

    // Formater les dates pour l'affichage
    const studentsWithFormattedDates = students.map(student => ({
        ...student,
        formattedBirth: formatDate(student.birth)
      }));
    
    return res.render('users', {
        currentPage: 'users',
        students: studentsWithFormattedDates,
        message: 'Étudiant ajouté avec succès', 
        messageType: 'success' 
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

app.post('/update-student/:originalName', async (req, res) => {
  try {
    const { originalName } = req.params;
    const { name, birth } = req.body;
    
    if (!name || !birth) {
      return res.render('edit', { 
        currentPage: 'users', 
        message: 'Tous les champs sont obligatoires', 
        messageType: 'error' 
      });
    }
    
    const students = await getStudents();
    const studentIndex = students.findIndex(s => s.name === originalName);
    
    if (studentIndex === -1) {
      return res.render('edit', { 
        currentPage: 'users', 
        message: 'Étudiant non trouvé', 
        messageType: 'error' 
      });
    }
    
    // Vérifier si le nouveau nom existe déjà
    if (name !== originalName && students.some(s => s.name === name)) {
      return res.render('edit', { 
        currentPage: 'users', 
        student: { name: originalName, birth },
        message: 'Un étudiant avec ce nom existe déjà', 
        messageType: 'error' 
      });
    }
    
    // Mettre à jour l'étudiant
    students[studentIndex] = { name, birth };
    await saveStudents(students);

    // Formater les dates pour l'affichage
    const studentsWithFormattedDates = students.map(student => ({
        ...student,
        formattedBirth: formatDate(student.birth)
      }));
    
    return res.render('users', {
        currentPage: 'users', 
        students: studentsWithFormattedDates,
        message: 'Étudiant mis à jour avec succès', 
        messageType: 'success' 
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

app.post('/delete-student/:name', async (req, res) => {
  try {
    const { name } = req.params;
    let students = await getStudents();
    
    students = students.filter(student => student.name !== name);
    await saveStudents(students);
    
    // Formater les dates pour l'affichage
    const studentsWithFormattedDates = students.map(student => ({
      ...student,
      formattedBirth: formatDate(student.birth)
    }));
    
    return res.render('users', {
      currentPage: 'users',
      students: studentsWithFormattedDates,
      message: 'Étudiant supprimé avec succès',
      messageType: 'success'
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
