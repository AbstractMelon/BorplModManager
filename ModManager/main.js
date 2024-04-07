const { app, BrowserWindow, ipcMain, dialog, Notification} = require('electron');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const extract = require('extract-zip');
const { spawn } = require('child_process');
console.log("main.js loaded");


function runBoplBattleAndKill(boplDir, durationInSeconds) {
    const boplExePath = path.join(boplDir, 'BoplBattle.exe');
    console.log('Bopl Battle executable path:', boplExePath);

    // Start BoplBattle.exe
    const boplProcess = spawn(boplExePath, [], {
        cwd: boplDir, // Set the working directory to boplDir
        detached: true, // Detach the child process from the parent
        stdio: 'ignore', // Ignore standard input/output/error streams
    });

    console.log('Bopl Battle process started.');

    // Kill the process after the specified duration
    /* setTimeout(() => {
        console.log(`Killing Bopl Battle process after ${durationInSeconds} seconds.`);
        process.kill(-boplProcess.pid); // Kill the process group (to ensure child processes are also killed)
    }, durationInSeconds * 1000); */
}


// Function to install Splotch
async function installSplotch(gameDir) {
    console.log('Starting Splotch installation...');
    const splotchZipUrl = 'https://github.com/codemob-dev/Splotch/releases/download/v0.5.1/Splotch-v0.5.1.zip';
    const tempZipPath = path.join(app.getPath('temp'), 'splotch.zip');
    const splotchDir = path.join(gameDir, 'Splotch');
    
    console.log('Downloading Splotch ZIP file from:', splotchZipUrl);
    console.log('Temp ZIP file path:', tempZipPath);
    console.log('Target Splotch directory:', splotchDir);

    try {
        const response = await axios.get(splotchZipUrl, { responseType: 'stream' });
        const writer = fs.createWriteStream(tempZipPath);

        response.data.pipe(writer);

        writer.on('finish', async () => {
            console.log('Splotch ZIP file downloaded successfully.');
            console.log('Extracting Splotch ZIP file to:', splotchDir);
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

async function installMod(modUrl, userDir) {
    const modDir = path.join(userDir, 'splotch_mods');

    try {
        // Ensure the splotch_mods directory exists
        if (!fs.existsSync(modDir)) {
            fs.mkdirSync(modDir);
        }

        const modFileName = path.basename(modUrl);
        const modFilePath = path.join(modDir, modFileName);

        const response = await axios.get(modUrl, { responseType: 'stream' });
        const writer = fs.createWriteStream(modFilePath);

        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        console.log('Mod downloaded successfully:', modFileName);
        new Notification({
            title: "Mod installed!",
            body: "Mod " + modFileName +  ", has installed successfully.",
          }).show()
    } catch (error) {
        console.error('Error downloading mod:', error);
        throw error;
    }
}


// Function to extract ZIP file
function extractZip(zipFilePath, outputDir) {
    return new Promise((resolve, reject) => {
        const parentDir = path.dirname(outputDir); // Get the parent directory of Bopl Battle
        console.log('Extracting ZIP file:', zipFilePath);
        console.log('Parent directory:', parentDir);

        extract(zipFilePath, { dir: parentDir }, (err) => {
            if (err) {
                console.error('Error extracting ZIP file:', err);
                reject(err);
            } else {
                console.log('ZIP file extracted successfully.');
                
                resolve();
            }
        });
    });
}



app.on('ready', () => {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        resizable: false,
        fullscreenable: false,
        maximizable: false,
        icon: __dirname + '/build/icon.ico',
        backgroundColor: '#444444',
        titleBarStyle: 'hidden',
        titleBarOverlay: {
          color: '#333333',
          symbolColor: '#fafafa',
          height: 50,
          width: 50,
        },
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    mainWindow.loadFile('index.html');


    ipcMain.handle('fetch-mods', async () => {
        try {
            // Fetch the JSON data
            const response = await axios.get('https://raw.githubusercontent.com/AbstractMelon/BorplModManager/main/assets/json/mods.json');

            // Extract the 'mods' property from the JSON data
            const mods = response.data.mods;

            // Log the fetched JSON data
            console.log('Fetched mods:', mods);

            return mods;
        } catch (error) {
            console.error('Error fetching mods:', error);
            throw error;
        }
    });


    ipcMain.on('install-splotch', async (event) => {
        // const gameDir = await selectGameDirectory();
        // if (!gameDir) return;

        try {
            await installSplotch('C:\\Program Files (x86)\\Steam\\steamapps\\common\\Bopl Battle');
            new Notification({
                title: "Splotch Installed!",
                body: "Splotch has installed successfully.",
              }).show()
            event.reply('splotch-installed');
            console.log('Starting Bopl Battle...');
            new Notification({
                title: "Close Bopl Battle!",
                body: "Please close Bopl Battle manually.",
              }).show()
            runBoplBattleAndKill('C:/Program Files (x86)/Steam/steamapps/common/Bopl Battle', 5);
            console.log('Splotch installed successfully.');
        } catch (error) {
            console.error('Error installing Splotch:', error);
            new Notification({
                title: "Failed to Install Splotch!",
                body: "Splotch has failed to install.",
              }).show()
            event.reply('splotch-install-error', error.message);
        }
    });
    
    ipcMain.on('install-mod', async (event, modUrl) => {
        let userDir = 'C:/Program Files (x86)/Steam/steamapps/common/Bopl Battle/'
        try {
            await installMod(modUrl, userDir);
            event.reply('mod-installed');
            console.log('Mod installed successfully.');
            new Notification({
                title: "Mod installed!",
                body: "mod " + modUrl +  ", has installed successfully.",
              }).show()
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
        defaultPath: 'C:/Program Files (x86)/Steam/steamapps/common/Bopl Battle'
    });

    if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
    } else {
        return null;
    }
}
