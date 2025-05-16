# Sujet

Durée : la journée.

Vous allez partir des données ci-dessous et réaliser une petite application Node.js, qui permet d'ajouter, supprimer des utilisateurs et en option d'en modifier.

Suivez bien les étapes demandées dans le document.

Vous utiliserez vos propres styles pour centrer la page et afficher les contenus.

## Data

```js
const students = [
    { name : "Sonia", birth : "2019-14-05"},
    { name : "Antoine", birth : "2000-12-05"},
    { name : "Alice", birth : "1990-14-09"},
    { name : "Sophie", birth : "2001-10-02"},
    { name : "Bernard", birth : "1980-21-08"}
];
```

## La structure

Respectez la structure suivante

```text
Data/ 
view/
    home.pug <-- formulaire
    ...
assets/
    css/
        style.css  <-- fichier statique
        ...
server.js
.env
```

## Les fonctionnalités

Vous devez développer une application qui affiche un formulaire et permet d'afficher l'ensemble des étudiants avec leurs dates d'aniversaire.

Utilisez le module **dayjs**, **momentjs** ou l'API Date pour formater les dates d'anniversaire en français.

Pensez à créer un fichier **utils** pour écrire les fonctions algorithmiques pour ce projet.

- Une page principale affichera le formulaire d'ajout d'un utilisateur, et un lien users permettra d'afficher les utilisateurs.

- La page affichant les utilisateurs affichera également deux boutons pour faire la modification et la suppression de chaque utilisateur.

Pensez à installer **dotenv** et définissez les variables d'environnement APP_ENV, APP_HOST et APP_PORT, dans le fichier .env.

## Page d'ajout d'un utilisateur (page principale)

Le formulaire permettra d'ajouter un nouvel étudiant avec sa date d'anniversaire : nom et date d'anniversaire. utilisez l'attribut **type="date"** pour définir la date.

## Question facultative

Si vous avez le temps implémenté la modification de chaque utilisateur.
Vous pouvez également ajouter un système de toast pour informer l'utilisateur des retours du serveur

- Page principale.

```text

[Home] Users    <-- Implémentez une navigation

[Zone de toast]

Name : []
date : []

[ajouter]

```

- Page users, la croix représente le bouton de suppression.

```text

Home [Users]    <-- Implémentez une navigation

[Zone de toast]


- Antoine 03/01/71 [modifier] [X]
- Elie 13/01/79 [modifier] [X]
- Stephane 13/11/72 [modifier] [X]

```


- Page modification.

```text

Home Users    <-- Implémentez une navigation

[Zone de toast]


name: [<nom prérempli>]
date: [<date prérempli>]

```