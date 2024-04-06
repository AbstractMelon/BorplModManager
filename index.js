const axios = require('axios');
const fs = require('fs');
const extract = require('extract-zip');

// Replace with your borpl API URL
const API_URL = 'https://borpl.site/api/mods';

// Function to fetch mods from borpl API
async function fetchMods() {
    try {
        const response = await axios.get(API_URL);
        const mods = response.data;
        console.log('Mods:', mods);
    } catch (error) {
        console.error('Error fetching mods:', error);
    }
}

// Function to install BepInEx
async function installBepInEx() {
    // Replace with the actual download URL of BepInEx
    const bepInExUrl = 'https://example.com/bepinex.zip';
    const tempZipPath = './bepinex.zip';
    const gameDirectory = '/path/to/game';

    const writer = fs.createWriteStream(tempZipPath);

    const response = await axios({
        url: bepInExUrl,
        method: 'GET',
        responseType: 'stream'
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', () => {
            extract(tempZipPath, { dir: gameDirectory }, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('BepInEx installed successfully.');
                    resolve();
                }
            });
        });
        writer.on('error', reject);
    });
}

// Function to install Splotch
async function installSplotch() {
    // Replace with the actual download URL of Splotch
    const splotchUrl = 'https://github.com/codemob-dev/Splotch/releases/download/v0.5.1/Splotch-v0.5.1.zip';
    const tempZipPath = './splotch.zip';
    const gameDirectory = '/path/to/game';

    const writer = fs.createWriteStream(tempZipPath);

    const response = await axios({
        url: splotchUrl,
        method: 'GET',
        responseType: 'stream'
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', () => {
            extract(tempZipPath, { dir: gameDirectory }, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('Splotch installed successfully.');
                    resolve();
                }
            });
        });
        writer.on('error', reject);
    });
}
