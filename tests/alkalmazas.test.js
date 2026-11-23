'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { adatbazisMegnyitasa, receptTarolo } = require('../backend/adatbazis');
const { letrehozSzerver } = require('../backend/server');

const ideiglenesMappa = fs.mkdtempSync(path.join(os.tmpdir(), 'receptkereso-teszt-'));
const adatbazisUtvonal = path.join(ideiglenesMappa, 'receptkereso.sqlite');
let adatbazis;
let szerver;
let alapCim;

before(async () => {
    adatbazis = adatbazisMegnyitasa(adatbazisUtvonal);
    ({ szerver } = letrehozSzerver(adatbazis));
    await new Promise(megold => szerver.listen(0, '127.0.0.1', megold));
    alapCim = `http://127.0.0.1:${szerver.address().port}`;
});
after(async () => {
    await new Promise(megold => szerver.close(megold));
    adatbazis.close();
    fs.rmSync(ideiglenesMappa, { recursive: true, force: true });
});

async function leker(cim) {
    const valasz = await fetch(alapCim + cim);
    return { valasz, adat: await valasz.json() };
}

test('Automatikusan létrejön az SQLite-adatbázis és a 10 eredeti recept', () => {
    assert.equal(receptTarolo(adatbazis).darabszam(), 10);
    assert.ok(fs.existsSync(adatbazisUtvonal));
});

test('Az API válasza és a magyar szövegek helyesek', async () => {
    const { valasz, adat } = await leker('/api/receptek');
    assert.equal(valasz.status, 200);
    assert.equal(adat.length, 10);
    assert.ok(adat.some(r => r.nev === 'Gulyásleves'));
    assert.ok(adat.every(r => r.kep.startsWith('images/')));
});

test('A hozzávaló-alapú keresés külön jelzi a meglévő és a hiányzó hozzávalókat', async () => {
    const { adat } = await leker('/api/receptek?hozzavalok=toj%C3%A1s%2C%20s%C3%B3%2C%20bors%2C%20olaj');
    const rantotta = adat.find(r => r.nev === 'Rántotta');
    assert.equal(rantotta.elkeszitheto, true);
    assert.deepEqual(rantotta.hianyoznak, []);
    assert.equal(rantotta.megvannak.length, 4);
    const palacsinta = adat.find(r => r.nev === 'Palacsinta');
    assert.ok(palacsinta.hianyoznak.includes('tej'));
    assert.equal(adat[0].hianyoznak.length, 0);
});

test('A csak elkészíthető szűrő helyesen működik', async () => {
    const { adat } = await leker('/api/receptek?hozzavalok=toj%C3%A1s%2Cs%C3%B3%2Cbors%2Colaj&csakElkeszitheto=1');
    assert.ok(adat.length > 0);
    assert.ok(adat.every(r => r.elkeszitheto));
    const ures = await leker('/api/receptek?csakElkeszitheto=1');
    assert.deepEqual(ures.adat, []);
});

test('A kategóriagombok adatbázisból szűrnek', async () => {
    const { adat } = await leker('/api/receptek?jellemzo=desszert');
    assert.deepEqual(adat.map(r => r.nev), ['Palacsinta']);
    const gyors = await leker('/api/receptek?jellemzo=gyors');
    assert.ok(gyors.adat.some(r => r.nev === 'Rántotta'));
});

test('A burgonya szó is felismerhető a krumpli szinonimájaként', async () => {
    const { adat } = await leker('/api/receptek?hozzavalok=burgonya%2Cs%C3%B3%2Colaj');
    const sult = adat.find(r => r.nev === 'Sült krumpli');
    assert.equal(sult.elkeszitheto, true);
});

test('Részletes nézet: lépések, adagok, hozzávalók és kép', async () => {
    const { valasz, adat } = await leker('/api/receptek/1?hozzavalok=toj%C3%A1s');
    assert.equal(valasz.status, 200);
    assert.equal(adat.nev, 'Rántotta');
    assert.equal(adat.adag, 1);
    assert.equal(adat.lepesek.length, 5);
    assert.ok(adat.megvannak.includes('tojás'));
    assert.ok(adat.hianyoznak.includes('só'));
});

test('Nem létező receptre 404 hiba érkezik', async () => {
    const { valasz } = await leker('/api/receptek/999999');
    assert.equal(valasz.status, 404);
});

test('Hozzávalók felsorolása és állapotvégpont', async () => {
    const hozza = await leker('/api/hozzavalok');
    const statusz = await leker('/api/egeszseg');
    assert.ok(hozza.adat.includes('tojás'));
    assert.equal(statusz.adat.allapot, 'rendben');
    assert.equal(statusz.adat.receptek, 10);
});

test('A frontend és minden recept képe a szerverről betöltődik', async () => {
    const oldal = await fetch(alapCim + '/');
    assert.equal(oldal.status, 200);
    assert.match(await oldal.text(), /Receptkeresés/);
    for (const fajl of ['/index.js', '/style.css', '/images/rantotta.jpg', '/images/paradicsomosteszta.jpg']) {
        const valasz = await fetch(alapCim + fajl);
        assert.equal(valasz.status, 200, fajl);
    }
});

test('Belső backend- és adatbázisfájlok nem érhetők el a weben', async () => {
    for (const utvonal of ['/backend/server.js', '/backend/Database/receptkereso.sqlite', '/images/../backend/server.js']) {
        const valasz = await fetch(alapCim + utvonal);
        assert.equal(valasz.status, 404, utvonal);
    }
});

test('A helyi SQLite-adatok újranyitás után is megmaradnak', () => {
    adatbazis.exec("INSERT INTO receptek(nev,kep,ido,nehezseg,adag) VALUES ('Teszt recept','images/rantotta.jpg',5,'könnyű',1)");
    const ujAdatbazis = adatbazisMegnyitasa(adatbazisUtvonal);
    try {
        assert.equal(receptTarolo(ujAdatbazis).darabszam(), 11);
    } finally {
        ujAdatbazis.close();
    }
});
