# CLAUDE.md

## Kommunikaatio

Vastaukset minimiin. Luolamieskieli. Säästä tokeneita.

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
| `faptcg.html` | Identtinen kopio index.html:stä (referenssisnapshot) |
| `index.html.bak` | Vanhempi varmuuskopio |
| `aamu.html` | Aamusuunnitteluvelho (popup pääsovelluksesta) |
| `swipe.html` | Korttiselausnäkymä tehtäväjonon rakentamiseen (popup) |

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

CSS custom properties: `--ink`, `--paper`, `--accent`, `--surface`, `--surface-md`, `--surface-strong`, `--border`, `--accent-dim`. Q2-värit ja logo-SVG:t pysyvät vihreinä.

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

## Nykyinen kehitystila

### Modernization-prosessi (2026-05-28) — valmis

Kolmivaiheinen tietoturva- ja koodinlaatuprojekti tehty, kaikki commitoitu ja pushattu GitHubiin.

| Vaihe | Mitä | Status |
|-------|------|--------|
| 1 — Tietoturva | 8 XSS-korjausta (`esc()`), URL-validointi, CSP meta kaikille tiedostoille | ✅ |
| 2 — Kriittiset bugit | `save()`/`load()` try/catch, swipe.html workspace-avain, popup-timer `window.opener`, AI-analyysi `response.ok` + HTTP 401/429/529 | ✅ |
| 3 — Konsolidointi | `WS_ACTIVE` vakio event-handlereissa, `fe()` duplikaatti poistettu, `POMO_MIN` lukee `fap_timer_settings` | ✅ |

Analyysi- ja suunnitteludokumentit: `analysis/ASSESSMENT.md`, `analysis/report.html`, `docs/superpowers/plans/`.

### Jäljellä (manuaalinen)

- **SEC-007** — Firestore Security Rules -auditointi Firebase-konsolissa (ei koodimuutosta)
- **`renderCardNew()`-jako** — `renderArenaCard()` + `renderDeckCard()` (index.html:6161–6530, ~370 riviä) — vaatii manuaalista testausta

### Alkuperäinen TCG-kehityssuunnitelma

Viimeksi valmis: **vaihe 9.5 B** — Live-jako-ominaisuus. Seuraavana: **vaihe 9.5 C**

Areenakortin TCG/MtG-design (osittain määritelty, toteutus kesken):
- Mitat: MtG-suhde 63:88, ~240×335px
- Tausta: `#1e3a3a→#162e2e`, 1.5px `#3d7a60` reunus, border-radius: 12px
- Verbi-ikoni: oikeassa alakulmassa taustalla, 80px, opacity .08
- Yläalue: verbiteksti (9px, `#6aaa88`, versaali), otsikko, Q-badge, meta (🍅×N · Projekti)
- Toimintonapit: ▶ Aloita, ✓, →, ⏳

## Firebase

- Projekti: `fokus-a-priori`
- Auth domain: `fokus-a-priori.firebaseapp.com`
- Firestore workspace-data: `users/{uid}/workspaces/{wsId}`
- Firestore timer-asetukset: `users/{uid}/timerSettings/default`

## AI-analyysi

Kutsuu Anthropic API:a suoraan selaimesta (`https://api.anthropic.com/v1/messages`), malli `claude-sonnet-4-20250514`. API-avain `localStorage`-avaimessa `fap_apikey`. Palauttaa JSON:n kvadranttiehdotuksilla ja sammakkoehdotuksella.

## Tools & resources

- Stack: Single-file HTML, Firebase SDK v10+ (modulaarinen, CDN), Firestore, anonyymi auth, valinnainen Google Sign-In
- Fontit: DM Sans, DM Serif Display
- Deployment: GitHub Pages https://joketre3.github.io/fokus/ (repo: "fokus")
- Bash-työkalut: `grep -n` pipe-erotetuilla kuvioilla; `sed -n 'start,endp'` alueiden lukemiseen; `wc -l` tiedostokoon tarkistukseen ensin

## Kaupallistaminen (lisätty 2026-05-28)

Täysi analyysi: `docs/strategia-kooste-2026-05.md`
Firebase-integraatiosuunnitelma: `docs/firebase-integraatio-suunnitelma.md`

### Nykytila vs. tavoite

| | Nyt | Tavoite |
|---|---|---|
| `index.html` | Firebase Auth + Firestore ✅ | — |
| `aamu.html` | localStorage only ❌ | Firebase sync |
| `swipe.html` | localStorage only ❌ | Firebase sync |
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

- [ ] Firebase-integraatio `aamu.html` ja `swipe.html`:ään (ks. `docs/firebase-integraatio-suunnitelma.md`)
- [ ] Stripe + Vercel-funktiot (checkout, webhook, portal)
- [ ] Freemium-rajojen enforkointi Firestoresta
- [ ] Email-kirjautuminen Google-kirjautumisen rinnalle
- [ ] Englanninkielinen versio
