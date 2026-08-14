# CLAUDE.md

## Design-backlog

Impeccable-analyysi tehty 2026-06-07. Raportti: `docs/impeccable-kritiikki.md`.
PRODUCT.md luotu 2026-06-10. P0 valmis.

**🔶 Kesken (2026-08-14): kortin kaksoisindeksi + ikonisetti.** Haara
`kortti-indeksi-ikonit`. Vaiheet 0–2 valmiit (`c0f3fcf`), seuraavana
vaihe 3 (sigil-taso). **Suunnitelma:**
`~/.claude/plans/home-jaakko-claude-uploads-dea0ecee-9cf-tidy-phoenix.md`
— itsenäinen dokumentti, sisältää lukitut päätökset, tokenit ja vaiheet.
Kaikki kortin ratkaisut ovat valmiina `mockup-kortti-v2.html`:ssä ja
ikonit `mockup-ikonit.html`:ssä; kopioi sieltä, älä piirrä uudestaan.
**Uusi glyfi on katsottava rinnakkain lähisukulaistensa kanssa** —
vaiheessa 2 löytyi neljä kollisiota, joista kolme oli jo hyväksytyissä
glyfeissä (`kirjaa`=`muokkaa`, `varaa`=`odottaa`, `kiire`≈`pomodoro`).
Mitattu lähtötilanne: käsi näyttää kortista 63–79px × 98px vasemmasta
yläkulmasta, rata 41–50 kortin px oikeasta laidasta — ja pomodoro-hinta
(`top:9px;right:9px`) on kädessä kokonaan piilossa.

**⬜ Avoin (kirjattu 2026-08-12, Jaakon havainto):** pitäisikö korttien
(areenakortti, ratakortit, käsikortit) skaalautua ikkunan koon mukaan? Nyt
mitat ovat kiinteitä pikseleitä — `--lane-card-w:214px`, `--hand-card-w:130px`,
areenakortti `max-width:300px` — ja kapeissa ikkunoissa rata joutuu
lyhenemään (`--lane-max` 4→3→2), kun se voisi kutistua. Ei aloitettu; oma
kierroksensa, koska koskee kaikkia kolmea korttikokoa yhtä aikaa.

**P0 ✅ valmis (2026-06-10):** Aurinko-teema kerma → puhdas valkoinen; aamu.html usva-synkronointi; --muted .55 → .72
*(Aurinkoteeman värinäkyvyys korjattu rakenteellisesti 2026-08-07 — ks. oma osio alempana.)*

**P1 ✅ valmis (2026-06-11):** text-xs tokenoitu; SVG-ajastinvärit → var(--pomo); reduced-motion aamu+swipe; empty states dashed-border

**Tuottavuustavat ✅ valmis (2026-08-08):** 2 min -sääntö (pikakortit), 1-3-5 päivän budjetti, keskeytysparkki — ks. oma osio alempana

**Tehtäväjonon rata 🔶 haarassa (2026-08-11):** jono saa fyysisen paikan areenan lattialla. Haara `claude/task-queue-visibility-ymx47m`, PR #10, **ei mergeä mainiin** — ks. oma osio alempana. Kerrosskaala `#arena`n sisällä muuttui (areenakortti z:3→9, banneri z:5→12).

**P2 ✅ valmis (2026-06-11) — Eisenhower-peek + navigaatio:**
- Eisenhower-matriisi yhdistetty: vanha full-screen modaali poistettu → uusi `#eise-peek` areenan yläreunassa
- Handle (48px, koko areenan leveys, mini 2×2-matriisi kvadranttiväreillä, tehtävämäärät per kvadrantti)
- Peek liukuu ylhäältä alas areenan päälle — ei peitä sivupaneeleja (ODOTTAVAT / TEHTÄVÄJONO)
- Drag-and-drop kvadrantista toiseen + klikkauspohjainen siirtovalikko (mobiili)
- ↑-nappi suoraan matriisista jonoon; indikaattorit: 🐸 sammakko, ⌛ odottava, 🍅 jonossa
- Timer käynnistyessä: handle piiloutuu automaattisesti; pysähtyessä: tulee takaisin
- ~~Tauon alkaessa (sbrk/lbrk): peek aukeaa automaattisesti tarjolle~~ **poistettu 2026-08-04** — matriisi ei aukea automaattisesti missään tilanteessa, vain kahvasta tai hampurilaisvalikosta. Tauon kehotus näkyy `#break-banner`issa
- Ham-btn näkymätunnus: näyttää "Matriisi" / "Tehty" / "Projektit" kun ei olla Tehtävälistalla
- Toimii sekä desktopilla että mobiililla (CSS siirretty globaaliksi)
- **Desktop-käytös muuttunut 2026-07-27:** kahva ja peek ovat 720px keskitettyjä (eivät areenan levyisiä), peek on opaakki, peittää käden ja sulkeutuu ulkoklikkauksesta — ks. Yhtenäinen näkymä -osio

## Project overview

Fokus A Priori — suomenkielinen tuottavuussovellus. Jaakko on sosiaaliohjaaja Länsi-Uudenmaan hyvinvointialueella (LUVN). Zero-dependency, single-file HTML. Ei build systemiä, ei npm. Julkaistu: https://joketre3.github.io/fokus/

## Running the app

```bash
python3 -m http.server 8080
# http://localhost:8080
```

Testit: `python3 tests/run.py` (ks. `tests/README.md`). Ei lintteriä, ei CI:tä.

- **`smoke` (2) ja `habits` (2) kaatuvat ajoittain** (`active=100`, `turn=[1,2,3,7]`) — epädeterministisiä ja vanhoja. Vertaa baselineen ennen kuin syytät omaa muutostasi: `git stash && python3 tests/run.py smoke habits; git stash pop`
- **Mittaa asettelu DOM:sta, älä kuvakaappauksesta.** `tests/harness.py`:n `build()`+`run()` ajaa mitä tahansa JS:ää sivun sisällä. `getBoundingClientRect` paljasti napin alle jääneen tekstin, jonka kaappaus hukkasi — ja mittauksen saa jätettyä pysyväksi testiksi.
- Oma siemendata: `seed_js(tasks=TASKS+extra)` + `mk()` (`tests/seed.py`). `extra=`-parametri on raakaa JS:ää joka ajetaan **ennen** sovelluksen skriptejä — `tasks`-globaalia ei siellä vielä ole, joten `tasks.push` menee hiljaa try/catchiin.
- Zoomattu kaappaus popupista: `--force-device-scale-factor=2` + pieni `--window-size`
- Suite valitsee siemenen rivillä `// seed: <nimi>` heti `// target:`-rivin jälkeen (`tests/run.py:SEEDS`). `frank` = Frankenstein-kortti: jokainen kenttä äärimmillään viitenä kappaleena, jotta maksimikortti osuu areenalle, radalle JA käteen. Uusi korttikenttä lisätään myös `frank()`iin tai ylivuoto löytyy vasta käyttäjän datasta
- **Kierretyn tai skaalatun elementin `getBoundingClientRect` on akselinsuuntainen bbox, ei elementti.** Viuhka (±11°) ja rata (1,5° + `scale`) levittävät sen — 300px korkea laatikko 1,5 asteessa on ~8px leveämpi. Laske suhteet kortin OMASSA koordinaatistossa (tokeneista tai `offsetWidth`illa); kahden rectin erotus on ok vain kun molemmat ovat samassa mittakaavassa
- **Klikkaus ja `textContent`-luku samassa tikissä antaa vanhentuneen arvon** — `requestAnimationFrame`iin sidottu mittaus ei ole ehtinyt ajaa. Sondi: klikkaukset yhteen `setTimeout`iin, luku toiseen ~1s myöhemmin
- `backdrop-filter` raportoituu `none` headlessissa (`--disable-gpu`) vaikka sääntö on voimassa — sumennusta ei voi todentaa headlessilla, vain oikeassa selaimessa
- Ad hoc -sondi mitä tahansa sivua vastaan ilman uutta suitea: scratchpad-skripti joka tekee `sys.path.insert(0,'tests')` + `from harness import build, run, report`

## File structure

| File | Purpose |
|------|---------|
| `index.html` | Pääsovellus — Eisenhower-matriisi, Pomodoro, AI-analyysi, työtilat |
| `aamu.html` | Aamusuunnitteluvelho (popup pääsovelluksesta) |
| `swipe.html` | Korttiselausnäkymä tehtäväjonon rakentamiseen (popup) |
| `landing.html` | Markkinointisivu |
| `mockup-kortti.html` | TCG-kortti-ilmeen mockup (referenssi) |
| `mockup-rarity.html` | Rarity-järjestelmän mockup (4 tieriä + holo-vertailu) |
| `mockup-poyta.html` | Korttipöytä-ilmeen mockup (teema+lite-kytkimet) |
| `mockup-lisaa.html` | Lisää tehtävä -napin ja -modalin suunnitteluvaihtoehdot (A/B/C) |
| `mockup-arena-3d-plus.html` | Areenan 3D-syvyys: heittovarjo, taustaecho, isot reaktiot (referenssi) |
| `mockup-yhtenainen.html` | Yhtenäinen näkymä: full-bleed areena + hover-peek-paneelit + pöydän kehys (vaihe 1, hyväksytty) |
| `mockup-fut-kortti.html` | FUT-korttityylin mockup (referenssi) |
| `mockup-arena-syvyys.html` | Areenan syvyyskokeilu (varhainen, korvattu `mockup-arena-3d-plus`illa) |
| `mockup-eise-placement.html` | Eisenhower-peekin sijoitteluvaihtoehdot |
| `mockup-jono.html` | Tehtäväjonon rata areenan lattialla — 3 varianttia + elävät geometrialiu'ut (`?v=v2`) |
| `mockup-kortti-v2.html` | Kortin kaksoisindeksi — kolme rajausta rinnakkain (areena/viuhka/rata), 3 indeksivarianttia, kustannusmittari pysty/vaaka, Frankenstein-kytkin |
| `mockup-ikonit.html` | Ikonisetin referenssi — 32 glyfiä + 4 kvadranttimerkkiä, kollisioparit, teemakytkin, koot 56/28/16,7/14 px |
| `manifest.json` | PWA-manifesti — asennettava sovellus, standalone-tila |
| `sw.js` | Service worker — navigointi verkosta ensin, muu välimuistista (offline) |
| `icon-192.png`, `icon-512.png`, `icon-180.png` | Sovellusikonit (512 myös maskable) |
| `dev-seed.html`, `testdata.html` | Testidatan siemennys localStorageen (kehitystyökaluja) |

Pääsovellus avaa `swipe.html` ja `aamu.html` popup-ikkunoina (`window.open`). Timer aukeaa JS:llä generoituna popuppina. Kaikki ikkunat jakavat datan `localStorage`n kautta.

## Architecture

Jokainen tiedosto on itsenäinen: kaikki CSS ja JS sisäänrakennettu HTML-tiedostoon. Ulkoiset riippuvuudet vain CDN:stä: Google Fonts ja Firebase SDK v10 (modulaarinen). Anthropic API:a kutsutaan suoraan selaimesta käyttäjän API-avaimella (localStorage).

**Data flow:**
1. Ensisijainen tallennus: `localStorage` (synkroninen, aina saatavilla)
2. Pilvisynkronointi: Firestore (`users/{uid}/workspaces/{wsId}`) — valinnainen, vaatii Google-kirjautumisen
3. Kirjautuessa Firestore-data ylikirjoittaa localStoragen; kirjoitukset molempiin

**TÄRKEÄÄ — arkkitehtuuriperiaatteet:**
- Single-file HTML on tietoinen rajoite `file://`-protokollaa varten — neuvot tiedostojen jakamisesta tai frameworkeista ovat haitallisia
- Mobiili-JS on tiukempaa kuin Node.js: innerHTML + pakotetut lainausmerkit (`\'`, `\"`) rikkoo Edge/Chromen mobiilissa vaikka `node --check` menisi läpi → käytä `textContent` staattisille DOM-elementeille
- Template literaalit emojeilla/ajatusviivalla aiheuttaa renderöintiongelmia mobiili-Edgessä — vältä JS:llä generoidussa HTML:ssä
- `overflow: hidden` modal-kontainereissa rikkoo popoverit — käytä `overflow: visible`
- `position: sticky` rikkoutuu kun vanhemmalla on `overflow-x: hidden` mobiilissa — käytä `position: fixed` + placeholder-elementti (`#pb-ph`)
- Firebase API-avain client-side koodissa on tarkoituksella julkinen, ei tietoturvariski
- Python `content.replace(old, new, 1)` on luotettava fallback kun `str_replace` epäonnistuu isoissa JS-funktioissa
- `dataset.*` palauttaa AINA merkkijonon — `parseInt` ennen `===`-vertailua numeeriseen id:hen (`t.projectId===p.id` hajoaa muuten hiljaa)
- `innerHTML`-klooni (esim. `openDoneModal`) pudottaa `onclick`-**propertyt** — kloonattavien elementtien napit tarvitsevat `data-*`-attribuutit + delegoidun kuuntelijan
- `save()` ei saa riippua `animationend`ista: `render()` voi irrottaa noden kesken animaation, jolloin eventtiä ei tule. Tallenna heti mutaation jälkeen + `setTimeout(_renderOnce,600)` fallbackiksi (`markDone` on malli)
- JS:n `\b` on ASCII-only — `^Selvitä\b` ei täsmää koskaan. Käytä `(?=\s|$|[,.;:!?])`
- `toISOString()` paikallisesta päivämäärästä siirtää päivän UTC+2/+3:ssa edelliselle — rakenna `getFullYear/getMonth/getDate`illa
- Inline-`style`ssä sama property kahdesti → jälkimmäinen voittaa (`display:none;...;display:flex` = elementti on näkyvissä a11y-puussa)
- `text`, `verbi` ja `kuvaus` on pidettävä synkassa: `text = verbi + ' ' + kuvaus`. ICS-vienti ja verbi-chip lukevat `verbi`/`kuvaus`, eivät `text`iä
- `backdrop-filter` on pääsyyllinen hitaaseen suorituskykyyn MacBook Pro 2010:llä (Intel HD Graphics, ei NVIDIA) — `html[data-perf="lite"]`-attribuutti poistaa sen kaikista elementeistä
- Usvametsä-teeman `--surface-xs` (rgba .35) ja `--surface` (rgba .42) ovat läpinäkyviä ja luottavat backdrop-filteriin — nopean tilan CSS ylikirjoittaa ne opaakeiksi (.97)
- `html[data-perf="lite"]` kuittaa kaikki CSS-transitiot automaattisesti `transition-duration:.01ms!important` — uusille animaatioille ei tarvita nopea-tila-erikoistapauksia
- `transform:translateX(-50%)`-elementteihin (esim. `.notif`) lisää `translateY()` samaan `transform`-arvoon: `translateX(-50%) translateY(8px)` — erillinen `translateY`-sääntö ylikirjoittaa edellisen ja rikkoo keskityksen
- Asetusnapit kuuluvat hampuriaisvalikkoon (Asetukset-osio), ei profiilipaneeliin — käyttäjä ei löydä piilotettujakin modaaleja
- Yläpalkki on `.hdr` (`grid-area:topbar`), mutta `#hdr-timer` EI ole sen sisällä — se on oma `position:fixed` -elementti (z:90) oikeassa yläkulmassa. Yläpalkkiin kohdistuvat kuuntelijat eivät tavoita ajastinwidgettiä
- `position:fixed` lapsi-elementti transformatun vanhemman sisällä positionoituu vanhempaan eikä viewporttiin — toggle-napit yms. sijoitetaan transformatun elementin ULKOPUOLELLE DOM:issa
- `node --check` ei toimi `.html`-tiedostoille — extractaa ensin: `python3 -c "import re; open('/tmp/chk.js','w').write('\n'.join(s[1] for s in re.findall(r'<script(?! type=[\"\'](module)[\"\']*[^>]*>)(?:[^>]*)>(.*?)</script>', open('index.html').read(), re.DOTALL)))"` → `node --check /tmp/chk.js`
- Headless Chrome `--screenshot` ei renderöi CSS transformeja luotettavasti — testaa aina oikeassa selaimessa, älä luota headless-kuvakaappauksiin CSS-animaatioiden todentamiseen
- Headless Chrome ei jaa `localStorage`:a eri origineista — modaaleja ja onboardingia ei voi testata automaattisesti headless-tilassa (eri portti = eri origin)
- `checkMorningTask()` lisää tehtävän heti startup:ssa ja kutsuu `render()` — vaikuttaa `tasks.length`-pohjaisiin tarkistuksiin; suodata `aamusuunnittelu`-tagi pois ennen laskentaa
- CSS hover-bounce: kun elementti liikkuu `:hover`-tilassa ylös, lisää `::after { position:absolute; bottom:-64px; left:-8px; right:-8px; height:64px; }` laajentamaan hit-aluetta — muuten elementti pomputtaa itseään
- `position:fixed` lapsielementti grid-rivin sisällä positionoituu viewporttiin kun vanhemmalla ei ole `transform`ia — käytä tätä viuhkan kaltaisiin fixed-overlayhin gridin sisällä
- `.wrap { overflow:hidden }` katkaisee gridin ulkopuolelle menevän sisällön — piilota elementit `translateY(100%)`:llä, älä siirrä fyysisesti gridin ulkopuolelle
- Grid-rivi säilyttää korkeutensa vaikka sen sisältö on `position:fixed` — käytä tätä pitämään muut elementit (esim. arena-kortti) paikallaan viuhkan avautuessa
- `startTmr()` ei kutsu `render()` — kutsu manuaalisesti heti perään jos UI pitää päivittää (esim. nappi-teksti)
- Mobiilikaappaus headlessilla: `google-chrome --headless=new --no-sandbox --disable-gpu --window-size=390,844 --screenshot=/tmp/out.png "http://localhost:8765/file.html"`
- Impeccable-detektori: `node /home/jaakko/.agents/skills/impeccable/scripts/detect.mjs --json index.html`
- Impeccable-baseline: **4 osumaa / 3 kategoriaa** jotka EIVÄT ole bugeja — bounce-easing ×2 (M1:n tarkoituksellinen overshoot), em-dash-overuse (suomen välimerkki), dark-glow (aurinko-chip-token, väärä positiivi) — älä "korjaa", vertaa vain deltaa. Rivinumerot liikkuvat, vertaa mergeä edeltäneeseen commitiin (`git show <sha>:index.html`), ei `HEAD`iin.
  - **Vahvistettu 2026-08-09 suuren merge-kierroksen jälkeen** (PR #6/#7/#8 + mobiili + PWA, index.html +2600 riviä). Ajettu molemmille puille — `19b5f69` (ennen) ja merge-tulos — ja tulos on **identtinen**: 4 warningia, 0 erroria, samat kategoriat, vain rivinumerot siirtyneet (82→109, 754→788, 668→708). Delta **0**.
  - Osumat: `--ease-out-back` `:root`issa, `.card-entering`in `card-enter`, aurinkoteeman `.eise-card:hover` -pehmeä varjo (detektori lukee sen "dark-glowksi" vaikka teema on vaalea), ja **18 em-dashia — sama luku molemmissa**. Uudet suomenkieliset UI-tekstit ("☕ Tauko — nouse ylös") EIVÄT kasvattaneet lukua, eli detektorin "bodyteksti" ei tarkoita JS:stä generoituja merkkijonoja. Älä oleta em-dash-luvun seuraavan UI-tekstien määrää.
- Headless Chrome ei aja `initTheme`a (Firebase/CSP offline) — teemojen testaus headlessissa: temp-kopio kovakoodatulla `data-theme`-attribuutilla, ei localStorage
- Rinnakkaishaarojen mergen/rebasen jälkeen tarkista funktioduplikaatit: `grep -c "function nimi" index.html` — auto-merge voi tuoda saman funktion kahdesti (esim. rarityOf PR #4 + M1)
- Projektiväri-indikaattori: `box-shadow: inset 0 3px 0 <väri>` — ei `border-left` eikä `border-top` (detektori ampuu kaikista `border-top:Npx solid` -säännöistä)
- Piilotettava sisältö: `.wrap{display:grid;grid-template-rows:0fr;transition:grid-template-rows .18s}` + sisältö `min-height:0;overflow:hidden` — ei max-height-animaatiota
- Absoluuttisen napin (esim. `.inv-card__star-btn`) väistäminen: `margin-right`, **ei** `padding-right`. Padding jättää laatikon geometrian napin päälle, jolloin `getBoundingClientRect`-päällekkäisyysväite kaatuu vaikka teksti näyttää oikealta — ja z-indexin varaan jäävä klikkaus on hauras. Marginilla geometria vastaa näkyvää.
- `git stash` tarvitaan ennen `git checkout main` jos working treessä on muutoksia muissa tiedostoissa
- **Flex-kontin `scrollHeight` ei näytä lapsen ylivuotoa** — Chrome laskee flex-itemien border-boxit, joten kutistuneen lapsen yli valuva teksti ei näy vanhemman luvussa. Mittaa ylivuoto siitä lapsesta jolla on `flex:1` (kortilla `.tcg-card__body`), ei `.tcg-card__plate`ista
- **SVG flex-rivissä tarvitsee `flex:none`** — muuten se venyy: `.tcg-card__typeline` kasvoi 218px korkeaksi ja runko litistyi 24px:ään
- `.tcg-card.tcg-card--hand{width:130px}` ja `.lane-card .tcg-card{width:100%}` ovat samaa spesifisyyttä (0-2-0) → lähdejärjestys ratkaisee. Jos se kääntyy, ratakortti renderöityy 130px levyisenä 214px kääreen sisään: **kääreen mitat pysyvät oikeina**, joten kaistalemittaus menee läpi ja vain kortin oikea laita on 64px väärässä. Käytä kaksoisluokkaa
- **Ryhmä nappeja tarvitsee yhtenäisen osumakentän.** `:hover` säilyy vain lapsesta jolla on `pointer-events:auto`; nappien välinen tyhjä tila katkaisee sen → ryhmä romahtaa, osoitin on tyhjän päällä, ryhmä avautuu — silmukka. Läpinäkyvä kiekko/laatikko koko ryhmän päälle, `pointer-events:none` levossa ja `auto` auki-tilassa (sama vikaluokka kuin radan hoverin sillassa)
- **Kovakoodattu luku joka kuvaa CSS:ää ajautuu erilleen siitä.** Liukusäätimen `DEFAULTS` ylikirjoitti `:root`in inline-tyylillä, ja mockupin "Kopioi tokenit" tulosti kertoimen `.78` kun CSS oli jo `.85` — vietävä arvo olisi kulkeutunut väärin `index.html`:ään asti. Lue arvot `getComputedStyle`lla, älä toista niitä merkkijonossa

## Ikonisetti (vaihe 2, 2026-08-14)

Yksi rekisteri: `ICON` (32 nimeä), `VERB_ALIAS`, `verbName()`,
`iconId(name,tier)`, `verbIcon(verbi,tier)`. Symbolit `<defs>`issä
muodossa `#g-<nimi>` (glyfi) ja `#q-q1…q4` (kvadranttimerkit).
`ICON_S` on tyhjä kunnes vaihe 3 tuo sigilit; `tier:'s'` putoaa siihen
asti glyfiin. Referenssi ja muokkauspaikka: `mockup-ikonit.html`.

- **`<use href>` ei varoita puuttuvasta symbolista** — se renderöityy
  hiljaa tyhjänä. Siksi ääkköset normalisoidaan lookupissa (`Selvitä` →
  `#g-selvita`) ja `icon_registry`-suite väittää että jokainen alias
  osoittaa olemassa olevaan symboliin.
- **Kolme rinnakkaista ikonikarttaa ajautui erilleen**: `VERB_ICONS` oli
  kuollut (56 riviä, 0 lukupaikkaa) ja sama verbi näytti kortilla
  SVG:ltä, pakassa emojilta. Uusi kartta pitää molemmat kirjoitusasut
  (`Soita` / `soittaminen`) avaimina.
- **Osittainen täsmäys kattaa vain prefiksit** — `soitto` ei ole
  `soita`n prefiksi kumpaankaan suuntaan, joten substantiivimuodot ovat
  omina aliaksinaan.
- **Täytetty siluetti kestää 14px:n paremmin kuin viivapiirros.** Kaksi
  samanväristä muotoa erotetaan `<mask>`illa (laajennettu polku
  `stroke-width`illä), ei taustavärillä — maskin `#fff`/`#000` ovat
  luminanssia, eivät teemavärejä.
- Vanhat `verb-i-*` (8 kpl) ovat yhä `<defs>`issä; ne poistuvat
  vaiheessa 3.

## Core data model

Kaikki tehtävädata `localStorage`-avaimessa `eis_v5_<wsId>` (oletus: `eis_v5_work`):

```js
{
  tasks: [{
    id: Number,          // auto-increment
    text: String,
    quad: 'q1'|'q2'|'q3'|'q4',
    important: Boolean,
    urgent: Boolean,
    est: Number,         // Pomodoro-arvio (0.5–8)
    done: Boolean,
    frog: Boolean,       // "syö sammakko ensin"
    waiting: Boolean,
    verbi: String,       // text = verbi + ' ' + kuvaus — pidä synkassa!
    kuvaus: String,
    schedule: Object|null,     // ajastus; scheduled_hidden piilottaa listalta
    scheduled_hidden: Boolean, // true kunnes ajastettu hetki koittaa
    projectId: Number|null,    // numero, EI merkkijono (dataset.pid → parseInt)
    pomos: Number,
    doneAt: String|null,       // ISO, asetetaan valmistuessa
    chainId, chainPosition, chainTotal, isChained,  // jatkokortit
    tags: String[],
    lisatiedot: String|null,
    linkki: String|null
  }],
  active: Number|null,  // jonon ensimmäinen (task id)
  turn: Number[],       // loppujono (task id:t)
  // legacy: queue[] → migratoidaan active+turn latauksen yhteydessä
}
```

**Muut localStorage-avaimet:**
- `fap_active_ws` — aktiivinen työtila (oletus `'work'`)
- `fap_workspaces` — työtilalista
- `fap_theme` — `'usva'` | `'havu'` | `'aurinko'`
- `fap_timer_settings` — `{work, sbrk, lbrk}` (minuutit)
- `fap_apikey` — Anthropic API-avain
- `fap_profile` — käyttäjäprofiili AI-analyysiä varten
- `fap_perf` — `'1'` kun Nopea tila päällä (asettaa `html[data-perf="lite"]`)
- `fap_data_uid` — paikallisen datan omistaja; eri uid kirjautuessa → data tyhjennetään
- `fap_onboarded` — onboarding nähty
- `fap_device_id` — laitteen tunniste jaetussa istunnossa (kumpi laite ohjaa ajastinta)
- `fap_device_label` — laitteen nimi Ohjain-näkymässä (oletus UA:sta: Puhelin / Työpöytä)

`_clearLocalAppData()` pyyhkii kaiken `eis_v5*` + `fap_*` paitsi `fap_theme`, `fap_perf`, `fap_onboarded`, `fap_timer_settings`, `fap_device_id`, `fap_device_label` (laiteasetuksia, ei käyttäjädataa).

## Tehtävien verbi-formaatti

**Verbi ensin** — tehtävä pitää olla toimintavalmis 2 sekunnissa.  
Formaatti: `Verbi + kohde + konteksti`  
Yleiset verbit: Soita, Sovi, Kirjaa, Tee, Selvitä, Vie, Tarkista, Varaa  
ICS-kalenteri aktivoituu automaattisesti verbeille: Sovi, Aikatauluta, Varaa (--wait sininen, Outlook-kohde)

## TCG-terminologia

| Termi | Merkitys |
|-------|---------|
| Tehtäväjono | Queue |
| Tehtäväkäsi | Hand (top 5 kortteina) |
| Tehtäväpakka | Inventory/deck |
| Tehtäväkortti | Task card |
| Verbi | Verb tag |
| Jatkokortti | Follow-up card |
| Tehtäväpohja | Template/preset |
| Keskity | Focus / timer start |
| Siirrä tehtäväjonoon | ↑-nappi |

## Eisenhower-matriisi

| Key | Label | Merkitys | Väri |
|-----|-------|---------|-------|
| `q1` | TEE HETI | Tärkeä + Kiireinen | terracotta `#a84c28` |
| `q2` | AIKATAULUTA | Tärkeä, ei kiireinen | forest green `#2d5a3d` |
| `q3` | DELEGOI | Kiireinen, ei tärkeä | muted warm |
| `q4` | POISTA | Ei kumpikaan | stone grey |

## Teemat

`data-theme` `<html>`:ssä, tallennus `fap_theme`:en:
- `usva` — Usvametsä (oletus): dark frosted-glass, kulta-aksentti `#c49a3a`
- `havu` — Havumetsä: syvä tumma metsä
- `aurinko` — Aurinko: lämmin vaalea/terracotta

CSS custom properties: `--ink`, `--surface-xs`, `--surface`, `--surface-md`, `--surface-strong`, `--border`, `--subtle`, `--accent`, `--accent-dim`, `--muted`, `--faint`. Q2-värit ja logo-SVG:t pysyvät vihreinä.

**Tekstivärit ovat `--ink` / `--muted` / `--faint` — vain nämä kolme.** `--subtle` (rajat, koriste), `--accent-dim` (taustasävy) ja `--etch-ink` (letterpress-koriste) EIVÄT ole tekstitokeneita; aurinkoteemassa niiden kontrasti on 1,1–3,2:1. Pysyvästi tummilla pinnoilla (TCG-kortin plate, `#hdr-timer`) muste on `--tcg-plate-ink*` tai eksplisiittinen valkoinen, ei teeman `--ink`. Ks. DESIGN.md §2 **The Text Token Rule** ja **The Theme Scope Rule**.

## Keskeiset käsitteet

**Sammakko (Frog):** Tärkein tehtävä päivässä. Aina ensimmäisenä jonossa. Renderöidään 🐸:llä kaikkialla.

**Käsi (Hand):** TCG-inspired käsikortit — **ei jono vaan ehdokasjoukko**: `buildHandQueue` valitsee tähtikortit (`handForced`) ja niiden jälkeen q1/q2-tehtävät jotka **eivät** ole areenalla eivätkä jonossa, järjestyksessä q1+sammakko → q1 → q2+sammakko → q2. `renderHandBar` näyttää niistä 5. Napautus → `promoteToHand`: areenalle jos areena on tyhjä, muuten jonon perään. Työpöydällä viuhka joka avautuu hoverilla, mobiilissa hylly joka lepää huulena (ks. The Hand Rule, DESIGN.md §9). Toggle: `window._useCardUI`.

**Areena:** Pääfokusialue, näyttää aktiivisen (jonon kärki) tehtävän isona korttina.

**Vuoro (Turn):** Loppujono areenan alla listana.

**Pomodoro:** 25 minuutin työsessiot. `POMO_MIN = 25`. Tehtäväarviot Pomodoro-yksikköinä (`est`).

## Työskentelytapa

(Yleiset säännöt globaalissa CLAUDE.md:ssä — tässä vain projektikohtaiset.)

- **Lue vain relevantti osa** suunnitteludokumenteista — ei koko tiedostoa.
- **Validoi ennen toimitusta:** `node --check` syntaksille; `sed -n` kontekstin lukemiseen ennen korvausta.
- **Massamuutokset:** sed tai Python-skriptit, ei manuaalisia rivirivi-muutoksia.
- DOM-haut: käytä aina id-pohjaisia selektoreja. Style-attribuuttiselektorit (`closest('div[style*="display:flex"]')`) ovat hauraita.

## Parannuskierros 2026-06-12 — valmis

| Paketti | Mitä |
|---|---|
| fix(security) | AI-vastauksen normalisointi (id/est Number, quad whitelist), onclick-stringit → addEventListener |
| fix(sync) | `_fsSaveDirty`-lippu (snapshot ei ylikirjoita debounce-ikkunassa), `save()` stale-write-suoja `_loadedTs`-vertailulla |
| refactor | Kuollut Eisenhower-koodi pois; ESC sulkee peekin (oli rikki); `notify()`-timer-jono + a11y-kuulutus |
| feat(a11y) | `trapFocus()`-helper kaikkiin modaaleihin (Tab-kierto + fokuspalautus); peek-kortit + siirtovalikko näppäimistöllä; swipe.html reduced-motion + aria-labelit; käsikortin fontit ≥.65rem |
| refactor(css) | TCG-värit tokenisoitu (`--gold*`, `--metal-silver*`, `--tcg-plate-ink*`, `--tcg-stop`, `--ink-on-art`, `--pomo-hi`, `--q2-bright`, `--frog-deep`); `background:white`-teemarikko korjattu; z-index 9000→600, 9999→700 |
| feat(tcg) | `rarityOf(t)`: mythic=frog, rare=q1/q2, uncommon=q3, common=q4; metallirengas + set-symboli (työtilan alkukirjain); holo vain frogille; `--qc` var()-tokeneiksi |

**Tietämys:**
- `render()` käyttää `on*`-propertyjä uusiin elementteihin ja `innerHTML=''` tuhoaa vanhat → EI listener-vuotoa, ei tarvitse tutkia uudelleen
- `trapFocus(modal)` palauttaa release-funktion; kytkentä `_trapOn(id)`/`_trapOff(id)` open/close-pareissa
- `renderDeckCard` jätetty tekemättä tarkoituksella: inventory käyttää tiheää `.inv-card`-ruudukkoa, TCG-kuvasuhde romuttaisi sen — backlogissa kevyt välimuoto (rarity-värinen set-symboli inv-cardiin)
- Z-index-skaala dokumentoitu DESIGN.md:ssä

## Nykyinen kehitystila

### Modernization-prosessi (2026-05-28) — valmis

Kolmivaiheinen tietoturva- ja koodinlaatuprojekti tehty, kaikki commitoitu ja pushattu GitHubiin.

| Vaihe | Mitä | Status |
|-------|------|--------|
| 1 — Tietoturva | 8 XSS-korjausta (`esc()`), URL-validointi, CSP meta kaikille tiedostoille | ✅ |
| 2 — Kriittiset bugit | `save()`/`load()` try/catch, swipe.html workspace-avain, popup-timer `window.opener`, AI-analyysi `response.ok` + HTTP 401/429/529 | ✅ |
| 3 — Konsolidointi | `WS_ACTIVE` vakio event-handlereissa, `fe()` duplikaatti poistettu, `POMO_MIN` lukee `fap_timer_settings` | ✅ |

Analyysi- ja suunnitteludokumentit: `analysis/ASSESSMENT.md`, `analysis/report.html`, `docs/superpowers/plans/`.

### Nopea tila -ominaisuus (2026-05-28) — valmis

MacBook Pro 2010 (Intel HD, ei GPU) suorituskykyoptionointi Chromessa.

| Muutos | Mitä |
|--------|------|
| `html[data-perf="lite"]` CSS-lohko | `backdrop-filter:none`, transitiot pois kaikista elementeistä |
| Opaakki `--surface-xs`/`--surface` | Usva .35→.97, havu/aurinko omat arvot |
| `togglePerfMode()`, `initPerfMode()` | localStorage `fap_perf`, `data-perf` attribute |
| Hampurilaisvalikko → Asetukset | `#ham-perf-btn` nappi |

### Firestore-synkronointi (2026-06-11) — valmis

| Vaihe | Mitä | Status |
|-------|------|--------|
| A — login-sync | Aikaleimat + last-write-wins kirjautuessa | ✅ |
| B — popup-synkka | aamu.html + swipe.html opener-delegoinnilla | ✅ |
| C1 — offline | `persistentLocalCache` (IndexedDB-välimuisti) | ✅ |
| C2 — real-time | `onSnapshot` + echo-esto (`_lastFsWriteTs`) | ✅ |
| C3 — indikaattori | `_setSyncStatus` syncing/ok/offline/error | ✅ |
| D — Security Rules | `users/{uid}/**` vain omalle käyttäjälle | ✅ |
| Uloskirjautuminen | `signOut`, hampurilaisvalikko + auth-elementti | ✅ |
| Tilinvalinta | `prompt: select_account` Google-provideriin | ✅ |

Suunnitelma: `docs/firestore-synkronointi-suunnitelma.md`

### Korttipöytä-ilme (2026-07-05) — valmis, haara `korttipoyta`

| Vaihe | Mitä | Status |
|-------|------|--------|
| 0 | `mockup-poyta.html` — suunnan hyväksyntä, teema+lite-kytkimet | ✅ |
| 1–2 | Pöytätokenit (12 kpl, 3 teemaa) + felt-pinta `.wrap`iin, blur(1px) pois | ✅ |
| 3–4 | `#arena::after`-slotti (border-image-SVG) + upotetut vyöhykkeet, `var(--bg)`-bugit korjattu | ✅ |
| 5–6 | `.turn-card`-pino + chip-napit + hdr/eise-handle-materiaalit | ✅ |
| 7 | Mobiilivinjetti, kontrastikorjaukset (etch-ink .38/.55), DESIGN.md §8 | ✅ |

Opit:
- `#arena::after` desktopilla vaatii `inset:auto` ennen left/top-arvoja — mobiilisääntö asettaa `bottom:-4px` joka muuten venyttää laatikon
- Slotti pseudo-elementtinä koska `render()` tyhjentää `#arena`n lapset (keep-lista vain eise-peek/handle)
- Chip-napit: paino vain box-shadow+translateY — teemojen `!important` omistaa `.pbtn`-backgroundin
- SVG presentation attrs: `path.setAttribute('stroke','var(--accent)')` ei resolvoidu — käytä `path.style.stroke='var(--accent)'`
- FLIP-lohkon sijoitusriski: Python replace samannäköisellä kontekstilla osuu väärään funktioon — tarkista `grep -n 'targetFn' index.html` ennen/jälkeen
- `prefers-reduced-motion` poistaa CSS-transitiot mutta EI keyframe-animaatioita — JS-guard node-luonnille: `if(matchMedia('(prefers-reduced-motion:reduce)').matches) return`
- `document.addEventListener('pointerleave', fn, true)` laukeaa jokaisella lapsirajan ylityksellä — guard: `e.target===pressed && e.pointerId===pressedId`
- Keyframe `box-shadow`-animaatio = main-thread repaint; siirrä hehku `::after`-pseudo-elementtiin + animoi `opacity` (compositable)
- FLIP leaving-overlayrivit: merkitse `dataset.ghost='1'` → First-pass ohittaa ne (muuten mitataan 240ms abs-rivi real-riveinä)

### FUT-ilme + areenan 3D-syvyys (2026-07-26) — valmis

**FUT-suunta on VALITTU ja live** (`_useCardUI=true`): areenakortti FUT-tyylinen (Q-taide taustana, verbi rintakuvana, metallireunus rarityn mukaan), arena-room 3D-lavaste. Vanha `.card-new`-MTG-kortti korvattu.

| Muutos | Tiedosto | Mitä |
|--------|----------|------|
| Verbi-tuplaus-fix | index.html renderTurnPanel + 5 a11y-kohtaa | `text` sisältää jo verbin (`addTask: text=verbi+' '+kuvaus`) → poistettu `verbi+' '+text` tuplaus. Malli rivillä ~8953 (`verbi+kuvaus`) |
| Kuollut koodi pois | index.html:~7422 | `renderCardNew` delegoi vain `renderArenaCard`:iin (kutsutaan vain aktiivisella) → 359-rivinen vanha runko + orvot `mkPipsNew`, `getVerbIconFromVerbi` poistettu (yht. 407 riviä). `.card-new*` CSS SÄILYY: `card-new__btn`/`__action-btn` yhä elävien toimintanappien käytössä |
| Taustaecho | `.arena-room__echo` + `--qc` arena-roomiin | Aktiivisen kortin q-taide isona/sumeana + quad-värinen bloom seinälle (FUT-liekit). Päivittyy quad-vaihdossa (renderissä ~7929) |
| Heittovarjo | `.arena-room__castshadow` (bottom:5%) + kortti translateY -12px | Kontaktivarjo + podium-valo kortin ALAREUNAN alle (kortti seisoo 3D:nä). Seuraa tiltiä (`--px`/`--shs`, tilt-handler ~8573) |
| Isot reaktiot | done-* keyframet + markDone | check-pop 1.06→1.25+rotate, flash 1.5→2.6, uusi hehkurengas (`doneRing`, rare/mythic), frogBurst 11→16 kipinää, scale-pop 1.14. `card-enter` → näyttävä deal-in |
| Lisää tehtävä -nappi B | index.html:~755 + ~1357 | C-variantti (glow) → B (korttiselkä): kultareunus, opaakki plate+diagonaaliraita, yläkulmat, -1.5° kallistus, isompi teksti. Teksti pysyy "Lisää tehtävä" |
| Jatkokortti-nappi siirretty | renderArenaCard (poistettu) → edit-modal (~9917) | Areenan alta → oma nappi muokkausmodaaliin (Linkki-kentän jälkeen). Sulkee editin ennen jatko-modaalin avausta. Vapautti lattiatilan → varjo lukeutuu |

Opit:
- **Heittovarjon z-stacking-ansa:** `#arena-room` luo oman stacking-kontekstin (`perspective`) ja on koko `#arena`ssa z:auto → areenakortti (z:3) peittää KOKO arena-roomin. Siksi varjo kortin pystykeskellä (`bottom:15%`) jää täysin kortin taakse näkymättömiin. Varjo TÄYTYY olla kortin alareunan alapuolella (`bottom:5%`) näkyvällä lattialla. Mittaa `getBoundingClientRect`illa: varjon top-reunan pitää olla > kortin bottom
- Heittovarjo lukeutuu vain lit-lattialla → tumma varjo + vaalea `::before`-podium-pooli. Jatkokortti-nappi siirretty pois areenan alta → lattiatila vapaa
- `--qc` (quad-väri) asetetaan kortille (`~7153`) JA arena-roomille (bloom-tint); ei `--qc-lite` — käytä `color-mix(... var(--qc) X%, white/transparent)`
- Reduced-motion: globaali sääntö (rivi ~784, kaikki animaatiot .01ms) tyynnyttää deal-inin + echon automaattisesti; markDone tarkistaa `rm` erikseen (skippaa flash/ring/burst)
- Guardit: perf-lite piilottaa echon+varjon (blur-raskaat); testattu usva/havu/aurinko + lite
- Inline `style="transform:..."` voittaa `:hover`/`:active`-säännöt (inline > pseudoluokka ilman `!important`) → staattinen transform kuuluu CSS-sääntöön, ei style-attribuuttiin
- `dataset.quad`-vertailun sisään ei saa laittaa `--qc`-asetusta: HTML alustaa `data-quad="q1"` → ensirenderissä ehto on false ja bloom putoaa `var(--gold)`-fallbackiin. Aseta custom property guardin ulkopuolella

### Yhtenäinen näkymä (2026-07-26) — valmis

**Tavoite:** desktop-näkymä tuntuu irralliselta (areena, ODOTTAVAT, TEHTÄVÄJONO, käsi ovat erillisiä grid-soluja). Areena/3D-huone täyttää koko `.wrap`in taustana; jono, odottavat ja käsi kelluvat sen päällä.

**Jaakkon lukitut design-päätökset:**
- Paneeli-ilme: **tumma well-look** — opaakki (`--well-bg`, `--well-shadow`, `inset 0 0 0 1px var(--engrave-dim)`). EI frosted glassia. (Tarkastaja ehdotti läpikuultavuutta — hylätty, opaakki on käyttäjän valinta.)
- Käytös: **hover-peek reunoilta** — lepotilassa 44px kisko, hover/`:focus-within` avaa 340px paneelin.
- **Pöydän kehys:** käsiviuhka tulee kehyksen alta, ei ruudun reunan alta.

Suunnitelmat: `~/.claude/plans/yhten-inen-n-kym-areena-taustana-sparkling-taco.md` (vaiheet) + `...-agent-affa01188614be7e3.md` (yksityiskohtainen rakennusspec, 257 riviä).

| Vaihe | Mitä | Status |
|---|---|---|
| 1 | `mockup-yhtenainen.html` (1037 riviä) — hyväksyntäportti | ✅ **hyväksytty** |
| 2 | index.html: grid-romautus + käsirivin poisto | ✅ |
| 3 | Paneeli-DOM: railit + body-kääreet + count-peilit | ✅ |
| 4 | Peek-käytös + focus-mode + a11y | ✅ |
| 5 | Arena-room full-bleed-viritys + pöydän kehys | ✅ |
| 6 | DESIGN.md z:40-kaista + täysregressio | ✅ |

**Toteutus index.html:ssä (vaiheet 2–5):**
- Tokenit `:root`iin: `--panel-w:340px`, `--rail-w:44px`, `--ledge-h:38px`, `--dur-panel:300ms`, `--rail-ink` (3 teemaa), `--room-grid` (3 teemaa)
- `.wrap` desktop-grid: `auto 1fr` / `1fr`, areat `"topbar" "stage"`. `.tcg-arena` + `.tcg-left` + `.tcg-right` kaikki `grid-area:stage`; paneelit `justify-self:start/end`, `align-self:stretch`, `width:var(--panel-w)`, `z:40`, `margin:.75rem 0` + `margin-bottom:var(--ledge-h)`
- Paneeli = läpinäkyvä flex-rivi; well-skin (`linear-gradient(0deg,var(--well-bg),var(--well-bg)), var(--table-felt-deep)`) siirtyi `.side-panel__body`yn ja `.side-panel__tab`iin. Vieritys bodylle. Base-CSS: `.side-panel__body` pelkkä flex-pinoaja, `.side-panel__tab{display:none}`, `.table-ledge{display:none}` → mobiili + 600–899px ennallaan
- `_attachSidePanelRails()` (kutsu `_attachHandHoverDesktop()`:n perässä): `aria-expanded`-synkka, kiskon klik-toggle `.is-open` (touch), Esc + blur
- `body.focus-mode` päälle `toggleTimer`issa (eise-kahvan piilotuksen vieressä), pois `stopAll()`:ssa
- `_syncCastShadow()` render()-lopussa + resize: mittaa areenakortin alareunan → `--card-base` `#arena-room`iin
- `.tcg-arena` alapadding `7rem` → kortti ~56px keskikohdan yläpuolella (käsi ei peitä sitä)

**Vaiheen 1 ratkaisut (siirrettävä index.html:ään vaiheissa 2–5):**
- `.wrap` grid `auto 1fr` / `"topbar" "stage"`; `#arena` JA molemmat paneelit `grid-area:stage` (päällekkäiset grid-solut). Paneelit `justify-self:start/end`, `width:340px`, `z-index:40`. Paneelit pysyvät `#arena`n sisaruksina → sisarus z:40 maalautuu isoloidun areenan päälle.
- Kisko on `<button class="side-panel__tab">` paneelin sisällä (vasen: viimeinen lapsi, oikea: ensimmäinen). Lepotila `translateX(∓(340−44)px)`, avaus `:hover,:focus-within → translateX(0)`. Sulkuviive `transition-delay:250ms` VAIN lepotilasäännössä. `--dur-panel:300ms`.
- `.table-ledge`: 38px pöydän kehys huovan alalaidassa, `z:65` (käden 60 päällä), `pointer-events:none`. Sivupaneeleille `margin-bottom:var(--ledge-h)`.
- `#hand-bar` = viuhkan rajausikkuna (`left/right:.75rem; top:0; bottom:.75rem; overflow:hidden`), `#hand-bar-cards` sen sisällä `position:absolute`.
- 3D-viritys full-bleedille: perspective 1000→1300px, perspective-origin 50% 38%→40%, `__side` 16%→10%, `__spot` `min(70%,900px)`, `__echo-art` `min(60%,560px)` keskitettynä, `__echo::after` `min(52%,620px)`, `#arena-room` inset `48px 0 0`→`0`. Wall/floor/castshadow-arvot säilyvät.
- Eise-kahva: keskitetty `max-width:min(720px, calc(100% - 2*var(--panel-w) - 2rem))`.

**Opit (vaihe 1):**
- **Heittovarjo full-bleedissä:** `bottom:5%` irtoaa kortista — kuilu kasvaa ikkunan korkeuden mukaan (120px @1600). Ankkuroi kortin tyveen: `top:calc(50% + 188px); bottom:auto` (kortti pystykeskitetty, puolikorkeus 196px − translateY 12px).
- **Käsiviuhka + kehys:** auki-tilassa viuhka on nostettava kehyksen yläpuolelle (`translateY(-(ledge-h + 12px))`) — muuten korttien alaosa (verbi + nimi) jää kehyksen taakse. +12px kattaa viuhkan alimman kortin `translateY(11px)`-poikkeaman.
- `#hand-bar-cards` koko viewportin levyisenä + `pointer-events:auto` on ansa: tukkii sivupaneelien alaosan ja avaa viuhkan mistä tahansa alareunan hoveristä → `pointer-events:none` kontainerille, `auto` korteille. `:hover` propagoituu silti kontaineriin lapsen kautta.
- **`*` ei osu pseudo-elementteihin** — `html[data-perf="lite"] *{animation:none}` jättää `::after`-keyframet pyörimään. Käytä `*,*::before,*::after` sekä litessä että reduced-motionissa. (index.html tekee tämän jo oikein riveillä 785, 799–801.)
- `writing-mode:vertical-rl` lukee JO ylhäältä alas — `rotate(180deg)` oikealle kiskolle kääntäisi tekstin alhaalta ylös JA badgen numeron ylösalaisin. Älä kierrä.
- `visibility:hidden` fokustilaan: pelkkä `transform` + `pointer-events:none` jättää railit ja käsikortit tab-järjestykseen ruudun ulkopuolelle (WCAG 2.4.3/2.4.7). Liuku säilyy `transition: ..., visibility 0s linear var(--dur-panel)`.
- Aurinko-teema tarvitsee omat ylikirjoitukset: `.turn-card`/`.waiting-item` (tumma plate-komposiitti → mutainen harmaa laatta), `html[data-theme="aurinko"][data-perf="lite"]` surface-tokenit (lite-lohko kaappaa ne muuten tummiksi), lattiaruudukko tokenina `--room-grid` (kovakoodattu valkoinen katoaa vaaleassa).
- `--subtle` ja `--etch-ink` ovat koriste-/taustatokeneita (kontrasti 1.05–3.6:1) — informaatiota kantava teksti tarvitsee `--muted`in tai oman `--rail-ink`-tokenin.
- **Headless-mittaus:** `getBoundingClientRect` on luotettava. Tilaluokkien testaus on silti turvallisinta lataamalla sivu tila valmiiksi päällä (`<body class="focus-mode">`) — ajonaikainen luokan lisäys + heti mittaus osuu kesken siirtymän. (Korjattu vaiheessa 6: virtual-time AJAA `setTimeout`in, joten viivästetty mittaus toimii — ks. vaiheen 6 opit.)

**Opit (vaiheet 2–5, korjaavat osan vaiheen 1 oletuksista):**
- **Heittovarjon kiinteä offset ei riitä:** mockupin `top:calc(50% + 188px)` olettaa 392px kortin, mutta index-areenakortissa on lisäksi toimintanapit (~490px) → varjo jäi kortin taakse. Ratkaisu: JS mittaa kortin alareunan (`.tcg-card--arena-size`, EI `.card-new--arena`) ja asettaa `--card-base`.
- **Käden auki-tila ei saa nousta kehyksen yläpuolelle** (vastoin vaiheen 1 opetusta): `translateY(-(ledge-h+12px))` nostaa kortin kokonaan kehyksen yli → viuhka kelluu eikä "tule pöydän alta". Oikein `translateY(0)`: alin `--ledge-h` (vain "N pom" -rivi) jää kehyksen taakse.
- **Kehys kiinni ikkunan alareunaan:** `bottom:.75rem` jättää 12px raon, josta näkyy huovan alamarginaali ja paneelien alareunat. Oikein `bottom:0; height:calc(var(--ledge-h) + .75rem); border-radius:0`.
- **`.tcg-card`-perusreunus oli läpikuultava** (`rgba(255,255,255,.30)`-liuku) → areenakortti paistoi käsikortin läpi. Lisää opaakki `var(--plate-bot)` viimeiseksi taustakerrokseksi. Rare/mythic/uncommon olivat jo opaakkeja.
- **Globaali eise-peek-CSS on desktop-media-lohkon JÄLKEEN** (rivi ~4227) → `#eise-handle`-override desktop-blokissa häviää lähdejärjestyksessä. Tarvitsee oman `@media (min-width:900px)` -lohkon globaalin säännön perään.
- `#main-content-area` + `#v-inbox` `display:contents` tekee KAIKISTA lapsista grid-itemeitä — `#onboarding` (näkyvissä 1. käynnistyksellä) luo implisiittisen rivin ja litistää stagen. Näkyy vain uudella käyttäjällä / headless-testissä.
- **Headless + localStorage:** tila siemenetään `<body>`-alkuun injektoidulla `localStorage.setItem`-skriptillä (`fap_onboarded`, `eis_v5_work`, `fap_theme`, `fap_perf`). (Väite "virtual-time ei aja `setTimeout`ia" oli väärä — ks. vaiheen 6 opit: JS-mittaussondit toimivat, kunhan viive on riittävä.)
- Käsi täyttyy `buildHandQueue`sta: vain q1/q2-tehtävät jotka EIVÄT ole aktiivina eivätkä jonossa (`turn`) — testiseedissä jätä vapaita q1/q2-tehtäviä tai käsi on tyhjä.

**Vaihe 6 — DESIGN.md + täysregressio:**
- DESIGN.md: §5 Navigation -rivi kiskoista, §6 z-taulukko (0–9 / 10–39 / **40–69 lavastekerros** / 90–99), §8 tokenit (6 riviä) + 3 Named Rulea: **The Stage Rule**, **The Rail Rule**, **The Ledge Rule**
- Korjattu 2 vikaa: eise-kahvan `max-width` laski `--panel-w`illä → 132px @900 ja kvadranttiluvut ulos laatikosta; oikein `--rail-w` (kahva väistää vain kiskot, auki oleva paneeli peittää sen z:40 > z:10 -sääntönä). `.notif` `bottom:2rem` lepäsi pöydän kehyksellä → desktop-override `calc(var(--ledge-h) + 3rem)`.
- Impeccable-delta HEAD-baselineen: 0 (samat 4 osumaa, vain rivinumerot siirtyivät)
- **Jälkikorjaus (Jaakon havainto):** `#eise-peek` aukesi koko areenan levyisenä → vasen reuna leikkautui kiskon alle. Nyt kahvan levyinen (sama `max-width`-kaava). Kaksi ansaa: (1) `#eise-peek.on{transform:translateY(0)}` on globaalisti MYÖHEMMIN lähteessä → override tarvitsee oman `@media (min-width:900px)` -lohkon sen jälkeen, ja `translateX(-50%)` on toistettava MOLEMMISSA transformeissa; (2) `--surface` on rgba — koko areenan levyisenä läpikuultavuus ei näkynyt, kahvan levyisenä areenakortti paistoi läpi → opaakki well-komposiitti (`--well-bg` + `--table-felt-deep`) kuten sivupaneeleissa.
- **Peek käden päälle (2026-07-27):** `#eise-peek`in oma z-index ei koskaan yllä `#hand-bar`iin (z:60), koska `#arena` on `isolation:isolate` -stacking-konteksti. Nostettava koko areena: `body.eise-open #arena{z-index:62}` (< kehyksen 65, joten pöydän reuna pysyy edessä) + sivupaneelit 63, ettei kiskoja hukata matriisin taakse.
- **Ulkoklikkaus-idiomi:** capture-vaiheen `click`-kuuntelija, rekisteröinti `setTimeout(...,0)`:lla ettei avaava klikkaus laukaise sitä (sama kuin `eiseOpenMoveMenu`). Sulkufunktiolle `noFocus`-parametri: hiiriklikkaus ei saa siepata fokusta kahvaan, mutta Esc ja `stopAll()` palauttavat sen.

**Opit (vaihe 6) — headless-regressiotyökalut:**
- **Virtual-time AJAA `setTimeout`in.** JS-mittaussondi toimii: injektoi `<script>` joka mittaa `getBoundingClientRect`illa ja kirjoittaa tuloksen `document.documentElement.setAttribute('data-probe', 'PROBE'+JSON+'ENDPROBE')`, lue `--dump-dom`in tulosteesta regexillä + `html.unescape` (attribuutin `"`-merkit escapataan). Sondi `<title>`en EI toimi — sovellus ylikirjoittaa sen.
- **Sondi VIIMEISEN `</body>`:n eteen** — ensimmäinen `</body>` on ajastin-popupin HTML-templaatissa merkkijonona. `html.rfind('</body>')`, ei `.replace(..., 1)`.
- **Vain YKSI viivästetty snapshot** (`setTimeout(snap, 2500)`). Jos sondi ottaa myös välittömän ja `load`-snapshotin, viimeinen kirjoitus ei ole deterministisesti se myöhäisin → mittaus osuu kesken 300 ms:n paneelisiirtymän ja antaa satunnaisia välituloksia (paneeli näytti auki 1920:ssä, kiinni 900:ssa). `--virtual-time-budget` sondin viivettä isommaksi (9000).
- **Pikselivertailun ansa:** eri `--window-size`-korkeus tuottaa eri kokoiset PNG:t, ja `ImageChops.difference` vertaa hiljaa vain leikkausta → "2,84 % regressio" oli 700×800 vs 700×844. Tarkista `Image.size` ennen diffiä. Kohinataso samasta tiedostosta kahdella ajolla: ~20 px.
- **Osumatestaus:** `document.elementFromPoint` ei kelpaa maalausjärjestyksen todentamiseen, jos elementillä on `pointer-events:none` (esim. `.notif`, `.table-ledge`) — se ohitetaan aina. Päättele z-järjestys stacking-konteksteista.
- Regressiovertailun baseline: `git show HEAD:index.html` → sama seed-generaattori molemmille → pikselidiffi. 700 px 0,02 % ja 390 px 0,03 % = kohinataso.

### Tuottavuustavat: 2 min, 1-3-5, keskeytysparkki (2026-08-08) — valmis

Kolme tapaa integroitu. Pomodoro, sammakko ja tehtävien pilkkominen olivat jo
valmiina; 5 sekunnin sääntö jätettiin tietoisesti pois (sotii PRODUCT.md:n
"rauhallinen varmuus" -periaatetta, eikä aloituskynnys ole Fokuksen ongelma —
keskeytykset ovat).

| Tapa | Mitä | Missä |
|---|---|---|
| **Keskeytysparkki** | Ajastimen sääntöteksti lupasi jo "merkitse se ylös ja jatka" ilman toteutusta. Nyt `#hdr-timer`iin ilmestyy työvaiheessa kenttä: Enter luo tehtävän (`quad:'q3'`, `est:.5`, `tags:['keskeytys']`, `needsReview:true`) ilman että pomodoro katkeaa | `parkInterrupt()`, `updParkRow()`, `updParkCount()`, `_parkCount` |
| **2 min -sääntö** | `est===0` = pikatehtävä. Liukusäätimen minimi 0.5 → 0 (lisäys- ja muokkausmodaalissa). Pikatehtävät eivät mene areenalle, käteen, jonoon, aamuvelhoon eivätkä swipe-pakkaan — ne kootaan `#pika-modal`iin ruksattavaksi | `isQuick()`, `quickTasks()`, `renderPikaBtn()`, `openPikaModal()`, `renderPikaList()`, `pikaDone()`, `pikaDelete()` |
| **1-3-5** | Päivän sitoumus (`active` + `turn`) mitataan: 1 iso (sammakko tai est ≥3), 3 keskikokoista (est 1–2.5), 5 pientä (est 0.5). Mittari jonopaneelin ylälaidassa ja aamuvelhon vaiheessa 4 | `dayBudget()`, `renderDay135()`, `DAY135_LIMITS`; aamu.html `day135Counts()`, `renderDay135()` |

Opit:
- **`fe(0)` oli aiemmin saavuttamaton** — 0 palautti `'0'`. Nyt `'⚡'`. Turvallista koska `est` alkoi ennen 0.5:stä; `totalQueueEst()` on kuollutta koodia eikä `fe`ä käytetä summiin.
- **`||1` on ansa nolla-arviolle.** `t.est||1` promotoi pikatehtävän hiljaa yhden pomodoron tehtäväksi. Kaikki osumat piti vaihtaa muotoon `t.est==null?1:t.est` — `saveEditModal`, `openEditModal`, areenakortin meta, matriisin pipit, Tehdyt-lista sekä swipe.html:n muokkaus. Myös `renderSummary` ja AI-vienti korjattiin: valmis pikatehtävä olisi kasvattanut arviosummaa yhdellä pomodorolla ja näyttänyt arviotarkkuudessa osumalta (`|0−1| ≤ 1`) — nyt ne ohitetaan ja `accPct`:n nimittäjä on `estimatedDone`, ei `done.length`.
- **`wizReset()` nollaa `est`-globaalin** → `addTask`in loppuun sijoitettu `if(est===0)` ei laukea koskaan. Lippu on luettava ennen resetiä.
- **`--q1`/`--q2` ovat täyttövärejä.** `--q2` (`#2d5a3d`) antaa tummalla well-paneelilla vain 2,3:1. Yhtä väriä ei voi jakaa teemojen kesken: `--q2-bright` (`#4a8a4a`) on 4,3:1 tummalla mutta 2,6:1 vaalealla. Siksi omat tokenit `--budget-ok`/`--budget-over` per teema (ks. DESIGN.md The Quadrant-Color Rule).
- **Desktopilla `#hdr-timer` on `position:static` gridissä** — parkkirivi kasvattaisi yläpalkkia ja siirtäisi lavastetta ajastimen käynnistyessä. Ratkaisu: `position:relative` + parkkirivi `position:absolute` ajastimen alle. Mobiilissa (fixed-widget) rivi saa pinota normaalisti, 45px → 80px.
- **Popup-tarkistus kannatti taas** (vrt. "Toistuva bugiluokka"): `swipe.html` olisi swaipannut pikatehtäviä jonoon ja sen `t.est=parseFloat(...)||1` olisi tuhonnut pika-tilan muokattaessa; `aamu.html` olisi aikatauluttanut ne slotteihin. Molemmat suodattavat nyt `est===0`:n.
- **Headless: regeneroi testisivu jokaisen lähdemuutoksen jälkeen.** Vanhasta `index.html`-kopiosta generoitu testisivu näytti korjatun kontrastin yhä rikkinäisenä — pikselimittaus antoi täsmälleen saman arvon ennen ja jälkeen, mikä paljasti syyn.
- **`--window-size` ei ohjaa `innerWidth`ia `--dump-dom`-ajossa:** Chrome raportoi 500 vaikka ikkuna on 390, ja `--screenshot` maalaa 390px kuvan 500px-taitosta → widget näyttää valuvan reunan yli vaikka `scrollWidth===innerWidth`. Mittaa `getBoundingClientRect`illa ja kaappaa raportoidulla leveydellä.

### Fokustila + taukokehotus (2026-08-04) — valmis

**Vika:** sivupaneelit ja käsi jäivät piiloon tauon jälkeenkin. `focus-mode` lisättiin `toggleTimer`issä ja poistettiin vain `stopAll`:ssa, jonne `onPhaseEnd` ei koskaan mene. Tauon päätyttyä `tmr` on `null` → ▶ meni käynnistyshaaraan eikä luokkaa poistettu koskaan. Ainoa kiertotie oli aloittaa pomodoro ja keskeyttää se heti.

| Osa | Mitä |
|---|---|
| `_syncTimerUI()` | Ajastintilan ainoa totuuden lähde, kutsutaan neljästä siirtymästä (`toggleTimer`, `onPhaseEnd` ×2, `stopAll`). `focus-mode` = `!!tmr` (työ JA tauko), `eise-handle--hidden` = `phase==='work' && tmr`, `body.on-break` + `#break-banner` = tauko |
| Auto-peek poistettu | `openEisePeek(true)` `onPhaseEnd`ista pois — matriisi ei aukea automaattisesti missään. Samalla pois parillinen `closeEisePeek()` tauon lopusta: se olisi sulkenut käyttäjän itse avaaman matriisin. `isAuto`-parametri poistettu tarpeettomana |
| `#break-banner` | Taukokehotus areenassa. Desktopilla absoluuttinen PAKKA-palkin yläpuolella, mobiilissa virrassa kortin yläpuolella |
| `.eise-peek-sub--break` | Sama kehotus peekin otsikkorivillä, jos matriisi avataan käsin kesken tauon |

Opit:
- **Tilaluokka ilman poistopolkua on aikapommi:** `classList.add` yhdessä funktiossa ja `remove` toisessa kestää vain niin kauan kuin kaikki polut kulkevat molempien kautta. `onPhaseEnd` oli kolmas polku joka ei kulkenut. Yksi `_sync*()`-funktio joka JOHTAA luokat tilamuuttujista (`phase`, `tmr`) ei voi jäädä epäsynkroniin.
- **Virtual-time EI aja viivästettyjä CSS-siirtymiä.** `.tcg-left`illa on `transition-delay:250ms`, `#hand-bar-cards`illa ei → headless-mittaus väitti paneelien jäävän piiloon while `focus-mode` oli jo pois. Sama ajo Playwrightilla reaaliajassa antoi oikean tuloksen. Ristiriitainen tulos samassa CSS-säännössä olevien elementtien välillä = mittausvirhe, ei bugi.
- **Peek peittää tauolla koko areenan** (mitattu: 99–912 px 900 px ikkunassa) → mikään areenaan sijoitettu banneri ei näkynyt sen alta. Mittaa peittävyys ennen kuin sijoitat elementtejä areenaan.
- `.notif`-toast (`bottom: --ledge-h + 3rem`, 40 px korkea) törmää areenan alalaidan elementteihin 6 px:llä → `body.on-break .notif` nostaa sen 5rem:iin. Toast ilmestyy juuri kun taukoteksti pitäisi lukea.
- Mobiilissa absoluuttinen `bottom` areenassa peittää kortin toimintonapit — banneri virtaan (`position:relative`) alle 900 px:ssä.

### Aurinkoteeman värinäkyvyys (2026-08-07) — valmis, ei vielä testattu selaimessa

**Vika:** vaaleassa teemassa laaja joukko käyttöliittymää oli lukukelvotonta — valkoista tekstiä valkoisella tai tummaa tummalla.

**Juurisyy oli rakenteellinen, ei yksittäisiä värejä.** `index.html`:n rivit 436–580 (`/* GLASS MIXIN */`) olivat **teematon** lohko, jossa oli kovakoodattuja tumman teeman literaaleja lähes kauttaaltaan `!important`illa. Alla olevat perussäännöt olivat jo oikein tokenisoituja (`color:var(--muted)` jne.) — glass-lohko vain yliajoi ne kaikissa teemoissa. Aurinko-lohko oli kasvanut ~40 paikkauksen listaksi, joka kumosi tämän komponentti kerrallaan; **jokainen komponentti jota listalla ei ollut, oli rikki** — ja jokainen myöhemmin lisätty komponentti syntyi rikkinäisenä.

| Vaihe | Mitä |
|---|---|
| 1 | 82 sääntöä prefiksoitu `html:not([data-theme="aurinko"])`:lla → aurinko putoaa tokenisoituihin perussääntöihin |
| 2 | Turhaksi jääneet aurinko-paikkaukset pois (6 kpl); liian heikot alfat (`.pstat` .50, `.clbl/.rlbl` .45, `.drag-handle` .20) → tokeneiksi |
| 3 | Uusi `--faint` tertiääriselle tekstille; 28 × `color:var(--subtle)` → `var(--faint)` |
| 4 | Aurinko-lohkosta puuttuneet `--accent-dim`, `--frog-deep`, `--q2-bright`, `--pomo-hi` |
| 5 | Kovakoodatut tummat pinnat: `.verb-pop`, `#chain-view-panel`, 3 arviosliderin kääre, ketjurivit, ajastin-popupin kello |

Opit:
- **Teematon `!important`-sääntö väriliteraalilla on aina bugi jossain teemassa.** Se ei näy heti, koska vastalohko paikkaa oireet — mutta paikkauslista ei voi koskaan olla täydellinen. Ks. DESIGN.md **The Theme Scope Rule**.
- **`button{color:…}` ei saa prefiksiä.** Spesifisyys nousisi 0-0-1 → 0-1-2 ja voittaisi `.pbtn`/`.badd`/`.vbtn` (0-1-0) → tummat teemat regressoituisivat. Tokenisoi arvo sen sijaan. `html:not([data-theme="x"])` lisää 0-1-1, koska `:not()`in spesifisyys on sen argumentin spesifisyys.
- **`var(--tokeni, var(--fallback))` ei laukea koskaan, jos tokeni on määritelty.** `.ham-theme-btn--active{color:var(--accent-dim,var(--accent))}` maalasi tekstin 12 % taustasävyllä *kaikissa* teemoissa — fallback oli kirjoitettu ikään kuin `--accent-dim` puuttuisi.
- **Sama tokeni voi olla oikein vaalealla ja väärin tummalla.** `--muted`in tummentaminen (#7a6a4a → #5f5334) korjasi huoneen taustalla lepäävät labelit mutta huononsi areenakortin ikoneita, jotka ovat **pysyvästi tummalla** plate-pinnalla. Ne tarvitsevat kortin oman `--tcg-plate-ink-dim`in. Sama koskee `#hdr-timer`iä: se on tumma widgetti kaikissa teemoissa, joten `var(--ink)` on siellä väärin.
- Kvadranttivärit valkoisen tekstin taustana tarvitsevat `color-mix(in srgb, var(--qN) 78%, black)` — puhdas `--q4` antaa 2,9:1. Kaava oli jo PAKKA-palkissa; nyt myös `.qbdg`issä ja JS-badgessa.

**Jäljellä tietoisesti:** ~50 osumaa on `--accent` `#c4681e` tekstivärinä vaalealla = 3,4–3,9:1. Se on DESIGN.md:ssä lukittu brändiväri (terracotta), joten sitä ei muutettu — erillinen suunnittelupäätös. Nykyisellään se täyttää AA:n isolle tekstille ja UI-komponenteille (3:1), muttei pienelle leipätekstille.

**Todentamistyökalut (`/tmp/.../scratchpad`, eivät repossa):**
- `seed.py` — injektoi `localStorage`-siemenen + kovakoodatun `data-theme`n; **jäädyttää animaatiot** (`*,*::before,*::after{animation:none;transition:none}` + `.notif{display:none}`). Ilman jäädytystä kahden identtisen ajon pikselidiffi oli **22 %** (deal-in, echo, toast); jäädytettynä **0,000 %**.
- `probe.py` — kontrastisondi: `getComputedStyle`illa jokaisen tekstisolmun väri + efektiivinen tausta (alfa-komposiitti ylöspäin), WCAG-suhde, tulos `data-probe`-attribuuttiin ja ulos `--dump-dom`ista.
- **Sondin ansat:** (1) `file://` vaatii **absoluuttisen** polun — suhteellinen `file://base/x.html` tulkitsee `base`n hostiksi ja epäonnistuu hiljaa. (2) `color-mix()` resolvoituu Chromessa muotoon `color(srgb r g b)`, ei `rgb()` — pelkkä `rgba?\(` -regex ohittaa sen, kävelee vanhempaan ja tuottaa **vääriä positiivisia**. (3) Elementti `display:none`-vanhemman sisällä palauttaa itse `display:block` → modaalit tulevat mittaukseen mukaan avaamatta niitä; **hyödyllistä tässä**, mutta muista se lukiessasi tuloksia. (4) `background-image` (gradientti) ei näy `backgroundColor`issa → korttiselkänapit yms. raportoituvat vääränä positiivisena; sondi tulostaa `img`-lipun sitä varten.
- **Kuvakaappaus ei todenna tätä työtä.** Desktop- ja mobiilinäkymä näyttävät vain areenan; rikkinäiset komponentit (välilehdet, `.qb`, syötteet, verbinapit) ovat modaaleissa ja listanäkymässä eivätkä näy kuvassa lainkaan. Aurinkoteeman pikselidiffi oli vaiheen 1 jälkeen 0,000 % vaikka 14 vikaa korjaantui. Käytä sondia, kuvaa vain regressiosuojana.

**⚠ TESTAAMATTA SELAIMESSA** — mittaus on staattinen; interaktiiviset tilat (`:hover`, `:focus`, avatut modaalit, ajastin-popup) on käytävä läpi käsin. Palautus: `git revert e6a7633 5070edb`.

| # | Testi | Odotettu |
|---|---|---|
| 1 | Aurinko + Lisää tehtävä | Verbinapit (Soita/Sovi/…), kvadranttivalitsin, arviovalitsin ja placeholderit luettavia; valittu verbi terracottana |
| 2 | Aurinko + välilehdet | Välilehtien tekstit ja laskurimerkit näkyvissä |
| 3 | Aurinko + verbi-popover (▾) | Vaalea paneeli, tumma teksti |
| 4 | Aurinko + Ketju-paneeli | Vaalea paneeli; otsikko ja × näkyvissä |
| 5 | Aurinko + ajastin-popup (↗) | Kellonumerot tummia vaalealla; jonolista luettava |
| 6 | Usva & havu yleissilmäys | Ennallaan; tyhjät tilat, ×-napit ja vetokahvat aiempaa selvemmin näkyvissä (`--faint`) |
| 7 | Nopea tila (aurinko-lite) | Ei mudanväristä; pinnat opaakkeja |

Impeccable-detektoria **ei ajettu** — `~/.agents/skills/impeccable/scripts/detect.mjs` on Jaakon koneella, ei tässä ympäristössä. Aja delta paikallisesti ennen julkaisua.

### Aamusuunnittelun aktivointi (2026-07-29) — valmis

**Vika:** `aamu.html`ää ei voinut avata mistään. `checkMorningTask()` loi aamukortin, mutta `index.html`:ssä ei ollut yhtäkään `window.open('aamu.html')`-kutsua — ei nappia, ei valikkoriviä. Velho oli siis olemassa mutta täysin tavoittamattomissa.

| Osa | Mitä |
|---|---|
| `_openPopup(url,name,features,winKey)` | Yhteinen popup-avaaja: jo auki oleva ikkuna nostetaan eteen, estetty popup kerrotaan `notify()`llä. `openAamu()` + `openSwipe()` käyttävät sitä — aiemmin swipe-rivi teki `window.open`in suoraan inline-onclickissä ilman estotarkistusta |
| Areenakortin päänappi | `isMorningTask(t)` → "☀ Aloita suunnittelu" (avaa velhon) `▶ Aloita`n sijaan. Aamukortti ei ole pomodoro-tehtävä |
| Hampurilaisvalikko | Uusi rivi ☀ Aamusuunnittelu (Työkalut-osion ensimmäisenä) — toimii myös kun kortti on jo kuitattu |
| Kortti areenalle | `checkMorningTask` teki `turn.unshift(mt.id)` kun `active` oli varattu → kortti jäi jonoon eikä sen nappi renderöitynyt (napit ovat vain aktiivisella kortilla). Nyt vanha aktiivinen siirtyy jonon kärkeen ja aamukortti tulee areenalle |
| Paikallinen päivämäärä | `fap_morning`-leima rakennettiin `toISOString()`illa → UTC+2/+3:ssa keskiyön jälkeen leima meni edelliselle päivälle ja kortti syntyi kahdesti. Nyt `getFullYear/getMonth/getDate` |
| `nid`-törmäyssuoja | `load()`: `nid=d.nid||1` antoi uudelle tehtävälle jo käytössä olevan id:n jos `nid` puuttui tai oli jäljessä (varmuuskopio, käsin muokattu data) → `active` osoitti väärään korttiin. Nyt `nid` nostetaan aina suurimman id:n yli |
| Teemasynkka | `setTheme` synkkasi vain `_swipeWin`in → silmukka `['_swipeWin','_aamuWin']` |
| `aamu.html`: oma kortti pois | `loadData` suodattaa `aamusuunnittelu`-tagin — velho ei enää kysy itsestään "onko tämä oikeasti Q1" eikä tarjoa sitä sammakoksi |
| `aamu.html`: kuittaus | `finish()` (= `saveData(true)`) merkitsee aamukortin tehdyksi; `skipToEnd()` EI, jotta ohitettu suunnittelu on yhä avattavissa. Valmiit tehtävät suodatetaan `newQueue`sta, muuten kuitattu kortti palaisi jonoon `queue`n kautta |

Opit:
- **Popup-ikkuna on koko ominaisuuden ainoa sisäänkäynti** — jos `window.open`-kutsua ei ole, ominaisuus on kuollutta koodia vaikka kaikki muu toimisi. `grep -n "window.open" index.html` paljastaa mitkä popupit on oikeasti kytketty.
- **Areenakortin toimintonapit renderöityvät vain aktiiviselle kortille** (`mode==='hand'` palaa ennen `.tcg-card__actions-tcg`-lohkoa, ja jonokorteilla on vain ✎/×). Kortti jonka nappi on koko UX:n ydin on siis pakko asettaa `active`ksi, ei `turn`iin.
- **Headless-sondi voi paljastaa muutakin kuin mitä testaa:** `taskIds:["1","1","2","3"]` testiseedissä (jossa `nid` puuttui) paljasti `load()`in id-törmäyksen. Kun sondi tulostaa listoja, lue ne — älä katso vain sitä kenttää jota varten sondi kirjoitettiin.
- Sondi voi myös *ajaa* toimintoja: `window.open` monkeypatchattiin sondissa ja napin `click()` todensi että oikea URL avautuu — ei tarvitse luottaa siihen että onclick "näyttää oikealta".

### PAKKA-palkki (2026-07-27) — valmis

Alakehyksestä tuli kiskojen kaltainen vaakapalkki, josta tehtäväpakka nousee. Ei muutoksia pakan sisältöön tai toimintoihin — vain kuori ja avaustapa.

| Osa | Mitä |
|---|---|
| 1 | `.table-ledge` → `<button id="deck-rail">`: kiskojen well-skin, "PAKKA" + 4 kvadranttiväristä lukua, hover + `:focus-visible`, `aria-expanded`/`aria-controls`. `_syncDeckRail()` render()-lopussa |
| 2 | `#inv-modal`-siirtymä → `var(--dur-panel) var(--ease-out)` (sama liuku kuin kiskoissa); `aria-expanded`-synkka |
| 3 | `_syncHdrBottom()` → `--hdr-b`; desktop `#inv-modal{top:var(--hdr-b,0px)}` → pakka ei peitä yläpalkkia |
| 4 | `_deckHdrClick` capture-kuuntelija `.hdr`iin avattaessa → klikkaus yläpalkkiin sulkee. Palkki `fixed` → `absolute` `.wrap`in sisään: linjaan yläpalkin kanssa, alakulmat pyöristyvät `.wrap`in radiuksesta |
| 5 | `#inv-btn{display:none}` vain desktopilla — mobiilissa nappi säilyy (siellä ei ole palkkia) |

Opit:
- **`position:absolute` `.wrap`in sisällä on oikea työkalu reunoihin linjaamiseen:** `.wrap`illa on jo `position:relative`, `border-radius` ja `overflow:hidden`, joten `left:0;right:0;bottom:0` antaa ilmaiseksi sekä linjauksen että kulmien pyöristyksen. `fixed` + `left:.75rem` meni kehyksen yli, koska bodyn padding (1rem) ei ole samassa koordinaatistossa kuin `.wrap`in margin (.75rem) → todellinen sisennys on 28px, ei 12px.
- **Kvadranttiväri badgen taustana vaatii tummennuksen:** puhtaalla `--q4`:llä (`#9a9a8e`) valkoinen teksti on ~2,6:1. `color-mix(in srgb, var(--qN) 78%, black)` säilyttää sävyn ja nostaa kontrastin ≥4,7:1 kaikissa kolmessa teemassa.
- **`--dump-dom`- ja `--screenshot`-ajot eivät ole sama viewport:** dump-dom raportoi `innerHeight` 813 kun `--window-size` on 900, screenshot maalaa 900px korkean kuvan. Lite- ja normaalitilan kuvat näyttivät eroavan pystysuunnassa ~87px, vaikka DOM-mittaus antoi molemmille identtisen geometrian → kyse oli kaappausartefaktista, ei bugista. Luota mittaukseen, älä kuvaan pystysijainneissa.
- Mobiilidiffin kohinalähde on `.notif`-toast: se on näkyvissä vaihtelevalla opasiteetilla eri ajoissa (~2000–3000 px ero rivien 770–820 alueella). Tunnista rivialueesta ennen kuin epäilet regressiota.

### Taustavalokuvat poistettu (2026-07-27)

`index.html` 984 kt → 542 kt (**-46 %**). Kaksi upotettua JPEGiä pois: usva/havu-metsä (338 kt) ja aurinko-vuoristo (111 kt). Desktopilla niistä näkyi vain ~28px kehys huovan ympärillä; mobiilissa ne olivat koko tausta.

- Tilalle `--room-bg` per teema: usva `#071009`, havu `#010402`, aurinko `#d8c6a4`
- `body::before`-sävytykset (perus + havu + aurinko + lite) poistettu — ne olivat olemassa vain kuvan tummentamiseen
- Nopean tilan `background-image:none`-ylikirjoitukset poistettu turhina. Sivuvaikutus: aurinko-lite ei enää näytä mudanvärisenä (se pakotti ensin tumman vihreän ja korjasi sen perässä)
- Kuollut `@media(max-width:768px){body{background-attachment:scroll}}` pois

Opit:
- **Huoneen värin pitää olla selvästi tummempi kuin huovan reuna.** Ensimmäinen yritys (`#0c1a13`) osui 1 RGB-yksikön päähän huovan reunasta (11,24,17 vs 12,25,20) → huopa katosi taustaan, vain `inset 0 0 0 1px var(--engrave-dim)` -kultaviiva erotti ne. Mittaa pikselit `getpixel`illä molemmin puolin rajaa (x=10 huone / x=28 viiva / x=40 huopa), älä luota silmään pienessä kuvassa.
- Suuret base64-lohkot: muokkaa Python-skriptillä `re.subn(..., count=1)` + osumamäärän tarkistus, älä `sed`illä. `grep -v base64` ei riitä kun lohko on yhdellä rivillä muun CSS:n seassa.

### Code review -kierros (2026-07-28) — valmis, ei vielä testattu selaimessa

Ultrareview kolmessa osassa + aamu/swipe manuaalisesti. 16 normal + 9 nit korjattu, commit `31f4bb8`.

**⚠ TESTAAMATTA SELAIMESSA** — nämä viisi eivät ole todennettavissa staattisesti, ja koodi on livenä GitHub Pagesissa. Palautus: `git revert 31f4bb8 && git push`.

| # | Testi | Odotettu |
|---|---|---|
| 1 | Kirjaudu ulos | Sivu latautuu uudelleen, tehtävät ja työtilat tyhjenevät, teema + ajastinasetukset säilyvät. **API-avain katoaa** (tarkoituksellista) |
| 2 | Vaihda työtilaa kirjautuneena | Muokkaa tehtävää → vaihda heti työtilaa → palaa takaisin: muutos tallessa. Toisen laitteen muutos näkyy vaihdon jälkeenkin (kuuntelija kytkeytyi uudelleen) |
| 3 | Hampuriaisvalikko → Tehdyt | Palauta ja × toimivat modaalin sisällä, ja lista päivittyy heti |
| 4 | swipe: ✎ Muokkaa → tallenna | Sulje popup, avaa uudelleen: nimi, tärkeys, kiireellisyys, arvio, lisätiedot ja linkki tallessa. Kirjoita nimikenttään "aika" — ei saa swaipata |
| 5 | aamu: "Ohita aamusuunnittelu" | Eilinen 🐸 on yhä sammakko |

Lisäksi kevyt varmistus: ICS-lataus koko päivän muistutuksena → tiedostossa oikea päivä (ei edellinen).

**Ultrareviewn ajaminen isolle koodikannalle:**
- `/code-review ultra <haara>` — argumentti on **kantahaara**, ei reviewtava. Reviewtava = se haara jolla olet.
- Rajat: **500 tiedostoa / 8 000 riviä**. `index.html` (11 k riviä) ei mahdu yhteen ajoon.
- Diff on kolmipiste (`base...HEAD`), joten kanta pitää olla **aito esi-isä**. Sisarhaarat eivät toimi: merge-base valuu juurcommittiin ja diff räjähtää koko koodikannaksi.
- Toimiva kaava per lohko: orphan-commit jossa lohko on **poistettu** → sen päälle commit jossa lohko on takaisin. Diff = vain se lohko. `git checkout --orphan base-N` → muokkaa → commit → `git checkout -b rev-N` → `git checkout <täysi> -- .` → commit.
- Ilmaisia ajoja 3/kk, sen jälkeen usage credits (käyttäjän kytkettävä selaimessa).
- Raportissa voi olla `synthesis_incomplete: true` — kattavuus on silloin epävarma, käy lohko itse läpi.

**Löydösten laadusta:** kaikki siteeratut rivinumerot pitivät paikkansa, mutta perustelut arvasivat toisinaan väärin *miksi* koodi on rikki (esim. duplikaatti-CSS:ää arveltiin review-haaran artefaktiksi — se oli mainissa ennestään). Vahvista väite koodista, älä perustelusta.

**Toistuva bugiluokka tässä koodikannassa:** popupit (`aamu.html`, `swipe.html`) jäävät jälkeen `index.html`:n suojauksista. Modernization-vaiheen 2 try/catch, `scheduled_hidden`-suodatus ja kenttäsynkka puuttuivat kaikki. Kun index.html saa datansuojauksen, tarkista popupit samalla.

### Mobiili + jaettu istunto (2026-07-30) — käytössä, osin testattu laitteella

Mobiili oli jäänyt paikkaustasolle: kaikki 2026 tehty työ on `min-width:900px` -lohkossa. **Mobiili on yhä toissijainen — mutta kehittyvä haara, ei paikkaustaso.** Työpöytä on paikka jossa päivä suunnitellaan, puhelin se laite joka on mukana kun päivä tapahtuu (PRODUCT.md § Users). Käytännön seuraus: uusi ominaisuus rakennetaan yhä ensin työpöydälle, mutta mobiilille tehdään sen oma kenttätilaversio eikä kutistettua pöytää.

**Mitatut lähtöviat** (headless-sondi, ei arvioita):

| Vika | Todiste |
|---|---|
| Katvealue 769–899px | mobiilipaikkaukset loppuivat 768:aan, työpöytägrid alkoi 900:sta |
| Vaakapuhelimessa areenakortti taitteen alla | 844×390: viewport 303px, kortti `y=355`, dokumentti 994px = 3,3 ruutua vieritystä |
| 932×430 sai täyden työpöytägridin | kortista näkyi yläkolmannes, käsiviuhka peitti loput |
| Sivupaneelit piiloutuivat vasta <600px | 600–899px ne pinoutuivat pystyyn ilman gridiä |
| Navigaatio = 2 × 40px nappia alavasemmalla | alle 44px minimin, ei safe-areaa → iOS-kotipalkin alla |
| Kirjautuminen ei onnistunut puhelimella | **koko synkka oli tavoittamattomissa**. Alkuperäinen diagnoosi (popup-esto) osoittautui vääräksi — todellinen syy oli cross-domain authDomain, ks. jälkikorjaus 1 |

| Vaihe | Mitä |
|---|---|
| 0 | Kirjautuminen: popup ensisijainen kaikkialla, redirect varareittinä (ks. jälkikorjaus 1). `manifest.json`, `sw.js`, ikonit 192/512/180. `viewport-fit=cover`, `--safe-*`, `--mnav-h`, `--tap`. `theme-color` seuraa teemaa |
| 1 | `.wrap` mobiilissa grid `auto 1fr auto`, `100dvh`. `#mnav` (Fokus·Jono·+·Matriisi·Pakka). `setMobileTab()` näyttää olemassa olevaa DOM:ia — ei uutta renderiä. Käsiviuhka, PAKKA-palkki, kiskot ja eise-kahva pois. Matriisi pinoon <600px |
| 2 | Arena-room pois, kortti keskitetty ilman kallistusta, napit 44px. Eleet: oikea=tehty, vasen=odottaa, ylös=seuraava. Vaakapuhelimessa kortista pudotetaan kuvitus → automaattikorkeus |
| 3 | `users/{uid}/session/live`: jaettu ajastin **määräaikana** (`endsAt`). Vaiheenvaihdon johtajuus `owner`-kentällä. Wake Lock |
| 4 | `#v-remote` — portti `popoutTimer()`-rungosta, lähde jaettu istunto. Välilehti ilmestyy kun toinen laite on elossa (5→6 saraketta) |
| 5 | Popupit samaan välilehteen (`?back=1`) + paluunappi. `swipe.html` pinoon <700px. `_resyncFromLocal()` paluun yhteydessä |
| 6 | **Tehtäväkäsi mobiiliin**: `#hand-bar` pois lavastekiellosta. Hylly lepää 36px huulena (`#hand-lip`) alanavigaation yläpuolella ja nousee huulta napauttamalla. Vaakavieritys viuhkan sijaan. Vain Fokus-välilehdellä, vain pystyasennossa |

**Opit:**
- **`grid-row` ilman `grid-column`ia on ansa.** Sijoitus jää automaattiselle algoritmille, joka työntää seuraavat itemit implisiittisiin **sarakkeisiin**: `#v-matrix` päätyi `x=500` eli ruudun ulkopuolelle, vaikka `display` oli `block` ja sisältö renderöity. Aina molemmat.
- **Areena ja sivupaneelit eivät ole `.view`-elementtejä** vaan `#main-content-arean` sisällä → `sv()` ei piilota niitä. Areena on positioitu, `.view` ei, joten areena maalautui matriisin päälle. Ratkaisu: `body.view-<n>` -luokka `sv()`:ssä.
- **Työpöydän breakpoint tarvitsee korkeusehdon.** `(min-width:900px)` yksin antaa vaakapuhelimelle (932×430) koko pöydän. Nyt `and (min-height:501px)` kaikissa viidessä desktop-lohkossa, ja mobiililohko vastaavasti `, (max-height:500px)`. `_isMobileLayout()` pitää JS:n samassa ehdossa — pidä ne synkassa.
- **5:7-kortti ei mahdu vaakapuhelimeen.** ~230px korkeudessa se olisi 165px leveä eli lukukelvoton. Kutistaminen ei ole ratkaisu: pudota kortista se osa joka ei kanna tietoa (`.tcg-card__art`) ja anna `aspect-ratio:auto`. Kvadranttitausta jää → väri-identiteetti säilyy.
- **Ajastin pilveen määräaikana, ei jäljellä olevana aikana.** `endsAt` tarkoittaa ettei tikitys aiheuta yhtään kirjoitusta, verkkoviive ei kerry kelloon eikä taustathrottlaus voi ajautua eteen. Kirjoituksia ~20–40/vrk.
- **Jaettu ajastin tarvitsee johtajuuden.** Ilman sitä molemmat laitteet laskevat nollaan ja `onPhaseEnd` kasvattaa `pomos`/`pomoDone` kahdesti. Vain `owner === oma laite` sitouttaa; seuraaja odottaa snapshotia.
- **Popupeilla ei ole Firebase-SDK:ta.** CLAUDE.md:n "aamu.html Firebase sync ✅" tarkoitti opener-delegointia, ei SDK:ta. Samassa välilehdessä `window.opener` puuttuu → pilvipush jäisi tekemättä. `_resyncFromLocal()` (`visibilitychange` + `pageshow`) lataa levyltä ja työntää pilveen jos leima on tuoreempi.
- **`window.close()` ei sulje välilehteä jota se ei avannut** — samassa välilehdessä paluu on `history.back()`, fallback `location.href`.
- **Areenan hehkuanimaatio antaa ~16 % pikselikohinaa.** Regressiovertailu on tehtävä animaatiot jäädytettynä (`*,*::before,*::after{animation:none!important;transition:none!important}`), muuten diffi on lukukelvoton. Jäädytettynä 1440×900 ja 1920×1080 antoivat **0,0000 %** jokaisessa vaiheessa. Portti on skriptinä: `scratchpad/regress.sh` (seedaus + jäädytys + `pngdiff.py`, joka on riippuvuudeton PNG-lukija — PIL:iä ei ole).
- **`pkill -f "chrome-linux/chrome"` tappaa oman kutsuvan shellinsä** (komentorivi täsmää kuvioon) → exit 144. Käytä `pkill -f "[c]hrome-linux/chrome"`.
- **`--dump-dom` ei näe `location.href`-navigointia** — se palaa ensimmäisen latauksen DOM:illa. Samaan välilehteen navigointia ei voi todentaa näin; testaa määränpääsivu suoraan.
- **Firebase-SDK ei lataudu hiekkalaatikossa** (ei pääsyä `gstatic.com`iin) → `window._firebaseApp` on `undefined` ja kaikki `window._*`-moduulifunktiot puuttuvat. Firestore-riippuvainen koodi on testattava tyngillä (`window._sessionPush=...`). Sivutuote: kuvakaappaukset todistavat että sovellus toimii ilman Firebasea.
- Ikonit voi renderöidä ilman PIL:iä: inline-SVG HTML-kääreessä + `--screenshot` halutulla `--window-size`illa, `file://`-URL (http-palvelin kuolee shellin mukana).
- **Iframe kiertää headlessin 500px-minimileveyden.** `--window-size=390,844` antaa silti `innerWidth` 500; `<iframe width="390">` isomman ikkunan sisällä antaa todellisen 390px viewportin. Kaikki kapean ruudun mittaukset on tehtävä näin.
- **Virtuaaliaika EI aja CSS-siirtymiä.** `getComputedStyle(el).transform` jää alkuarvoon vaikka luokka on vaihdettu — ja niin jää myös inline-tyylillä asetettu arvo, koska sekin siirtyy. Oire näyttää tasan siltä kuin CSS-sääntö ei osuisi. Injektoi `*,*::before,*::after{transition:none!important}` ennen tilamittauksia. (Tämä maksoi kolme sondia käsihyllyä tehdessä.)
- **Käden peek-kaista tarvitsee oman napautuskohteen.** Ilman `#hand-lip`-nappia korttien päällä peek-alueen napautus osuu korttiin ja `promoteToHand` nostaa sen areenalle vahingossa — käyttäjä yritti vain avata hyllyn.
- `body.focus-mode #hand-bar-cards` (1,1,0) häviää `#hand-bar.hand-bar--open #hand-bar-cards` -säännölle (2,1,0). Ajastimen käynnistyessä hylly on suljettava **tilan kautta** (`setHandBarOpen(false)`), ei luokkaa lisäämällä — muuten localStorageen jää auki-tila jota ruudulla ei näy.
- **Kirjautuminen ei ole yhdistämistä vaan tilin tuomista.** `fap_data_uid` puuttuu kun paikallinen data on syntynyt kirjautumattomana → se ei ole koskaan kuulunut tälle tilille, ja aikaleimavertailu pilvidataan on merkityksetön (leimat mittaavat eri datajoukkoja). Tuore paikallinen data voitti tilin oikeat tehtävät ja työnsi ne pilveen. Nyt: `prevUid !== user.uid` ja molemmilla dataa → tili voittaa, paikallinen talteen `<lsKey>__prelogin`-avaimeen. Tyhjä tili + paikallista työtä on yhä migraatio ylöspäin.
- **Redirect-kirjautuminen ei toimi kun authDomain on eri origin.** `signInWithRedirect` tallettaa paluutilan authDomainin tallennukseen, jonka selaimet osioivat → paluu Googlelta ei löydä tilaa ja epäonnistuu **hiljaa** (ei virhettä, ei käyttäjää). Popup toimii, koska se palauttaa tunnisteen `postMessage`illa. Popup on siksi ensisijainen myös mobiilissa. Pysyvä korjaus: authDomain samaan originiin (Firebase Hosting). Hiljainen tapaus on tehty näkyväksi `sessionStorage`-lipulla.
- **Ominaisuus voi olla valmis mutta tavoittamaton.** Mobiilikäsi oli jo koodattu (`toggleHandBar`, `initHandBarState`, `fap_hand_open`), ja `renderHandBar` täytti kortit myös puhelimessa — vain `display:none` esti kaiken. Sama kuvio kuin aamusuunnittelussa 2026-07-29 (velho oli olemassa, `window.open`-kutsua ei). **Ennen kuin rakennat mobiiliversion jostakin, tarkista onko se jo olemassa nukkumassa.**

#### Käden kuollut koodi — todennettu 2026-07-30, ei siivottu

Käsihyllyn yhteydessä kartoitettu. Jätetty tarkoituksella koskematta (oma
siivouksensa), mutta **älä oleta näiden toimivan** ja poista ne kun siivoat.
Rivinumerot vanhenevat — hae nimellä.

| Tunniste | Tila |
|---|---|
| `#hand-cards`, `#hand-label`, `#hand-empty`, `#hand-bar-empty` | Pelkkää CSS:ää, ei DOM-elementtiä eikä JS-viittausta. Jäänne TCG:tä edeltävästä vaakavieritys-kädestä |
| `.card-new--hand` (+ sen `→ Nosta` -tooltip), `.card-new__star-mark` | CSS-lohkoja joita mikään ei lisää. Korvattu `.tcg-card--hand`illa |
| `hand-bar--hidden` | CSS on olemassa (2 sääntöä) ja luokkaa *poistetaan* neljässä paikassa ja *tarkistetaan* yhdessä — mutta **sitä ei lisätä missään**. Ajastimen piilotus tehdään `body.focus-mode`illa |
| `body-hand-hidden` | Vain poistetaan, ei koskaan lisätä, ei CSS:ää |
| `body.hand-hidden` | CSS olemassa, mutta luokkaa ei koskaan lisätä |
| `body.hand-open` | `setHandBarOpen` asettaa sen, mutta molemmat CSS-vaikutukset ovat kuolleita: `body.hand-open{padding-bottom}` on ylikirjoitettu nollaksi kummassakin media-lohkossa, ja `body.hand-open #hand-toggle` osoittaa piilotettuun nappiin. Tilapeili, ei tyyliä |
| `_handBarVisible` | Julistetaan `true`, ei lueta koskaan |
| `#hand-toggle` + `#hand-toggle-label` + `toggleHandBar()` | Nappi on `display:none` **kummassakin** media-lohkossa (työpöytä ja mobiili kattavat koko leveysalueen), joten se ei ole koskaan näkyvissä. `toggleHandBar` on siis tavoittamaton: mobiilihylly kutsuu `setHandBarOpen`ia suoraan. `renderHandBar` päivittää yhä `#hand-toggle-label`in tekstin — kirjoitus näkymättömään |

Elossa ovat vain: `#hand-bar`, `#hand-bar-cards`, `#hand-lip`, `.tcg-card--hand`,
`hand-bar--open`, `buildHandQueue`, `renderHandBar`, `promoteToHand`,
`setHandBarOpen`, `initHandBarState`, `_attachHandHoverDesktop`, `_attachHandMobile`.

**Testitila oikealla laitteella (2026-07-30):**

| # | Testi | Tila |
|---|---|---|
| 1 | Mobiilinäkymä ja toiminnot | ✅ Jaakko: "kaikki toimii" (ennen käsihyllyä) |
| 2 | Kirjautuminen puhelimella | ✅ toimii popup-korjauksen jälkeen |
| 3 | Lisää aloitusnäyttöön / offline | ⬜ testaamatta |
| 4 | Ajastin: ruutu ei sammu, kello oikeassa lukituksen jälkeen | ⬜ testaamatta |
| 5 | Eleet kortilla (oikea/vasen/ylös) | ⬜ testaamatta laitteella (headless-TouchEventit läpi) |
| 6 | Aamusuunnittelu → ← Takaisin, muutokset näkyvät koneella | ⬜ testaamatta |
| 7 | Kone auki samaan aikaan: Ohjain-välilehti, ei kaksinkertaista pomo-laskuria | ⬜ testaamatta — vaatii kaksi laitetta |
| 8 | Käsihylly: huuli → kortin napautus → jonon perään | ⬜ testaamatta laitteella |

Palautus: `git revert` vaiheittain tai koko haara.

**Jälkikorjaukset oikean laitteen testauksen jälkeen:**

1. **Popup ensisijaiseksi myös mobiiliin.** Vaiheessa 0 valitsin redirectin mobiilin ensisijaiseksi reitiksi. Se oli väärin tälle hosting-asetelmalle: sovellus ajetaan `joketre3.github.io`-originista mutta `authDomain` on `fokus-a-priori.firebaseapp.com`, ja `signInWithRedirect` tallettaa paluutilan authDomainin tallennukseen, jonka selaimet osioivat. Kirjautuminen kävi Googlessa ja palasi hiljaa kirjautumattomana — sekä selaimessa että aloitusnäytön sovelluksessa. Popup ei nojaa säilyneeseen tilaan (`postMessage`), joten se on ensisijainen kaikkialla. `popup-closed-by-user` ja `cancelled-popup-request` **eivät** enää putoa redirectiin: ne tarkoittavat että käyttäjä perui.
2. **Kirjautuessa tilin tiedot voittavat vieraan paikallisen datan.** Ks. Opit-kohta "Kirjautuminen ei ole yhdistämistä".

**⚠ Avoin:** Firestore-säännöt `users/{uid}/{document=**}` pitäisi kattaa uuden `session/live` -dokumentin, mutta sitä ei ole varmistettu konsolista. Oire jos ei kata: konsolissa `⚠️ Istunnon kirjoitus epäonnistui: Missing or insufficient permissions`, eikä Ohjain-välilehti koskaan ilmesty.

### Impeccable-jono — kaikki komennot ajettu

`harden`, `audit`, `polish`, `optimize`, `document` tehty (critique-score 16/20, snapshot `.impeccable/critique/2026-06-11T10-44-50Z__index-html.md`). Tulokset DESIGN.md:ssä ja `.impeccable/design.json`issa. Jäljellä vain deltan seuranta detektorilla — ks. baseline-rivi Bash-työkaluissa.

### TCG-korttipeli-ilme (2026-06-04/05) — valmis, live

Komponentit `index.html`:ssä (etsi nimellä, rivinumerot vanhenevat): `.tcg-card*`-CSS-lohko, `renderArenaCard()`, `mkCostPips()`, `_tcgIconId()`/`_tcgSvgIcon()`, viuhka-käsi `#hand-bar`, Cinzel-`@import`, tokenit `--plate-top/bot`, `--hand-card-w/h`, `--hand-peek-h`.

**`renderArenaCard` mode:** `'arena'` = täysi kortti; `'hand'` = kompakti `.tcg-card--hand` ilman stats/footer/jatkokortti
**`#hand-toggle` on `#hand-bar`:n ULKOPUOLELLA DOM:issa** — position:fixed toimii oikein vain näin
**`#hand-bar-cards` on desktopilla `position:fixed`** — overlay viewportin alareunassa, hover avaa, 5s mouseleave sulkee. `#hand-bar` pysyy gridin pohjarivissä (182px) pitäen areenan paikallaan.
**Viuhkan tilat desktopilla:** lepo (`--hand-rest-t`, 99px näkyvissä) → `hand-bar--open` (`--hand-open-t`, 134px) → `hand-bar--hidden` (ajastin käynnissä, `translateY(100%)`). Geometria uusittu 2026-08-10 — ks. **Pidetty viuhka** alempana.

## Firebase

- Projekti: `fokus-a-priori`
- Auth domain: `fokus-a-priori.firebaseapp.com`
- Firestore workspace-data: `users/{uid}/workspaces/{wsId}`
- Firestore timer-asetukset: `users/{uid}/settings/timer`
- Firestore jaettu istunto: `users/{uid}/session/live` — ajastimen tila `endsAt`-mallilla, kirjoitus vain siirtymissä

## AI-analyysi

Kutsuu Anthropic API:a suoraan selaimesta (`https://api.anthropic.com/v1/messages`), malli `claude-sonnet-4-20250514`. API-avain `localStorage`-avaimessa `fap_apikey`. Palauttaa JSON:n kvadranttiehdotuksilla ja sammakkoehdotuksella.

## Tools & resources

- Stack: Single-file HTML, Firebase SDK v10+ (modulaarinen, CDN), Firestore, anonyymi auth, valinnainen Google Sign-In
- Fontit: DM Sans, DM Serif Display, Cinzel (TCG-kortit)
- Deployment: GitHub Pages https://joketre3.github.io/fokus/ (repo: "fokus")
- `gh` ei ole asennettu — PR:t GitHub MCP:llä (`mcp__plugin_github_github__create_pull_request` / `update_pull_request`), ei `gh pr create`
- Bash-työkalun työhakemisto palautuu `/home/jaakko`:hon heredocin tai `python3 -c`:n jälkeen. Sen jälkeen `grep` suhteellisella polulla palauttaa hiljaa tyhjän — se näyttää "ei osumia", ei virheeltä. Käytä `cd /home/jaakko/fokus && ...`
- Bash-työkalut: `grep -n` pipe-erotetuilla kuvioilla; `sed -n 'start,endp'` alueiden lukemiseen; `wc -l` tiedostokoon tarkistukseen ensin. `index.html`:ssä ei ole enää upotettuja valokuvia (poistettu 2026-07-27), vain 4 pientä inline-SVG:tä — `sed -n` on taas turvallinen

## Kaupallistaminen (lisätty 2026-05-28)

Täysi analyysi: `docs/strategia-kooste-2026-05.md`
Firebase-integraatiosuunnitelma: `docs/firebase-integraatio-suunnitelma.md`

### Nykytila vs. tavoite

| | Nyt | Tavoite |
|---|---|---|
| `index.html` | Firebase Auth + Firestore ✅ | — |
| `aamu.html` | Synkka opener-delegoinnilla ⚠ | Ei omaa Firebase-SDK:ta. Samassa välilehdessä (mobiili) `_resyncFromLocal()` hoitaa pushin paluun yhteydessä |
| `swipe.html` | Synkka opener-delegoinnilla ⚠ | Sama |
| Maksut | Ei mitään ❌ | Stripe + Vercel functions |
| Freemium-rajat | Ei enforcea ❌ | 30 tehtävää / 1 työtila ilmaisella |

### Arkkitehtuuripäätökset

- **Pysytään Firebasessa** — ei migraatiota Supabaseen
- **Stripe + Vercel/Netlify serverless** webhookeille (ilmainen tier)
- **Subscription-status Firestoreen:** `users/{uid}/subscription: { tier, status, expires_at }`
- **Kotipalvelin ei tuotantoon** — Firebase hoitaa, kotipalvelin vain dev-työkaluille

### Differointistrategia

Lähimmät kilpailijat: Sunsama ($20/kk), TickTick ($3/kk), Akiflow ($15/kk).
Fokuksen etu: ohjattu aamurutiini metodologiana (ei vain näkymänä), selkeämpi ja halvempi.

**Tie 1 (aloita):** Niche suomi — "Pohjoismainen tuottavuusrituaali", ~€2–5k MRR realistinen katto.
**Tie 2 (myöhemmin):** Globaali englanninkielinen versio kun pohja on kunnossa.

### Seuraavat askeleet prioriteettijärjestyksessä

- [x] Firebase-integraatio `aamu.html` ja `swipe.html`:ään ✅ (opener-delegointi, ei omaa SDK:ta)
- [ ] **Firebase Hosting** — `authDomain` samaan originiin kuin sovellus. Poistaa koko cross-domain-kirjautumisongelmaluokan (ks. mobiiliosion jälkikorjaus 1) ja tekee `signInWithRedirect`istä toimivan varareitin. Projekti on jo olemassa: `firebase init hosting` + `firebase deploy`. Vaihtaa osoitteen → käyttäjän päätös
- [ ] Firestore-sääntöjen varmistus `session/live`-dokumentille
- [ ] Stripe + Vercel-funktiot (checkout, webhook, portal)
- [ ] Freemium-rajojen enforkointi Firestoresta
- [ ] Email-kirjautuminen Google-kirjautumisen rinnalle
- [ ] Englanninkielinen versio

### Tilanapit muokkausmodaaliin (2026-08-11) — valmis, mobiili testaamatta

Tehtävä voi tulla tehdyksi tai jäädä odottamaan muulloinkin kuin pomodoron
aikana areenalla. `✓ Tehty` ja `⏳ Odottaa` olivat tavoitettavissa vain
areenakortilta, ajastinwidgetistä, eleistä ja listariviltä — eivät siitä
näkymästä johon korttia mennään katsomaan jälkikäteen (jonokortin ✎, PAKKA).

| Osa | Mitä |
|---|---|
| `#edit-done-btn` / `#edit-wait-btn` | Uusi nappirivi modaalin rungossa Jatkokortti-napin yläpuolella (ei footeriin: siellä on jo Tallenna/📅/Peruuta ja mobiilissa se on sticky). Teksti + `onclick` asetetaan `openEditModal`issa kortin tilan mukaan |
| `editModalAction(fn)` | Tallenna ensin, toimi sitten. `saveEditModal` palauttaa nyt totuusarvon → tyhjä nimi keskeyttää toiminnon ja modaali jää auki |
| `_editDone(id)` | `active===id` → `doneActive()` (nostaa ketjukortin kärkeen), muuten `markDone(id)` |
| Tilat | `t.waiting` → «↩ Palauta vuoroon» (`clearWaiting`); `t.done` → «↩ Palauta tekemättömiin» (`restore`) ja odotusnappi piiloon |

Opit:
- **`markDone` ja `doneActive` eivät ole synonyymejä:** vain `doneActive` nostaa
  `findChainNext`in jonon kärkeen. Uusi kutsupaikka joutuu valitsemaan kumpaa
  se jäljittelee — areenan kortilla oikea vastaus on `doneActive`.
- **Toiminnon on ajettava `saveEditModal`in JÄLKEEN**, ei ennen: se tekee
  `save()+render()+closeEditModal()`, joten kortti on tuoreena DOM:issa ja
  `markDone`in `[data-task-id]`-haku löytää sen ulosanimaatiota varten. Samalla
  kesken jäänyt muokkaus ei huku. `active` voi myös vaihtua tallennuksessa
  (pikatehtävä `est=0`) → `active===id` on vertailtava vasta sen jälkeen.
- **Tehty kortti ei saa mennä odottamaan:** odottavat-paneeli suodattaa
  `!t.done`, joten `waiting` jäisi tilaksi jota mikään näkymä ei näytä.
- `wtB.style.display='none'` on nollattava `''`:ksi ei-tehdyllä kortilla —
  napit ovat pysyviä DOM-elementtejä, joten piilotus jää muuten voimaan
  seuraavalle kortille.
- Testit: `tests/suites/edit_modal.js` (27 väitettä). Kontrolliajo
  `--tree /tmp/base-tree`illa kaatuu heti («napit ovat DOM:issa» false) → suite
  mittaa oikeasti tätä muutosta.

**⚠ Mobiili testaamatta laitteella.** Napit perivät footerin toissijaisen
tyylin ja ovat `flex:1` samalla rivillä; <600px modaali on lähes fullscreen.

### Muokkausmodaali popupeihin (2026-08-11) — valmis, laitteella testaamatta

Sama modaali samoine tilanappeineen myös `aamu.html`:ään ja `swipe.html`:ään.
Aiemmin aamussa ei ollut minkäänlaista muokkausta eikä yhtäkään modaalia;
swipessä oli suppea bottom sheet, jonka värit oli kovakoodattu vaaleiksi
(havu-teemassa valkoista valkoisella).

**Rakenne: yksi lohko, kaksi identtistä kopiota.** `<!-- BEGIN fokus:edit-modal
v1 -->…<!-- END -->` sisältää CSS:n, DOM:in ja IIFE:n joka julkaisee
`window.FokusEdit`in (`init/open/close/isOpen`). Isäntä rekisteröi adapterin:
`{tasks, queue, projects, persist, refresh, notify}`. Lohkoa **ei saa muokata
vain toiseen tiedostoon** — `tests/run.py`:n `shared_block`-esitarkistus vertaa
kopiot merkki merkiltä ja kaatuu erosta. Kanonista kolmatta kopiota ei ole
tarkoituksella: se voisi ajautua näistä kahdesta ilman että mikään huomaa.
Muokkaa siis molempia (esim. kopioi lohko toisesta toiseen) ja aja
`python3 tests/run.py shared_block`.

`index.html` jää supersetiksi: 📅 ICS ja ↳ Jatkokortti eivät porttautuneet.

**Toinen jaettu lohko (2026-08-12): `/* BEGIN fokus:sched v1 */…/* END */`** —
ajastuksen logiikka `localDateStr`, `scheduleDue`, `fmtSchedule`,
`fmtSchedDays`, `schedLaterThanToday`, `releaseDueSchedules`. Kopiot
**kolmessa** tiedostossa: `index.html`, `aamu.html`, `swipe.html` (toisin kuin
edit-modal, joka on vain popupeissa). `shared_block` vertaa nyt molemmat lohkot
ja tuntee eri tiedostojoukot. Lohko on puhdasta logiikkaa: se ei tallenna,
piirrä eikä ilmoita mitään, koska `save`/`render`/`notify` ovat eri asioita
pääsovelluksessa ja popupeissa — kutsuja hoitaa ne. Kopiointiin:
`/tmp/.../sync_block.py`-tyylinen skripti tai käsin, mutta aja
`python3 tests/run.py shared_block` perään.

| Tiedosto | Mitä |
|---|---|
| `swipe.html` | `#edit-panel`, `openEditCard`, `saveEditCard` poistettu; ✎ → `FokusEdit.open`. `saveQueue`in kenttälistaan `waiting`/`projectId`, `done` vain tosi-suuntaan. `loadData` lukee `d.projects`in |
| `aamu.html` | ✎ vaiheiden 1–2 riveille; uusi `persistTaskEdit` (kapea kirjoitus — `saveData` rakentaisi jonon uudelleen slotteista); `#nt`-toast (ei ollut aiemmin mitään palautetta); `goStep3` säilyttää sammakkovalinnan |

Opit:
- **Isäntä voi poistaa kortin listaltaan kesken toiminnon.** `action(fn)` teki
  ensin `save()`n (joka kutsuu isännän `refresh`iä) ja etsi kortin vasta sitten
  id:llä — odottavalla kortilla refresh oli jo pudottanut sen, joten «Palauta
  vuoroon» ei tehnyt mitään eikä kertonut siitä. Nyt kortti otetaan talteen
  **ennen** tallennusta ja toiminto saa olion, ei id:tä.
- **Pudotussääntö on kopioitava latauksen suodattimesta.** swipe näyttää
  odottavat kortit pakassa (`loadData` ei suodata `waiting`), joten niitä ei saa
  pudottaa `refresh`issäkään — muuten sama kortti on yhtä aikaa poissa ja
  palaa uudelleenlatauksessa. aamussa suodatin lisättiin (`!t.waiting`), joten
  siellä pudotus on oikein. Suodatin ja refresh ovat sama sääntö kahdessa
  paikassa; ristiriita näkyy vasta reloadissa.
- **Kentän puuttuminen kirjoituslistalta on hiljainen bugi.** swipen `saveQueue`
  kopioi 10 kenttää nimeltä; `waiting` olisi jäänyt tallentumatta ilman virhettä.
  `done` taas kirjoitetaan vain `true`-suuntaan: pakassa on pelkkiä tekemättömiä,
  joten `o.done=false` ylikirjoittaisi pääikkunassa juuri tehdyn kortin.
- **Popupeilla on sama tokenisto** (`--ink/--paper/--muted/--light/--accent/
  --q1…--q4/--pomo`), vain arvot eroavat → lohko seuraa isännän teemaa ilman
  omia teemasääntöjä. Modaalin pinta on `color-mix(in srgb, var(--paper) 90%,
  var(--ink) 10%)`, jotta kentät (`--paper`) erottuvat kummassakin suunnassa.
- **Taustaväri ilman tekstiväriä on puolikas sääntö.** `#edit-frog.on` sai vain
  `background:var(--q2)`, teksti jäi `--mutediksi` → vaaleassa teemassa tummaa
  tummalla. Valittu tila on aina pari (tausta + muste).
- `q2`-rivin `row.onclick` valitsee/poistaa valinnan → rivin sisään lisätyn
  ✎-napin kuuntelija tarvitsee `e.stopPropagation()`.
- Vanha suite voi olla vanhan sopimuksen dokumentaatio: `swipe.js` kutsui
  poistettua `openEditCard`ia ja `aamu.js` väitti odottavan näkyvän velhossa.
  Molemmat päivitettiin — kaatuva vanha testi kertoi käytösmuutoksesta, ei viasta.

**⚠ Laitteella testaamatta.** Headless todentaa datan, tilat ja teemat; käymättä
ovat oikea kosketuskäyttö, popupin paluu samassa välilehdessä (`?back=1`) ja
Firestore-synkka.

### Popupien paluunapit (2026-08-11) — valmis, laitteella testaamatta

**Vika (Jaakon havainto):** swipen lopun «Sulje ja siirry ajastimeen» ei tehnyt
mitään. Nappi oli `onclick="window.close()"`, ja selain sulkee vain ikkunan
jonka skripti itse avasi. No-op kolmessa tilanteessa: mobiilissa aina
(`_openPopup` navigoi samaan välilehteen `?back=1`), sivun ollessa avattu
suoraan osoiterivistä, ja kun `window.opener` on katkennut (iOS, `noopener`).

Asia oli jo tiedossa — `swipe.html`:n kommentti sanoo sen sanatarkasti ja
`goBackToApp()` hoiti kaikki tapaukset — mutta **neljä nappia ei koskaan
päätynyt kutsumaan sitä**: swipen done-nappi, aamun näytön 5 nappi,
`skipToEnd()` ja aamun oma `goBackToApp` (josta puuttui popup-haara kokonaan).

| Osa | Mitä |
|---|---|
| `goBackToApp()` | Ei enää haaraudu `window.openerin` perusteella: fokusoi openerin, yrittää `close()`, ja varmistaa 150 ms:n kuluttua `history.back()`illa (tai `location.href='index.html'`). `pagehide` peruu ajastimen |
| Nappien tekstit | Samassa välilehdessä «Sulje ja siirry ajastimeen» → «Siirry ajastimeen →» (aamussa «Takaisin Fokukseen →») — mitään ei suljeta, joten nappi ei saa luvata sitä |

Opit:
- **`window.opener` ei kerro voiko ikkunan sulkea.** Opener voi olla olemassa
  vaikka `close()` on no-op ja toisin päin. Oikea muoto on yritä–varmista, ei
  haarauta etukäteen.
- **Kommentti oikeasta ratkaisusta ei ole ratkaisu.** Korjaus oli kirjoitettu
  ja dokumentoitu funktioon jota kolme neljästä kutsupaikasta ei käyttänyt.
  `grep -n "window.close()"` löysi ne sekunneissa — kannattaa ajaa aina kun
  yksi ilmentymä korjataan.
- **Testattavissa headlessissa enemmän kuin luulisi:** `window.close`,
  `window.opener` ja `history.back` ovat kaikki stubattavissa sivun sisältä,
  joten «close on no-op → paluu historian kautta» on todennettavissa ilman
  oikeaa navigointia. Fallback vaatii asynkronisen suiten (150 ms viive).
- Testien on peruttava `_backTimer` klikkauksen jälkeen (`clearTimeout`), tai
  testiajo navigoi itsensä pois kesken mittauksen.

**⚠ Laitteella testaamatta:** oikea `history.back()`-paluu puhelimella ja
popupin sulkeutuminen työpöydällä.

### Selaintestit (2026-08-08)

`tests/`-hakemisto: headless-Chrome-testipohja, ei riippuvuuksia.
Ajo `python3 tests/run.py` (~3 min), suitet `tests/suites/*.js` (9 kpl, 150 väitettä).
Ks. `tests/README.md`. PR-läpikäynti ja merge-prosessi:
`docs/pr-testaus-ja-merge-prosessi.md`.

- Aiemman "Ei testejä, ei lintteriä, ei CI:tä" -rivin tilalle: testit ovat
  olemassa, CI:tä ei edelleenkään ole — aja käsin ennen pushia.
- **Kontrolliajo molempiin suuntiin on osa testin kirjoittamista.** Suite joka
  läpäisee korjatun puun mutta EI kaadu korjaamattomaan ei mittaa mitään.
  `tests/run.py --tree <vanha-puu>` on se tarkistus.
- **`tasks.every(...)` tyhjällä taulukolla on tosi.** `swipe.html` ei lataa
  pakkaa ennen `startSwipe()`ia, joten suodatustestit menivät ensin läpi
  tyhjästi. Väitä aina ensin että aineistoa on (`tasks.length>0`).
- **Headless ei palauta `visibility`ä** tilaluokan poiston jälkeen — sama
  `main`issa, ei siis regressio. Todenna palautussuunta luokasta.
- `_clearLocalAppData` on moduulinäkyvyydessä → ei tavoitettavissa sivun
  sisältä. Testattavissa vain irrottamalla funktio Nodeen.
- Kontrastisondi: `color-mix()` resolvoituu muotoon `color(srgb …)`, ja
  gradienttitaustalla oleva elementti raportoituu vääränä positiivisena →
  sondi merkitsee ne `img`-lipulla.

### Ajastimen vaiheenvaihto — ilmoituskerros ei saa katkaista sitä (2026-08-09)

**Vika (löytyi manuaalitestissä M3, oli `main`issa, ei missään PR:ssä):**
näyttö jähmettyi 00:01:een, tauko ei käynnistynyt; ▶ käynnisti tauon.

`pushNotif`illa ei ollut `try/catch`ia. `new Notification()` heittää
`TypeError`in mm. Chrome for Androidilla (*Illegal constructor*) **vaikka
`permission` on `'granted'`**. `tick()` tappaa intervallin ENNEN
`onPhaseEnd()`-kutsua, joten heitto keskellä `onPhaseEnd`ia jätti `startTmr()`:n
ajamatta → ajastin kuoli tilassa jossa `phase` oli jo vaihtunut.

Korjaus: `pushNotif` kokonaan try/catchiin + `onPhaseEnd` järjestetty niin että
**tila ja ajastin asetetaan ennen ilmoituksia** molemmissa haaroissa.

Opit:
- **Selaimen ilmoitus-API on sivuvaikutus, ei ohjausvirtaa.** `Notification`,
  `AudioContext` ja `navigator.vibrate` voivat kaikki heittää alustakohtaisesti.
  Kääri ne, tai aja ne vasta kun tila on jo kirjoitettu.
- **`permission==='granted'` ei tarkoita että konstruktori toimii.** Androidin
  Chrome vaatii `ServiceWorkerRegistration.showNotification()`in.
- **Headless ei löydä tätä koskaan:** `Notification.permission` on siellä
  `'denied'`, joten haara ei aja. `tests/suites/phase_end.js` pakottaa
  konstruktorin heittämään — näin alustakohtaiset heitot saa testattavaksi.
- **Oire "pysähtyy 1 sekunti jäljellä" tarkoittaa poikkeusta, ei ajastinlogiikkaa.**
  Näyttö jää viimeiseen maalattuun kehykseen; `tleft` on jo 0. Etsi heittoa
  siltä polulta joka olisi maalannut seuraavan kehyksen.
- **Headless-teemasiemennys vaatii `fap_theme`in.** Pelkkä `data-theme`-attribuutti
  ei riitä: `initTheme` ylikirjoittaa sen `localStorage`n oletuksella. Tämä
  pilasi ensimmäisen aurinkokontrastimittauksen (raportoitu 92, oikea 185).

### PR #7 + ajastinkorjaus: molemmat tarvitaan (2026-08-09)

Manuaalitestin M3 oire vaihtui korjauskierrosten välillä, mikä paljasti kaksi
eri vikaa samassa polussa:

1. `pushNotif`-heitto tappoi vaiheenvaihdon (ks. edellinen osio) — ajastin ei
   koskaan päässyt tauolle asti.
2. Kun se korjattiin, alta paljastui `main`in alkuperäinen käytös: matriisi
   aukeaa itsestään (`openEisePeek(true)`) ja `focus-mode` jää päälle tauon
   jälkeen. Nämä ovat PR #7:n korjauskohteet.

Mitattu: merge ilman ajastinkorjausta 3/8, merge + korjaus 8/8.

- **Korjauksen jälkeen paljastuva uusi oire ei ole regressio** — se on vika joka
  oli edellisen takana. Vertaa oiretta edelliseen, älä oleta samaa juurisyytä.
- `onPhaseEnd` konfliktoi PR #7:n kanssa (3 hunkia). Yhdistettäessä:
  `openEisePeek(true)` pudotetaan, `closeEisePeek()` EI palaa tauon loppuun
  (PR #7 poisti sen tarkoituksella), `_syncTimerUI()` heti `startTmr()`:n
  perään ja ilmoitukset viimeiseksi.
- **Testattavan puun tunnistaminen on osa raportin lukemista.** "Matriisi
  aukesi itsestään" kertoi yksiselitteisesti että PR #7 puuttui — yhden
  funktiokutsun `grep -c` haaroittain vahvisti sen sekunneissa.

### Pidetty viuhka + palkin koordinaatistot (2026-08-10) — valmis, mobiili testaamatta

Käsiviuhka oli viisi käsin viritettyä `nth-child`-rotaatiota, joilla
`transform-origin:bottom center` — jokainen kortti kiertyi omasta tyvestään,
joten pohjat eivät konvergoineet mihinkään. Levossa näkyi ~50px pelkkää
taidetta: ei verbiä, ei nimeä. Suunta valittiin PR #5:n mockupista
(`mockup-kasi.html`, vaihtoehto **B — pidetty viuhka**); PR:n oma
`index.html`-osuus hylättiin vanhentuneena (base heinäkuulta, `#hand-lip` ja
`hand-bar--open` olivat sen jälkeen refaktoroineet rakenteen).

| Osa | Mitä |
|---|---|
| Tokenit | `--hand-rest-t:60px`, `--hand-open-t:24px`, `--fan-r:836px`, `--fan-step:5.5deg`, `--fan-step-open:9deg`. `--hand-peek-h` on nyt **vain mobiilin** huuli — desktop-ylikirjoitus (`calc(36px + --ledge-h)`) poistettu kuolleena |
| Geometria | Yksi kaava: kortit `position:absolute` keskelle päällekkäin, `transform-origin:50% var(--fan-r)`, `rotate(calc(var(--i) * var(--fan-step)))`. Kaari syntyy geometriasta, ei erillisistä translateY-arvoista. Viisi `nth-child`-sääntöä poistettu |
| `--i` / `--ia` | `renderHandBar` asettaa etumerkillisen indeksin keskeltä (`idx - (n-1)/2`) ja sen itseisarvon. Toimii millä tahansa korttimäärällä |
| Kääre | `translateY(var(--hand-rest-t)) rotate(-1.2deg)`; auki-tilassa `--hand-open-t` + `--fan-step:var(--fan-step-open)` |
| `--ledge-total` | Uusi tokeni `calc(var(--ledge-h) + .75rem)` — palkin laatikon korkeus `.wrap`-koordinaatistossa |

Mitattu 1625×875: lepo 50px → **99px** näkyvissä (taide + verbisiru), auki
108px → **134px**, väli areenakortin nappeihin +12px → **+35px**.

Opit:
- **Rekisteröimätön custom property ei invalidoi siitä laskettua transformia.**
  `--fan-step` vaihtui 5.5deg → 9deg auki-tilassa, mutta korttien
  `rotate(calc(var(--i) * var(--fan-step)))` jäi jumiin vanhaan matriisiin —
  `getComputedStyle` näytti uuden `--fan-step`in ja vanhan `transform`in
  yhtä aikaa. Korjaus: `@property{syntax:'<angle>'|'<number>'}` kaikille
  kolmelle. Sivuhyöty: tyypitetty arvo interpoloituu, joten viuhka
  levittäytyy sulavasti. **Mockupissa vika ei näkynyt**, koska se vaihtaa
  arvon `<html>`-elementillä (juuri invalidoi koko puun), ei kääreellä —
  mockupista siirretty sääntö voi siis rikkoutua pelkästä selektorin
  vaihdosta, vaikka arvot ovat identtiset.
- **`--ledge-h` ja `--ledge-total` eivät ole sama luku eri nimellä, vaan kaksi
  koordinaatistoa.** `.wrap` ylittää viewportin .75rem, joten palkin alin
  .75rem jää ruudun alle. `position:fixed` -elementti (`.notif`) väistää
  **`--ledge-h`:ta** (38px viewportin pohjasta) ja oli jo oikein;
  `.wrap`in sisällä absoluuttinen (`#break-banner` `#arena`ssa, jonka pohja on
  `.wrap`in pohja) väistää **`--ledge-total`ia** ja oli 12px liian alhaalla.
  Mittaa kumpi koordinaatisto on kyseessä ennen kuin "korjaat" — kolmesta
  epäillystä osumasta vain yksi oli oikeasti rikki, yksi oli pelkkä käsin
  toistettu ilmaisu ja yksi oli jo oikein.
- **Hover tarvitsee oman `transform-origin`in kun lepo-origo on kaukana.**
  Globaali hover-sääntö nostaa kortin `translateY(-52px) … !important`illa;
  `--fan-r`:n päässä olevalla origolla se olisi kaartanut kortin sivuun.
  `transform-origin:bottom center` hoverissa palauttaa pivotin tyveen.
- **Kontrolliajo paljasti että 4 kaatuvaa väitettä oli ennestään rikki
  `main`issa.** `git archive HEAD | tar -x -C /tmp/base-tree` +
  `python3 tests/run.py --tree /tmp/base-tree` antoi identtiset 4 failia →
  delta 0. Ilman tätä ne olisi luettu tämän muutoksen regressioiksi.
- `tests/harness.py` osoitti kovakoodattuun `/opt/pw-browsers/chromium-1194/…`
  -polkuun jota tällä koneella ei ole. Nyt ketju
  `CHROME_BIN` → `shutil.which("google-chrome")` → vanha polku viimeisenä.
- **CSP:n `frame-src` estää oman sivun mittaamisen iframessa.** CLAUDE.md:n
  mobiilikikka (iframe isomman ikkunan sisällä kiertää headlessin 500px-
  minimileveyden) ei toimi `index.html`:llä — `contentDocument` on `null`.
  Mobiilin kapean näkymän mittaus vaatii oikean kapean ikkunan.

**⚠ Mobiili testaamatta.** Uusi geometria on `min-width:900px`-lohkossa eikä
mobiili näe sitä, mutta mobiilin `nth-child`-nollaus tiivistyi yhdeksi
`transform:none`-riviksi — tarkista hylly puhelimella.

### Tehtäväjonon rata areenan lattialla (2026-08-11) — haarassa, ei mergeä mainiin

Haara `claude/task-queue-visibility-ymx47m`, PR #10. **Ei mergeä** — tämä on
testiversio jota ajetaan omalla datalla.

**Vika:** käsiviuhka lepää areenakortin alapuolella, joten käsikortin napautus
*näyttää* kortin lyömiseltä areenalle. `promoteToHand` tekee kuitenkin
`turn.push(id)` aina kun areena on varattu, ja kortti katoaa 44px kiskon taakse.
Ainoa palaute oli toast ja hover-`title`.

**Juurisyy on metaforakuilu, ei kosmetiikka.** Kuudesta vyöhykkeestä neljä on
fyysisiä paikkoja pöydällä — pakka, käsi, areena, tehdyt — ja kaksi on
tekstilistoja laatikossa: **tehtäväjono** ja **odottavat**. Ne kaksi jotka eivät
puhu korttikieltä ovat täsmälleen ne joita uusi käyttäjä ei löydä.

| Osa | Mitä |
|---|---|
| `mockup-jono.html` | Vaiheen 1 hyväksyntäportti. 3 varianttia, 3 teemaa, lite, jonon pituus 0–8, ajastintila, **9 elävää geometrialiukua** + "Kopioi tokenit". URL-parametrit `?v=v2&t=aurinko&n=5&lite=1&focus=1&peek=1&ctl=0` |
| `index.html` rata | `#queue-lane` + `renderQueueLane()` + `renderArenaCard`in `'lane'`-moodi. Lukee saman `turn`-taulukon kuin `renderTurnPanel` — ei uutta datamallia |
| Ennakkokorostus | Käsikortin hover/fokus → `body[data-hand-target]`: jono tyhjä → `#arena-slot-hint`, muuten radan häntä + kiskon badge |
| Koherenssikorjaukset | `HAND_MAX`, `buildHandQueue`in ämpärilajittelu — ks. oma kohta alempana |

**Valittu muoto (V2):** rata ei ole rivi luettavia kortteja vaan **pino oikeita
reunoja**. Kortit *eivät ole luettavia levossa* — rata kertoo jonon
**koostumuksen** (kvadranttivärit reunoina), ja luettavuus tulee hoverista.
Jatkosuunta: kortin visuaalinen hierarkia siirretään niin, että tärkein tieto on
kortin **oikeassa laidassa** ja vasen alanurkka jää tyhjäksi.

#### Kerrosskaala `#arena`n sisällä — muuttui, älä käytä mockupin arvoja

| z | Elementti |
|---|---|
| auto (0) | `#arena-room` (oma stacking-konteksti `perspective`in takia) |
| 1 | `.lane-shadow` |
| 2 | `.lane-ghost`, `#arena-slot-hint` |
| 3 | `#arena-label`, `#arena-empty` |
| 4 | `.lane-more` |
| **5–8** | **`.lane-card`** (`--qz = 8 − qi`) |
| **9** | `.tcg-card--arena-size` — **oli 3** |
| 10 | `#eise-handle` |
| **12** | `#break-banner` — **oli 5** |
| 20 | `#eise-peek` |

`--lane-max` on siksi enintään **4**: viides kortti saisi `--qz:4` ja törmäisi
`.lane-more`en, kuudes `#arena-label`iin. Mockup käytti arvoja rata 20 /
areenakortti 30 / hover 60 — **ne olisivat nostaneet areenakortin Eisenhower-
matriisin peekin (z:20) päälle.** DESIGN.md §6 -taulukko on päivittämättä.

**Opit:**
- **`#queue-lane` on `z-index:auto` TARKOITUKSELLA.** Positioitu elementti ei luo
  stacking-kontekstia ilman `z-index`iä. Jos rata olisi oma konteksti (esim.
  `z:2`) ja areenakortti `z:3`, radan sisäinen `z-index` ei kilpailisi kortin
  kanssa **koskaan** — yhtäkään yksittäistä ratakorttia ei voisi järjestää
  suhteessa siihen. Ja jos koko rata nostetaan kortin yli (`:has()`), myös
  **hoveraamattomat** kortit peittävät aktiivisen tehtävän.
- **`z-index` ei ole animoituva → sen nostaminen hoverissa näyttää siltä että
  elementti ilmestyy tyhjästä.** Kerros vaihtuu ensimmäisellä framella samalla
  kun `transform` vasta aloittaa 300 ms liukunsa. Radan hover on siksi puhdas
  **liuku**: `z-index`iin ei kosketa, kortti pysyy lepokerroksessaan ja vetäytyy
  `--lane-peek-x`:n verran oikealle. Silloin se ei *rakenteellisesti voi* mennä
  edessään olevan päälle — se ei ole sääntö vaan geometrian seuraus.
- **`--card-base` on mitattava kahdesti.** Renderin aikainen mittaus jäi **14px
  pieleen** (204 vs. oikea 190): kortin lopullinen korkeus asettuu vasta kun
  fontit ja koko lavaste ovat paikoillaan. Heittovarjolla virhe ei näkynyt
  (varjo on epämääräinen läikkä), mutta rata seisoo samalla viivalla ja 14px
  kuilu lukee kelluntana. Nyt `requestAnimationFrame(_syncCastShadow)` renderin
  perään + `document.fonts.ready`-uusinta. Tämä tarkensi myös heittovarjoa.
- **Ilmakehä on `--room-haze` (huoneen oma väri peitteenä), ei `brightness()`.**
  Kortin plate on tumma **kaikissa** teemoissa, joten pelkkä tummennus olisi
  lukenut varjona vaaleassa huoneessa. Tokenina se tummuu usvassa ja havussa ja
  vaalenee auringossa: sama sääntö, oikea suunta molempiin.
- **Kortti tarvitsee oman kääreen (`.lane-card`).** `.tcg-card--hand::after` on
  jo varattu hoverin osumakentälle, joten ilmakehäpeite ei mahdu kortille
  itselleen. Kääre pitää myös transformin erillään kortin omista tyyleistä.
- **Ratakorteilla ei ollut hoveria lainkaan** ennen kuin `.lane-card` sai
  `pointer-events:auto` erikseen — `#queue-lane` on `none`, ja se peri lapsille.
- **Kortin `z-index` ei saa tulla JS:stä inline-tyylinä** jos `:hover` haluaa
  ylikirjoittaa sen (inline > pseudoluokka ilman `!important`). Käytä
  `--qz`-tokenia ja `z-index:var(--qz)`.
- **`+N`-siru on ankkuroitava viimeisen kortin OIKEAAN reunaan.** Vasempaan
  ankkuroituna se katoaa areenakortin taakse heti kun `--lane-gap` on
  negatiivinen (pino alkaa kortin alta).
- **Rata täynnä → haamupaikka pois, kisko kertoo.** Muuten haamu valehtelee
  paikasta ja palaute katoaa juuri siinä tapauksessa jossa kohde on
  näkymättömissä (`.lane--full`).
- **Tauko: ei muutosta.** `focus-mode = !!tmr` kattaa jo sekä työn että tauon
  (`onPhaseEnd` kutsuu `startTmr()` myös tauolle), joten "tauko on tauko" ei
  vaatinut uutta logiikkaa — rata vain perii saman säännön.
- **Mockup voi valehdella siitä mitä se testaa.** Variantit on asetettava
  `#queue-lane`lle eikä `<html>`-elementille: `<html>`-taso invalidoi koko puun
  ja piilottaa juuri sen bugin jota vastaan `@property`-rekisteröinti on. Sama
  opetus kuin viuhkan `--fan-step`issä, nyt toisin päin.
- **Neljä vikaa löytyi mittaamalla, kaksi niistä olisi mennyt katselmoinnista
  läpi:** V2:n ja V3:n ensimmäinen kortti jäi *kokonaan* areenakortin taakse
  (jonon tärkein kortti näkymätön, mutta kuvassa se näyttää tarkoitukselliselta
  syvyydeltä), ja haamupaikka osui täydellä radalla viimeisen kortin päälle.
  Loput: `+N` kilpaili kiskosta 1440px:ssä, ja fixturessa oli liian vähän
  q1/q2-tehtäviä joten käsi jäi vajaaksi eikä ennakkokorostusta voinut arvioida.

#### Käden koherenssikorjaukset (samalla kierroksella, riippumattomat radasta)

Molemmat olivat mainissa pitkään. `tests/suites/hand_order.js` todentaa.

| # | Vika | Korjaus |
|---|---|---|
| C1 | `buildHandQueue` järjesti ämpärit `q1+frog → q1 → q2+frog → q2`, mutta **ämpärin sisällä ei lajitellut lainkaan** — `inbox.filter` säilyttää lisäysjärjestyksen. Matriisi taas lajittelee `t.order`illa. Kortin raahaaminen matriisissa **ei vaikuttanut käden järjestykseen ollenkaan** | Ämpärit lajitellaan `t.order`illa |
| C2 | `buildHandQueue` palautti 7 ja varoitti *"Käden max on 7. Näkyvissä 7 / N"*, mutta `renderHandBar` teki `.slice(0,5)`. Varoitus lupasi kaksi korttia joita ei koskaan päätynyt ruudulle | `HAND_MAX`-vakio, johon molemmat nojaavat |

- **`t.order` on kvadranttikohtainen indeksi** (`render()`: `qTasks.forEach(function(t,i){t.order=i})`), joten se on mielekäs vain **ämpärin sisällä** — ei ämpäreiden välillä. Siksi lajittelu on neljässä palassa eikä yhtenä. `forced` (tähtikortit) jätettiin lajittelematta: se kattaa useita kvadrantteja, joissa `order` ei ole vertailukelpoinen.
- `Array.prototype.sort` on stabiili (ES2019), joten koskaan raahaamattomat (`order` undefined → `||0` → 0) säilyttävät lisäysjärjestyksensä.

#### Testaus

```bash
python3 -m http.server 8080     # index.html — rata omalla datalla
# mockup: http://localhost:8080/mockup-jono.html?v=v2
export CHROME_BIN=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
python3 tests/run.py            # 150/150, 9 suitea
```

Kontrolliajo `hand_order`ille (suite joka ei kaadu korjaamattomaan ei mittaa
mitään):

```bash
git archive main | tar -x -C /tmp/base-tree
python3 tests/run.py hand_order --tree /tmp/base-tree   # → 4 EPÄONNISTUNUTTA
```

Tarkin niistä on `5 renderoity vs 7 palautettu` — se on koko C2 yhdellä rivillä.

**⚠ Testaamatta oikeassa selaimessa:**

| # | Testi | Miksi headless ei kata |
|---|---|---|
| 1 | Hoverin **liike** — 300 ms liuku ja paluu pinoon | Virtuaaliaika ei aja CSS-siirtymiä |
| 2 | Hoverin poistuminen: osoitin voi osua naapuriin paluumatkalla → värinä | Sama |
| 3 | Mobiili: rata on `display:none` <900px, mutta `--card-base`in uusi rAF-mittaus koskee myös puhelinta — hypähtääkö areenakortti latauksessa | Kapea viewport vaatii oikean ikkunan (CSP estää iframen) |
| 4 | Aurinkoteema: ratakorttien teksti kauimmaisella `--lane-haze`-tasolla | Kontrastisondi, ei kuvakaappaus |

Impeccable-deltaa **ei ajettu** — detektori on Jaakon koneella. Aja
`node ~/.agents/skills/impeccable/scripts/detect.mjs --json index.html` ja vertaa
`git show 2259048:index.html`-baselineen (4 osumaa / 3 kategoriaa) ennen mergeä.

**Palautus:** `git revert 6113618 1715fdb` (C-korjaukset ja rata erikseen).

### Ajastetut kortit (2026-08-12) — haarassa, manuaalitestit tekemättä

Haara `claude/ajastetut-kortit-korjaus`, PR #11. Spec:
`docs/superpowers/specs/2026-08-12-ajastetut-kortit-design.md`.

**Vika:** ajastettu tehtävä näkyi vain pakassa. Tähden sai laitettua mutta
kortti ei mennyt käteen, eikä syytä voinut todeta mistään.

**Juurisyy:** `checkScheduledTasks` vertasi täsmäminuuttiin
(`s.time===currentHHMM`) ja ajoi kerran minuutissa. Selain kiinni sinä
minuuttina → `scheduled_hidden:true` jäi pysyvästi. `inbox` suodattaa sen pois,
pakka ei suodata mitään, ja `t.schedule` luettiin vain tuossa yhdessä
funktiossa — joten ajastusta ei voinut nähdä, muuttaa eikä poistaa.

| Osa | Mitä |
|---|---|
| A | `scheduleDue` (`<=` eikä `===`), `localDateStr` (paikallinen päivä — `toISOString` heitti vuorokauden ennen klo 3), `sched_last_<id>` → `t.schedLast` jotta toisto synkkaa laitteiden välillä |
| B | `fmtSchedule(t, short)` -rivi kursiivilla: iso kortti, muokkausmodaali, pakkakortti. **Ei** kirjoiteta `t.lisatiedot`iin — tallennus lukisi sen käyttäjän tekstiksi |
| C | "Ajastetut" oma kategoria pakassa |
| D | Pakkakortin `⏳2` → `2 pom`; ⏳ merkitsi Odottaa-tilaa joka muualla |
| E | Ajastus näkyviin ja poistettavaksi muokkausmodaalista |
| F | Aamu ja selaus: jaettu `fokus:sched v1`, molemmat vapauttavat erääntyneet latauksessa |

**⚠ MANUAALITESTIT TEKEMÄTTÄ** — headless ei kata näitä:

| # | Testi |
|---|---|
| 1 | Ajasta tehtävä muutaman minuutin päähän, sulje välilehti, avaa ajan mentyä → ilmestyy + notify |
| 2 | Avaa **aamusuunnittelu PWA-pikakuvakkeesta** ilman pääsovellusta → aamuksi ajastettu on mukana |
| 3 | Toistoajastus ma–pe: laukeaa kerran päivässä, ei uudelleen refreshin jälkeen |
| 4 | Kaksi laitetta samalla tilillä: toisto ei laukea toiseen kertaan toisella |
| 5 | Ennen korjausta jumiin jäänyt kortti vapautuu itsestään ensimmäisellä avauksella |
| 6 | Mobiili: pakkakortin ajastusrivi ei mene tähtinapin alle kapeammalla kortilla |

Automaattitestit: `scheduled` 47, `sched_aamu` 15, `sched_swipe` 10, kaikki
läpi. Detektoridelta 0 kaikissa kolmessa tiedostossa.

**Palautus:** `git revert 359b49a 6553cd8 62313bb ec529dc`.
