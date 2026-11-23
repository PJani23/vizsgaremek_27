'use strict';

// Egyetlen Node.js szerver szolgálja ki az oldalt és az SQLite API-t.
// Futtatás a projekt gyökeréből: npm start
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { adatbazisMegnyitasa, receptTarolo } = require('./adatbazis');

const projektMappa = path.resolve(__dirname, '..');
const frontendMappa = path.join(projektMappa, 'frontend');
const kepekMappa = path.join(projektMappa, 'images');
const fajlTipusok = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp'
};

function jsonValasz(valasz, kod, adat, fej = false) {
    const tartalom = JSON.stringify(adat);
    valasz.writeHead(kod, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(tartalom),
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff'
    });
    valasz.end(fej ? undefined : tartalom);
}

async function fajlKuldes(valasz, teljesUtvonal, fej = false) {
    try {
        const fajl = await fs.readFile(teljesUtvonal);
        valasz.writeHead(200, {
            'Content-Type': fajlTipusok[path.extname(teljesUtvonal).toLowerCase()] || 'application/octet-stream',
            'Content-Length': fajl.length,
            'X-Content-Type-Options': 'nosniff'
        });
        valasz.end(fej ? undefined : fajl);
    } catch (hiba) {
        if (hiba.code === 'ENOENT') return jsonValasz(valasz, 404, { hiba: 'A fájl nem található.' }, fej);
        console.error('Fájlhiba:', hiba);
        jsonValasz(valasz, 500, { hiba: 'Nem sikerült betölteni az oldalt.' }, fej);
    }
}

function letrehozSzerver(adatbazis = adatbazisMegnyitasa()) {
    const tarolo = receptTarolo(adatbazis);
    const szerver = http.createServer(async (keres, valasz) => {
        const fej = keres.method === 'HEAD';
        if (keres.method !== 'GET' && !fej) {
            return jsonValasz(valasz, 405, { hiba: 'Nem támogatott művelet.' });
        }

        let utvonal;
        try {
            utvonal = new URL(keres.url, 'http://localhost');
        } catch {
            return jsonValasz(valasz, 400, { hiba: 'Hibás kérés.' }, fej);
        }
        const cim = utvonal.pathname;
        try {
            if (cim === '/api/egeszseg') {
                return jsonValasz(valasz, 200, { allapot: 'rendben', receptek: tarolo.darabszam() }, fej);
            }
            if (cim === '/api/hozzavalok') {
                return jsonValasz(valasz, 200, tarolo.hozzavalok(), fej);
            }
            if (cim === '/api/receptek') {
                return jsonValasz(valasz, 200, tarolo.listaz({
                    hozzavalok: utvonal.searchParams.get('hozzavalok') || '',
                    jellemzo: utvonal.searchParams.get('jellemzo') || '',
                    csakElkeszitheto: utvonal.searchParams.get('csakElkeszitheto') === '1'
                }), fej);
            }
            const receptId = /^\/api\/receptek\/([1-9][0-9]*)$/.exec(cim);
            if (receptId) {
                const recept = tarolo.reszletek(Number(receptId[1]), utvonal.searchParams.get('hozzavalok') || '');
                return jsonValasz(valasz, recept ? 200 : 404, recept || { hiba: 'A recept nem található.' }, fej);
            }
            if (cim.startsWith('/api/')) return jsonValasz(valasz, 404, { hiba: 'Ismeretlen API-végpont.' }, fej);

            if (cim === '/' || cim === '/index.html') return fajlKuldes(valasz, path.join(frontendMappa, 'index.html'), fej);
            if (cim === '/index.js' || cim === '/style.css') return fajlKuldes(valasz, path.join(frontendMappa, cim.slice(1)), fej);
            const kep = /^\/images\/([a-zA-Z0-9_-]+\.(?:jpg|jpeg|png|webp))$/.exec(cim);
            if (kep) return fajlKuldes(valasz, path.join(kepekMappa, kep[1]), fej);
            return jsonValasz(valasz, 404, { hiba: 'Az oldal nem található.' }, fej);
        } catch (hiba) {
            console.error('Szerverhiba:', hiba);
            return jsonValasz(valasz, 500, { hiba: 'Belső szerverhiba.' }, fej);
        }
    });
    // Tesztek és szabályos leállítás számára is elérhető.
    return { szerver, adatbazis };
}

if (require.main === module) {
    const { szerver, adatbazis } = letrehozSzerver();
    const port = Number(process.env.PORT || 3000);
    szerver.listen(port, '127.0.0.1', () => {
        console.log(`Receptkereső: http://localhost:${szerver.address().port}`);
        console.log('Adatbázis:', process.env.ADATBAZIS_UTVONAL || path.join(__dirname, 'Database', 'receptkereso.sqlite'));
    });
    const leallas = () => szerver.close(() => { adatbazis.close(); process.exit(0); });
    process.on('SIGINT', leallas);
    process.on('SIGTERM', leallas);
}

module.exports = { letrehozSzerver };
