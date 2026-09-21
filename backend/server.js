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

async function mutasdReceptReszletek(recept) {
    const res = await fetch(`http://localhost:3000/recept/${encodeURIComponent(recept.nev)}`);
    const adat = await res.json();

    const div = document.getElementById("receptReszletek");
    div.style.display = "block";

    div.innerHTML = `
        <h2>${adat.nev}</h2>
        <img src="${adat.kep}" style="max-width:300px;border-radius:10px;">
        <p><b>Idő:</b> ${adat.ido} perc</p>
        <p><b>Nehézség:</b> ${adat.nehezseg}</p>
        <p><b>Adag:</b> ${adat.adag}</p>

        <h3>Hozzávalók</h3>
        <ul>${adat.hozzavalok.map(h => `<li>${h}</li>`).join("")}</ul>

        <h3>Lépések</h3>
        <ul>${adat.lepesek.map(l => `<li>${l}</li>`).join("")}</ul>
    `;
}
