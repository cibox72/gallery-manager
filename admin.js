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
let allClients = [];

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
const clientsCountEl = document.getElementById('clientsCount');
const searchInput = document.getElementById('clientSearch');

// ============================================
// EVENT LISTENERS
// ============================================
loginForm.addEventListener('submit', handleLogin);
logoutBtn.addEventListener('click', handleLogout);
clientForm.addEventListener('submit', handleClientForm);
backupBtn.addEventListener('click', createBackup);
restoreBtn.addEventListener('click', openRestoreModal);
if (searchInput) searchInput.addEventListener('input', filterClients);

// Carica dashboard se già loggato
checkLoginStatus();

// ============================================
// FUNZIONI DI LOGIN
// ============================================

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value.trim();
    const loginError = document.getElementById('loginError');
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        isAdminLoggedIn = true;
        localStorage.setItem('isAdminLoggedIn', 'true');
        showDashboard();
        loginError.textContent = '';
    } else {
        loginError.textContent = '❌ Credenziali errate!\n\n💡 Username: gelstudio\n💡 Password: 12763Mlg';
        setTimeout(() => alert('❌ Accesso negato!\n\nUsername: gelstudio\nPassword: 12763Mlg'), 100);
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
    editingClientId ? updateClient() : addClient();
}

function addClient() {
    const clientName = document.getElementById('clientName').value.trim();
    const clientUsername = document.getElementById('clientUsername').value.trim();
    const clientPassword = document.getElementById('clientPassword').value.trim();
    const megaLink = document.getElementById('megaLink').value.trim();
    const clientNotes = document.getElementById('clientNotes').value.trim();
    
    if (!clientName || !clientUsername || !clientPassword || !megaLink) {
        alert('⚠️ Tutti i campi obbligatori devono essere compilati!');
        return;
    }
    
    const clientId = 'client_' + Date.now() + '_' + Math.floor(Math.random() * 900000 + 100000);
    
    const newClient = {
        id: clientId,
        name: clientName,
        username: clientUsername,
        password: clientPassword,
        megaLink: megaLink,
        notes: clientNotes,
        createdAt: Date.now()
    };
    
    allClients.push(newClient);
    saveClientsToStorage();
    
    clientForm.reset();
    document.getElementById('clientNotes').value = '';
    loadClients();
    
    alert('✅ Cliente aggiunto con successo!');
}

function updateClient() {
    const clientName = document.getElementById('clientName').value.trim();
    const clientUsername = document.getElementById('clientUsername').value.trim();
    const clientPassword = document.getElementById('clientPassword').value.trim();
    const megaLink = document.getElementById('megaLink').value.trim();
    const clientNotes = document.getElementById('clientNotes').value.trim();
    
    if (!clientName || !clientUsername || !clientPassword || !megaLink) {
        alert('⚠️ Tutti i campi obbligatori devono essere compilati!');
        return;
    }
    
    const index = allClients.findIndex(c => c.id === editingClientId);
    if (index === -1) {
        alert('❌ Cliente non trovato!');
        return;
    }
    
    allClients[index] = {
        ...allClients[index],
        name: clientName,
        username: clientUsername,
        password: clientPassword,
        megaLink: megaLink,
        notes: clientNotes
    };
    
    saveClientsToStorage();
    editingClientId = null;
    clientForm.querySelector('button[type="submit"]').textContent = 'Aggiungi Cliente';
    clientForm.reset();
    document.getElementById('clientNotes').value = '';
    loadClients();
    
    alert('✅ Cliente aggiornato con successo!');
}

function deleteClient(clientId) {
    if (!clientId || clientId.trim() === '') {
        alert('❌ ID cliente non valido!');
        return;
    }
    
    const clientBefore = allClients.find(c => c.id === clientId);
    if (!clientBefore) {
        alert('❌ Cliente non trovato!');
        return;
    }
    
    const clientInfo = [
        clientBefore.name ? `Nome: ${clientBefore.name}` : 'Nome: N/D',
        clientBefore.username ? `Username: ${clientBefore.username}` : 'Username: N/D',
        clientBefore.password ? `Password: ${clientBefore.password}` : 'Password: N/D'
    ].join('\n');
    
    if (confirm(`⚠️ Eliminare questo cliente?\n\n${clientInfo}\n\nQuesta azione non può essere annullata!`)) {
        const initialCount = allClients.length;
        allClients = allClients.filter(client => client.id !== clientId);
        
        if (allClients.length < initialCount) {
            saveClientsToStorage();
            loadClients();
            alert('✅ Cliente eliminato con successo!');
        } else {
            alert('❌ Errore durante l\'eliminazione!');
        }
    }
}

function editClient(clientId) {
    const client = allClients.find(c => c.id === clientId);
    if (!client) {
        alert('❌ Cliente non trovato!');
        return;
    }
    
    editingClientId = clientId;
    document.getElementById('clientName').value = client.name;
    document.getElementById('clientUsername').value = client.username;
    document.getElementById('clientPassword').value = client.password;
    document.getElementById('megaLink').value = client.megaLink;
    document.getElementById('clientNotes').value = client.notes || '';
    clientForm.querySelector('button[type="submit"]').textContent = 'Aggiorna Cliente';
}

// ============================================
// FUNZIONI DI VISUALIZZAZIONE
// ============================================

function loadClients() {
    if (clientsCountEl) {
        clientsCountEl.textContent = allClients.length;
    }
    
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const filteredClients = searchTerm 
        ? allClients.filter(c => 
            c.name.toLowerCase().includes(searchTerm) || 
            c.username.toLowerCase().includes(searchTerm) ||
            c.id.toLowerCase().includes(searchTerm)
          )
        : allClients;
    
    filteredClients.sort((a, b) => b.createdAt - a.createdAt);
    const clientsToRender = filteredClients.slice(0, 50);
    const totalCount = filteredClients.length;
    
    clientsList.innerHTML = '';
    
    if (totalCount === 0) {
        clientsList.innerHTML = `
            <div style="text-align:center; padding:40px; color:#999;">
                <div style="font-size:48px; margin-bottom:20px;">📭</div>
                <p style="font-size:18px; margin-bottom:10px;">Nessun cliente trovato</p>
                <p style="font-size:14px;">${searchTerm ? 'Prova con termini di ricerca diversi' : 'Clicca su "Aggiungi Nuovo Cliente" per iniziare'}</p>
            </div>
        `;
        return;
    }
    
    if (totalCount > 50) {
        const warning = document.createElement('div');
        warning.style.cssText = 'background:#fff3cd; color:#856404; padding:12px; border-radius:8px; margin-bottom:15px; text-align:center; font-weight:500;';
        warning.innerHTML = `⚠️ Visualizzati solo i primi 50 clienti (su ${totalCount} totali). Usa la ricerca per trovare clienti specifici.`;
        clientsList.appendChild(warning);
    }
    
    clientsToRender.forEach(client => {
        const clientCard = document.createElement('div');
        clientCard.className = 'client-card';
        clientCard.innerHTML = `
            <h3>${escapeHtml(client.name)}</h3>
            <div class="client-info">
                <p><strong>👤 Username:</strong> ${escapeHtml(client.username)}</p>
                <p><strong>🔒 Password:</strong> ${escapeHtml(client.password)}</p>
                <div style="background:#e8f4fd; border-left:4px solid #3498db; padding:12px; border-radius:4px; margin-top:15px; font-size:13px;">
                    <strong style="color:#2980b9; display:block; margin-bottom:8px;">📋 Link da inviare al cliente:</strong>
                    <div style="display:flex; gap:8px; margin-top:8px;">
                        <input type="text" value="${getClientUrl(client.id)}" readonly style="flex:1; padding:6px; border:1px solid #ddd; border-radius:4px; font-family:monospace; font-size:11px;" id="link-${client.id}">
                        <button onclick="copyLink('${client.id}')" class="copy-btn">
                            📋
                        </button>
                    </div>
                </div>
            </div>
            
            ${client.notes ? `
            <div class="client-notes">
                <strong style="color:#856404; display:block; margin-bottom:5px;">📝 Note:</strong>
                <p>${escapeHtml(client.notes)}</p>
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

function filterClients() {
    loadClients();
}

function openClientDetail(clientId) {
    const client = allClients.find(c => c.id === clientId);
    if (!client) {
        alert('❌ Cliente non trovato!');
        return;
    }
    
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
                <div class="detail-value">${escapeHtml(client.name)}</div>
            </div>
            <div class="detail-item">
                <span class="detail-label">🔑 Username:</span>
                <div class="detail-value">${escapeHtml(client.username)}</div>
            </div>
            <div class="detail-item">
                <span class="detail-label">🔒 Password:</span>
                <div class="detail-value">${escapeHtml(client.password)}</div>
            </div>
            <div class="detail-item">
                <span class="detail-label">🔗 Link MEGA:</span>
                <div class="detail-value">
                    <a href="${escapeHtml(client.megaLink)}" target="_blank" style="color: #667eea; text-decoration: underline;">
                        ${client.megaLink.length > 60 ? client.megaLink.substring(0, 60) + '...' : client.megaLink}
                    </a>
                </div>
            </div>
            <div class="detail-item full-width">
                <span class="detail-label">🌐 Link Galleria Cliente:</span>
                <div class="detail-value">
                    <input type="text" value="${getClientUrl(client.id)}" readonly style="width:100%; padding:8px; margin-top:5px; border:1px solid #ddd; border-radius:4px; font-family:monospace; font-size:13px;">
                    <button onclick="copyText('${getClientUrl(client.id)}')" style="margin-top:8px; background:#27ae60; color:white; border:none; border-radius:4px; padding:6px 12px; cursor:pointer; font-weight:600; width:100%;">
                        📋 Copia Link Completo
                    </button>
                </div>
            </div>
            ${client.notes ? `
            <div class="detail-item full-width">
                <span class="detail-label">📝 Note:</span>
                <div class="detail-value">${escapeHtml(client.notes).replace(/\n/g, '<br>')}</div>
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

function closeClientDetailModal() {
    clientDetailModal.style.display = 'none';
}

// ============================================
// FUNZIONI DI SALVATAGGIO
// ============================================

function saveClientsToStorage() {
    try {
        localStorage.setItem('galleryClients', JSON.stringify(allClients));
    } catch (error) {
        if (error.name === 'QuotaExceededError') {
            alert(`❌ Spazio esaurito nel browser!\n\nHai troppi clienti (${allClients.length}).\n\nSOLUZIONE:\n1. Fai un backup\n2. Elimina alcuni clienti`);
        } else {
            alert(`❌ Errore durante il salvataggio:\n${error.message}`);
        }
    }
}

function loadClientsFromStorage() {
    try {
        const data = localStorage.getItem('galleryClients');
        allClients = data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('❌ Errore caricamento clienti:', error);
        allClients = [];
        alert('❌ Errore durante il caricamento dei clienti!');
    }
}

// ============================================
// FUNZIONI TOKEN - VERSIONE CORRETTA E STABILE
// ============================================

function getClientUrl(clientId) {
    const client = allClients.find(c => c.id === clientId);
    if (!client) return '#';
    
    // Crea payload semplice
    const payload = {
        u: client.username,
        p: client.password,
        m: client.megaLink,
        i: client.id,
        t: Date.now()
    };
    
    // Codifica in Base64 URL-safe
    const token = btoa(JSON.stringify(payload))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    
    return `${window.location.origin}${window.location.pathname.replace('index.html', '')}client.html?token=${token}`;
}

function copyLink(clientId) {
    const url = getClientUrl(clientId);
    copyText(url);
}

function copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('✅ Link copiato negli appunti!');
    }).catch(err => {
        const tempInput = document.createElement('input');
        tempInput.value = text;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        alert('✅ Link copiato (metodo alternativo)!');
    });
}

// ============================================
// FUNZIONI BACKUP
// ============================================

function createBackup() {
    try {
        const backupData = {
            version: '3.0',
            timestamp: new Date().toISOString(),
            clients: allClients
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
        alert(`✅ Backup creato con successo!\n\n${allClients.length} clienti salvati.`);
    } catch (error) {
        alert(`❌ Errore durante il backup:\n${error.message}`);
    }
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
    
    if (!fileInput.files?.length) {
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
            if (!backupData.clients) throw new Error('File di backup non valido');
            
            if (!confirm(`⚠️ ATTENZIONE!\n\nQuesta operazione sovrascriverà TUTTI i dati attuali (${allClients.length} clienti).\n\nIl backup contiene ${backupData.clients.length} clienti.\n\nSei SICURO di voler continuare?`)) {
                return;
            }
            
            allClients = backupData.clients;
            saveClientsToStorage();
            loadClients();
            
            restoreError.textContent = '';
            restoreSuccess.textContent = `✅ Backup ripristinato con successo!\n\n${allClients.length} clienti caricati.`;
            restoreSuccess.style.display = 'block';
            
            setTimeout(closeRestoreModal, 2500);
        } catch (error) {
            restoreError.textContent = `❌ Errore durante il ripristino:\n${error.message}`;
        }
    };
    
    reader.onerror = () => {
        restoreError.textContent = '❌ Errore durante la lettura del file!';
    };
    
    reader.readAsText(file);
}

// ============================================
// FUNZIONI DI SUPPORTO
// ============================================

function escapeHtml(text) {
    if (!text) return '';
    return text.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function showDashboard() {
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    loadClientsFromStorage();
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
window.copyText = copyText;

window.onclick = function(event) {
    if (event.target === restoreModal) closeRestoreModal();
    if (event.target === clientDetailModal) closeClientDetailModal();
};

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
