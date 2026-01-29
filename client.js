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
        
        // Mostra messaggio informativo
        const infoMsg = document.createElement('div');
        infoMsg.className = 'info-message';
        infoMsg.style.cssText = 'background:#e8f4fd; color:#2980b9; padding:15px; border-radius:8px; margin-bottom:20px; font-size:14px;';
        infoMsg.innerHTML = `
            <strong>ℹ️ Per accedere alla tua galleria:</strong><br>
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

// NUOVA FUNZIONE: Decodifica token sicuro
function decodeClientToken(token) {
    const secretKey = 'G&LStudio2026SecretKey12763Mlg@';
    try {
        const decoded = decodeURIComponent(atob(token));
        let decrypted = '';
        for (let i = 0; i < decoded.length; i++) {
            decrypted += String.fromCharCode(decoded.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length));
        }
        const payload = JSON.parse(decrypted);
        
        // Verifica timestamp (opzionale: scadenza dopo 1 anno)
        const oneYear = 365 * 24 * 60 * 60 * 1000;
        if (Date.now() - payload.t > oneYear) {
            console.warn('Token scaduto');
            return null;
        }
        
        return payload;
    } catch (e) {
        console.error('Errore decodifica token:', e);
        return null;
    }
}

// Per testing: mostra i dati decodificati nella console
if (clientToken && window.clientData) {
    console.log('✅ Cliente caricato correttamente');
    console.log('Username:', window.clientData.u);
    console.log('Password:', window.clientData.p.substring(0, 3) + '***');
}
