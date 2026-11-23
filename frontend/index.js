'use strict';

// A receptek a /api/receptek végpontról érkeznek, nem a böngészőbe írt JSON-listából.
const hozzavalokBevitel = document.getElementById('hozzavalokInput');
const talalatokDoboz = document.getElementById('talalatok');
const keresesAllapot = document.getElementById('keresesAllapot');
const reszletekDoboz = document.getElementById('receptReszletek');
const bevasarloPanel = document.getElementById('bevasarloPanel');
const bevasarloTetelek = document.getElementById('bevasarloTetelek');

let aktivJellemzo = '';
let kedvencNezet = false;
let legutobbiReceptek = [];
let aktivRecept = null;
let lekeresSorszam = 0;

function betoltTaroltAdat(kulcs, alap) {
    try {
        const adat = JSON.parse(localStorage.getItem(kulcs));
        return Array.isArray(adat) ? adat : alap;
    } catch { return alap; }
}
function tarolas(kulcs, ertek) {
    try { localStorage.setItem(kulcs, JSON.stringify(ertek)); }
    catch { keresesAllapot.textContent = 'A böngésző nem engedélyezi a helyi mentést.'; }
}
let kedvencek = betoltTaroltAdat('receptkereso_kedvencek', []);
let bevasarloLista = betoltTaroltAdat('receptkereso_bevasarlo', []);

function elem(cimke, osztaly = '', szoveg = '') {
    const uj = document.createElement(cimke);
    if (osztaly) uj.className = osztaly;
    if (szoveg !== '') uj.textContent = szoveg;
    return uj;
}
function gomb(szoveg, kattintas, osztaly = '') {
    const uj = elem('button', osztaly, szoveg);
    uj.type = 'button';
    uj.addEventListener('click', kattintas);
    return uj;
}
function hozzavalokSzovege() { return hozzavalokBevitel.value.trim(); }
function keresettVan() { return hozzavalokSzovege().split(',').some(s => s.trim().length > 0); }

async function apiLekeres(cim) {
    const valasz = await fetch(cim, { headers: { Accept: 'application/json' } });
    if (!valasz.ok) throw new Error(`A szerver ${valasz.status} hibát adott.`);
    return valasz.json();
}

function szurokFrissitese() {
    document.querySelectorAll('[data-jellemzo]').forEach(kapcsolo => {
        const aktiv = kapcsolo.dataset.jellemzo === aktivJellemzo;
        kapcsolo.classList.toggle('toggle', aktiv);
        kapcsolo.setAttribute('aria-pressed', String(aktiv));
    });
    const kedvencGomb = document.getElementById('kedvencekGomb');
    kedvencGomb.classList.toggle('kivalasztott', kedvencNezet);
    kedvencGomb.setAttribute('aria-pressed', String(kedvencNezet));
}

async function receptekBetoltese() {
    const sajatSorszam = ++lekeresSorszam;
    keresesAllapot.textContent = 'Receptek betöltése…';
    talalatokDoboz.replaceChildren();
    reszletekDoboz.hidden = true;
    aktivRecept = null;
    szurokFrissitese();
    const parameterek = new URLSearchParams({
        hozzavalok: hozzavalokSzovege(),
        jellemzo: aktivJellemzo,
        csakElkeszitheto: document.getElementById('csakElkeszitheto').checked ? '1' : '0'
    });
    try {
        const receptek = await apiLekeres(`/api/receptek?${parameterek}`);
        if (sajatSorszam !== lekeresSorszam) return;
        legutobbiReceptek = receptek;
        kartyakMegjelenitese();
    } catch (hiba) {
        if (sajatSorszam !== lekeresSorszam) return;
        keresesAllapot.textContent = `Nem sikerült kapcsolódni az adatbázis-szerverhez. ${hiba.message}`;
    }
}

function kedvencValtas(azonosito) {
    if (kedvencek.includes(azonosito)) kedvencek = kedvencek.filter(szam => szam !== azonosito);
    else kedvencek.push(azonosito);
    tarolas('receptkereso_kedvencek', kedvencek);
    kartyakMegjelenitese();
    if (aktivRecept) reszletekMegjelenitese(aktivRecept);
}

function kartyakMegjelenitese() {
    talalatokDoboz.replaceChildren();
    const receptek = kedvencNezet
        ? legutobbiReceptek.filter(recept => kedvencek.includes(recept.id))
        : legutobbiReceptek;
    if (!receptek.length) {
        keresesAllapot.textContent = kedvencNezet
            ? 'Nincs a szűrésnek megfelelő kedvenc recept.'
            : 'Nincs találat. Próbálj más hozzávalókat vagy kategóriát!';
        return;
    }
    keresesAllapot.textContent = `${receptek.length} recept található${kedvencNezet ? ' a kedvencek között' : ''}.`;
    const tordeles = document.createDocumentFragment();
    for (const recept of receptek) {
        const kartya = elem('article', 'recept');
        const kep = elem('img', 'recept-kep');
        kep.src = `/${recept.kep}`;
        kep.alt = recept.nev;
        kep.loading = 'lazy';
        kartya.append(kep, elem('h3', '', recept.nev));
        kartya.append(elem('p', 'meta', `${recept.ido} perc · ${recept.nehezseg} · ${recept.adag} adag`));
        kartya.append(elem('p', 'kartyahozzavalok', recept.hozzavalok.join(', ')));
        if (keresettVan()) {
            kartya.append(elem('p', recept.elkeszitheto ? 'siker' : 'hiany',
                recept.elkeszitheto ? '✓ Minden hozzávaló megvan' : `Megvan: ${recept.megvannak.length} · Hiányzik: ${recept.hianyoznak.length}`));
        }
        const muveletek = elem('div', 'kartya-muveletek');
        muveletek.append(gomb('Részletek', () => reszletekBetoltese(recept.id), 'reszlet-gomb'));
        const kedvenc = kedvencek.includes(recept.id);
        const kedvencKapcsolo = gomb(kedvenc ? '♥' : '♡', () => kedvencValtas(recept.id), 'kedvenc-kapcsolo');
        kedvencKapcsolo.setAttribute('aria-label', kedvenc ? `${recept.nev} eltávolítása a kedvencekből` : `${recept.nev} a kedvencekhez`);
        kedvencKapcsolo.title = kedvenc ? 'Kedvenc eltávolítása' : 'Kedvencekhez';
        muveletek.append(kedvencKapcsolo);
        kartya.append(muveletek);
        tordeles.append(kartya);
    }
    talalatokDoboz.append(tordeles);
}

async function reszletekBetoltese(azonosito) {
    try {
        const parameterek = new URLSearchParams({ hozzavalok: hozzavalokSzovege() });
        aktivRecept = await apiLekeres(`/api/receptek/${azonosito}?${parameterek}`);
        bevasarloPanel.hidden = true;
        reszletekMegjelenitese(aktivRecept);
        reszletekDoboz.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (hiba) {
        keresesAllapot.textContent = `Nem sikerült megnyitni a receptet. ${hiba.message}`;
    }
}

function reszletekMegjelenitese(recept) {
    reszletekDoboz.replaceChildren();
    reszletekDoboz.hidden = false;
    const fejlec = elem('div', 'panel-fejlec');
    fejlec.append(elem('h2', '', recept.nev), gomb('Bezárás', () => {
        reszletekDoboz.hidden = true;
        aktivRecept = null;
    }, 'btn kis-gomb'));
    reszletekDoboz.append(fejlec);
    const adatok = elem('div', 'detail-header');
    const kep = elem('img');
    kep.src = `/${recept.kep}`;
    kep.alt = recept.nev;
    const info = elem('div', 'detail-info');
    info.append(elem('p', 'meta', `Elkészítési idő: ${recept.ido} perc`));
    info.append(elem('p', 'meta', `Nehézség: ${recept.nehezseg}`));
    info.append(elem('p', 'meta', `Adagok száma: ${recept.adag}`));
    info.append(gomb(kedvencek.includes(recept.id) ? '♥ Kedvenc eltávolítása' : '♡ Kedvencekhez', () => kedvencValtas(recept.id), 'btn reszlet-kedvenc'));
    adatok.append(kep, info);
    reszletekDoboz.append(adatok);

    const hozzavalokSzakasz = elem('div', 'detail-section');
    hozzavalokSzakasz.append(elem('h3', '', 'Hozzávalók'));
    const lista = elem('ul');
    for (const nev of recept.hozzavalok) {
        const meglevo = keresettVan() && recept.megvannak.includes(nev);
        const hianyzik = keresettVan() && recept.hianyoznak.includes(nev);
        lista.append(elem('li', meglevo ? 'siker' : hianyzik ? 'hiany' : '',
            `${nev}${meglevo ? ' ✓ megvan' : hianyzik ? ' – hiányzik' : ''}`));
    }
    hozzavalokSzakasz.append(lista);
    const listaTetelek = keresettVan() ? recept.hianyoznak : recept.hozzavalok;
    if (listaTetelek.length) {
        hozzavalokSzakasz.append(gomb(keresettVan() ? 'Hiányzók a bevásárlólistára' : 'Hozzávalók a bevásárlólistára', () => {
            listaTetelek.forEach(bevasarlasHozzaadasa);
            bevasarlasMegjelenitese();
            bevasarloPanel.hidden = false;
            bevasarloPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 'lista-hozzaadas'));
    }
    reszletekDoboz.append(hozzavalokSzakasz);

    const lepesekSzakasz = elem('div', 'detail-section');
    lepesekSzakasz.append(elem('h3', '', 'Elkészítés lépései'));
    const lepesek = elem('ol');
    for (const lepes of recept.lepesek) lepesek.append(elem('li', '', lepes));
    lepesekSzakasz.append(lepesek);
    reszletekDoboz.append(lepesekSzakasz);
}

function bevasarlasHozzaadasa(nev) {
    const tisztitott = String(nev).trim();
    if (!tisztitott) return;
    if (!bevasarloLista.some(item => item.toLocaleLowerCase('hu-HU') === tisztitott.toLocaleLowerCase('hu-HU'))) {
        bevasarloLista.push(tisztitott);
        tarolas('receptkereso_bevasarlo', bevasarloLista);
    }
}
function bevasarlasMegjelenitese() {
    bevasarloTetelek.replaceChildren();
    document.getElementById('uresLista').textContent = bevasarloLista.length ? '' : 'Még nincs semmi a bevásárlólistán.';
    bevasarloLista.forEach((nev, index) => {
        const sor = elem('li');
        sor.append(elem('span', '', nev), gomb('Törlés', () => {
            bevasarloLista.splice(index, 1);
            tarolas('receptkereso_bevasarlo', bevasarloLista);
            bevasarlasMegjelenitese();
        }, 'btn kis-gomb'));
        bevasarloTetelek.append(sor);
    });
}

document.getElementById('keresoUrlap').addEventListener('submit', esemeny => {
    esemeny.preventDefault();
    receptekBetoltese();
});
document.getElementById('csakElkeszitheto').addEventListener('change', receptekBetoltese);
document.querySelectorAll('[data-jellemzo]').forEach(kapcsolo => {
    kapcsolo.addEventListener('click', () => {
        aktivJellemzo = aktivJellemzo === kapcsolo.dataset.jellemzo ? '' : kapcsolo.dataset.jellemzo;
        receptekBetoltese();
    });
});
document.getElementById('kedvencekGomb').addEventListener('click', () => {
    kedvencNezet = !kedvencNezet;
    szurokFrissitese();
    kartyakMegjelenitese();
});
document.getElementById('bevasarlasGomb').addEventListener('click', () => {
    bevasarloPanel.hidden = !bevasarloPanel.hidden;
    bevasarlasMegjelenitese();
    if (!bevasarloPanel.hidden) bevasarloPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
document.getElementById('listaBezar').addEventListener('click', () => { bevasarloPanel.hidden = true; });
document.getElementById('listaUrlap').addEventListener('submit', esemeny => {
    esemeny.preventDefault();
    const mező = document.getElementById('ujTetel');
    bevasarlasHozzaadasa(mező.value);
    mező.value = '';
    bevasarlasMegjelenitese();
});

function temaFrissitese() {
    const sotet = document.documentElement.classList.contains('dark');
    document.getElementById('napocska').textContent = sotet ? '☀️ Világos mód' : '🌙 Sötét mód';
}
try {
    if (localStorage.getItem('receptkereso_sotet') === '1') document.documentElement.classList.add('dark');
} catch { /* helyi tárhely nélkül is működik az oldal */ }
temaFrissitese();
document.getElementById('napocska').addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    try { localStorage.setItem('receptkereso_sotet', document.documentElement.classList.contains('dark') ? '1' : '0'); }
    catch { /* a beállítás csak erre a munkamenetre marad meg */ }
    temaFrissitese();
});

receptekBetoltese();
