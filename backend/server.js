const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "frontend")));

const receptek = JSON.parse(
  fs.readFileSync(path.join(__dirname, "receptek.json"), "utf8")
);

// összes recept
app.get("/receptek", (req, res) => {
  res.json(receptek);
});

// keresés hozzávalók alapján
app.post("/kereses", (req, res) => {
  const userHozzavalok = req.body.hozzavalok || [];
  const talalatok = receptek.filter(r =>
    r.hozzavalok.every(h => userHozzavalok.includes(h))
  );
  res.json(talalatok);
});

// részletes recept név alapján
app.get("/recept/:nev", (req, res) => {
  const nev = req.params.nev;
  const recept = receptek.find(r => r.nev === nev);
  if (!recept) return res.status(404).json({ error: "Nincs ilyen recept" });
  res.json(recept);
});

app.listen(3000, () => console.log("Backend fut: http://localhost:3000"));
