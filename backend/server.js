const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json());

// JSON beolvasása
const receptek = JSON.parse(fs.readFileSync("./data/receptek.json", "utf8"));

// Összes recept lekérése
app.get("/receptek", (req, res) => {
    res.json(receptek);
});

// Keresés hozzávalók alapján
app.post("/kereses", (req, res) => {
    const userHozzavalok = req.body.hozzavalok;

    const talalatok = receptek.filter(r =>
        r.hozzavalok.every(h => userHozzavalok.includes(h))
    );

    res.json(talalatok);
});

// Egy recept részletes adatai ID alapján
app.get("/recept/:nev", (req, res) => {
    const nev = req.params.nev;
    const recept = receptek.find(r => r.nev === nev);

    if (!recept) return res.status(404).json({ error: "Nincs ilyen recept" });

    res.json(recept);
});

app.listen(3000, () => console.log("Backend fut a 3000-es porton"));
