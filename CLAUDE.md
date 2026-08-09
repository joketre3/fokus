# CLAUDE.md

## Design-backlog

Impeccable-analyysi tehty 2026-06-07. Raportti: `docs/impeccable-kritiikki.md`.
PRODUCT.md luotu 2026-06-10. P0 valmis.

**P0 ✅ valmis (2026-06-10):** Aurinko-teema kerma → puhdas valkoinen; aamu.html usva-synkronointi; --muted .55 → .72

**P1 ✅ valmis (2026-06-11):** text-xs tokenoitu; SVG-ajastinvärit → var(--pomo); reduced-motion aamu+swipe; empty states dashed-border

**P2 ✅ valmis (2026-06-11) — Eisenhower-peek + navigaatio:**
- Eisenhower-matriisi yhdistetty: vanha full-screen modaali poistettu → uusi `#eise-peek` areenan yläreunassa
- Handle (48px, koko areenan leveys, mini 2×2-matriisi kvadranttiväreillä, tehtävämäärät per kvadrantti)
- Peek liukuu ylhäältä alas areenan päälle — ei peitä sivupaneeleja (ODOTTAVAT / TEHTÄVÄJONO)
- Drag-and-drop kvadrantista toiseen + klikkauspohjainen siirtovalikko (mobiili)
- ↑-nappi suoraan matriisista jonoon; indikaattorit: 🐸 sammakko, ⌛ odottava, 🍅 jonossa
- Timer käynnistyessä: handle piiloutuu automaattisesti; pysähtyessä: tulee takaisin
- Tauon alkaessa (sbrk/lbrk): peek aukeaa automaattisesti tarjolle
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
- Impeccable-baseline: **4 osumaa / 3 kategoriaa** jotka EIVÄT ole bugeja — bounce-easing ×2 (M1:n tarkoituksellinen overshoot), em-dash-overuse (suomen välimerkki), dark-glow (aurinko-chip-token, väärä positiivi) — älä "korjaa", vertaa vain deltaa. Rivinumerot liikkuvat, vertaa `git show HEAD:index.html` -kopioon.
- Headless Chrome ei aja `initTheme`a (Firebase/CSP offline) — teemojen testaus headlessissa: temp-kopio kovakoodatulla `data-theme`-attribuutilla, ei localStorage
- Rinnakkaishaarojen mergen/rebasen jälkeen tarkista funktioduplikaatit: `grep -c "function nimi" index.html` — auto-merge voi tuoda saman funktion kahdesti (esim. rarityOf PR #4 + M1)
- Projektiväri-indikaattori: `box-shadow: inset 0 3px 0 <väri>` — ei `border-left` eikä `border-top` (detektori ampuu kaikista `border-top:Npx solid` -säännöistä)
- Piilotettava sisältö: `.wrap{display:grid;grid-template-rows:0fr;transition:grid-template-rows .18s}` + sisältö `min-height:0;overflow:hidden` — ei max-height-animaatiota
- `git stash` tarvitaan ennen `git checkout main` jos working treessä on muutoksia muissa tiedostoissa

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

`_clearLocalAppData()` pyyhkii kaiken `eis_v5*` + `fap_*` paitsi `fap_theme`, `fap_perf`, `fap_onboarded`, `fap_timer_settings` (laiteasetuksia, ei käyttäjädataa).

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

CSS custom properties: `--ink`, `--surface-xs`, `--surface`, `--surface-md`, `--surface-strong`, `--border`, `--subtle`, `--accent`, `--accent-dim`, `--muted`. Q2-värit ja logo-SVG:t pysyvät vihreinä.

## Keskeiset käsitteet

**Sammakko (Frog):** Tärkein tehtävä päivässä. Aina ensimmäisenä jonossa. Renderöidään 🐸:llä kaikkialla.

**Käsi (Hand):** TCG-inspired käsikorttipalkki desktopilla — top 5 jonotehtävää kortteina. Toggle: `window._useCardUI`.

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

### Impeccable-jono — kaikki komennot ajettu

`harden`, `audit`, `polish`, `optimize`, `document` tehty (critique-score 16/20, snapshot `.impeccable/critique/2026-06-11T10-44-50Z__index-html.md`). Tulokset DESIGN.md:ssä ja `.impeccable/design.json`issa. Jäljellä vain deltan seuranta detektorilla — ks. baseline-rivi Bash-työkaluissa.

### TCG-korttipeli-ilme (2026-06-04/05) — valmis, live

Komponentit `index.html`:ssä (etsi nimellä, rivinumerot vanhenevat): `.tcg-card*`-CSS-lohko, `renderArenaCard()`, `mkCostPips()`, `_tcgIconId()`/`_tcgSvgIcon()`, viuhka-käsi `#hand-bar`, Cinzel-`@import`, tokenit `--plate-top/bot`, `--hand-card-w/h`, `--hand-peek-h`.

**`renderArenaCard` mode:** `'arena'` = täysi kortti; `'hand'` = kompakti `.tcg-card--hand` ilman stats/footer/jatkokortti
**`#hand-toggle` on `#hand-bar`:n ULKOPUOLELLA DOM:issa** — position:fixed toimii oikein vain näin
**`#hand-bar-cards` on desktopilla `position:fixed`** — overlay viewportin alareunassa, hover avaa, 5s mouseleave sulkee. `#hand-bar` pysyy gridin pohjarivissä (182px) pitäen areenan paikallaan.
**Viuhkan tilat desktopilla:** peek (oletus, ~36px näkyvissä) → `hand-bar--open` (täysin auki) → `hand-bar--hidden` (ajastin käynnissä, `translateY(100%)`)

## Firebase

- Projekti: `fokus-a-priori`
- Auth domain: `fokus-a-priori.firebaseapp.com`
- Firestore workspace-data: `users/{uid}/workspaces/{wsId}`
- Firestore timer-asetukset: `users/{uid}/timerSettings/default`

## AI-analyysi

Kutsuu Anthropic API:a suoraan selaimesta (`https://api.anthropic.com/v1/messages`), malli `claude-sonnet-4-20250514`. API-avain `localStorage`-avaimessa `fap_apikey`. Palauttaa JSON:n kvadranttiehdotuksilla ja sammakkoehdotuksella.

## Tools & resources

- Stack: Single-file HTML, Firebase SDK v10+ (modulaarinen, CDN), Firestore, anonyymi auth, valinnainen Google Sign-In
- Fontit: DM Sans, DM Serif Display, Cinzel (TCG-kortit)
- Deployment: GitHub Pages https://joketre3.github.io/fokus/ (repo: "fokus")
- Bash-työkalut: `grep -n` pipe-erotetuilla kuvioilla; `sed -n 'start,endp'` alueiden lukemiseen; `wc -l` tiedostokoon tarkistukseen ensin. `index.html`:ssä ei ole enää upotettuja valokuvia (poistettu 2026-07-27), vain 4 pientä inline-SVG:tä — `sed -n` on taas turvallinen

## Kaupallistaminen (lisätty 2026-05-28)

Täysi analyysi: `docs/strategia-kooste-2026-05.md`
Firebase-integraatiosuunnitelma: `docs/firebase-integraatio-suunnitelma.md`

### Nykytila vs. tavoite

| | Nyt | Tavoite |
|---|---|---|
| `index.html` | Firebase Auth + Firestore ✅ | — |
| `aamu.html` | Firebase sync ✅ | — |
| `swipe.html` | Firebase sync ✅ | — |
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

- [x] Firebase-integraatio `aamu.html` ja `swipe.html`:ään ✅
- [ ] Stripe + Vercel-funktiot (checkout, webhook, portal)
- [ ] Freemium-rajojen enforkointi Firestoresta
- [ ] Email-kirjautuminen Google-kirjautumisen rinnalle
- [ ] Englanninkielinen versio

### Selaintestit (2026-08-08)

`tests/`-hakemisto: headless-Chrome-testipohja, ei riippuvuuksia.
Ajo `python3 tests/run.py` (~3 min), suitet `tests/suites/*.js`.
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
