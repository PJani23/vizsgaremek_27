const json = JSON.parse(
[
  {
    "nev": "Rántotta",
    "kep": "images/rantotta.jpg",
    "ido": 10,
    "nehezseg": "könnyű",
    "adag": 1,
    "hozzavalok": ["tojás", "só", "bors", "olaj"],
    "lepesek": [
      "A tojásokat egy tálban felverjük.",
      "Sózzuk, borsozzuk.",
      "Olajat hevítünk a serpenyőben.",
      "A tojást beleöntjük és folyamatosan keverjük.",
      "3-4 perc alatt készre sütjük."
    ],
    "tulajdonsag": [
      "egyszerű"
    ]
  },
  {
    "nev": "Palacsinta",
    "kep": "images/palacsinta.jpg",
    "ido": 25,
    "nehezseg": "közepes",
    "adag": 4,
    "hozzavalok": ["liszt", "tojás", "tej", "cukor", "olaj", "só"],
    "lepesek": [
      "A lisztet, tojást, tejet és cukrot összekeverjük.",
      "Hozzáadunk egy csipet sót.",
      "A tésztát 10 percig pihentetjük.",
      "Olajjal kikent serpenyőben kisütjük a palacsintákat."
    ],
    "tulajdonsag": [
      "egyszerű"
    ]
  }
])
const d =  document.getElementById("talatok").innerHTML
let a = 0
for (const e of json) {
    `
        <div class="recept">
            <h2>${json[e].nev}</h2>
            <img src="${json[e].kep}" alt="kep">
            <p>${json[e].lepesek}</p>
        </div>
    `
}



















