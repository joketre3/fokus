# Vaihe 1: Tietoturvakorjaukset — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Korjaa kaikki 9 tietoturvahavaintoa (2 korkea, 4 keski, 3 matala) single-file HTML -arkkitehtuurin sisällä.

**Architecture:** Kaikki korjaukset ovat pieniä muutoksia olemassa olevaan koodiin. `esc()`-funktio on jo määritelty tiedostossa `index.html:3410` — käytetään sitä kaikkialla. Ei uusia tiedostoja, ei arkkitehtuurimuutoksia.

**Tech Stack:** Vanilla JS, single-file HTML, `node --check` syntaksivalidointiin, manuaalinen selaintestaus.

---

## Tiedostot joihin kosketaan

| Tiedosto | Muutokset |
|----------|-----------|
| `index.html` | SEC-003 (:7979–7981, :8260), SEC-001 (:4629, :4663), SEC-002 (:9464–9465), SEC-009 (:4872), SEC-006 (:9448–9451), SEC-004 (:6289) |
| `index.html` `<head>` | SEC-008 — CSP meta-tagi riville 6 |
| `aamu.html` `<head>` | SEC-008 — CSP meta-tagi riville 6 |
| `swipe.html` `<head>` | SEC-008 — CSP meta-tagi riville 6 |

---

## Task 1: SEC-003 — Preset-jaon XSS (korkein prioriteetti)

**Files:**
- Modify: `index.html:7979–7981` (preset preview list)
- Modify: `index.html:8260` (preset instance header)

Jaettujen presettien `titleTemplate` ja `verb` renderöidään suoraan `innerHTML`:ään ilman `esc()`:tä. Hyökkääjä voi eksfiltroida API-avaimen asettamalla `titleTemplate: '<img src=x onerror="fetch(...+localStorage.getItem(\'fap_apikey\'))">'`.

- [ ] **Step 1: Manuaalinen testi — varmista haavoittuvuus**

Avaa `index.html` selaimessa. Avaa DevTools → Console. Aja:
```js
// Simuloi haitallinen preset (ei tarvitse oikeaa Firestore-dataa)
var fakeCards = [{titleTemplate: '<img src=x onerror="document.title=\'XSS-SEC003\'">', verb: '<b>BOLD</b>'}];
var list = document.createElement('div');
fakeCards.forEach(function(c,i){
  var row=document.createElement('div');
  row.innerHTML='<span>'+(i+1)+'</span>'
    +'<span>'+(c.titleTemplate||c.title||'Tehtävä')+'</span>'
    +(c.verb?'<span>'+c.verb+'</span>':'');
  list.appendChild(row);
});
document.body.appendChild(list);
```
Odotettu: `document.title` muuttuu `'XSS-SEC003'` ja `<b>BOLD</b>` renderöityy lihavana.

- [ ] **Step 2: Korjaa index.html:7979–7981**

Nykyinen koodi:
```js
    row.innerHTML='<span style="font-size:.65rem;color:var(--muted);font-weight:600;min-width:1.2rem">'+(i+1)+'</span>'
      +'<span style="color:var(--ink)">'+(c.titleTemplate||c.title||'Tehtävä')+'</span>'
      +(c.verb?'<span style="font-size:.6rem;padding:.1rem .4rem;border-radius:20px;background:var(--surface-strong);color:var(--muted)">'+c.verb+'</span>':'');
```

Korvataan:
```js
    row.innerHTML='<span style="font-size:.65rem;color:var(--muted);font-weight:600;min-width:1.2rem">'+(i+1)+'</span>'
      +'<span style="color:var(--ink)">'+esc(c.titleTemplate||c.title||'Tehtävä')+'</span>'
      +(c.verb?'<span style="font-size:.6rem;padding:.1rem .4rem;border-radius:20px;background:var(--surface-strong);color:var(--muted)">'+esc(c.verb)+'</span>':'');
```

- [ ] **Step 3: Korjaa index.html:8260**

Nykyinen koodi:
```js
      +'<div style="font-size:var(--text-xs);font-weight:500;color:var(--accent)">'+(card.verb||'').toUpperCase()+'</div>'
```

Korvataan:
```js
      +'<div style="font-size:var(--text-xs);font-weight:500;color:var(--accent)">'+esc((card.verb||'').toUpperCase())+'</div>'
```

- [ ] **Step 4: Validoi syntaksi**

```bash
node --check index.html 2>&1
```
Odotettu: ei tulosta mitään (syntaksi ok).

- [ ] **Step 5: Testi — varmista korjaus**

Avaa `index.html` selaimessa. DevTools → Console:
```js
var fakeCards = [{titleTemplate: '<img src=x onerror="document.title=\'XSS-SEC003\'">', verb: '<b>BOLD</b>'}];
var list = document.createElement('div');
fakeCards.forEach(function(c,i){
  var row=document.createElement('div');
  row.innerHTML='<span style="font-size:.65rem;color:var(--muted);font-weight:600;min-width:1.2rem">'+(i+1)+'</span>'
    +'<span style="color:var(--ink)">'+esc(c.titleTemplate||c.title||'Tehtävä')+'</span>'
    +(c.verb?'<span style="font-size:.6rem;padding:.1rem .4rem;border-radius:20px;background:var(--surface-strong);color:var(--muted)">'+esc(c.verb)+'</span>':'');
  list.appendChild(row);
});
document.body.appendChild(list);
```
Odotettu: `document.title` pysyy `'Fokus A Priori'`. Sivulle ilmestyy teksti `&lt;img src=x...&gt;` — escapattu, ei suoritettu.

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "fix(security): escape preset titleTemplate and verb in innerHTML (SEC-003)"
```

---

## Task 2: SEC-007 — Firestore Security Rules -auditointi

**Files:**
- Ei koodimuutoksia — ulkoinen tarkistus Firebase-konsolissa.

Puuttuvat `uid`-tarkistukset Firestore-säännöissä mahdollistavat cross-user-kirjoitukset. Tämä on SEC-003:n mahdollistava tekijä tuotannossa.

- [ ] **Step 1: Avaa Firebase Console**

Mene osoitteeseen https://console.firebase.google.com → projekti `fokus-a-priori` → Firestore Database → Rules.

- [ ] **Step 2: Tarkista nykyiset säännöt**

Varmista että seuraavat polut on suojattu:
```
// Pitää olla:
match /users/{userId}/workspaces/{wsId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
match /users/{userId}/presets/{presetId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
// Julkiset presetit (collectionGroup-query):
match /{path=**}/presets/{presetId} {
  allow read: if resource.data.isPublic == true;
  allow write: if request.auth != null && request.auth.uid == resource.data.ownerId;
}
```

- [ ] **Step 3: Jos säännöt puuttuvat tai ovat liian avoimia — päivitä**

Korvaa säännöt yllä olevalla mallilla. Tallenna ja julkaise.

- [ ] **Step 4: Merkitse tulos**

Kirjaa tähän tarkistuksen tulos:
- `[ ]` Säännöt olivat kunnossa — ei muutoksia tarvittu
- `[ ]` Säännöt korjattu — päivitetty yllä olevan mallin mukaan

---

## Task 3: SEC-001 — AI-vastauksen XSS

**Files:**
- Modify: `index.html:4629` (sammakkoehdotuksen perustelu)
- Modify: `index.html:4663` (tehtäväehdotuksen kommentti)

Claude API:n palauttama `perustelu` ja `kommentti` lisätään `innerHTML`:ään ilman `esc()`:tä. Jos API vastaa haitallisella sisällöllä (esim. prompt-injection), API-avain voi vuotaa.

- [ ] **Step 1: Manuaalinen testi — varmista haavoittuvuus**

DevTools → Console:
```js
// Simuloi AI-vastaus haitallisella perustelu-kentällä
var el = document.createElement('div');
el.innerHTML = '<div>' + '<img src=x onerror="document.title=\'XSS-SEC001\'">' + '</div>';
document.body.appendChild(el);
```
Odotettu: `document.title` muuttuu (haavoittuvuus olemassa).

- [ ] **Step 2: Korjaa index.html:4629**

Nykyinen koodi:
```js
        +'<div style="font-size:.72rem;color:var(--muted);font-weight:300;margin-bottom:.75rem;line-height:1.5">'+result.sammakko.perustelu+'</div>'
```

Korvataan:
```js
        +'<div style="font-size:.72rem;color:var(--muted);font-weight:300;margin-bottom:.75rem;line-height:1.5">'+esc(result.sammakko.perustelu)+'</div>'
```

- [ ] **Step 3: Korjaa index.html:4663**

Nykyinen koodi:
```js
        inner+='<div style="font-size:.7rem;color:var(--muted);font-weight:300;font-style:italic;margin-bottom:.6rem;line-height:1.5">'+e.kommentti+'</div>';
```

Korvataan:
```js
        inner+='<div style="font-size:.7rem;color:var(--muted);font-weight:300;font-style:italic;margin-bottom:.6rem;line-height:1.5">'+esc(e.kommentti)+'</div>';
```

- [ ] **Step 4: Validoi syntaksi**

```bash
node --check index.html 2>&1
```
Odotettu: ei tulosta mitään.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "fix(security): escape AI response perustelu and kommentti in innerHTML (SEC-001)"
```

---

## Task 4: SEC-002 + SEC-009 + SEC-006 — Loput innerHTML-escaping-korjaukset

**Files:**
- Modify: `index.html:9464–9465` (inventory-kortit)
- Modify: `index.html:4872` (projektikortin deadline)
- Modify: `index.html:9448–9451` (t.quad whitelist)

- [ ] **Step 1: Korjaa index.html:9464–9465 (SEC-002)**

Nykyinen koodi:
```js
    html += '<div class="inv-card__name">'+(t.text||'')+'</div>';
    if(verb) html += '<div class="inv-card__verb">'+verb+'</div>';
```

Korvataan:
```js
    html += '<div class="inv-card__name">'+esc(t.text||'')+'</div>';
    if(verb) html += '<div class="inv-card__verb">'+esc(verb)+'</div>';
```

- [ ] **Step 2: Korjaa index.html:4872 (SEC-009)**

Nykyinen koodi:
```js
      meta.innerHTML+='<span>📅 '+p.deadline+'</span><span style="color:'+(diff<=3?'var(--pomo)':'var(--muted)')+'">'+dlStr+'</span>';
```

Korvataan:
```js
      meta.innerHTML+='<span>📅 '+esc(p.deadline)+'</span><span style="color:'+(diff<=3?'var(--pomo)':'var(--muted)')+'">'+esc(dlStr)+'</span>';
```

- [ ] **Step 3: Korjaa index.html:9448–9451 — t.quad whitelist (SEC-006)**

Nykyinen koodi (rivit 9450–9451):
```js
    var qLabel = (t.quad||'').toUpperCase();
    var qClass = 'inv-card__q--'+(t.quad||'q4');
```

Korvataan:
```js
    var safeQuad = ['q1','q2','q3','q4'].indexOf(t.quad) !== -1 ? t.quad : 'q4';
    var qLabel = safeQuad.toUpperCase();
    var qClass = 'inv-card__q--'+safeQuad;
```

- [ ] **Step 4: Validoi syntaksi**

```bash
node --check index.html 2>&1
```
Odotettu: ei tulosta mitään.

- [ ] **Step 5: Manuaalinen testi — inventory XSS**

DevTools → Console:
```js
// Lisää haitallinen tehtävä localStorage:iin
var ws = localStorage.getItem('fap_active_ws') || 'work';
var key = 'eis_v5_' + ws;
var data = JSON.parse(localStorage.getItem(key) || '{"tasks":[],"active":null,"turn":[]}');
data.tasks.push({id: 99999, text: '<img src=x onerror="document.title=\'XSS-SEC002\'">', quad: 'q1', verbi: '<script>alert(1)</script>', done: false});
localStorage.setItem(key, JSON.stringify(data));
location.reload();
```
Avaa Inventory (tehtäväpakka). Odotettu: `document.title` pysyy `'Fokus A Priori'`. Teksti näkyy escapattuna.

Siivoa testi:
```js
var ws = localStorage.getItem('fap_active_ws') || 'work';
var key = 'eis_v5_' + ws;
var data = JSON.parse(localStorage.getItem(key));
data.tasks = data.tasks.filter(function(t){return t.id !== 99999;});
localStorage.setItem(key, JSON.stringify(data));
location.reload();
```

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "fix(security): escape user data in inventory, project deadline, whitelist t.quad (SEC-002, SEC-006, SEC-009)"
```

---

## Task 5: SEC-004 — URL-skeeman validointi

**Files:**
- Modify: `index.html:6289`

`window.open(t.linkki)` ilman validointia — `data:` ja `blob:` URI:t sallittu.

- [ ] **Step 1: Manuaalinen testi — varmista haavoittuvuus**

DevTools → Console:
```js
// Testaa data-URI avautuminen
window.open('data:text/html,<h1>data-URI auki</h1>', '_blank', 'noopener');
```
Odotettu: uusi välilehti avautuu data-URI:lla (haavoittuvuus olemassa).

- [ ] **Step 2: Korjaa index.html:6289**

Nykyinen koodi:
```js
      lnkBtn.onclick=(function(url){return function(e){e.stopPropagation();window.open(url,'_blank','noopener');}})(t.linkki);
```

Korvataan:
```js
      lnkBtn.onclick=(function(url){return function(e){
        e.stopPropagation();
        if(!/^https?:\/\//i.test(url)){notify('Vain http(s)-linkit sallittu');return;}
        window.open(url,'_blank','noopener');
      };})(t.linkki);
```

- [ ] **Step 3: Validoi syntaksi**

```bash
node --check index.html 2>&1
```
Odotettu: ei tulosta mitään.

- [ ] **Step 4: Manuaalinen testi — validointi toimii**

Lisää tehtävä linkillä `data:text/html,testi`. Klikkaa linkkiä. Odotettu: toast-notifikaatio "Vain http(s)-linkit sallittu", ei uutta välilehteä.

Lisää tehtävä linkillä `https://example.com`. Klikkaa linkkiä. Odotettu: avautuu normaalisti.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "fix(security): validate URL scheme before window.open, block non-http(s) links (SEC-004)"
```

---

## Task 6: SEC-008 — Content Security Policy kaikille tiedostoille

**Files:**
- Modify: `index.html` rivi 6 (uusi meta-tagi riville 6)
- Modify: `aamu.html` rivi 6
- Modify: `swipe.html` rivi 6

CSP rajoittaa XSS:n räjähdyssädettä — erityisesti estää API-avaimen eksfiltroinnin tuntemattomiin osoitteisiin `connect-src`:n avulla.

- [ ] **Step 1: Lisää CSP index.html:ään — rivin 5 jälkeen**

Nykyinen rakenne (rivit 4–6):
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Fokus A Priori</title>
```

Lisää riville 6 (ennen `<title>`):
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'unsafe-inline'; connect-src https://api.anthropic.com https://*.googleapis.com https://*.firebaseio.com https://firestore.googleapis.com https://www.gstatic.com https://identitytoolkit.googleapis.com; font-src https://fonts.gstatic.com; style-src 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob:">
<title>Fokus A Priori</title>
```

- [ ] **Step 2: Lisää CSP aamu.html:ään — rivin 5 jälkeen**

Nykyinen rakenne:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Fokus — Aamusuunnittelu</title>
```

Lisää:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'unsafe-inline'; connect-src https://*.googleapis.com https://*.firebaseio.com https://firestore.googleapis.com https://www.gstatic.com; font-src https://fonts.gstatic.com; style-src 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob:">
<title>Fokus — Aamusuunnittelu</title>
```

- [ ] **Step 3: Lisää CSP swipe.html:ään — rivin 5 jälkeen**

Nykyinen rakenne:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
<title>Fokus — Selaa tehtäviä</title>
```

Lisää:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'unsafe-inline'; connect-src https://*.googleapis.com https://*.firebaseio.com https://firestore.googleapis.com https://www.gstatic.com; font-src https://fonts.gstatic.com; style-src 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob:">
<title>Fokus — Selaa tehtäviä</title>
```

- [ ] **Step 4: Validoi syntaksi kaikki tiedostot**

```bash
node --check index.html aamu.html swipe.html 2>&1
```
Odotettu: ei tulosta mitään.

- [ ] **Step 5: Manuaalinen testi — CSP ei riko toiminnallisuutta**

Avaa `index.html` selaimessa. DevTools → Console. Tarkista että:
- Fontit latautuvat (DM Sans näkyvissä)
- Firebase-auth toimii (kirjaudu sisään jos mahdollista)
- AI-analyysi toimii (jos API-avain asetettu)
- Konsoli ei näytä CSP-violation-virheitä

Jos CSP-virhe ilmenee: tarkista `connect-src` — lisää puuttuva domain allowlistiin.

- [ ] **Step 6: Commit**

```bash
git add index.html aamu.html swipe.html
git commit -m "fix(security): add Content-Security-Policy meta to all three files (SEC-008)"
```

---

## Vaihe 1 — Valmis ✓

Kaikki 9 tietoturvahavaintoa korjattu:

| ID | Vakavuus | Status |
|----|----------|--------|
| SEC-003 | Korkea | ✓ Task 1 |
| SEC-007 | Korkea | ✓ Task 2 |
| SEC-001 | Keski | ✓ Task 3 |
| SEC-002 | Keski | ✓ Task 4 |
| SEC-009 | Matala | ✓ Task 4 |
| SEC-006 | Matala | ✓ Task 4 |
| SEC-004 | Keski | ✓ Task 5 |
| SEC-008 | Keski | ✓ Task 6 |
| SEC-005 | Matala | Hyväksytty riski — dokumentoitu CLAUDE.md:ssä |

---

## Siirtymä → Vaihe 2: Kriittiset bugit

Kun kaikki Tasks 1–6 on tehty ja commitoitu, jatketaan suunnitelmalla `2026-05-28-vaihe2-bugit.md`.

**Vaihe 2 kattaa:**
1. `save()` / `load()` — try/catch puuttuu (QuotaExceededError ja JSON.parse-kaatuminen)
2. `swipe.html:289` — väärä localStorage-avain `queueTotalMin()`-funktiossa
3. Popup-timer — kovakoodatut `WORK/SBRK/LBRK`-arvot (käyttäjän asetukset eivät vaikuta)
4. `runAnalysis()` — `response.ok`-tarkistus puuttuu (HTTP 401/429/529 → väärä virheviesti)

**Siirtymäehto:** Kaikki tämän vaiheen commitit tehty, sovellus toimii normaalisti selaimessa, CSP ei aiheuta console-virheitä.
