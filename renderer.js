const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
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

    // Other button event listeners can be added here

    function displayMods(mods) {
        modContainer.innerHTML = '';
        mods.forEach((mod) => {
            const modCard = document.createElement('div');
            modCard.classList.add('mod');
            modCard.style.backgroundImage = `url('${mod.img}')`; // Set background image dynamically
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
    }
    
    
    

    // Event delegation to handle install mod buttons
    modContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('installModBtn')) {
            const modUrl = event.target.getAttribute('data-url');
            ipcRenderer.send('install-mod', modUrl);
        }
    });
});
