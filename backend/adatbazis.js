'use strict';

// A szerver ugyanazt az SQLite adatbázist használja minden kéréshez.
// A táblákat és a mintaadatokat csak első indításkor hozza létre.
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const adatbazisMappa = path.join(__dirname, 'Database');
const alapAdatbazis = path.join(adatbazisMappa, 'receptkereso.sqlite');

function adatbazisMegnyitasa(utvonal = process.env.ADATBAZIS_UTVONAL || alapAdatbazis) {
    fs.mkdirSync(path.dirname(utvonal), { recursive: true });
    const adatbazis = new DatabaseSync(utvonal);
    adatbazis.exec('PRAGMA foreign_keys = ON;');
    adatbazis.exec('PRAGMA busy_timeout = 5000;');
    adatbazis.exec(fs.readFileSync(path.join(adatbazisMappa, 'sema.sql'), 'utf8'));

    const darab = adatbazis.prepare('SELECT COUNT(*) AS darab FROM receptek').get().darab;
    if (darab === 0) {
        try {
            adatbazis.exec('BEGIN IMMEDIATE;');
            adatbazis.exec(fs.readFileSync(path.join(adatbazisMappa, 'alapadatok.sql'), 'utf8'));
            adatbazis.exec('COMMIT;');
        } catch (hiba) {
            if (adatbazis.isTransaction) adatbazis.exec('ROLLBACK;');
            adatbazis.close();
            throw hiba;
        }
    }
    return adatbazis;
}

function egyszerusit(szoveg) {
    const normalizalt = String(szoveg || '').normalize('NFC').trim().toLocaleLowerCase('hu-HU');
    const szinonimak = {
        'burgonya': 'krumpli',
        'sárgarépa': 'répa',
        'vöröshagyma': 'hagyma',
        'étolaj': 'olaj',
        'feketebors': 'bors',
        'csirkehús': 'csirke'
    };
    return szinonimak[normalizalt] || normalizalt;
}

function hozzavalokFeldolgozasa(szoveg) {
    return [...new Set(String(szoveg || '').split(',').map(egyszerusit).filter(Boolean))].slice(0, 100);
}

function receptTarolo(adatbazis) {
    const receptekKeresese = adatbazis.prepare('SELECT id, nev, kep, ido, nehezseg, adag FROM receptek ORDER BY nev COLLATE NOCASE, id');
    const receptLekerese = adatbazis.prepare('SELECT id, nev, kep, ido, nehezseg, adag FROM receptek WHERE id = ?');
    const hozzavalokLekerese = adatbazis.prepare(`
        SELECT h.nev, rh.mennyiseg FROM recept_hozzavalok rh
        JOIN hozzavalok h ON h.id = rh.hozzavalo_id
        WHERE rh.recept_id = ? ORDER BY h.nev COLLATE NOCASE`);
    const jellemzokLekerese = adatbazis.prepare(`
        SELECT j.kod FROM recept_jellemzok rj JOIN jellemzok j ON j.id = rj.jellemzo_id
        WHERE rj.recept_id = ? ORDER BY j.kod`);
    const lepesekLekerese = adatbazis.prepare('SELECT szoveg FROM lepesek WHERE recept_id = ? ORDER BY sorszam');
    const osszesHozzavalo = adatbazis.prepare('SELECT nev FROM hozzavalok ORDER BY nev COLLATE NOCASE');

    function atalakit(recept, megadott, reszletes = false) {
        const hozzavalok = hozzavalokLekerese.all(recept.id);
        const megtalalt = hozzavalok.filter(h => megadott.includes(egyszerusit(h.nev))).map(h => h.nev);
        const hianyzok = hozzavalok.filter(h => !megadott.includes(egyszerusit(h.nev))).map(h => h.nev);
        return {
            ...recept,
            hozzavalok: hozzavalok.map(h => h.nev),
            mennyisegek: hozzavalok,
            jellemzok: jellemzokLekerese.all(recept.id).map(j => j.kod),
            megvannak: megadott.length ? megtalalt : [],
            hianyoznak: megadott.length ? hianyzok : [],
            elkeszitheto: megadott.length > 0 && hianyzok.length === 0,
            ...(reszletes ? { lepesek: lepesekLekerese.all(recept.id).map(l => l.szoveg) } : {})
        };
    }

    return {
        listaz({ hozzavalok = '', jellemzo = '', csakElkeszitheto = false } = {}) {
            const megadott = hozzavalokFeldolgozasa(hozzavalok);
            const jellemzoKod = String(jellemzo || '').trim().toLocaleLowerCase('hu-HU');
            if (csakElkeszitheto && !megadott.length) return [];
            return receptekKeresese.all()
                .map(r => atalakit(r, megadott))
                .filter(r => !jellemzoKod || r.jellemzok.includes(jellemzoKod))
                .filter(r => !csakElkeszitheto || r.elkeszitheto)
                .sort((a, b) => megadott.length
                    ? (a.hianyoznak.length - b.hianyoznak.length || b.megvannak.length - a.megvannak.length || a.nev.localeCompare(b.nev, 'hu'))
                    : a.nev.localeCompare(b.nev, 'hu'));
        },
        reszletek(azonosito, hozzavalok = '') {
            const recept = receptLekerese.get(azonosito);
            if (!recept) return null;
            return atalakit(recept, hozzavalokFeldolgozasa(hozzavalok), true);
        },
        hozzavalok: () => osszesHozzavalo.all().map(h => h.nev),
        darabszam: () => adatbazis.prepare('SELECT COUNT(*) AS darab FROM receptek').get().darab
    };
}

module.exports = { adatbazisMegnyitasa, receptTarolo, hozzavalokFeldolgozasa };
