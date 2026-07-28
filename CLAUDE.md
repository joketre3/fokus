# CLAUDE.md

## Kommunikaatio

Vastaukset minimiin. Luolamieskieli. Säästä tokeneita.

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

Ei testejä, ei lintteriä, ei CI:tä.

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
| `mockup-kasi.html` | Käsiviuhkan kolme vaihtoehtoa: teline / pidetty viuhka / pöytäkäsi (B valittu) |

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
- `backdrop-filter` on pääsyyllinen hitaaseen suorituskykyyn MacBook Pro 2010:llä (Intel HD Graphics, ei NVIDIA) — `html[data-perf="lite"]`-attribuutti poistaa sen kaikista elementeistä
- Usvametsä-teeman `--surface-xs` (rgba .35) ja `--surface` (rgba .42) ovat läpinäkyviä ja luottavat backdrop-filteriin — nopean tilan CSS ylikirjoittaa ne opaakeiksi (.97)
- `html[data-perf="lite"]` kuittaa kaikki CSS-transitiot automaattisesti `transition-duration:.01ms!important` — uusille animaatioille ei tarvita nopea-tila-erikoistapauksia
- `transform:translateX(-50%)`-elementteihin (esim. `.notif`) lisää `translateY()` samaan `transform`-arvoon: `translateX(-50%) translateY(8px)` — erillinen `translateY`-sääntö ylikirjoittaa edellisen ja rikkoo keskityksen
- Asetusnapit kuuluvat hampuriaisvalikkoon (Asetukset-osio), ei profiilipaneeliin — käyttäjä ei löydä piilotettujakin modaaleja
- Yläpalkki on `.hdr` (`grid-area:topbar`), mutta `#hdr-timer` EI ole sen sisällä — se on oma `position:fixed` -elementti (z:90) oikeassa yläkulmassa. Yläpalkkiin kohdistuvat kuuntelijat eivät tavoita ajastinwidgettiä
- `position:fixed` lapsi-elementti transformatun vanhemman sisällä positionoituu vanhempaan eikä viewporttiin — toggle-napit yms. sijoitetaan transformatun elementin ULKOPUOLELLE DOM:issa
- `node --check` ei toimi `.html`-tiedostoille — extractaa ensin: `python3 -c "import re; open('/tmp/chk.js','w').write('\n'.join(s[1] for s in re.findall(r'<script(?! type=[\"\'](module)[\"\']*[^>]*>)(?:[^>]*)>(.*?)</script>', open('index.html').read(), re.DOTALL)))"` → `node --check /tmp/chk.js`
- Headless Chrome `--screenshot` renderöi **staattiset** transformit (rotate, rotateX, perspektiivi) luotettavasti — käsiviuhka 2026-07-27 todennettiin näin. Se mitä se EI tee on siirtymien ja keyframejen ajaminen: virtuaaliaika ei etene CSS-transitionin aikana, joten ajonaikainen luokanvaihto jäätyy lähtöarvoon. Lataa tila valmiiksi päällä tai injektoi `transition:none!important` ennen mittausta
- Headless Chrome ei jaa `localStorage`:a eri origineista (eri portti = eri origin) → erillinen seed-sivu ei toimi. **Kierto:** injektoi `localStorage.setItem`-skripti testikopion `<body>`-alkuun — tällöin modaalit ja onboarding testautuvat normaalisti
- `checkMorningTask()` lisää tehtävän heti startup:ssa ja kutsuu `render()` — vaikuttaa `tasks.length`-pohjaisiin tarkistuksiin; suodata `aamusuunnittelu`-tagi pois ennen laskentaa
- CSS hover-bounce: kun elementti liikkuu `:hover`-tilassa ylös, lisää `::after { position:absolute; bottom:-64px; left:-8px; right:-8px; height:64px; }` laajentamaan hit-aluetta — muuten elementti pomputtaa itseään
- `position:fixed` lapsielementti grid-rivin sisällä positionoituu viewporttiin kun vanhemmalla ei ole `transform`ia — käytä tätä viuhkan kaltaisiin fixed-overlayhin gridin sisällä. (Käsi ei enää ole gridissä: `grid-area:auto` + full-bleed — ks. Yhtenäinen näkymä)
- `.wrap { overflow:hidden }` katkaisee gridin ulkopuolelle menevän sisällön — piilota elementit `translateY(100%)`:llä, älä siirrä fyysisesti gridin ulkopuolelle
- ~~Grid-rivi säilyttää korkeutensa vaikka sen sisältö on `position:fixed`~~ — koski vanhaa käsiriviä, joka poistettiin Yhtenäisessä näkymässä. Areenakortin ja käden törmäys ratkaistaan nyt mittaamalla (`_syncHandLift()`)
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
    scheduledDate: String|null,
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

- **Vaihe kerrallaan:** Jaakko vahvistaa "toimii" / "jatketaan" / "aloitetaan" ennen seuraavaa. Ei jatketa ilman vihreää valoa.
- **Jako ensin:** Jaa vaihe osiin (esim. 15a–15d) ennen toteutusta.
- **Lue vain relevantti osa** suunnitteludokumenteista — ei koko tiedostoa.
- **Mockup ensin** UI-päätöksille: erillinen mockup-tiedosto, ei working copya.
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

| Muutos | Tiedosto | Mitä |
|--------|----------|------|
| `html[data-perf="lite"]` CSS-lohko | index.html:~682 | `backdrop-filter:none`, transitiot pois kaikista elementeistä |
| Opaakki `--surface-xs`/`--surface` | index.html:~696 | Usva .35→.97, havu/aurinko omat arvot |
| `togglePerfMode()`, `initPerfMode()` | index.html:~7537 | localStorage `fap_perf`, `data-perf` attribute |
| Hampurilaisvalikko → Asetukset | index.html:~9137 | `#ham-perf-btn` nappi |

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
- Tokenit `:root`iin: `--panel-w:340px`, `--rail-w:44px`, `--ledge-h:38px`, `--dur-panel:300ms`, `--rail-ink` (3 teemaa), `--room-grid` (3 teemaa). Myöhemmin lisätty `--ledge-total`, `--fan-r/-step/-step-open`, `--hand-rest-t/-open-t` (ks. Käsiviuhka uusiksi)
- `.wrap` desktop-grid: `auto 1fr` / `1fr`, areat `"topbar" "stage"`. `.tcg-arena` + `.tcg-left` + `.tcg-right` kaikki `grid-area:stage`; paneelit `justify-self:start/end`, `align-self:stretch`, `width:var(--panel-w)`, `z:40`, `margin:.75rem 0` (erillinen `margin-bottom:var(--ledge-h)` oli kuollut — myöhempi `margin` ylikirjoitti sen; poistettu 2026-07-27)
- Paneeli = läpinäkyvä flex-rivi; well-skin (`linear-gradient(0deg,var(--well-bg),var(--well-bg)), var(--table-felt-deep)`) siirtyi `.side-panel__body`yn ja `.side-panel__tab`iin. Vieritys bodylle. Base-CSS: `.side-panel__body` pelkkä flex-pinoaja, `.side-panel__tab{display:none}`, `.table-ledge{display:none}` → mobiili + 600–899px ennallaan
- `_attachSidePanelRails()` (kutsu `_attachHandHoverDesktop()`:n perässä): `aria-expanded`-synkka, kiskon klik-toggle `.is-open` (touch), Esc + blur
- `body.focus-mode` päälle `toggleTimer`issa (eise-kahvan piilotuksen vieressä), pois `stopAll()`:ssa
- `_syncCastShadow()` render()-lopussa + resize: mittaa areenakortin alareunan → `--card-base` `#arena-room`iin
- `.tcg-arena` alapadding `7rem` → `9rem` (2026-07-27). Pelkkä padding ei riitä: käsi seuraa viewportia 1:1, kortti 1:2 → matalilla ikkunoilla ne törmäävät. `_syncHandLift()` hoitaa loput

**Vaiheen 1 ratkaisut (siirrettävä index.html:ään vaiheissa 2–5):**
- `.wrap` grid `auto 1fr` / `"topbar" "stage"`; `#arena` JA molemmat paneelit `grid-area:stage` (päällekkäiset grid-solut). Paneelit `justify-self:start/end`, `width:340px`, `z-index:40`. Paneelit pysyvät `#arena`n sisaruksina → sisarus z:40 maalautuu isoloidun areenan päälle.
- Kisko on `<button class="side-panel__tab">` paneelin sisällä (vasen: viimeinen lapsi, oikea: ensimmäinen). Lepotila `translateX(∓(340−44)px)`, avaus `:hover,:focus-within → translateX(0)`. Sulkuviive `transition-delay:250ms` VAIN lepotilasäännössä. `--dur-panel:300ms`.
- `.table-ledge`: 38px pöydän kehys huovan alalaidassa, `z:65` (käden 60 päällä). (Mockup-vaiheessa `pointer-events:none`; tuotannossa se on `<button id="deck-rail">` eli `auto` — ks. PAKKA-palkki.)
- `#hand-bar` = viuhkan rajausikkuna (`left/right:.75rem; top:0; bottom:.75rem; overflow:hidden`), `#hand-bar-cards` sen sisällä `position:absolute`.
- 3D-viritys full-bleedille: perspective 1000→1300px, perspective-origin 50% 38%→40%, `__side` 16%→10%, `__spot` `min(70%,900px)`, `__echo-art` `min(60%,560px)` keskitettynä, `__echo::after` `min(52%,620px)`, `#arena-room` inset `48px 0 0`→`0`. Wall/floor/castshadow-arvot säilyvät.
- Eise-kahva: keskitetty `max-width:min(720px, calc(100% - 2*var(--panel-w) - 2rem))`.

**Opit (vaihe 1):**
- **Heittovarjo full-bleedissä:** `bottom:5%` irtoaa kortista — kuilu kasvaa ikkunan korkeuden mukaan (120px @1600). Ankkuroi kortin tyveen: `top:calc(50% + 188px); bottom:auto` (kortti pystykeskitetty, puolikorkeus 196px − translateY 12px).
- ~~**Käsiviuhka + kehys:** auki-tilassa viuhka on nostettava kehyksen yläpuolelle~~ — kumottu jo vaiheessa 2–5 (ks. alla) ja lopullisesti 2026-07-27: nosto on mitattu, ei kiinteä.
- `#hand-bar-cards` koko viewportin levyisenä + `pointer-events:auto` on ansa: tukkii sivupaneelien alaosan ja avaa viuhkan mistä tahansa alareunan hoveristä → `pointer-events:none` kontainerille, `auto` korteille. `:hover` propagoituu silti kontaineriin lapsen kautta.
- **`*` ei osu pseudo-elementteihin** — `html[data-perf="lite"] *{animation:none}` jättää `::after`-keyframet pyörimään. Käytä `*,*::before,*::after` sekä litessä että reduced-motionissa. (index.html tekee tämän jo oikein riveillä 785, 799–801.)
- `writing-mode:vertical-rl` lukee JO ylhäältä alas — `rotate(180deg)` oikealle kiskolle kääntäisi tekstin alhaalta ylös JA badgen numeron ylösalaisin. Älä kierrä.
- `visibility:hidden` fokustilaan: pelkkä `transform` + `pointer-events:none` jättää railit ja käsikortit tab-järjestykseen ruudun ulkopuolelle (WCAG 2.4.3/2.4.7). Liuku säilyy `transition: ..., visibility 0s linear var(--dur-panel)`.
- Aurinko-teema tarvitsee omat ylikirjoitukset: `.turn-card`/`.waiting-item` (tumma plate-komposiitti → mutainen harmaa laatta), `html[data-theme="aurinko"][data-perf="lite"]` surface-tokenit (lite-lohko kaappaa ne muuten tummiksi), lattiaruudukko tokenina `--room-grid` (kovakoodattu valkoinen katoaa vaaleassa).
- `--subtle` ja `--etch-ink` ovat koriste-/taustatokeneita (kontrasti 1.05–3.6:1) — informaatiota kantava teksti tarvitsee `--muted`in tai oman `--rail-ink`-tokenin.
- **Headless-mittaus:** `getBoundingClientRect` on luotettava. Tilaluokkien testaus on silti turvallisinta lataamalla sivu tila valmiiksi päällä (`<body class="focus-mode">`) — ajonaikainen luokan lisäys + heti mittaus osuu kesken siirtymän. (Korjattu vaiheessa 6: virtual-time AJAA `setTimeout`in, joten viivästetty mittaus toimii — ks. vaiheen 6 opit.)

**Opit (vaiheet 2–5, korjaavat osan vaiheen 1 oletuksista):**
- **Heittovarjon kiinteä offset ei riitä:** mockupin `top:calc(50% + 188px)` olettaa 392px kortin, mutta index-areenakortissa on lisäksi toimintanapit (~490px) → varjo jäi kortin taakse. Ratkaisu: JS mittaa kortin alareunan (`.tcg-card--arena-size`, EI `.card-new--arena`) ja asettaa `--card-base`.
- **Käden auki-tila ei saa nousta kehyksen yläpuolelle** (vastoin vaiheen 1 opetusta): `translateY(-(ledge-h+12px))` nostaa kortin kokonaan kehyksen yli → viuhka kelluu eikä "tule pöydän alta". Periaate pätee yhä; kiinteä `translateY(0)` korvattiin 2026-07-27 mitatulla `--hand-open-t`:llä.
- **Kehys kiinni ikkunan alareunaan:** `bottom:.75rem` jättää 12px raon, josta näkyy huovan alamarginaali ja paneelien alareunat. Oikein `bottom:0; height:var(--ledge-total); border-radius:0`.
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
- **Osumatestaus:** `document.elementFromPoint` ei kelpaa maalausjärjestyksen todentamiseen, jos elementillä on `pointer-events:none` (esim. `.notif`; `.table-ledge` oli tällainen ennen PAKKA-palkkia) — se ohitetaan aina. Päättele z-järjestys stacking-konteksteista.
- Regressiovertailun baseline: `git show HEAD:index.html` → sama seed-generaattori molemmille → pikselidiffi. 700 px 0,02 % ja 390 px 0,03 % = kohinataso.

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

### Käsiviuhka uusiksi (2026-07-27) — valmis

Viuhka liukui ylös ruudun alareunasta ilman lähdettä. Kolme vaihtoehtoa mockupattiin (`mockup-kasi.html`: A teline / B pidetty viuhka / C pöytäkäsi), **B valittiin**.

| Osa | Mitä |
|---|---|
| Viuhkan geometria | `nth-child(1..5)`-viritys → yksi kaava: `transform-origin:50% var(--fan-r)` + `rotate(calc(var(--i)*var(--fan-step)))`. `renderHandBar` asettaa `--i`/`--ia`. Toimii millä tahansa korttimäärällä |
| Lepotila | 49px → 96px näkyvissä: taide + verbisiru lukeutuu. Kaari, ei suora rivi |
| Ote | `#hand-grip` — tumma pooli PAKKA-palkin yläreunassa, laajenee auetessa. Litessä pois |
| Törmäysbugi | Auki-tila peitti Aloita/Tehty/✕. `.tcg-arena` padding 7rem→9rem **ja** `_syncHandLift()` |
| `--ledge-total` | Uusi token: palkin laatikon korkeus (50px). `--ledge-h` (38px) on näkyvä korkeus — molemmat päteviä, eri tarkoitukseen |
| Kuollut koodi | `#hand-bar--hidden`-CSS, `_handBarVisible`, `#hand-cards`/`#hand-label`/`#hand-empty`/`#hand-bar-empty`, kuollut `.tcg-left/.tcg-right{margin-bottom}` |

Opit:
- **Käden nostoa ei voi kovakoodata.** Käsi on `position:fixed` viewportin pohjaan → liikkuu 1:1 ikkunan korkeuden mukana. Areenakortti on `justify-content:center` → liikkuu 1:2. Ne lähestyvät toisiaan ikkunan madaltuessa: 9rem padding riitti ≥782px korkeudella, 720p:ssä ei. Riittävä padding olisi ollut ~17,7rem = areena litistyy. Oikea työkalu on mittaus (`_syncHandLift()`), sama kuin `--card-base` heittovarjossa
- **Näkyvä osa palkin yläpuolella = 156px − translateY**, riippumaton ikkunan korkeudesta: leikkuupohja on vp−12, palkin yläreuna vp−38, kortti 182px. Areenakortin sijainti sen sijaan RIIPPUU korkeudesta → törmäystesti on ajettava useassa koossa, ja **lyhin ikkuna on pahin tapaus** (ei pisin)
- **Kaukainen pivot antaa kaaren ilmaiseksi.** `transform-origin:bottom center` kiertää jokaisen kortin omasta tyvestään → pohjat eivät konvergoi. Siirrä origo `--fan-r`:n (836px) päähän kortin yläreunasta alaspäin: pohjat konvergoivat ja uloimmat kortit laskeutuvat `d(1−cos θ)` verran automaattisesti
- **Vaakajako = d·sin(θ)** missä d = `--fan-r` − puolikorkeus (836−91=745). Auki-tilassa säteen kaventaminen kaventaa myös jakoa → nimet jäävät naapurin alle. **Muuta vain kulmaa, älä sädettä**
- **Virtuaaliaika EI etene CSS-siirtymän aikana.** Luokan lisääminen ajonaikaisesti + `getComputedStyle` palauttaa lähtöarvon koko keston ajan → auki-tila mittautui lepotilaksi. Joko lataa sivu tila valmiiksi päällä tai injektoi `transition:none!important` ennen mittausta
- **Yhteinen auki-sääntö ennen varianttilohkoa voittaa saman spesifisyyden.** `html[data-hand="open"] #x` ja `html[data-variant="c"] #x` ovat molemmat (1,1,1) → lähdejärjestys ratkaisee. Varianttikohtainen transform tarvitsee oman auki-säännön
- **Palkilla on kaksi korkeutta.** `--ledge-h` (38px) on **näkyvä** korkeus: `.wrap` ylittää viewportin .75rem, joten palkin alin .75rem jää ruudun alle. `--ledge-total` (50px) on **laatikon** korkeus. Näkyvää reunaa väistävä (`.notif`) lukee `--ledge-h`:n oikein; laatikkoa mittaava tarvitsee `--ledge-total`in — vanha `--hand-peek-h: calc(36px + var(--ledge-h))` luki väärää ja jäi 12px vajaaksi
- Kuollut `hand-bar--hidden`: luokkaa ei lisätty missään, vain poistettiin 5 kohdassa. Ajastimen aikainen piilotus hoituu `body.focus-mode`illa
- Aurinko-teemassa musta ei ole varjo vaan harmaa laatta — `rgba(0,0,0,.5)` vaalean huovan päällä. Syvennysvärit tokenoitava kuten `--well-bg`
- Mobiili (<900px) koskematon: kaikki uudet säännöt ovat desktop-lohkossa. Pikselidiffi HEAD:iin 390px = 0,00 % (`.notif`-alue maskattuna)
- **Pikselidiffin kaksi väärää hälytystä samassa sessiossa.** (1) Baseline oli kaapattu ennen keskiyötä, vertailu sen jälkeen → `checkMorningTask()` näytti "Uusi päivä" -toastin vain toisessa ja päivämääräkenttä erosi → 3,4 % "regressio". **Kaappaa baseline ja vertailu samalla ajolla**, älä käytä eilistä kuvaa. (2) `.notif`-toast on näkyvissä vaihtelevalla opasiteetilla → maskaa sen alue ennen diffiä (mobiili y≈660–780, desktop y≈670–780). Maskattuna kohina on 0,002 %; ilman maskia 3,4 %

### Jäljellä (manuaalinen)

- **`renderCardNew()`-jako** — `renderArenaCard()` tehty ✅; `renderDeckCard()` jätetty pois tarkoituksella (ks. Parannuskierros 2026-06-12)
- **`.card-new--hand`-CSS on kuollutta** (~60 riviä, 11 esiintymää: `grep -n 'card-new--hand' index.html`). Elementtiä ei luoda missään eikä luokkaa lisätä JS:stä. Jätetty 2026-07-27 siivouksesta pois vain diffin rajaamiseksi — turvallinen poistaa
- **Impeccable-detektoria ei ole etäympäristössä** (`/home/jaakko/.agents/...`) — delta on ajettava paikallisesti ennen mainiin mergeä

### Impeccable-jono (critique-score 16/20 harden+audit tehty, snapshot `.impeccable/critique/2026-06-11T10-44-50Z__index-html.md`)

| Komento | Mitä | Prioriteetti |
|---------|------|-------------|
| ~~`$impeccable harden index.html`~~ | ~~Undo-toast poisto/valmis-toiminnoille~~ | ~~P1~~ ✅ |
| ~~`$impeccable audit index.html`~~ | ~~Touch targets 44px, focus-indikaattorit~~ | ~~P1~~ ✅ |
| ~~`$impeccable polish index.html`~~ | ~~6 side-tab border-left → poistettu, box-shadow inset~~ | ~~P2~~ ✅ |
| ~~`$impeccable optimize index.html`~~ | ~~6 layout-animaatiota → transform/grid-template-rows~~ | ~~P2~~ ✅ |
| ~~`$impeccable document index.html`~~ | ~~DESIGN.md + .impeccable/design.json~~ | ~~P2~~ ✅ |

### TCG-korttipeli-ilme (2026-06-04/05) — mergetty mainiin

Rivinumerot jätetty pois tarkoituksella: ne vanhenevat joka commitissa. Käytä grep-ankkuria.

| Komponentti | Ankkuri |
|---|---|
| `.tcg-card*` CSS-lohko | `grep -n '^\.tcg-card{' index.html` |
| `renderArenaCard(t, container, anyFrog, mode)` | `grep -n '^function renderArenaCard'` |
| `mkCostPips()` — pyöreät mana-helmet | `grep -n '^function mkCostPips'` |
| `_tcgIconId()`, `_tcgSvgIcon()` | `grep -n '^function _tcgIconId'` |
| Viuhka-käsi | `grep -n '^#hand-bar{'` (perus) / `'#hand-bar {'` (desktop-lohko) |
| Cinzel `@import` | index.html:9 |
| `--plate-top/bot`, `--hand-card-w/h` | `:root` |

**`renderArenaCard` mode:** `'arena'` = täysi kortti; `'hand'` = kompakti `.tcg-card--hand` ilman stats/footer/jatkokortti
**`#hand-toggle` on `#hand-bar`:n ULKOPUOLELLA DOM:issa** — position:fixed toimii oikein vain näin. Desktopilla `display:none` (hover hoitaa), mobiilissa elävä
**`#hand-bar` on desktopilla `position:fixed`** viuhkan rajausikkunana; `#hand-bar-cards` on sen sisällä `position:absolute`, ja kortit ovat sen sisällä absoluuttisia (ks. The Fan Rule, DESIGN.md §8)
**Viuhkan tilat desktopilla:** lepo (96px näkyvissä) → `hand-bar--open` (132px, hover; 5s mouseleave sulkee). Ajastimen aikainen piilotus on `body.focus-mode`, ei `hand-bar--hidden` — se luokka oli kuollut ja poistettiin 2026-07-27
**`--hand-peek-h` on enää mobiilin token** — desktop käyttää `--hand-rest-t` / `--hand-open-t`, jotka `_syncHandLift()` ylikirjoittaa matalilla ikkunoilla

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
