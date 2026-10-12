document.getElementById("napocska").addEventListener("click", function() {
    document.documentElement.classList.toggle("dark");
});

const json = [
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
    ]
  },
  {
    "nev": "Paradicsomos tészta",
    "kep": "images/paradicsomos_teszta.jpg",
    "ido": 20,
    "nehezseg": "könnyű",
    "adag": 2,
    "hozzavalok": ["tészta", "paradicsomszósz", "fokhagyma", "só", "bors", "olaj"],
    "lepesek": [
      "A tésztát sós vízben megfőzzük.",
      "Olajon megpirítjuk a fokhagymát.",
      "Hozzáadjuk a paradicsomszószt.",
      "Sózzuk, borsozzuk.",
      "A leszűrt tésztát összekeverjük a szósszal."
    ]
  },
  {
    "nev": "Bundás kenyér",
    "kep": "images/bundas_kenyer.jpg",
    "ido": 15,
    "nehezseg": "könnyű",
    "adag": 2,
    "hozzavalok": ["kenyér", "tojás", "só", "olaj"],
    "lepesek": [
      "A tojást felverjük.",
      "Sózzuk.",
      "A kenyérszeleteket belemártjuk.",
      "Olajban aranybarnára sütjük."
    ]
  },
  {
    "nev": "Sült krumpli",
    "kep": "images/sult_krumpli.jpg",
    "ido": 40,
    "nehezseg": "könnyű",
    "adag": 2,
    "hozzavalok": ["krumpli", "olaj", "só"],
    "lepesek": [
      "A krumplit meghámozzuk és felvágjuk.",
      "Olajjal meglocsoljuk.",
      "Sózzuk.",
      "200°C-on 30-35 percig sütjük."
    ]
  },
  {
    "nev": "Zöldségleves",
    "kep": "images/zoldsegleves.jpg",
    "ido": 45,
    "nehezseg": "könnyű",
    "adag": 4,
    "hozzavalok": ["répa", "krumpli", "zeller", "hagyma", "só", "bors", "víz"],
    "lepesek": [
      "A zöldségeket felvágjuk.",
      "A hagymát megpirítjuk.",
      "Hozzáadjuk a zöldségeket.",
      "Felöntjük vízzel.",
      "Fűszerezzük.",
      "40 percig főzzük."
    ]
  },
  {
    "nev": "Tejfölös uborkasaláta",
    "kep": "images/uborkasalata.jpg",
    "ido": 10,
    "nehezseg": "könnyű",
    "adag": 2,
    "hozzavalok": ["uborka", "tejföl", "só", "bors", "fokhagyma"],
    "lepesek": [
      "Az uborkát legyaluljuk.",
      "Sózzuk és állni hagyjuk.",
      "A tejfölt összekeverjük a fokhagymával.",
      "Az uborkát kinyomkodjuk.",
      "Összekeverjük a tejföllel."
    ]
  },
  {
    "nev": "Tojásos nokedli",
    "kep": "images/tojasos_nokedli.jpg",
    "ido": 30,
    "nehezseg": "közepes",
    "adag": 3,
    "hozzavalok": ["liszt", "tojás", "víz", "só", "olaj"],
    "lepesek": [
      "A lisztet, tojást és vizet összekeverjük.",
      "Sózzuk, majd nokedlit szaggatunk belőle.",
      "A nokedlit kifőzzük.",
      "A tojásokat felverjük és ráöntjük.",
      "Összesütjük."
    ]
  },
  {
    "nev": "Gulyásleves",
    "kep": "images/gulyasleves.jpg",
    "ido": 90,
    "nehezseg": "nehéz",
    "adag": 4,
    "hozzavalok": ["marhahús", "krumpli", "répa", "hagyma", "paprika", "só", "bors", "olaj"],
    "lepesek": [
      "A hagymát megdinszteljük.",
      "Hozzáadjuk a húst és megpirítjuk.",
      "Fűszerezzük.",
      "Felöntjük vízzel.",
      "Hozzáadjuk a zöldségeket.",
      "1 órán át főzzük."
    ]
  },
  {
    "nev": "Csirkepaprikás",
    "kep": "images/csirkepaprikas.jpg",
    "ido": 60,
    "nehezseg": "közepes",
    "adag": 4,
    "hozzavalok": ["csirke", "hagyma", "paprika", "tejföl", "só", "bors", "olaj"],
    "lepesek": [
      "A hagymát megpirítjuk.",
      "Hozzáadjuk a csirkét.",
      "Megszórjuk paprikával.",
      "Felöntjük vízzel.",
      "Puhára főzzük.",
      "Tejföllel behabarjuk."
    ]
  }
];

function megjelenit() {
    const div = document.getElementById("talalatok");
    const input = document.getElementById("hozzavalokInput").value.toLowerCase();
    
    const keresett = input.split(',').map(x => x.trim()).filter(x => x !== "");
    
    div.innerHTML = "";
    
    if (keresett.length === 0) {
        return;
    }
    
    for (const e of json) {
        const talalat = keresett.every(k => e.hozzavalok.some(h => h.toLowerCase().includes(k)));
    
        if (talalat) {
            div.innerHTML += `
            <div class="recept" onclick="mutasdReceptReszletek('${e.nev}')">
                <h3>${e.nev}</h3>
                <img src="${e.kep}" alt="${e.nev}">
                <div class="meta">Idő: ${e.ido} perc · Nehézség: ${e.nehezseg}</div>
                <div><b>Hozzávalók:</b> ${e.hozzavalok.join(", ")}</div>
            </div>
            `;
        }
    }
}

function mutasdReceptReszletek(nev) {
    const recept = json.find(r => r.nev === nev);
    const detailDiv = document.getElementById("receptReszletek");
    
    if (!recept) return;

    detailDiv.style.display = "block";
    
    detailDiv.innerHTML = `
        <div class="detail-header">
            <img src="${recept.kep}" alt="${recept.nev}">
            <div class="detail-info">
                <h2>${recept.nev}</h2>
                <div class="meta">Elkészítési idő: ${recept.ido} perc</div>
                <div class="meta">Nehézség: ${recept.nehezseg}</div>
                <div class="meta">Adagok száma: ${recept.adag}</div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3>Hozzávalók</h3>
            <ul>
                ${recept.hozzavalok.map(h => `<li>${h}</li>`).join("")}
            </ul>
        </div>
        
        <div class="detail-section">
            <h3>Elkészítés lépései</h3>
            <ul>
                ${recept.lepesek.map(l => `<li>${l}</li>`).join("")}
            </ul>
        </div>
    `;
}