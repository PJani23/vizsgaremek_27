A Receptkereső egy webalkalmazás, amely segít eldönteni, hogy a felhasználó milyen ételeket tud elkészíteni az otthon található hozzávalókból.
A rendszer összeveti a megadott alapanyagokat az adatbázisban tárolt receptekkel, és megjeleníti azokat, amelyek elkészíthetők — illetve jelzi, ha bizonyos hozzávalók hiányoznak.

A receptre kattintva egy részletes nézet jelenik meg, amely tartalmazza:

recept neve

kép

elkészítési idő

nehézség

adagok száma

hozzávalók listája

elkészítés lépései

mely hozzávalók vannak meg

mely hozzávalók hiányoznak


A backend feladata:

a receptek beolvasása a receptek.json fájlból

API végpontok biztosítása a frontend számára

hozzávaló-alapú keresés

részletes receptadatok visszaadása


A frontend feladata:

felhasználói felület megjelenítése

hozzávalók bekérése

találatok listázása

receptkártyák kattinthatósága

részletes receptnézet megjelenítése

dark mode támogatás

A frontend a backendhez fetch kérésekkel kapcsolódik.
