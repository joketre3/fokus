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

`shared_block` on esitarkistus (ei selainajoa): se vertaa jaetut lohkot merkki
merkiltä. Lohkot on kopioitu useaan tiedostoon single-file-rajoitteen takia,
joten ajautuminen on tehtävä näkyväksi — muokkaa **kaikkia** kopioita tai
tarkistus kaatuu.

| Lohko | Tiedostot |
|---|---|
| `fokus:edit-modal v1` | `aamu.html`, `swipe.html` |
| `fokus:sched v1` | `index.html`, `aamu.html`, `swipe.html` |

## Suitet

| Suite | Kohde | Mitä kattaa |
|---|---|---|
| `smoke` | index | Käynnistyy, data latautuu, areena ja jono renderöityvät |
| `timer_break` | index | Fokustila, taukobanneri, eise-kahva, vaihesiirtymät |
| `habits` | index | 2 min -sääntö, 1-3-5-budjetti, keskeytysparkki |
| `shared_block` | aamu + swipe | Jaettu edit-modal-lohko on merkki merkiltä sama molemmissa |
| `edit_modal` | index | Muokkausmodaalin tilanapit (tehty/odottaa/palautukset) |
| `edit_modal_aamu` | aamu | Jaettu muokkausmodaali velhon vaiheissa 1–2 |
| `edit_modal_swipe` | swipe | Jaettu muokkausmodaali korttiselauksessa |
| `popup_back` | swipe | Paluu pääsovellukseen (close + varmistus historian kautta) |
| `popup_back_aamu` | aamu | Sama velhon näytölle 5 ja «Ohita aamusuunnittelu» |
| `regression` | index | Tehdyt-modaali (palauta/poista), ICS-päivämäärä |
| `aamu` | aamu | Pikatehtävien suodatus, 1-3-5-mittari |
| `aamu_skip` | aamu | Ohitus ei pyyhi eilistä sammakkoa |
| `swipe` | swipe | Pakan suodatus, muokkauksen tallennus, näppäinoikopolut |
| `hand_order` | index | Käden järjestys seuraa `t.orderia`, `HAND_MAX` yksi luku |
| `scheduled` | index | Myöhästyneiden ajastusten vapautus, ajastusrivi, Ajastetut-kategoria |
| `sched_aamu` | aamu | Velho vapauttaa erääntyneet; tänään ilmestyvä on suunniteltavissa |
| `sched_swipe` | swipe | Pakka näyttää ajastetut tilamerkinnällä, vapauttaa erääntyneet |
| `card_zones` | index | Kortin rajausvyöhykkeet: viuhkan ja radan geometria, Frankenstein-kortin ylivuoto |

## Suitejen kirjoittaminen

`tests/suites/*.js`, ensimmäinen rivi `// target: index|aamu|swipe`.
Runko ajetaan sivun sisällä, käytössä `ok(nimi, ehto, lisätieto)`.

Asynkroninen suite (tarvitsee odottaa CSS-siirtymiä) kirjoittaa `data-probe`n
itse ja päättyy `return;`iin — malli `timer_break.js`.

Testidata siemenetään `seed.py`:llä `localStorage`iin ennen sovelluksen
skriptejä. Siemenen tehtävä id 7 on pikatehtävä (`est:0`), id 1 sammakko,
id 9 odottava, id 10 valmis.

Suite voi valita siemenen rivillä `// seed: <nimi>` heti target-rivin jälkeen:

| Siemen | Sisältö |
|---|---|
| `default` | `TASKS` — 10 tavallista tehtävää (oletus, ei tarvitse merkitä) |
| `frank` | **Frankenstein-kortti**: jokainen kenttä äärimmillään (pisin verbi `Aikatauluta`, `est:8`, toistuva ajastus, projekti, linkki, kaksirivinen lisätieto, sammakko + tähti) viidessä kappaleessa, jotta maksimikortti osuu areenalle, radalle JA käteen yhtä aikaa |

Frankenstein on Paquetten *Game Cards 101* -menetelmä: kehys mitoitetaan
äärimmäisen sisällön mukaan, ennen kuin visuaali lukitaan. Uusi kortin
kenttä lisätään siis myös `frank()`iin — muuten ylivuoto löytyy vasta
käyttäjän datasta.

## Mitä tämä EI kata

Headless-ajolla on kaksi todennettua rajoitetta — älä tulkitse niitä bugeiksi:

- **`visibility` ei palaudu** kun tilaluokka poistetaan. Sama ilmiö on
  `main`issa. Palautussuunta todennetaan luokasta, ei lasketusta tyylistä.
- **Kuvakaappaus ei todenna teematyötä.** Rikkinäiset komponentit ovat
  modaaleissa eivätkä näy areenanäkymässä.

Firebase-riippuvaiset polut (kirjautuminen, työtilan vaihto pilvessä,
Firestore-synkka) eivät ole testattavissa täällä lainkaan — ne ovat
manuaalilistalla.
