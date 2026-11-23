-- SQLite relációs adatbázis: a Node.js szerver indításkor létrehozza, ha még nem létezik.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS receptek (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nev TEXT NOT NULL UNIQUE,
    kep TEXT NOT NULL,
    ido INTEGER NOT NULL CHECK (ido > 0),
    nehezseg TEXT NOT NULL,
    adag INTEGER NOT NULL CHECK (adag > 0)
);
CREATE TABLE IF NOT EXISTS hozzavalok (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nev TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS recept_hozzavalok (
    recept_id INTEGER NOT NULL REFERENCES receptek(id) ON DELETE CASCADE,
    hozzavalo_id INTEGER NOT NULL REFERENCES hozzavalok(id),
    mennyiseg TEXT NOT NULL DEFAULT '',
    PRIMARY KEY (recept_id, hozzavalo_id)
);
CREATE TABLE IF NOT EXISTS lepesek (
    recept_id INTEGER NOT NULL REFERENCES receptek(id) ON DELETE CASCADE,
    sorszam INTEGER NOT NULL CHECK (sorszam > 0),
    szoveg TEXT NOT NULL,
    PRIMARY KEY (recept_id, sorszam)
);
CREATE TABLE IF NOT EXISTS jellemzok (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kod TEXT NOT NULL UNIQUE,
    nev TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS recept_jellemzok (
    recept_id INTEGER NOT NULL REFERENCES receptek(id) ON DELETE CASCADE,
    jellemzo_id INTEGER NOT NULL REFERENCES jellemzok(id),
    PRIMARY KEY (recept_id, jellemzo_id)
);
CREATE INDEX IF NOT EXISTS idx_recept_hozzavalok_hozzavalo ON recept_hozzavalok(hozzavalo_id);
CREATE INDEX IF NOT EXISTS idx_recept_jellemzok_jellemzo ON recept_jellemzok(jellemzo_id);
