import { json } from './server.js';


function toggleTheme() {
        document.documentElement.classList.toggle("dark");
    }

    /*const json = [
        {
            "nev": "Rántotta",
            "kep": [
                "../image/rantotta.jpg", "rantotta"
            ],
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
            "kep": [
                "../image/palacsinta.jpg", "palacsinta"
            ],
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
        }
    ];
    */
    function megjelenit() {
    const div = document.getElementById("talalatok");
    const input = document.getElementById("hozzavalokInput").value.toLowerCase();

    const keresett = input.split(',').map(x => x.trim()).filter(x => x !== "");

    div.innerHTML = "";

    if (keresett.length === 0) {
        return;
    }

    for (const e of json) {
        const talalat = keresett.every(k => e.hozzavalok.some(h => h.toLowerCase().includes(k))
        );

        if (talalat) {
            div.innerHTML += `
                <div class="recept" onclick="mutasdReceptReszletek('${e.nev}')">
                    <h3>${e.nev}</h3>
                    <img src="${e.kep[0]}" alt="${e.kep[1]}">
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

        detailDiv.style.display = "block";

        detailDiv.innerHTML = `
            <div class="detail-header">
                <img src="${recept.kep[0]}" alt="${recept.kep[1]}">
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
        // Triggered when clicking the "Find Recipes" button
async function searchRecipes() {
  // Gather checked ingredient IDs
  const selectedIngredients = Array.from(document.querySelectorAll('.ingredient-cb:checked'))
                                   .map(cb => cb.value);

  if (selectedIngredients.length === 0) {
    alert("Please select at least one ingredient!");
    return;
  }

  try {
    // Send IDs to the Node.js backend
    const response = await fetch('http://localhost:3000/api/find-recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients: selectedIngredients })
    });

    const recipes = await response.json();
    displayRecipes(recipes); // Update UI
  } catch (error) {
    console.error('Error:', error);
  }
}

function displayRecipes(recipes) {
  const container = document.getElementById('recipe-results');
  container.innerHTML = ''; 

  recipes.forEach(recipe => {
    const div = document.createElement('div');
    div.className = 'recipe-card';
    div.innerHTML = `<h3>${recipe.nev}</h3><p>Time: ${recipe.ido} mins</p>`;
    container.appendChild(div);
  });
}

    }