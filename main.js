const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const extract = require('extract-zip');
console.log("main.js loaded");

// Function to install Splotch
async function installSplotch(gameDir) {
    const splotchZipUrl = 'https://github.com/codemob-dev/Splotch/releases/download/v0.5.1/Splotch-v0.5.1.zip';
    const tempZipPath = path.join(app.getPath('temp'), 'splotch.zip');
    const splotchDir = path.join(gameDir, 'Splotch');

    try {
        const response = await axios.get(splotchZipUrl, { responseType: 'stream' });
        const writer = fs.createWriteStream(tempZipPath);
        response.data.pipe(writer);

        writer.on('finish', async () => {
            await extractZip(tempZipPath, splotchDir);
            console.log('Splotch installed successfully.');
        });

        writer.on('error', (error) => {
            console.error('Error downloading Splotch:', error);
            throw error;
        });
    } catch (error) {
        console.error('Error downloading Splotch:', error);
        throw error;
    }
}

// Function to extract ZIP file
function extractZip(zipFilePath, outputDir) {
    return new Promise((resolve, reject) => {
        extract(zipFilePath, { dir: outputDir }, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

app.on('ready', () => {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        autoHideMenuBar: true,
    });

    mainWindow.loadFile('index.html');

    ipcMain.handle('fetch-mods', async () => {
        try {
            const modsData = await fs.promises.readFile(path.join(__dirname, 'mods.json'), 'utf-8');
            const mods = JSON.parse(modsData).mods;
            return mods;
        } catch (error) {
            console.error('Error fetching mods:', error);
            throw error;
        }
    });

    ipcMain.on('install-splotch', async (event) => {
        const gameDir = await selectGameDirectory();
        if (!gameDir) return;

        try {
            await installSplotch(gameDir);
            event.reply('splotch-installed');
        } catch (error) {
            console.error('Error installing Splotch:', error);
            event.reply('splotch-install-error', error.message);
        }
    });
    
    ipcMain.on('install-mod', async (event, modUrl) => {
        const gameDir = await selectGameDirectory();
        if (!gameDir) return;

        try {
            await installMod(modUrl, gameDir);
            event.reply('mod-installed');
            console.log('Mod installed successfully.');
        } catch (error) {
            console.error('Error installing mod:', error);
            event.reply('mod-install-error', error.message);
        }
    });
});

async function selectGameDirectory() {
    const result = await dialog.showOpenDialog({
        title: 'Select Game Directory',
        properties: ['openDirectory'],
        defaultPath: 'G:/Steam/steamapps/common/Bopl Battle'
    });

    if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
    } else {
        return null;
    }
}
