# Selaintestit

Kevyt headless-Chrome-testipohja. Ei riippuvuuksia, ei npm:ää — sama periaate
kuin sovelluksessa itsessään. Testit ajetaan sovelluksen sisällä injektoidulla
skriptillä, ja tulokset luetaan ulos `data-probe`-attribuutista.

## Ajaminen

```bash
python3 tests/run.py                    # kaikki suitet työhakemistoa vasten
python3 tests/run.py smoke habits       # vain nimetyt
python3 tests/run.py --tree /polku/puu  # muu puu (esim. merge-tulos)
```

Vaatii Chromiumin polusta `harness.py:CHROME`. Ajo kestää ~30 s / suite.

## Suitet

| Suite | Kohde | Mitä kattaa |
|---|---|---|
| `smoke` | index | Käynnistyy, data latautuu, areena ja jono renderöityvät |
| `timer_break` | index | Fokustila, taukobanneri, eise-kahva, vaihesiirtymät |
| `habits` | index | 2 min -sääntö, 1-3-5-budjetti, keskeytysparkki |
| `edit_modal` | index | Muokkausmodaalin tilanapit (tehty/odottaa/palautukset) |
| `regression` | index | Tehdyt-modaali (palauta/poista), ICS-päivämäärä |
| `aamu` | aamu | Pikatehtävien suodatus, 1-3-5-mittari |
| `aamu_skip` | aamu | Ohitus ei pyyhi eilistä sammakkoa |
| `swipe` | swipe | Pakan suodatus, muokkauksen tallennus, näppäinoikopolut |

## Suitejen kirjoittaminen

`tests/suites/*.js`, ensimmäinen rivi `// target: index|aamu|swipe`.
Runko ajetaan sivun sisällä, käytössä `ok(nimi, ehto, lisätieto)`.

Asynkroninen suite (tarvitsee odottaa CSS-siirtymiä) kirjoittaa `data-probe`n
itse ja päättyy `return;`iin — malli `timer_break.js`.

Testidata siemenetään `seed.py`:llä `localStorage`iin ennen sovelluksen
skriptejä. Siemenen tehtävä id 7 on pikatehtävä (`est:0`), id 1 sammakko,
id 9 odottava, id 10 valmis.

## Mitä tämä EI kata

Headless-ajolla on kaksi todennettua rajoitetta — älä tulkitse niitä bugeiksi:

- **`visibility` ei palaudu** kun tilaluokka poistetaan. Sama ilmiö on
  `main`issa. Palautussuunta todennetaan luokasta, ei lasketusta tyylistä.
- **Kuvakaappaus ei todenna teematyötä.** Rikkinäiset komponentit ovat
  modaaleissa eivätkä näy areenanäkymässä.

Firebase-riippuvaiset polut (kirjautuminen, työtilan vaihto pilvessä,
Firestore-synkka) eivät ole testattavissa täällä lainkaan — ne ovat
manuaalilistalla.
