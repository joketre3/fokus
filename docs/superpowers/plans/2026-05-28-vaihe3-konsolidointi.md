# Vaihe 3: Koodin konsolidointi — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Kolme mekaanista konsolidointia: WS_ACTIVE-vakion yhtenäistäminen, fe()-duplikaatin poisto ja POMO_MIN:n lukeminen käyttäjän timer-asetuksista.

**Architecture:** Kaikki muutokset ovat 1–3 rivin korvauksia olemassa oleviin tiedostoihin. Ei uusia funktioita, ei arkkitehtuurimuutoksia. `renderCardNew()`-jako on jätetty pois — se vaatii manuaalista testausta.

**Tech Stack:** Vanilla JS, single-file HTML, git commit per task.

---

## Tiedostot

| Tiedosto | Task |
|----------|------|
| `index.html` | Task 1: WS_ACTIVE vakio (:7483, :7485, :7491) |
| `swipe.html` | Task 2: fe() duplikaatti (:287) |
| `swipe.html` | Task 3: POMO_MIN timer-asetuksista (:221) |
| `aamu.html` | Task 3: POMO_MIN timer-asetuksista (:466) |

---

## Task 1: WS_ACTIVE — raw string -bypassit → vakio

**Files:**
- Modify: `index.html:7483, :7485, :7491`

`WS_ACTIVE='fap_active_ws'` on määritelty vakiona rivillä 7256, mutta storage/focus-tapahtumankäsittelijät käyttävät raw-stringiä. Muutoksen jälkeen avaimen vaihtaminen vaatii muutoksen vain yhteen paikkaan.

**TÄRKEÄÄ:** Rivit 744 ja 800 ovat `<script type="module">` -lohkossa (Firebase) — niillä EI ole pääsyä `WS_ACTIVE`:een (eri scope). Jätä ne koskemattomiksi.

- [ ] **Step 1: Varmista rivit 7480–7495**

Lue rivit 7480–7495 ja varmista kolme raw-stringiä:
```js
window.addEventListener('storage', function(e){
  var wsId = localStorage.getItem('fap_active_ws') || 'work';
  var mainKey = 'eis_v5_' + wsId;
  if(e.key === mainKey || e.key === 'fap_active_ws'){
    load(); render();
  }
});
window.addEventListener('focus', function(){
  var wsId = localStorage.getItem('fap_active_ws') || 'work';
```

- [ ] **Step 2: Korjaa storage-handler (rivit 7483 ja 7485)**

Nykyinen:
```js
  var wsId = localStorage.getItem('fap_active_ws') || 'work';
  var mainKey = 'eis_v5_' + wsId;
  if(e.key === mainKey || e.key === 'fap_active_ws'){
```

Korvataan:
```js
  var wsId = localStorage.getItem(WS_ACTIVE) || 'work';
  var mainKey = 'eis_v5_' + wsId;
  if(e.key === mainKey || e.key === WS_ACTIVE){
```

- [ ] **Step 3: Korjaa focus-handler (rivi 7491)**

Nykyinen:
```js
  var wsId = localStorage.getItem('fap_active_ws') || 'work';
```

Korvataan:
```js
  var wsId = localStorage.getItem(WS_ACTIVE) || 'work';
```

- [ ] **Step 4: Varmista että rivit 744 ja 800 ovat KOSKEMATTOMIA**

Lue rivit 742–746 ja 798–802 — molempien pitää edelleen käyttää raw-stringiä `'fap_active_ws'`.

- [ ] **Step 5: Commit**

```bash
cd /home/jaakko/fokus && git add index.html && git commit -m "refactor: use WS_ACTIVE constant in storage/focus event handlers (was raw string)"
```

---

## Task 2: swipe.html — fe() duplikaatti poistetaan

**Files:**
- Modify: `swipe.html:287`

`fe()` on määritelty kahdesti swipe.html:ssä (rivit 222 ja 287). Identtiset toteutukset. Toinen hiljaa varjostaa ensimmäisen. Poistetaan jälkimmäinen.

- [ ] **Step 1: Varmista molemmat määrittelyt**

Lue rivit 220–224:
```js
var POMO_MIN=25;
function fe(v){if(v===0.5)return'½';if(v%1!==0)return Math.floor(v)+'½';return String(v);}
```

Lue rivit 285–290:
```js
}

function fe(v){if(v===0.5)return'½';if(v%1!==0)return Math.floor(v)+'½';return String(v);}

function queueTotalMin(){
```

- [ ] **Step 2: Poista rivi 287 (toinen fe()-määrittely)**

Poista täsmälleen tämä rivi (tyhjä rivi ennen ja jälkeen säilyy):
```js
function fe(v){if(v===0.5)return'½';if(v%1!==0)return Math.floor(v)+'½';return String(v);}
```

Tulos riveillä 285–290 poiston jälkeen:
```js
}


function queueTotalMin(){
```

- [ ] **Step 3: Varmista että ensimmäinen fe() (rivi 222) on koskematon**

Lue rivit 220–224 poiston jälkeen — `function fe(v)` pitää olla edelleen rivillä ~222.

- [ ] **Step 4: Commit**

```bash
cd /home/jaakko/fokus && git add swipe.html && git commit -m "refactor: remove duplicate fe() definition in swipe.html"
```

---

## Task 3: POMO_MIN — lue fap_timer_settings:stä kovakoodauksen sijaan

**Files:**
- Modify: `swipe.html:221`
- Modify: `aamu.html:466`

`POMO_MIN=25` on kovakoodattu molemmissa tiedostoissa. `fap_timer_settings`-avaimessa on `{work, sbrk, lbrk}` minuutteina (sama kuin `TSET_DEFAULTS` index.html:ssä: `{work:25, sbrk:5, lbrk:20}`). Lukemalla `work`-kenttä POMO_MIN pysyy synkronisoituna käyttäjän timer-asetusten kanssa.

Validointi: `work` on kokonaisluku välillä 5–90, muuten fallback 25 (sama rajaus kuin `_applyTimerValues()` index.html:4251).

- [ ] **Step 1: Varmista swipe.html rivi 221**

Lue rivit 219–224:
```js
var tasks=[],queue=[],active=null,turn=[],idx=0,total=0,budgetMin=0;
var POMO_MIN=25;
function fe(v){...}
```

- [ ] **Step 2: Korvaa swipe.html:221**

Nykyinen:
```js
var POMO_MIN=25;
```

Korvataan:
```js
var POMO_MIN=(function(){try{var s=JSON.parse(localStorage.getItem('fap_timer_settings')||'{}');return(s.work>=5&&s.work<=90)?s.work:25;}catch(e){return 25;}}());
```

- [ ] **Step 3: Varmista aamu.html rivi 466**

Lue rivit 464–470:
```js
<script>
var POMO_MIN = 25;
var MAX_Q2 = 3;
```

- [ ] **Step 4: Korvaa aamu.html:466**

Nykyinen:
```js
var POMO_MIN = 25;
```

Korvataan:
```js
var POMO_MIN=(function(){try{var s=JSON.parse(localStorage.getItem('fap_timer_settings')||'{}');return(s.work>=5&&s.work<=90)?s.work:25;}catch(e){return 25;}}());
```

- [ ] **Step 5: Manuaalinen testi**

Avaa swipe.html selaimessa. DevTools → Console:
```js
// Aseta timer-asetukset ja testaa
localStorage.setItem('fap_timer_settings', JSON.stringify({work:50, sbrk:10, lbrk:20}));
location.reload();
// Tarkista konsolissa:
console.log('POMO_MIN:', POMO_MIN); // pitäisi olla 50
```

Palauta oletukset:
```js
localStorage.removeItem('fap_timer_settings');
location.reload();
console.log('POMO_MIN:', POMO_MIN); // pitäisi olla 25
```

- [ ] **Step 6: Commit**

```bash
cd /home/jaakko/fokus && git add swipe.html aamu.html && git commit -m "fix: POMO_MIN reads work duration from fap_timer_settings instead of hardcoded 25"
```

---

## Vaihe 3 — Valmis ✓

| Task | Status |
|------|--------|
| WS_ACTIVE vakio yhtenäistetty | ☐ |
| fe() duplikaatti poistettu | ☐ |
| POMO_MIN lukee timer-asetuksista | ☐ |

**Huom: Jätetty manuaaliseen:** `renderCardNew()`:n jako `renderArenaCard()` + `renderDeckCard()`:ksi (index.html:6161–6541, ~370 riviä). Vaatii manuaalista selaintestausta — liian riskialtis automaattiselle agentille ilman testikehystä.

---

## Modernization-prosessi valmis

Kaikki kolme vaihetta tehty:
- **Vaihe 1:** Tietoturvakorjaukset (9 havaintoa)
- **Vaihe 2:** Kriittiset bugit (5 bugia)
- **Vaihe 3:** Koodin konsolidointi (3 mekaanista muutosta)
