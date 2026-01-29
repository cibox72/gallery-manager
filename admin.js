// ============================================
// CREDENZIALI DI ACCESSO
// ============================================
const ADMIN_USERNAME = 'gelstudio';
const ADMIN_PASSWORD = '12763Mlg';

// ============================================
// VARIABILI GLOBALI
// ============================================
let isAdminLoggedIn = false;
let editingClientId = null;

// ============================================
// ELEMENTI DOM
// ============================================
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

// ============================================
// EVENT LISTENERS
// ============================================
loginForm.addEventListener('submit', handleLogin);
logoutBtn.addEventListener('click', handleLogout);
clientForm.addEventListener('submit', handleClientForm);
backupBtn.addEventListener('click', createBackup);
restoreBtn.addEventListener('click', openRestoreModal);

// Carica dashboard se già loggato
checkLoginStatus();

// ============================================
// FUNZIONI DI LOGIN
// ============================================

function handleLogin(e) {
    e.preventDefault();
    
    // Rimuovi spazi prima/dopo
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value.trim();
    const loginError = document.getElementById('loginError');
    
    // Verifica credenziali
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        isAdminLoggedIn = true;
        localStorage.setItem('isAdminLoggedIn', 'true');
        showDashboard();
        loginError.textContent = '';
    } else {
        let errorMsg = '❌ Credenziali errate!\n\n';
        
        if (username !== ADMIN_USERNAME) {
            errorMsg += '• Username non corretto\n';
            errorMsg += `  Inserito: "${username}"\n`;
            errorMsg += `  Atteso: "${ADMIN_USERNAME}"\n\n`;
        }
        
        if (password !== ADMIN_PASSWORD) {
            errorMsg += '• Password non corretta\n';
            errorMsg += `  Inserita: "${password}"\n`;
            errorMsg += `  Attesa: "${ADMIN_PASSWORD}"\n\n`;
        }
        
        errorMsg += '💡 Username: gelstudio\n💡 Password: 12763Mlg';
        
        loginError.textContent = errorMsg;
        
        // Mostra alert per errore evidente
        setTimeout(() => {
            alert('❌ Accesso negato!\n\nUsername: gelstudio\nPassword: 12763Mlg');
        }, 100);
    }
}

function handleLogout() {
    isAdminLoggedIn = false;
    localStorage.removeItem('isAdminLoggedIn');
    showLogin();
}

// ============================================
// FUNZIONI DI GESTIONE CLIENTI
// ============================================

function handleClientForm(e) {
    e.preventDefault();
    
    if (editingClientId) {
        updateClient();
    } else {
        addClient();
    }
}

function addClient() {
    const clientName = document.getElementById('clientName').value;
    const clientUsername = document.getElementById('clientUsername').value;
    const clientPassword = document.getElementById('clientPassword').value;
    const megaLink = document.getElementById('megaLink').value;
    const clientNotes = document.getElementById('clientNotes').value;
    
    const clientId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    const newClient = {
        id: clientId,
        name: clientName,
        username: clientUsername,
        password: clientPassword,
        megaLink: megaLink,
        notes: clientNotes,
        createdAt: new Date().toISOString()
    };
    
    let clients = getClients();
    clients.push(newClient);
    localStorage.setItem('galleryClients', JSON.stringify(clients));
    
    clientForm.reset();
    document.getElementById('clientNotes').value = '';
    loadClients();
    
    alert('✅ Cliente aggiunto con successo!');
}

function updateClient() {
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
        
        clientForm.querySelector('button[type="submit"]').textContent = 'Aggiungi Cliente';
        clientForm.reset();
        document.getElementById('clientNotes').value = '';
        
        loadClients();
        alert('✅ Cliente aggiornato con successo!');
    }
}

function getClients() {
    const clients = localStorage.getItem('galleryClients');
    return clients ? JSON.parse(clients) : [];
}

function deleteClient(clientId) {
    if (confirm('⚠️ Sei sicuro di voler eliminare questo cliente?\n\nQuesta azione non può essere annullata!')) {
        let clients = getClients();
        clients = clients.filter(client => client.id !== clientId);
        localStorage.setItem('galleryClients', JSON.stringify(clients));
        loadClients();
        alert('✅ Cliente eliminato con successo!');
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
        
        clientForm.querySelector('button[type="submit"]').textContent = 'Aggiorna Cliente';
    }
}

function openClientDetail(clientId) {
    const clients = getClients();
    const client = clients.find(c => c.id === clientId);
    
    if (client) {
        const detailContent = document.getElementById('clientDetailContent');
        const createdAt = new Date(client.createdAt).toLocaleString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        detailContent.innerHTML = `
            <div class="client-detail-info">
                <div class="detail-item">
                    <span class="detail-label">👤 Nome Cliente:</span>
                    <div class="detail-value">${client.name}</div>
                </div>
                <div class="detail-item">
                    <span class="detail-label">🔑 Username:</span>
                    <div class="detail-value">${client.username}</div>
                </div>
                <div class="detail-item">
                    <span class="detail-label">🔒 Password:</span>
                    <div class="detail-value">${client.password}</div>
                </div>
                <div class="detail-item">
                    <span class="detail-label">🔗 Link MEGA:</span>
                    <div class="detail-value">
                        <a href="${client.megaLink}" target="_blank" style="color: #667eea; text-decoration: underline;">
                            ${client.megaLink.length > 50 ? client.megaLink.substring(0, 50) + '...' : client.megaLink}
                        </a>
                    </div>
                </div>
                <div class="detail-item full-width">
                    <span class="detail-label">🌐 Link Galleria Cliente:</span>
                    <div class="detail-value">
                        <a href="client.html?token=${generateClientToken(client)}" target="_blank" style="color: #667eea; text-decoration: underline;">
                            Apri link cliente
                        </a>
                        <div style="margin-top:8px; font-size:12px; color:#666;">
                            client.html?token=...
                        </div>
                    </div>
                </div>
                ${client.notes ? `
                <div class="detail-item full-width">
                    <span class="detail-label">📝 Note:</span>
                    <div class="detail-value">${client.notes.replace(/\n/g, '<br>')}</div>
                </div>
                ` : ''}
                <div class="detail-item full-width">
                    <span class="detail-label">📅 Data Creazione:</span>
                    <div class="detail-value">${createdAt}</div>
                    <div class="created-date" style="font-size:12px; color:#999; margin-top:5px;">
                        ID Cliente: ${client.id}
                    </div>
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
        clientsList.innerHTML = `
            <div style="text-align:center; padding:40px; color:#999;">
                <div style="font-size:48px; margin-bottom:20px;">📭</div>
                <p style="font-size:18px; margin-bottom:10px;">Nessun cliente ancora aggiunto</p>
                <p style="font-size:14px;">Clicca su "Aggiungi Nuovo Cliente" per iniziare</p>
            </div>
        `;
        return;
    }
    
    clients.forEach(client => {
        const clientToken = generateClientToken(client);
        const clientUrl = `${window.location.origin}${window.location.pathname.replace('index.html', '')}client.html?token=${clientToken}`;
        
        const clientCard = document.createElement('div');
        clientCard.className = 'client-card';
        clientCard.innerHTML = `
            <h3>${client.name}</h3>
            <div class="client-info">
                <p><strong>👤 Username:</strong> ${client.username}</p>
                <p><strong>🔒 Password:</strong> ${client.password}</p>
                <p><strong>🔗 Link Gallery:</strong></p>
                <a href="${clientUrl}" class="client-link" target="_blank">
                    🌐 Apri link cliente
                </a>
                <div style="background:#e8f4fd; border-left:4px solid #3498db; padding:12px; border-radius:4px; margin-top:15px; font-size:13px; word-break:break-all;">
                    <strong style="color:#2980b9; display:block; margin-bottom:8px;">📋 Link da inviare al cliente:</strong>
                    <code style="color:#1a5276; background:#fff; padding:5px; border-radius:3px; display:block; font-family:monospace; font-size:12px; margin-bottom:8px;" id="link-${client.id}">${clientUrl}</code>
                    <button onclick="copyLink('${client.id}')" style="background:#27ae60; color:white; border:none; border-radius:4px; padding:6px 12px; cursor:pointer; font-weight:600; width:100%; display:block;">
                        📋 Copia Link
                    </button>
                </div>
            </div>
            
            ${client.notes ? `
            <div class="client-notes">
                <strong style="color:#856404; display:block; margin-bottom:5px;">📝 Note:</strong>
                <p>${client.notes}</p>
            </div>
            ` : ''}
            
            <div class="button-group">
                <button class="open-btn" onclick="openClientDetail('${client.id}')">📁 Apri</button>
                <button class="edit-btn" onclick="editClient('${client.id}')">✏️ Modifica</button>
                <button class="delete-btn" onclick="deleteClient('${client.id}')">🗑️ Elimina</button>
            </div>
        `;
        clientsList.appendChild(clientCard);
    });
}

// NUOVA FUNZIONE: Copia link negli appunti
function copyLink(clientId) {
    const linkElement = document.getElementById(`link-${clientId}`);
    const linkText = linkElement.textContent;
    
    navigator.clipboard.writeText(linkText).then(() => {
        // Mostra feedback visivo
        const originalText = linkElement.nextElementSibling.innerHTML;
        linkElement.nextElementSibling.innerHTML = '✅ Copiato!';
        linkElement.nextElementSibling.style.background = '#27ae60';
        
        setTimeout(() => {
            linkElement.nextElementSibling.innerHTML = originalText;
            linkElement.nextElementSibling.style.background = '';
        }, 2000);
        
        alert('✅ Link copiato negli appunti!\n\nPuoi ora incollarlo e inviarlo al cliente.');
    }).catch(err => {
        console.error('Errore durante la copia:', err);
        alert('❌ Errore durante la copia del link.\n\nSeleziona e copia manualmente il link.');
    });
}

// ============================================
// FUNZIONI TOKEN CLIENTE
// ============================================

function generateClientToken(clientData) {
    const secretKey = 'G&LStudio2026SecretKey12763Mlg@';
    const payload = {
        u: clientData.username,
        p: clientData.password,
        m: clientData.megaLink,
        i: clientData.id,
        t: Date.now()
    };
    
    const json = JSON.stringify(payload);
    let encrypted = '';
    for (let i = 0; i < json.length; i++) {
        encrypted += String.fromCharCode(json.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length));
    }
    return btoa(encodeURIComponent(encrypted));
}

// ============================================
// FUNZIONI BACKUP
// ============================================

function createBackup() {
    const clients = getClients();
    const backupData = {
        version: '2.0',
        timestamp: new Date().toISOString(),
        clients: clients
    };
    
    const backupString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([backupString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    const timestamp = new Date().toLocaleDateString('it-IT').replace(/\//g, '-') + '_' + 
                      new Date().toLocaleTimeString('it-IT').replace(/:/g, '-');
    a.href = url;
    a.download = `gallery-backup-${timestamp}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    
    alert('✅ Backup creato con successo!\n\nIl file è stato scaricato sul tuo computer.');
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
        restoreError.textContent = '❌ Seleziona un file di backup!';
        return;
    }
    
    const file = fileInput.files[0];
    
    if (!file.name.endsWith('.json')) {
        restoreError.textContent = '❌ Seleziona un file JSON valido!';
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const backupData = JSON.parse(e.target.result);
            
            if (!backupData.clients) {
                restoreError.textContent = '❌ File di backup non valido!';
                return;
            }
            
            const clientCount = backupData.clients.length;
            
            if (!confirm(`⚠️ Attenzione!\n\nQuesta operazione sovrascriverà tutti i dati attuali.\n\nIl backup contiene ${clientCount} cliente${clientCount !== 1 ? 'i' : ''}.\n\nSei sicuro di voler continuare?`)) {
                return;
            }
            
            localStorage.setItem('galleryClients', JSON.stringify(backupData.clients));
            
            restoreError.textContent = '';
            restoreSuccess.textContent = `✅ Backup ripristinato con successo!\n\n${clientCount} cliente${clientCount !== 1 ? 'i' : ''} caricato${clientCount !== 1 ? 'i' : ''}.`;
            restoreSuccess.style.display = 'block';
            
            loadClients();
            
            setTimeout(() => {
                closeRestoreModal();
            }, 2500);
            
        } catch (error) {
            restoreError.textContent = '❌ Errore durante il ripristino:\n' + error.message;
        }
    };
    
    reader.onerror = function() {
        restoreError.textContent = '❌ Errore durante la lettura del file!';
    };
    
    reader.readAsText(file);
}

// ============================================
// FUNZIONI DI VISUALIZZAZIONE
// ============================================

function showDashboard() {
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    loadClients();
}

function showLogin() {
    loginSection.style.display = 'block';
    dashboardSection.style.display = 'none';
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

// ============================================
// FUNZIONI GLOBALI
// ============================================

window.deleteClient = deleteClient;
window.editClient = editClient;
window.openClientDetail = openClientDetail;
window.closeClientDetailModal = closeClientDetailModal;
window.closeRestoreModal = closeRestoreModal;
window.handleRestore = handleRestore;
window.copyLink = copyLink;

// Chiudi modals cliccando fuori
window.onclick = function(event) {
    if (event.target === restoreModal) {
        closeRestoreModal();
    }
    if (event.target === clientDetailModal) {
        closeClientDetailModal();
    }
}

// ============================================
// AGGIUNGI PULSANTE RESET NELLA PAGINA DI LOGIN
// ============================================

window.addEventListener('DOMContentLoaded', function() {
    const authBox = document.querySelector('.auth-box');
    if (authBox && !document.getElementById('resetSessionBtn')) {
        const resetBtn = document.createElement('button');
        resetBtn.id = 'resetSessionBtn';
        resetBtn.innerHTML = '🔄 Reset Sessione (pulisci cache)';
        resetBtn.style.cssText = `
            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
            color: white;
            border: none;
            border-radius: 6px;
            padding: 10px 20px;
            margin-top: 20px;
            cursor: pointer;
            font-weight: 600;
            width: 100%;
            transition: transform 0.2s, box-shadow 0.2s;
        `;
        resetBtn.onmouseover = function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 5px 15px rgba(231, 76, 60, 0.4)';
        };
        resetBtn.onmouseout = function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        };
        resetBtn.onclick = function() {
            if (confirm('🔄 Vuoi resettare la sessione?\n\nQuesto pulirà la cache e ti disconnetterà.\n\nContinuare?')) {
                localStorage.clear();
                alert('✅ Sessione resettata!\n\nLa pagina verrà ricaricata.');
                location.reload();
            }
        };
        authBox.appendChild(resetBtn);
    }
});

// ============================================
// DEBUG INIT
// ============================================

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║          GALLERY MANAGER - CARICATO CORRETTAMENTE          ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');
console.log('🔐 Credenziali di accesso:');
console.log('   Username: gelstudio');
console.log('   Password: 12763Mlg');
console.log('');
console.log('💡 Suggerimento: copia e incolla le credenziali esatte.');
console.log('══════════════════════════════════════════════════════════════');
