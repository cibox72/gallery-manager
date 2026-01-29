// ... resto del codice rimane uguale fino a saveClient ...

function saveClient(client) {
    let clients = getClients();
    clients.push(client);
    localStorage.setItem('galleryClients', JSON.stringify(clients));
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

// NUOVA FUNZIONE: Decodifica token (per testing)
function decodeClientToken(token) {
    const secretKey = 'G&LStudio2026SecretKey12763Mlg@';
    try {
        const decoded = decodeURIComponent(atob(token));
        let decrypted = '';
        for (let i = 0; i < decoded.length; i++) {
            decrypted += String.fromCharCode(decoded.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length));
        }
        return JSON.parse(decrypted);
    } catch (e) {
        return null;
    }
}

function loadClients() {
    const clients = getClients();
    clientsList.innerHTML = '';
    
    if (clients.length === 0) {
        clientsList.innerHTML = '<p class="no-clients">Nessun cliente ancora aggiunto.</p>';
        return;
    }
    
    clients.forEach(client => {
        // Genera il token sicuro per questo cliente
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
                    ${clientUrl.substring(0, 40)}...
                </a>
                <div style="background:#e8f4fd; padding:8px; border-radius:4px; margin-top:10px; font-size:13px;">
                    <strong>Copia link da inviare al cliente:</strong><br>
                    <code style="word-break:break-all;">${clientUrl}</code>
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

// ... resto del codice rimane uguale ...
