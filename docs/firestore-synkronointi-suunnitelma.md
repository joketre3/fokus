# Firestore-synkronoinnin kehitys — suunnitelma & tilanne

> Status 2026-06-11. Branch: `claude/firestore-database-review-6o7qu6`.
> Jatka tästä työpöytäversiolla. Vaiheet A, B ja CSP-korjaus tehty ja pushattu.
> Vaiheet C ja D tekemättä.

## Tausta

Fokus tallentaa tehtävädatan kahteen paikkaan: `localStorage` (ensisijainen, synkroninen)
ja Firestore (`users/{uid}/workspaces/{wsId}`, valinnainen pilvisynkka). Kirjautuessa
localStoragen ja pilven yhteispeli oli epämääräistä: synkka perustui heuristiikkaan
("kummalla on tehtäviä") ilman aikaleimoja → datan menetysriski monilaitekäytössä.
Lisäksi popup-ikkunat (`aamu.html`, `swipe.html`) eivät synkronoineet pilveen ollenkaan,
ja CSP esti Firebase SDK:n latauksen kokonaan.

---

## ✅ TEHTY

### CSP-korjaus (kriittinen, esto-bugi)
**Commit:** `Korjaa CSP: salli Firebase SDK script-src:ssä`

`index.html:6` — `script-src 'unsafe-inline'` esti Firebase-moduulien latauksen
`www.gstatic.com`ista (vain `connect-src` salli sen). **Firebase ei toiminut lainkaan
tuotannossa** — kaikki kirjautuneidenkin data jäi vain localStorageen. Lisätty
`https://www.gstatic.com` script-src:hen.

> ⚠️ Tämä korjaus tulee GitHub Pages -tuotantoon vasta kun branch mergetään mainiin.

### Vaihe A — aikaleimat + deterministinen login-sync
**Commit:** Vaihe A (osa aiempaa committia)

| Muutos | Sijainti |
|--------|----------|
| `save()` lisää `updatedAt: Date.now()` data-objektiin | `index.html` `save()` (~7426) |
| `saveToFirestore()` → `setDoc(ref, data, {merge:true})` | `index.html` (~743) |
| Timer-tallennus → `setDoc(..., {merge:true})` | `index.html` (~784) |
| Login-logiikka → **last-write-wins** | `index.html` `onAuthStateChanged` (~825–860) |
| Race-suojaus: `clearTimeout(_fsSaveTimer)` ennen pilvilatausta | sama |

**Login last-write-wins -logiikka:**
- Molemmilla puolilla dataa → uudempi `updatedAt` voittaa. Tasapeli/puuttuva leima (0=0) → **Firestore voittaa** (deterministinen, sama kuin ennen).
- Vain pilvessä dataa → pilvi → localStorage.
- Vain localStoragessa dataa → migraatio localStorage → pilvi.
- Ei kummallakaan → ei tehdä mitään.

Malli kopioitu olemassa olevasta preset-mergestä (`index.html` `_loadPresetsFromFirestore`, ~7400).

### Vaihe B — popup-pilvisynkka
**Commit:** `Popup-pilvisynkka: aamu/swipe → Firestore opener-delegoinnilla (Vaihe B)`

| Muutos | Sijainti |
|--------|----------|
| `saveData()` lisää `updatedAt` + kutsuu `window.opener._scheduleFsSave()` | `aamu.html` `saveData()` (~561) |
| `saveQueue()` lisää `updatedAt` + kutsuu `window.opener._scheduleFsSave()` | `swipe.html` `saveQueue()` (~284) |
| `renderQueuePanel()` lukee `eis_v5_<wsId>` legacy `eis_v5`:n sijaan (bugikorjaus) | `swipe.html` (~415) |
| storage-listener flushaa pilveen popup-kirjoituksen jälkeen (varmistus) | `index.html` (~7513) |

**Periaate:** popupit eivät tuo Firebase-SDK:ta (vältetään duplikaatti-auth ja
single-file-periaate säilyy) — ne delegoivat pilvitallennuksen pääikkunalle `window.opener`
kautta. Jos `opener` puuttuu (mobiili avaa välilehtenä), `try/catch` suojaa ja pääikkunan
`storage`-listener hoitaa synkan varmistuksena.

---

## ⏸️ TEKEMÄTTÄ

### Vaihe C — real-time + offline
1. `onSnapshot`-kuuntelu aktiiviselle workspace-docille. Saapuvassa snapshotissa vertaa
   `updatedAt` ennen paikallisen tilan ylikirjoitusta — **estä oman kirjoituksen echo**
   (esim. jätä huomiotta snapshot jonka `updatedAt` === viimeksi itse kirjoitettu).
2. Offline-persistenssi: SDK v10 `persistentLocalCache` (tai `enableIndexedDbPersistence`)
   → SDK jonottaa kirjoitukset ja ratkoo online-paluun automaattisesti.
3. Sync-tilan indikaattori: laajenna olemassa olevaa `#fs-sync-status` (`index.html` ~826)
   kattamaan offline/virhe.

> ⚠️ Iso muutos, vaatii huolellista testausta ettei real-time-päivitys töki kesken
> muokkauksen eikä oma kirjoitus kaiu takaisin.

### Vaihe D — Firestore Security Rules (SEC-007, manuaalinen)
Ei koodimuutosta repossa. Firebase Console → Firestore → Rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
Jos julkisia presettejä käytetään, lisää erillinen `isPublic`-lukusääntö. Dokumentoi
tulos CLAUDE.md:hen (SEC-007).

---

## Testit (A + B)

Aja `python3 -m http.server 8080` → `http://localhost:8080`, DevTools-konsoli auki.
**Lataa kova-lataus (Ctrl+Shift+R)** ensin — varmista ettei punaisia CSP/Firebase-virheitä.

### Vaihe A
- **A1 — Aikaleima syntyy:** tee muokkaus → `JSON.parse(localStorage.getItem('eis_v5_work')).updatedAt` palauttaa numeron (ei `undefined`).
- **A2 — localStorage uudempi voittaa:** kirjaudu+tallenna pilveen, kirjaudu ulos, konsolissa lisää tehtävä + `d.updatedAt=Date.now()` localStorageen, kirjaudu → konsoli `📦 localStorage uudempi → pilveen`, muutos säilyy.
- **A3 — Firestore uudempi voittaa:** laite B tekee muutoksen pilveen, laite A kirjautuu → `☁️ Firestore uudempi → localStorageen`, B:n muutos ilmestyy A:lle. (Yhdellä koneella: aseta local `updatedAt=1` → pilvi voittaa.)
- **A4 — Race-suojaus:** tee muutos ja heti Ctrl+R → ei katoa.
- **A5 — Tyhjä local + pilvi:** `localStorage.removeItem('eis_v5_work')`, lataa kirjautuneena → `☁️ Data ladattu Firestoresta`.

### Vaihe B
- **B1 — aamu → pilvi:** kirjautuneena avaa aamu-popup, muuta kvadrantteja/sammakko, vie loppuun → **pääikkunan** konsoli `☁️ Firestore tallennettu`.
- **B2 — swipe → pilvi:** kirjautuneena avaa swipe, lisää tehtäviä jonoon → pääikkunan konsoli `☁️ Firestore tallennettu`, areena päivittyy.
- **B3 — swipe-avain (ei-oletustyötila):** vaihda esim. `koti`-työtilaan, lisää tehtäviä, avaa swipe → jonopaneeli näyttää **oikeat** tehtävät ja keston (ennen korjausta tyhjä/väärä).
- **B4 — popup ilman kirjautumista:** kirjautumatta avaa aamu/swipe, tee muutoksia → ei JS-virhettä, localStorage päivittyy.

**Validointi koodimuutoksen jälkeen:** eristä muuttunut `<script>`-lohko tilapäistiedostoon
ja aja `node --check` (CLAUDE.md). HTML:lle suoraan `node --check` ei toimi.

---

## Muutetut tiedostot (yhteenveto)

| Tiedosto | Mitä |
|----------|------|
| `index.html` | CSP script-src, `save()` updatedAt, `setDoc` merge ×2, login last-write-wins, race-suojaus, storage-flush |
| `aamu.html` | `saveData()` updatedAt + opener-delegointi |
| `swipe.html` | `saveQueue()` updatedAt + opener-delegointi, `renderQueuePanel()` avainkorjaus |
| Firebase Console | (Vaihe D) Security Rules — tekemättä |

Täysi tekninen suunnitelma: `/root/.claude/plans/` (session-kohtainen, ei repossa).
