# Receptkereső – javított vizsgaremek

Az eredeti weboldal javított, működő változata. **Nem újraírt nagy rendszer**: az eredeti 10 magyar receptet és az eredeti dizájn alapját tartalmazza. A receptek a **SQLite-adatbázisban** vannak, és a böngésző a Node.js backend **API-ján** keresztül tölti be őket `fetch` hívásokkal.

## Indítás Windowson

1. Telepítsd a **Node.js 24 LTS** verziót (minimum **Node.js 22.13** szükséges a beépített SQLite-hoz).
2. Csomagold ki a ZIP-et.
3. Kattints duplán az **`inditas.bat`** fájlra, vagy nyisd meg a projektet VS Code-ban, és írd be a terminálba:

   ```bash
   npm start
   ```

4. Nyisd meg a **http://localhost:3000** oldalt.

**Fontos:** ne a `frontend/index.html` fájlt nyisd meg dupla kattintással (`file://`), mert az API-hoz futnia kell a szervernek.

Nincs szükség MySQL/MariaDB telepítésére, `npm install` futtatására vagy internetkapcsolatra. Az adatbázist a Node.js szerver kezeli, ezért az adatbázisnak külön szolgáltatása nem fut. (Ez egy valódi, fájlalapú SQL-adatbázis.)

## Mi lett javítva?

- Valóban futó **HTTP-szerver** (`backend/server.js`) és SQLite-kapcsolat (`backend/adatbazis.js`).
- A receptek nem JavaScript-tömbből és nem JSON-fájlból jönnek, hanem a `backend/Database/receptkereso.sqlite` adatbázisból.
- Javítva a hibás képutak és a receptkártyák/részletes nézet megnyitása.
- Működik a hozzávaló szerinti keresés; látszanak a meglévő és hiányzó hozzávalók.
- Működik a „Csak elkészíthető” jelölőnégyzet, az öt kategóriagomb és a sötét mód.
- Működik a korábbi felületen már szereplő kedvencek és bevásárlólista: ezek **a böngésző helyi tárhelyében** mentődnek, nem az SQLite-ban. Nincs felhasználói fiók ebben a feltöltött projektben.
- Magyar változó- és függvénynevek a saját kódban; külön tesztek.

## Adatbázis

A fájl: `backend/Database/receptkereso.sqlite`

SQL struktúra: `backend/Database/sema.sql`

Alapadatok: `backend/Database/alapadatok.sql`

Táblák: `receptek`, `hozzavalok`, `recept_hozzavalok`, `lepesek`, `jellemzok`, `recept_jellemzok`.

Az adatbázis már a ZIP-ben található. Ha törlöd a `.sqlite` fájlt, **a szerver újra létrehozza az eredeti 10 recepttel** az SQL-fájlok alapján. Fontos: ezzel elveszhetnek a kézzel hozzáadott adatbázis-módosításaid, ezért mindig készíts biztonsági másolatot a `.sqlite` fájlról.

Receptek hozzáadása SQLite-kezelő programmal (például DB Browser for SQLite) történhet. A kapcsolótáblák miatt egy recepthez hozzávalók, elkészítési lépések és jellemzők is tartoznak. Ha a kezdőállomány receptjeit változtatnád meg, módosítsd az `alapadatok.sql` fájlt is, különben új adatbázis létrehozásakor a korábbi 10 recept kerül vissza.

**Az eredeti `Documentains/Database.txt` a korábbi MySQL-adatbázistervet tartalmazza, nem a jelenlegi futó SQLite-adatbázis szerkezetét.** A futó rendszerhez a `sema.sql` mérvadó.

## API

| Kérés | Eredmény |
|---|---|
| `GET /api/egeszseg` | szerver állapota és receptek száma |
| `GET /api/hozzavalok` | összes ismert hozzávaló |
| `GET /api/receptek` | összes recept és rövid adatok |
| `GET /api/receptek?hozzavalok=tojás,só,olaj` | találatok meglévő/hiányzó hozzávalókkal |
| `GET /api/receptek?jellemzo=gyors` | adott kategória |
| `GET /api/receptek?hozzavalok=tojás,só,olaj&csakElkeszitheto=1` | csak elkészíthető receptek |
| `GET /api/receptek/1` | az 1-es recept részletes adatai |

Kategóriakódok: `gyors`, `teszta`, `egeszseges`, `desszert`, `olcso`.

## Tesztek

A projekt gyökerében:

```bash
npm test
```

12 automatikus teszt ellenőrzi az API-t, a keresést, a kategóriákat, a képfájlok kiszolgálását, az adatbázis tartósságát és a védett fájlok elérhetetlenségét. A böngésző kezelőfelületét külön ellenőrzés során is teszteltük (helyi hálózati korlátozás miatt előzetesen lekért API-adatokkal).

## Szerver/port módosítása

Alapport: **3000**, cím: **http://localhost:3000**. Ha foglalt a port:

Windows PowerShell:

```powershell
$env:PORT=3001; npm start
```

A `http://localhost:3001` címet kell megnyitni. Az adatbázis helye az `ADATBAZIS_UTVONAL` környezeti változóval változtatható meg.

Ez a változat **helyi, iskolai bemutatásra** készült. Nem nyilvános internetre kihelyezett, több felhasználós szolgáltatás.
