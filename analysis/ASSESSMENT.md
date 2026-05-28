# Fokus A Priori — Modernization Assessment

## Executive Summary

Fokus A Priori on 11 000-rivin single-file HTML -tuottavuussovellus (Eisenhower-matriisi + Pomodoro + TCG-metafora), jonka single-file-arkkitehtuuri on tietoinen rajoite `file://`-protokollan ja mobiili-Edge/Chrome-yhteensopivuuden vuoksi. Koodi on toimivaa ja hyvin jäsenneltyä domeeneittain, mutta siinä on **9 tietoturvahavaintoa** (2 korkean tason XSS-haavoittuvuutta presetien jaetussa sisällössä) ja **10 teknisen velan kohtaa** joista kriittisin on väärä localStorage-avain swipe.html:ssä. Suositeltu lähestyminen: **Refactor** — ei arkkitehtuurin muutos, vaan kohdennetut korjaukset tietoturva-aukoihin, virheenkäsittelyyn ja koodin konsolidointiin single-file-rajoitteen sisällä.

---

## System Inventory

### LOC-taulukko (cloc-fallback: find + wc -l)

| Tiedosto | Rivit | Rooli |
|----------|-------|-------|
| index.html | 9 631 | Pääsovellus |
| aamu.html | 921 | Aamusuunnitteluvelho |
| swipe.html | 508 | Korttiselaus / jonorakennin |
| faptcg.html | 9 631 | Identtinen kopio (ei aktiivinen) |
| **Yhteensä (uniikki)** | **11 060** | |

Kompleksisuuden päätösavainsanat (`if/for/while/switch/catch`):
- index.html: **795**
- aamu.html: 35
- swipe.html: 41

Funktioita (named + arrow): index.html ~243, aamu.html ~34, swipe.html ~24.

### Teknologiajalanjälki

| Kategoria | Teknologia |
|-----------|-----------|
| Kielet | HTML5, CSS3 (custom properties), ES2020+ JS |
| Runtime | Selain suoraan — file:// tai HTTP static |
| Ulkoiset CDN | Firebase SDK v10 (modular), Google Fonts (DM Sans, DM Serif Display) |
| Pilvi | Firebase/Firestore (valinnainen), anonyymi + Google Sign-In auth |
| AI | Anthropic API suoraan selaimesta (claude-sonnet-4-20250514) |
| Build | Ei — ei npm, ei bundler, ei CI |
| Testit | Ei |
| Deployment | GitHub Pages (https://joketre3.github.io/fokus/) |

---

## Architecture-at-a-Glance

12 toiminnallista domeenia (ks. `ARCHITECTURE.mmd` Mermaid-kaavio):

| # | Domeeni | Rivit | Kuvaus |
|---|---------|-------|--------|
| D1 | Firebase/Auth | 684–861 | ES-moduuli, Firestore-sync, dual write |
| D2 | CSS + Teemat | hajautettu | 3 teemaa data-theme:llä, CSS custom properties |
| D3 | HTML Shell + Modaalit | 862–3407 | Staattinen rakenne, kaikki overlay-modaalit |
| D4 | State + Eisenhower | 3408–3699 | Global state (tasks/active/turn), XSS-guard `esc()` |
| D5 | Asetukset + AI + Projektit | 3700–4920 | Profiili, timer-asetukset, AI-analyysi, projektit |
| D6 | Task CRUD + Velho | 4921–5646 | Wizard, verbi-picker, live-jako, addTask |
| D7 | Timer + Äänet | 5647–5988 | Pomodoro, Web Audio, Notifications, kello |
| D8 | Render Engine | 5989–7044 | render(), areena, jono, matriisi, käsi |
| D9 | Aikataulu | 7045–7242 | Schedule picker, checkScheduledTasks (60s) |
| D10 | Save/Load + Työtilat | 7243–7508 | save/load, workspace CRUD, setTheme |
| D11 | ICS + Jatkokortti + Presetit | 7509–8384 | Kalenteri, seurantakortit, preset-jako |
| D12 | Satelliittiskriptit | 8829–9561 | Header-timer-widget, hamburger, inventory |

---

## Production Runtime Profile

Ei tuotantotelemetriaa saatavilla. Arkkitehtuurin perusteella korkein suorituskykyriski: **D8 Render Engine** — `render()` kutsuu kaikkia alirenderereitä joka muutoksessa ilman memoizaatiota tai dirty-checking-logiikkaa.

---

## Technical Debt — Top 10

| # | Prioriteetti | Kategoria | Löydös | Sijainti |
|---|-------------|-----------|--------|---------|
| 1 | Korkea | Virheenkäsittely puuttuu | `save()` — ei try/catch localStorage.setItem:lle. QuotaExceededError hylätään hiljaa. | index.html:7388 |
| 2 | Korkea | Virheenkäsittely puuttuu | `load()` — JSON.parse ilman try/catch. Korruptoitunut data kaataa koko tilan. | index.html:7403, :7479 |
| 3 | Korkea | Toiminnallinen bugi | `queueTotalMin()` swipe.html lukee `'eis_v5'` (legacy key, ilman workspace-suffiksia). Väärä data kaikille ei-oletus-työtilan käyttäjille. | swipe.html:289 vs :244 |
| 4 | Korkea | Hardcoded config | Popup-timer kovakoodaa `WORK=1500, SBRK=300, LBRK=1200`. Käyttäjän omat asetukset eivät vaikuta popup-ajastimeen. | index.html:4131 |
| 5 | Korkea | API-virheenkäsittely | `runAnalysis()` ei tarkista `response.ok` ennen `.json()`. HTTP 401/429/529 kaikki tuottavat saman virheviesti. | index.html:4592–4593 |
| 6 | Keskisuuri | Duplikaattikoodi | `fe()` määritelty kahdesti swipe.html:ssä. Toinen varjostaa ensimmäistä hiljaa. | swipe.html:221, :286 |
| 7 | Keskisuuri | Maaginen luku | `POMO_MIN=25` kovakoodattu swipe.html:ssä ja aamu.html:ssä. Lukee `fap_timer_settings` `work`-arvon sijaan. | swipe.html:220, aamu.html:465 |
| 8 | Keskisuuri | God function | `renderCardNew()` on 386 riviä, sisältää kaksi täysin erillistä renderöintihaaraa. | index.html:6155–6541 |
| 9 | Matala | Epäjohdonmukaiset patternit | `WS_ACTIVE='fap_active_ws'` vakio ohitetaan 4 paikassa raw-stringillä. Sama vakio käyttämättä aamu.html:ssä ja swipe.html:ssä. | index.html:743,:799,:7467,:7475 |
| 10 | Matala | Magic strings | 7 usein käytettyä localStorage-avainta ilman nimettyä vakiota (`fap_theme`, `fap_apikey`, jne.). | index.html:4247 (malli olemassa) |

---

## Security Findings

| ID | CWE | Vakavuus | Sijainti | Kuvaus |
|----|-----|----------|---------|--------|
| SEC-001 | CWE-79 | Keskisuuri | index.html:4629,:4663 | AI-vastauksen `perustelu`/`kommentti` lisätään innerHTML:ään ilman `esc()` — prompt-injection voi eksfiltroida API-avaimen |
| SEC-002 | CWE-79 | Keskisuuri | index.html:9464–9465 | Inventory-kortit rakentavat HTML:n `t.text`/`t.verbi`:llä ilman `esc()` |
| SEC-003 | CWE-79 | **Korkea** | index.html:7979–7981,:8260 | Jaettujen presettien `titleTemplate`/`verb` renderöidään suoraan innerHTML:ään — cross-user stored XSS |
| SEC-004 | CWE-601 | Keskisuuri | index.html:6289 | `window.open(t.linkki)` ilman URL-skeeman validointia — `data:` ja `blob:` URI:t sallittu |
| SEC-005 | CWE-312 | Matala | index.html:4210,:4579 | API-avain cleartext localStorage:ssa (tietoinen arkkitehtuuripäätös; mitigointi: poista XSS-vektorit) |
| SEC-006 | CWE-116 | Matala | index.html:9451,:9461 | `t.quad` konkatenoidaan class-attribuuttiin ilman whitelist-validointia |
| SEC-007 | CWE-284 | **Korkea** | index.html:691–697 | Firestore Security Rules — ei voida vahvistaa lähdekoodista, mutta puuttuvat `uid`-tarkistukset mahdollistaisivat cross-user-kirjoitukset |
| SEC-008 | CWE-693 | Keskisuuri | Kaikki tiedostot | Ei Content Security Policy:a — XSS:n räjähdyssäde rajoittamaton |
| SEC-009 | CWE-79 | Matala | index.html:4872 | `p.deadline` lisätään `meta.innerHTML`:ään ilman `esc()` |

**Nopein korjaus / suurin vaikutus:** SEC-003 → SEC-007 → SEC-001 (kaikki ovat 1–3 rivin muutoksia olemassa olevan `esc()`-funktion avulla).

---

## Documentation Gaps

| # | Aukko |
|---|-------|
| 1 | `aamu.html` ei ole linkitetty mistään `index.html`:n navigaatiosta. Käyttäjälle ei ole selvää polkua sen avaamiseen (CLAUDE.md:ssä ei mainita). |
| 2 | `_useCardUI`-lippu on dokumentoitu CLAUDE.md:ssä mutta koodissa ei ole tätä muuttujaa — käytössä on `_handBarVisible`. Dokumentaatio on jäänyt vanhasta toteutuksesta. |
| 3 | `lataаIcs`-funktion nimessä on kyrillinen `а`-kirjain (homoglyfi). Ei hajonnut koska call-site käyttää samaa glyfiä, mutta täysin dokumentoimaton ja hauras. |
| 4 | `eis_v5_default` fallback-avain (index.html:7396) — ei ole selvää, onko tämä vielä saavutettava legacy-migraatiopolku vai kuollut koodi. |
| 5 | Firestore timer-settings synkronoinnissa ei ole konfliktinratkaisustrategiaa offline-first-tilanteille. |

---

## Effort Estimation

**Menetelmä:** COCOMO-II basic, nominal scale factors  
**Kaava:** `PM = 2.94 × (KSLOC)^1.10`

```
KSLOC = 11.06 (index + aamu + swipe; faptcg.html jätetty pois duplikaattina)
(11.06)^1.10 = e^(1.10 × ln(11.06)) = e^(1.10 × 2.403) = e^2.644 ≈ 14.07
PM = 2.94 × 14.07 ≈ 41 henkilökuukautta
```

**Vaihteluväli:** ±30% → **29–54 henkilökuukautta** (tyypillinen yksittäisen kehittäjän projekti vähentää skaalaa merkittävästi)

**Huomio:** COCOMO ei huomioi single-file-arkkitehtuurin rajoitteita eikä JavaScript/HTML-projektin tuottavuutta — luku on suuntaa-antava.

---

## Recommended Modernization Pattern

**Suositus: Refactor (kohdennettu)**

Arkkitehtuurimuutos (React, build-järjestelmä, tiedostojen jako) on **poissuljettu** — single-file HTML on tietoinen rajoite `file://`-protokollaa ja mobiili-Edge/Chrome-käyttöä varten. Frameworks-neuvot ovat haitallisia tälle projektille.

Sen sijaan kolme vaihetta:

1. **Tietoturvakorjaukset (1–2 pv):** SEC-003 → SEC-007-auditointi → SEC-001 → SEC-008 (CSP). Kaikki ovat pieniä muutoksia olemassa olevan `esc()`-funktion avulla.
2. **Kriittiset bugit (1 pv):** swipe.html:289 workspace-avain, popup-timer kovakoodatut arvot, `save()`/`load()` try/catch.
3. **Koodin konsolidointi (2–3 pv):** localStorage-vakioiden yhtenäistäminen, `renderCardNew()` jakaminen, `POMO_MIN` lukeminen asetuksista.

Tavoite: sama arkkitehtuuri, parempi luotettavuus, pienempi hyökkäyspinta.
