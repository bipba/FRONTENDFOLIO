const gallery = document.querySelector(".gallery");
const filters = document.querySelector(".filters");
const galleryModal = document.querySelector(".galleryModal");
const modalContainer = document.querySelector(".modalContainer");
const modifier = document.querySelector(".modifier");
const faXmark = document.querySelector(".fa-xmark");
const modalBtnAdd = document.querySelector(".modalContents button");
const modalAdd = document.querySelector(".modalAdd");
const arrowL = document.querySelector(".fa-arrow-left");
const xmark = document.querySelector('.modalAdd .fa-xmark');
const validationBtn = document.querySelector('#validationBtn');
const modalContents = document.querySelector('.modalContents');
const imgAddLoad = document.querySelector('.containerAddFile img');
const inputTypeFile = document.querySelector('.containerAddFile input');
const form = document.querySelector('.modalAdd form');
const errorMessage = document.querySelector('#error-message');

// récuperation le token de session stocké dans "sessionStorage"
const token = window.sessionStorage.getItem("token");

// fonction pour obtenir les travaux depuis l'API
async function catchWorks() {
  const response = await fetch('http://localhost:5678/api/works');//envoie une requête GET à l'API pour obtenir les works
  return await response.json();// convertit la réponse en JSON et la retourne
}

// function pour afficher les WORKS dans la galerie principale
async function displayWorks() {
  gallery.innerHTML = "";// vidage du contenu de la galerie

  const works = await catchWorks();// récupèration des works avec la fonction "catchWorks"
  works.forEach((work) => {
    createWork(work);// pour chaque work, création et ajout d'élément à la galerie
  });
}

//function pour créer les éléments HTML et les ajouter à la galerie
function createWork(work) {
  const figure = document.createElement('figure');
  figure.dataset.id = work.id;// définit l'ID du travail comme un attribut de "figure"
  const img = document.createElement('img');
  const figcaption = document.createElement('figcaption');

  img.src = work.imageUrl;//définition de la source de l'img
  
  figcaption.textContent = work.title;// définition du texte de la légende
  figure.appendChild(img);
  figure.appendChild(figcaption);
  gallery.appendChild(figure);
}

// fonction pour obtention des catégories depuis l'API
async function getCategories() {
  // envoie une requête GET à l'API pour obtenir les catégories
  const responseCategories = await fetch("http://localhost:5678/api/categories");
  return await responseCategories.json();// convertion de la réponse en JSON et la retourne
}

// function pour l'affichage des btns de catégories
async function displayBtnCategories() {
  const categories = await getCategories();// récupère les catégories en utilisant la function "getCategories"

  // création du btn "Tous" pour afficher tous les works
  const allBtn = document.createElement("button");
  allBtn.id = 0;//ID 0 pour représenter tous les works
  allBtn.textContent = "Tous";// texte du btn
  allBtn.classList.add("active"); // pour ajouter la classe active par défaut
  filters.appendChild(allBtn);// ajout du btn au conteneur des filters

  // pour chaque catégorie, crée un btn et s'ajoute au conteneur des filters
  categories.forEach(categorie => {
    const btn = document.createElement("button");
    btn.id = categorie.id;// usage l'ID de la catégorie
    btn.textContent = categorie.name;// texte du button
    filters.appendChild(btn);// ajout du btn au conteneur des filters
  });
}

// function pour filtrer les works par catégorie
async function filterCategories() {
  const projets = await catchWorks();//récupèration des works en utilisant "catchWorks ()"
  const buttons = document.querySelectorAll(".filters button");//sélection de tous les btns de filters
// pour chaque btn, il faut ajouter un gestionnaire d'événement au click
  buttons.forEach(button => {
    button.addEventListener("click", (e) => {
      const btnId = parseInt(e.target.id, 10);// récupère l'ID du btn cliqué
      gallery.innerHTML = "";
      // retire la classe active de tous les btns
      buttons.forEach(btn => btn.classList.remove("active")); //retirer la classe active de tous les btns
      e.target.classList.add("active"); 
      // ajout de la classe active au btn cliqué
      if (btnId !== 0) {
        // filtrage des works par catégorie et les affiche
        const projetsFiltres = projets.filter(work => work.categoryId === btnId);
        projetsFiltres.forEach(work => {
          createWork(work);
        });
      } else {
       displayWorks();// rappel de la function pour l'affichage de tous les works
      }
    });
  });
}

// function de connexion et de vérif de statut de connexion
function checkLoginStatus() {
  const loginButton = document.querySelector("#login-button");
  const topMenu = document.querySelector(".topMenu");// sélection du topMenu bordereau noir
  const token = window.sessionStorage.getItem("token");//récupère le token de sessionStorage
  if (token) {
    // si le token est présent, alors  configuration du btn pour la déconnexion
    loginButton.textContent = "Logout";
    loginButton.href = "#";
    loginButton.addEventListener("click", handleLogout);
    modifier.style.display = "block";// display l'élément "modifier"
    topMenu.style.display = "flex";// display le menu supérieur
    filters.style.display = "none";// undisplay les filtres

  } else {
    // si aucun token n'est présent, alors configuration du btn pour la connexion
    loginButton.textContent = "Login";
    loginButton.href = "./login.html";
    loginButton.removeEventListener("click", handleLogout);
    modifier.style.display = "none";
    topMenu.style.display = "none";
    filters.style.display = "block";
    filterCategories();// rappel de la function et applique les filtres de catégories
  }
}
// gestion de  la déconnexion
function handleLogout(e) {
  e.preventDefault();// empêche le comportement par défaut (le rechargement de la page) % au lien
  logout();// apelle de la fonction de déconnexion
}
// function de déconnexion
function logout() {
  window.sessionStorage.removeItem("token");// suppression du token de session
  checkLoginStatus();// vérification à nouveau du statut de connexion
}

// function pour afficher les works dans la modale
async function displayGalleryModal() {
  galleryModal.innerHTML = "";
  const works = await catchWorks();// récupèration des travaux
  works.forEach(work => {
    const figure = document.createElement('figure');
    const img = document.createElement('img');
    const trash = document.createElement('i');//c réation d'une icône de suppression

    figure.dataset.id = work.id;// définit l'ID du work comme un attribut de figure
    trash.classList.add('fa-solid', 'fa-trash');//ajout des classes à l'icône
    trash.dataset.id = work.id;//définit l'ID du travail comme un attribut de l'icône
    img.src = work.imageUrl;//définition la source de l'image

 // ajout d'un gestionnaire d'événements click à l'icône de suppression
    trash.addEventListener('click', async function() {
      await deleteWork(work.id); // appele une fonction pour supprimer le work
      figure.remove(); // suppression de l'élément figure du DOM
      removeWorkFromGallery(work.id); //suppression également de l'élément de la galerie principale
    });

    figure.appendChild(trash);// ajout de l'icône et de l'image à la figure et le tout à la galleryModal
    figure.appendChild(img);
    galleryModal.appendChild(figure);
  });
}

// function pour la suppression d'un work de la source de données
async function deleteWork(id) {
  try {
    const token = window.sessionStorage.getItem("token"); //récupérer le jeton d'authentification
    // envoie une requête DELETE à l'API pour supprimer le work
    const response = await fetch(`http://localhost:5678/api/works/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`, // ajouter le jeton à l'en-tête de la requête
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la suppression du travail');
    }
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// function pour la suppréssion d'un work de la galerie principale
function removeWorkFromGallery(id) {
  // sélectionne l'élément figure correspondant à l'ID du work
  const workFigure = gallery.querySelector(`figure[data-id='${id}']`);
  if (workFigure) {
    workFigure.remove(); // suppression de l'élément figure du DOM
  }
}

// réinitialisation de la modale d'ajout
function resetAddModal() {
  form.reset(); // réinitialiser le formulaire HTML
  imgAddLoad.src = ''; // réinitialiser l'image d'aperçu
  imgAddLoad.style.display = 'none'; // masquage de l'img d'aperçue
  document.querySelector('.containerAddFile label').style.display = 'block';//display le label
  document.querySelector('.containerAddFile .fa-image').style.display = 'block';//display l'icône
  document.querySelector('.containerAddFile p').style.display = 'block';//paragraphe mesError
}

// Réinitialiser la modalContents
function resetModalContents() {
 
}

// affichage de la modale et gestion de sa fermeture
modifier.addEventListener("click", () => {
  resetModalContents(); // réinitialisation de la modalContents avant de l'afficher
  modalAdd.style.display = "none"; // assure que modalAdd est masqué
  modalContents.style.display = "flex"; // afficher modalContents
  modalContainer.style.display = "flex";// affiche le conteneur de la modale
});
// gestion de la fermeture de la modale
faXmark.addEventListener("click", () => {
  modalContainer.style.display = "none";
});
// gestion de la fermeture de la modale qund on clique en dehors de celle-ci
modalContainer.addEventListener("click", (e) => {
  if (e.target.className === "modalContainer") {
    modalContainer.style.display = "none";
  }
});

// affichage de la modale 2
function displayAddModal () {
  modalBtnAdd.addEventListener("click", () => {
    resetAddModal(); //affiche & réinitialise modalAdd avant de l'afficher
    modalAdd.style.display = "flex";//affiche modalAdd
    modalContents.style.display = "none";//masque modalContents
  });
  // gestion de la navigation de retour dans la modale
  arrowL.addEventListener("click", () => {
    modalAdd.style.display = "none";
    modalContents.style.display = "flex";
  });
  // gestion de la fermeture de la modale
  xmark.addEventListener("click", () => {
    modalContainer.style.display = "none";// masque le conteneur de la modale
  });
}
displayAddModal();//rappelle de la fonction pour initialiser les événements de la modale

// préview de l'img
inputTypeFile.addEventListener("change", () => {
  const file = inputTypeFile.files[0];// récupère le fichier sélectionné
  if (file) {
    const reader = new FileReader();// crée un nouvel "objet" FileReader
    reader.onload = (e) => {
      imgAddLoad.src = e.target.result;// définit la source de l'image d'aperçu
      imgAddLoad.style.display = 'flex';// affiche l'image d'aperçu
      document.querySelector('.containerAddFile label').style.display = 'none';//masque le label
      document.querySelector('.containerAddFile .fa-image').style.display = 'none';//masque l'icône
      document.querySelector('.containerAddFile p').style.display = 'none';//masque le texte
    };
    reader.readAsDataURL(file);// lit le fichier comme une URL de données
  }
});

// listing des catégories dans le formulaire
async function displayCatImg() {
  const select = document.querySelector("#category");//sélectionne le menu déroulant des catégories
  const categories = await getCategories();//récupère les catégories
  categories.forEach(category => {
    const option = document.createElement("option");//crée une option pour le menu déroulant
    option.value = category.id;//définit la valeur de l'option
    option.textContent = category.name;//définit le texte de l'option
    select.appendChild(option);//ajoute l'option au menu déroulant
  });
}
displayCatImg();// appelle la fonction pour afficher les catégories

// Ajout d'un nouveau travail
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMessage.style.display = 'none'; //masquer le message d'erreur au début
  errorMessage.textContent = ''; //réinitialiser le texte du message d'erreur

  const formData = new FormData(form);//récupère les données du formulaire
  // vérification des champs obligatoires en récupèrant le titre + categorie + img
  const title = formData.get('title');//
  const category = formData.get('category');
  const image = formData.get('image');

  if (!title || !category || !image) {//verif si tous les champs sont remplis
    errorMessage.textContent = 'Veuillez remplir tous les champs obligatoires.';
    errorMessage.style.display = 'block';//affichage du message d'erreur
    return;// arrête l'exécution si des champs sont vides
  }

  try {
    const response = await fetch("http://localhost:5678/api/works", {
      method: "POST",// méthode POST pour ajouter un nouveau travail
      body: formData,// les données du formulaire
      headers: {
        "Authorization": `Bearer ${token}`// ajoute le token d'authentification
      }
    });
    if (response.ok) {
      const newWork = await response.json();//récupère la réponse JSON
      createWork(newWork); // ajout de new work à la galerie principale
      displayGalleryModal(); // mise à jour la galerie modale
      modalContainer.style.display = "none";// masque le conteneur de la modale
    } else {
      console.error('Erreur lors de l\'ajout');
    }
  } catch (error) {
    console.error('Erreur:', error);
  }
});

// initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  checkLoginStatus();// vérifie le statut de connexion
  displayWorks();// affiche les travaux
  displayBtnCategories();// affiche les boutons de catégories
  filterCategories();// applique les filtres de catégories
  displayGalleryModal();// affiche la galerie modale
});



// vérification du formulaire de contact
document.getElementById('contactForm').addEventListener('submit', function(event) {
  event.preventDefault(); // empêche l'envoi du formulaire

  // récupère les valeurs des champs
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  // vérifie si tous les champs sont remplis
  if (name === '' || email === '' || message === '') {
      // affiche le message d'erreur et masque le message de succès
      document.getElementById('errorMessage').style.display = 'block';
      document.getElementById('successMessage').style.display = 'none';
  } else {
      // masque le message d'erreur et affiche le message de succès
      document.getElementById('errorMessage').style.display = 'none';
      document.getElementById('successMessage').style.display = 'block';
  }
});





