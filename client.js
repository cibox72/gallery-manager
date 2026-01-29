// DOM Elements
const loginSection = document.getElementById('loginSection');
const gallerySection = document.getElementById('gallerySection');
const clientLoginForm = document.getElementById('clientLoginForm');
const galleryLink = document.getElementById('galleryLink');
const authError = document.getElementById('authError');

// URL Parameters
const urlParams = new URLSearchParams(window.location.search);
const clientId = urlParams.get('id');

// Carica cliente se ID presente
if (clientId) {
    const client = getClientById(clientId);
    if (!client) {
        window.location.href = 'index.html';
    }
} else {
    window.location.href = 'index.html';
}

// Event Listener
clientLoginForm.addEventListener('submit', handleClientLogin);

// Funzioni
function handleClientLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const client = getClientById(clientId);
    
    if (client && client.username === username && client.password === password) {
        authError.textContent = '';
        showGallery(client.megaLink);
    } else {
        authError.textContent = 'Credenziali errate!';
    }
}

function getClientById(id) {
    const clients = localStorage.getItem('galleryClients');
    if (!clients) return null;
    
    const clientsArray = JSON.parse(clients);
    return clientsArray.find(client => client.id === id);
}

function showGallery(megaLink) {
    loginSection.style.display = 'none';
    gallerySection.style.display = 'block';
    galleryLink.href = megaLink;
}

// Gestione caso in cui localStorage non sia disponibile
if (!localStorage.getItem('galleryClients')) {
    authError.textContent = 'Errore: dati cliente non disponibili.';
}
