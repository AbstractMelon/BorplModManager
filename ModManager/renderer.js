const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
    if (window.location === "splash.html") {
        const { ipcRenderer } = require('electron');
        ipcRenderer.on('quote', (event, quote) => {
            const quoteElement = document.getElementById('quote');
            quoteElement.innerText = `"${quote}"`;
        });
    }
    const fetchModsBtn = document.getElementById('fetchModsBtn');
    const installSplotchBtn = document.getElementById('installSplotchBtn');
    const modContainer = document.getElementById('modContainer');

    fetchModsBtn.addEventListener('click', async () => {
        try {
            const mods = await ipcRenderer.invoke('fetch-mods');
            displayMods(mods);
        } catch (error) {
            console.error('Error fetching mods:', error);
        }
    });

    installSplotchBtn.addEventListener('click', () => {
        ipcRenderer.send('install-splotch');
    });

    document.getElementById('browseBtn').addEventListener('click', async () => {
        const gameDir = await ipcRenderer.invoke('select-game-directory');
        console.log('Selected game directory:', gameDir);
    });

    // Epic mod text
    function displayMods(mods) {
        modContainer.innerHTML = '';
        mods.forEach((mod) => {
            const modCard = document.createElement('div');
            modCard.classList.add('mod');
            modCard.style.backgroundImage = `url('${mod.img}')`; 
            modCard.innerHTML = `
                <div class="modContent">
                    <!-- <p class="modAuthor">By ${mod.author}</p>
                    <p class="modDescription">${mod.description}</p> -->
                    <div class="actions center">
                        <button class="installModBtn" data-url="${mod.github}">Install Mod</button>
                    </div>
                </div>
            `;
            modContainer.appendChild(modCard);
        });
    
        const installModBtns = document.querySelectorAll('.installModBtn');
        installModBtns.forEach((btn) => {
            btn.addEventListener('click', (event) => {
                const modUrl = event.target.getAttribute('data-url');
                ipcRenderer.send('install-mod', modUrl);
            });
        });
    }

    // SETTINGS!
    document.addEventListener('DOMContentLoaded', () => {
        const consoleEnabledCheckbox = document.getElementById('consoleEnabled');
        const verboseLoggingCheckbox = document.getElementById('verboseLogging');
        const nightlyCheckbox = document.getElementById('nightly');
        const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    
        // Populate settings UI when the page loads
        const settings = readSettings();
        if (settings) {
            consoleEnabledCheckbox.checked = settings.consoleEnabled;
            verboseLoggingCheckbox.checked = settings.verboseLoggingEnabled;
            nightlyCheckbox.checked = settings.nightly;
        }
    
        // Save settings when the "Save Settings" button is clicked
        saveSettingsBtn.addEventListener('click', () => {
            const newSettings = {
                consoleEnabled: consoleEnabledCheckbox.checked,
                verboseLoggingEnabled: verboseLoggingCheckbox.checked,
                nightly: nightlyCheckbox.checked
            };
            saveSettings(newSettings);
        });
    });
});
