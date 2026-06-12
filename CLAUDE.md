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

### Jäljellä (manuaalinen)

- **`renderCardNew()`-jako** — `renderArenaCard()` tehty ✅; `renderDeckCard()` jätetty pois tarkoituksella (ks. Parannuskierros 2026-06-12)

### Impeccable-jono (critique-score 16/20 harden+audit tehty, snapshot `.impeccable/critique/2026-06-11T10-44-50Z__index-html.md`)

| Komento | Mitä | Prioriteetti |
|---------|------|-------------|
| ~~`$impeccable harden index.html`~~ | ~~Undo-toast poisto/valmis-toiminnoille~~ | ~~P1~~ ✅ |
| ~~`$impeccable audit index.html`~~ | ~~Touch targets 44px, focus-indikaattorit~~ | ~~P1~~ ✅ |
| ~~`$impeccable polish index.html`~~ | ~~6 side-tab border-left → poistettu, box-shadow inset~~ | ~~P2~~ ✅ |
| ~~`$impeccable optimize index.html`~~ | ~~6 layout-animaatiota → transform/grid-template-rows~~ | ~~P2~~ ✅ |
| ~~`$impeccable document index.html`~~ | ~~DESIGN.md + .impeccable/design.json~~ | ~~P2~~ ✅ |

### TCG-korttipeli-ilme (2026-06-04/05) — haara `claude/graphic-design-skills-t3mNx`, PR auki

| Komponentti | Status | Sijainti |
|---|---|---|
| `.tcg-card*` CSS-lohko | ✅ | index.html:~3000 |
| `renderArenaCard(t, container, anyFrog, mode)` | ✅ | index.html:~6440 |
| `mkCostPips()` — pyöreät mana-helmet | ✅ | index.html:~6290 |
| `_tcgIconId()`, `_tcgSvgIcon()` | ✅ | index.html:~6383 |
| Viuhka-käsi (`#hand-bar`) peek-tila | ✅ | index.html:~2008 |
| Cinzel `@import` | ✅ | index.html:9 |
| `--plate-top/bot`, `--hand-card-w/h`, `--hand-peek-h` | ✅ | index.html:51 |

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
- Bash-työkalut: `grep -n` pipe-erotetuilla kuvioilla; `sed -n 'start,endp'` alueiden lukemiseen; `wc -l` tiedostokoon tarkistukseen ensin — HUOM: `sed -n` tulostaa base64-kuvadatan sellaisenaan, käytä `python3 -c "..."` tai `grep -v base64` jos tiedostossa on upotettuja kuvia

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
