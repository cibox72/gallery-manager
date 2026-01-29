// Credenziali amministratore - ATTENZIONE AI CARATTERI SPECIALI
const ADMIN_USERNAME = 'G&LStudio';
const ADMIN_PASSWORD = '12763Mlg@';

// Stato login
let isAdminLoggedIn = false;
let editingClientId = null;

// DOM Elements
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const clientForm = document.getElementById('clientForm');
const clientsList = document.getElementById('clientsList');
const backupBtn = document.getElementById('backupBtn');
const restoreBtn = document.getElementById('restoreBtn');
const restoreModal = document.getElementById('restoreModal');
const clientDetailModal = document.getElementById('clientDetailModal');

// Event Listeners
loginForm.addEventListener('submit', handleLogin);
logoutBtn.addEventListener('click', handleLogout);
clientForm.addEventListener('submit', handleAddClient);
backupBtn.addEventListener('click', createBackup);
restoreBtn.addEventListener('click', openRestoreModal);

// Aggiungi pulsante reset sessione
addResetButton();

// Carica dashboard se già loggato
checkLoginStatus();

// Funzioni Login
function handleLogin(e) {
    e.preventDefault();
    
    // Rimuovi spazi prima/dopo le credenziali
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value.trim();
    const loginError = document.getElementById('loginError');
    
    console.log('Tentativo login:', { username, password });
    console.log('Credenziali attese:', { ADMIN_USERNAME, ADMIN_PASSWORD });
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        isAdminLoggedIn = true;
        saveLoginStatus();
        showDashboard();
        loginError.textContent = '';
        console.log('✅ Accesso riuscito!');
    } else {
        // Debug dettagliato
        let errors = [];
        if (username !== ADMIN_USERNAME) {
            errors.push(`Username errato (inserito: "${username}" - atteso: "${ADMIN_USERNAME}")`);
        }
        if (password !== ADMIN_PASSWORD) {
            errors.push(`Password errata (inserita: "${password.replace(/./g, '*')}" - attesa: "${ADMIN_PASSWORD.replace(/./g, '*')}")`);
        }
        loginError.textContent = '❌ Credenziali errate! ' + errors.join(' | ');
        console.error('❌ Accesso fallito:', errors);
    }
}

function handleLogout() {
    isAdminLoggedIn = false;
    clearLoginStatus();
    showLogin();
}

// Funzioni Clienti
function handleAddClient(e) {
    e.preventDefault();
    
    const clientName = document.getElementById('clientName').value;
    const clientUsername = document.getElementById('clientUsername').value;
    const clientPassword = document.getElementById('clientPassword').value;
    const megaLink = document.getElementById('megaLink').value;
    const clientNotes = document.getElementById('clientNotes').value;
    
    // Genera ID univoco
    const clientId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    // Crea oggetto cliente
    const newClient = {
        id: clientId,
        name: clientName,
        username: clientUsername,
        password: clientPassword,
        megaLink: megaLink,
        notes: clientNotes,
        createdAt: new Date().toISOString()
    };
    
    // Salva nel localStorage
    saveClient(newClient);
    
    // Reset form
    clientForm.reset();
    document.getElementById('clientNotes').value = '';
    
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
    if (confirm('Sei sicuro di voler eliminare questo cliente? Questa azione non può essere annullata!')) {
        let clients = getClients();
        clients = clients.filter(client => client.id !== clientId);
        localStorage.setItem('galleryClients', JSON.stringify(clients));
        loadClients();
    }
}

function editClient(clientId) {
    editingClientId = clientId;
    
    const clients = getClients();
    const client = clients.find(c => c.id === clientId);
    
    if (client) {
        document.getElementById('clientName').value = client.name;
        document.getElementById('clientUsername').value = client.username;
        document.getElementById('clientPassword').value = client.password;
        document.getElementById('megaLink').value = client.megaLink;
        document.getElementById('clientNotes').value = client.notes || '';
        
        // Modifica il testo del pulsante
        clientForm.querySelector('button[type="submit"]').textContent = 'Aggiorna Cliente';
    }
}

function updateClient(e) {
    e.preventDefault();
    
    if (!editingClientId) return;
    
    const clientName = document.getElementById('clientName').value;
    const clientUsername = document.getElementById('clientUsername').value;
    const clientPassword = document.getElementById('clientPassword').value;
    const megaLink = document.getElementById('megaLink').value;
    const clientNotes = document.getElementById('clientNotes').value;
    
    let clients = getClients();
    const index = clients.findIndex(client => client.id === editingClientId);
    
    if (index !== -1) {
        clients[index] = {
            ...clients[index],
            name: clientName,
            username: clientUsername,
            password: clientPassword,
            megaLink: megaLink,
            notes: clientNotes
        };
        
        localStorage.setItem('galleryClients', JSON.stringify(clients));
        editingClientId = null;
        
        // Ripristina il testo del pulsante
        clientForm.querySelector('button[type="submit"]').textContent = 'Aggiungi Cliente';
        
        // Reset form
        clientForm.reset();
        document.getElementById('clientNotes').value = '';
        
        // Aggiorna lista
        loadClients();
        
        alert('Cliente aggiornato con successo!');
    }
}

function openClientDetail(clientId) {
    const clients = getClients();
    const client = clients.find(c => c.id === clientId);
    
    if (client) {
        const detailContent = document.getElementById('clientDetailContent');
        const createdAt = new Date(client.createdAt).toLocaleString('it-IT');
        
        detailContent.innerHTML = `
            <div class="client-detail-info">
                <div class="detail-item">
                    <span class="detail-label">Nome Cliente:</span>
                    <div class="detail-value">${client.name}</div>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Username:</span>
                    <div class="detail-value">${client.username}</div>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Password:</span>
                    <div class="detail-value">${client.password}</div>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Link MEGA:</span>
                    <div class="detail-value">
                        <a href="${client.megaLink}" target="_blank" style="color: #667eea; text-decoration: underline;">
                            ${client.megaLink.substring(0, 50)}...
                        </a>
                    </div>
                </div>
                <div class="detail-item full-width">
                    <span class="detail-label">Link Galleria Cliente:</span>
                    <div class="detail-value">
                        <a href="client.html?token=${generateClientToken(client)}" target="_blank" style="color: #667eea; text-decoration: underline;">
                            client.html?token=...
                        </a>
                    </div>
                </div>
                ${client.notes ? `
                <div class="detail-item full-width">
                    <span class="detail-label">Note:</span>
                    <div class="detail-value">${client.notes}</div>
                </div>
                ` : ''}
                <div class="detail-item full-width">
                    <span class="detail-label">Data Creazione:</span>
                    <div class="detail-value">${createdAt}</div>
                    <div class="created-date">ID Cliente: ${client.id}</div>
                </div>
            </div>
        `;
        
        clientDetailModal.style.display = 'block';
    }
}

function closeClientDetailModal() {
    clientDetailModal.style.display = 'none';
}

function loadClients() {
    const clients = getClients();
    clientsList.innerHTML = '';
    
    if (clients.length === 0) {
        clientsList.innerHTML = '<p class="no-clients">Nessun cliente ancora aggiunto.</p>';
        return;
    }
    
    clients.forEach(client => {
        // Genera token sicuro per il link cliente
        const clientToken = generateClientToken(client);
        const clientUrl = `${window.location.origin}${window.location.pathname.replace('index.html', '')}client.html?token=${clientToken}`;
        
        const clientCard = document.createElement('div');
        clientCard.className = 'client-card';
        clientCard.innerHTML = `
            <h3>${client.name}</h3>
            <div class="client-info">
                <p><strong>Username:</strong> ${client.username}</p>
                <p><strong>Password:</strong> ${client.password}</p>
                <p><strong>Link Gallery:</strong></p>
                <a href="${clientUrl}" class="client-link" target="_blank">
                    client.html?token=...
                </a>
                <div style="background:#e8f4fd; padding:8px; border-radius:4px; margin-top:10px; font-size:12px; word-break:break-all;">
                    <strong>Link da inviare al cliente:</strong><br>
                    <code>${clientUrl}</code>
                </div>
            </div>
            
            ${client.notes ? `<div class="client-notes"><p>${client.notes}</p></div>` : ''}
            
            <div class="button-group">
                <button class="open-btn" onclick="openClientDetail('${client.id}')">Apri</button>
                <button class="edit-btn" onclick="editClient('${client.id}')">Modifica</button>
                <button class="delete-btn" onclick="deleteClient('${client.id}')">Elimina</button>
            </div>
        `;
        clientsList.appendChild(clientCard);
    });
}

// NUOVA FUNZIONE: Genera token sicuro per il cliente
function generateClientToken(clientData) {
    const secretKey = 'G&LStudio2026SecretKey12763Mlg@'; // Chiave segreta hardcoded
    const payload = {
        u: clientData.username,    // username
        p: clientData.password,    // password
        m: clientData.megaLink,    // mega link
        i: clientData.id,          // id cliente
        t: Date.now()              // timestamp per sicurezza
    };
    
    // XOR semplice + Base64 (offuscamento sufficiente per questo uso)
    const json = JSON.stringify(payload);
    let encrypted = '';
    for (let i = 0; i < json.length; i++) {
        encrypted += String.fromCharCode(json.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length));
    }
    return btoa(encodeURIComponent(encrypted));
}

// Aggiungi l'evento per il pulsante di aggiornamento
clientForm.addEventListener('submit', function(e) {
    if (editingClientId) {
        updateClient(e);
    } else {
        handleAddClient(e);
    }
});

// Funzioni Backup
function createBackup() {
    const clients = getClients();
    const backupData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        clients: clients
    };
    
    const backupString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([backupString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    a.href = url;
    a.download = `gallery-backup-${timestamp}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    
    alert('Backup creato con successo! Il file è stato scaricato sul tuo computer.');
}

function openRestoreModal() {
    restoreModal.style.display = 'block';
}

function closeRestoreModal() {
    restoreModal.style.display = 'none';
    document.getElementById('backupFile').value = '';
    document.getElementById('restoreError').textContent = '';
    document.getElementById('restoreSuccess').style.display = 'none';
}

function handleRestore() {
    const fileInput = document.getElementById('backupFile');
    const restoreError = document.getElementById('restoreError');
    const restoreSuccess = document.getElementById('restoreSuccess');
    
    if (!fileInput.files || fileInput.files.length === 0) {
        restoreError.textContent = 'Seleziona un file di backup!';
        return;
    }
    
    const file = fileInput.files[0];
    
    if (!file.name.endsWith('.json')) {
        restoreError.textContent = 'Seleziona un file JSON valido!';
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const backupData = JSON.parse(e.target.result);
            
            if (!backupData.clients) {
                restoreError.textContent = 'File di backup non valido!';
                return;
            }
            
            // Chiedi conferma
            if (!confirm('Attenzione! Questa operazione sovrascriverà tutti i dati attuali. Sei sicuro di voler continuare?')) {
                return;
            }
            
            // Salva i dati
            localStorage.setItem('galleryClients', JSON.stringify(backupData.clients));
            
            // Mostra successo
            restoreError.textContent = '';
            restoreSuccess.textContent = 'Backup ripristinato con successo!';
            restoreSuccess.style.display = 'block';
            
            // Aggiorna lista
            loadClients();
            
            // Chiudi modal dopo 2 secondi
            setTimeout(() => {
                closeRestoreModal();
            }, 2000);
            
        } catch (error) {
            restoreError.textContent = 'Errore durante il ripristino del backup: ' + error.message;
        }
    };
    
    reader.onerror = function() {
        restoreError.textContent = 'Errore durante la lettura del file!';
    };
    
    reader.readAsText(file);
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

// NUOVA FUNZIONE: Aggiungi pulsante reset sessione
function addResetButton() {
    const authBox = document.querySelector('.auth-box');
    if (authBox) {
        const resetBtn = document.createElement('button');
        resetBtn.innerHTML = '🔄 Reset Sessione';
        resetBtn.style.cssText = `
            background: #e74c3c;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 8px 15px;
            margin-top: 15px;
            cursor: pointer;
            font-weight: 600;
        `;
        resetBtn.onclick = function() {
            if (confirm('Resetta la sessione? Questo pulirà tutti i dati temporanei.')) {
                localStorage.clear();
                location.reload();
            }
        };
        authBox.appendChild(resetBtn);
    }
}

// Rendi le funzioni accessibili globalmente
window.deleteClient = deleteClient;
window.editClient = editClient;
window.openClientDetail = openClientDetail;
window.closeClientDetailModal = closeClientDetailModal;
window.closeRestoreModal = closeRestoreModal;
window.handleRestore = handleRestore;

// Chiudi modals cliccando fuori
window.onclick = function(event) {
    if (event.target === restoreModal) {
        closeRestoreModal();
    }
    if (event.target === clientDetailModal) {
        closeClientDetailModal();
    }
}
