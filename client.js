// DOM Elements
const loginSection = document.getElementById('loginSection');
const gallerySection = document.getElementById('gallerySection');
const clientLoginForm = document.getElementById('clientLoginForm');
const galleryLink = document.getElementById('galleryLink');
const authError = document.getElementById('authError');

// Leggi il token dall'URL
const urlParams = new URLSearchParams(window.location.search);
const clientToken = urlParams.get('token');

// Se non c'è token, mostra errore
if (!clientToken) {
    authError.textContent = '❌ Link non valido! Contatta lo staff per il link corretto.';
    loginSection.style.display = 'none';
} else {
    // Decodifica i dati del cliente
    const clientData = decodeClientToken(clientToken);
    
    if (!clientData || !clientData.u || !clientData.p || !clientData.m) {
        authError.textContent = '❌ Link danneggiato o scaduto! Contatta lo staff.';
        loginSection.style.display = 'none';
    } else {
        // Salva i dati decodificati per l'autenticazione
        window.clientData = clientData;
        
        // Mostra messaggio informativo con credenziali
        const infoMsg = document.createElement('div');
        infoMsg.className = 'info-message';
        infoMsg.innerHTML = `
            <strong>ℹ️ Credenziali di accesso:</strong><br>
            Username: <strong>${clientData.u}</strong><br>
            Password: <strong>${clientData.p}</strong>
        `;
        loginSection.insertBefore(infoMsg, loginSection.firstChild);
    }
}

// Event Listener
clientLoginForm.addEventListener('submit', handleClientLogin);

// Funzioni
function handleClientLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Verifica le credenziali con i dati decodificati
    if (window.clientData && 
        window.clientData.u === username && 
        window.clientData.p === password) {
        
        authError.textContent = '';
        showGallery(window.clientData.m);
    } else {
        authError.textContent = '❌ Credenziali errate! Controlla username e password.';
    }
}

function showGallery(megaLink) {
    loginSection.style.display = 'none';
    gallerySection.style.display = 'block';
    galleryLink.href = megaLink;
    galleryLink.target = '_blank';
}

// Funzione per decodificare il token - VERSIONE CORRETTA
function decodeClientToken(token) {
    try {
        // Decodifica Base64 URL-safe
        const safeToken = token
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        
        // Aggiungi padding se necessario
        const paddedToken = safeToken + '='.repeat((4 - safeToken.length % 4) % 4);
        
        // Decodifica Base64 e parse JSON
        const json = atob(paddedToken);
        const payload = JSON.parse(json);
        
        // Verifica timestamp (scadenza dopo 1 anno)
        const oneYear = 365 * 24 * 60 * 60 * 1000;
        if (Date.now() - payload.t > oneYear) {
            console.warn('Token scaduto');
            return null;
        }
        
        return payload;
    } catch (e) {
        console.error('❌ Errore decodifica token:', e);
        console.error('Token ricevuto:', token);
        return null;
    }
}

// Debug per test
console.log('Token ricevuto:', clientToken);
if (clientToken) {
    console.log('Decodifica tentativo:', decodeClientToken(clientToken));
}
