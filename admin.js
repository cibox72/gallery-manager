// Credenziali amministratore
const ADMIN_USERNAME = 'G&LStudio';
const ADMIN_PASSWORD = '12763Mlg@';

// Stato login
let isAdminLoggedIn = false;

// DOM Elements
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const clientForm = document.getElementById('clientForm');
const clientsList = document.getElementById('clientsList');

// Event Listeners
loginForm.addEventListener('submit', handleLogin);
logoutBtn.addEventListener('click', handleLogout);
clientForm.addEventListener('submit', handleAddClient);

// Carica dashboard se già loggato
checkLoginStatus();

// Funzioni
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    const loginError = document.getElementById('loginError');
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        isAdminLoggedIn = true;
        saveLoginStatus();
        showDashboard();
        loginError.textContent = '';
    } else {
        loginError.textContent = 'Credenziali errate!';
    }
}

function handleLogout() {
    isAdminLoggedIn = false;
    clearLoginStatus();
    showLogin();
}

function handleAddClient(e) {
    e.preventDefault();
    
    const clientName = document.getElementById('clientName').value;
    const clientUsername = document.getElementById('clientUsername').value;
    const clientPassword = document.getElementById('clientPassword').value;
    const megaLink = document.getElementById('megaLink').value;
    
    // Genera ID univoco
    const clientId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    // Crea oggetto cliente
    const newClient = {
        id: clientId,
        name: clientName,
        username: clientUsername,
        password: clientPassword,
        megaLink: megaLink,
        createdAt: new Date().toISOString()
    };
    
    // Salva nel localStorage
    saveClient(newClient);
    
    // Reset form
    clientForm.reset();
    
    // Aggiorna lista
    loadClients();
    
    alert('Cliente aggiunto con successo!');
}

function saveClient(client) {
    let clients = getClients();
    clients.push(client);
    localStorage.setItem('galleryClients', JSON.stringify(clients));
}

function getClients() {
    const clients = localStorage.getItem('galleryClients');
    return clients ? JSON.parse(clients) : [];
}

function deleteClient(clientId) {
    let clients = getClients();
    clients = clients.filter(client => client.id !== clientId);
    localStorage.setItem('galleryClients', JSON.stringify(clients));
    loadClients();
}

function loadClients() {
    const clients = getClients();
    clientsList.innerHTML = '';
    
    if (clients.length === 0) {
        clientsList.innerHTML = '<p class="no-clients">Nessun cliente ancora aggiunto.</p>';
        return;
    }
    
    clients.forEach(client => {
        const clientCard = document.createElement('div');
        clientCard.className = 'client-card';
        clientCard.innerHTML = `
            <h3>${client.name}</h3>
            <div class="client-info">
                <p><strong>Username:</strong> ${client.username}</p>
                <p><strong>Password:</strong> ${client.password}</p>
                <p><strong>Link Gallery:</strong></p>
                <a href="client.html?id=${client.id}" class="client-link" target="_blank">
                    client.html?id=${client.id}
                </a>
            </div>
            <button class="delete-btn" onclick="deleteClient('${client.id}')">Elimina</button>
        `;
        clientsList.appendChild(clientCard);
    });
}

function showDashboard() {
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    loadClients();
}

function showLogin() {
    loginSection.style.display = 'block';
    dashboardSection.style.display = 'none';
}

function saveLoginStatus() {
    localStorage.setItem('isAdminLoggedIn', 'true');
}

function clearLoginStatus() {
    localStorage.removeItem('isAdminLoggedIn');
}

function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (isLoggedIn === 'true') {
        isAdminLoggedIn = true;
        showDashboard();
    } else {
        showLogin();
    }
}

// Rendi deleteClient accessibile globalmente
window.deleteClient = deleteClient;
