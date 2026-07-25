# Nopea tila — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lisää manuaalinen "Nopea tila" -kytkin profiilipaneeliin, joka poistaa backdrop-filterin ja CSS-transitiot heikon laitteiston (esim. MacBook Pro 2010, ei GPU) suorituskyvyn parantamiseksi.

**Architecture:** `html[data-perf="lite"]` -attribuutti `<html>`-elementissä aktivoi CSS-lohkon joka ylikirjoittaa backdrop-filterin ja transitiot kaikissa elementeissä `!important`-määrein. Asetus tallennetaan `fap_perf`-avaimeen localStoragessa. Muutos on 3-tiedostollinen: CSS (1 lohko), JS (2 funktiota), HTML (1 toggle-rivi profiilipaneelissa). Vain `index.html` muuttuu.

**Tech Stack:** Vanilla JS, CSS, single-file HTML, localStorage.

---

## Tiedostot

| Tiedosto | Muutos |
|----------|--------|
| `index.html` | Task 1: CSS-lohko (:681) |
| `index.html` | Task 2: JS-funktiot (:7522) |
| `index.html` | Task 3: Toggle-nappi profiilipaneeliin (:3301) |

---

## Task 1: CSS — `html[data-perf="lite"]` -lohko

**Files:**
- Modify: `index.html` — lisäys rivi 681 (ennen `</style>`)

Lisätään heti `prefers-reduced-motion`-lohkon jälkeen (rivit 673–680). Lohko poistaa `backdrop-filter`in ja transitiot kaikista elementeistä kun `data-perf="lite"` on asetettu `<html>`:lle.

- [ ] **Step 1: Varmista rivit 673–683**

Lue rivit 673–683 ja varmista rakenne:
```
/* prefers-reduced-motion: kaikki animaatiot ja transitionit pois */
@media(prefers-reduced-motion:reduce){
  *,*::before,*::after{
    animation-duration:.01ms!important;
    animation-iteration-count:1!important;
    transition-duration:.01ms!important;
  }
}

</style>
```

- [ ] **Step 2: Lisää lite-mode CSS-lohko**

Nykyinen (rivit 680–682):
```
}
}

</style>
```

Korvataan:
```
}
}

/* NOPEA TILA — poistaa backdrop-filter ja transitiot heikolla laitteistolla */
html[data-perf="lite"] *,
html[data-perf="lite"] *::before,
html[data-perf="lite"] *::after{
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
  animation-duration:.01ms!important;
  animation-iteration-count:1!important;
  transition-duration:.01ms!important;
}

</style>
```

- [ ] **Step 3: Varmista syntaksi**

```bash
node --check /home/jaakko/fokus/index.html
```

(Node ei validoi HTML:ää/CSS:ää, mutta heittää poikkeuksen pahimmissa tapauksissa. Riittää tarkistukseen.)

- [ ] **Step 4: Commit**

```bash
cd /home/jaakko/fokus && git add index.html && git commit -m "perf: add html[data-perf=lite] CSS block — removes backdrop-filter and transitions"
```

---

## Task 2: JS — `initPerfMode()` ja `togglePerfMode()`

**Files:**
- Modify: `index.html` — lisäys rivien 7519–7522 jälkeen (heti `initTheme()` IIFE:n perään)

`initPerfMode()` lukee `fap_perf` localStoragesta sivun latauksen yhteydessä ja asettaa attribuutin. `togglePerfMode()` vaihtaa tilan ja tallentaa. Molemmat kutsuvat `_updatePerfBtn()`:ä joka päivittää napin tekstin.

- [ ] **Step 1: Varmista rivit 7519–7524**

Lue rivit 7519–7524 ja varmista:
```js
(function initTheme(){
  var saved=localStorage.getItem('fap_theme')||'usva';
  setTheme(saved);
})();


// ── ICS KALENTERI ──
```

- [ ] **Step 2: Lisää JS-funktiot**

Nykyinen (rivit 7522–7526):
```js
})();


// ── ICS KALENTERI ──
```

Korvataan:
```js
})();

function _updatePerfBtn(){
  var on=document.documentElement.getAttribute('data-perf')==='lite';
  var btn=document.getElementById('perf-toggle-btn');
  if(btn) btn.textContent=on?'⚡ Nopea tila: päällä':'⚡ Nopea tila: pois';
}
function togglePerfMode(){
  var on=document.documentElement.getAttribute('data-perf')==='lite';
  if(on){document.documentElement.removeAttribute('data-perf');localStorage.removeItem('fap_perf');}
  else{document.documentElement.setAttribute('data-perf','lite');localStorage.setItem('fap_perf','1');}
  _updatePerfBtn();
}
(function initPerfMode(){
  if(localStorage.getItem('fap_perf')==='1') document.documentElement.setAttribute('data-perf','lite');
})();

// ── ICS KALENTERI ──
```

- [ ] **Step 3: Varmista syntaksi**

```bash
node --check /home/jaakko/fokus/index.html
```

Odotettu: ei virheitä (tai "SyntaxError: Cannot use import statement" jos node törmää ES-moduuliin — tämä on OK, tarkoittaa että JS itsessään on validi).

- [ ] **Step 4: Commit**

```bash
cd /home/jaakko/fokus && git add index.html && git commit -m "perf: add togglePerfMode() and initPerfMode() for lite performance mode"
```

---

## Task 3: HTML — Toggle-nappi profiilipaneeliin

**Files:**
- Modify: `index.html:3301` — lisäys ennen version-tekstiriviä

Lisätään toggle-nappi profiilipaneelin footer-alueeseen ennen "Fokus A Priori · v1.0.0 · MIT-lisenssi" -tekstiä (rivi 3302).

- [ ] **Step 1: Varmista rivit 3296–3305**

Lue rivit 3296–3305 ja varmista footer-rakenne:
```html
  <div style="padding:1rem 1.75rem;border-top:1px solid var(--light);display:flex;flex-direction:column;gap:.6rem;flex-shrink:0">
    <div style="display:flex;gap:.75rem">
      <button onclick="saveProfile()" ...>Tallenna profiili</button>
      <button onclick="closeProfile()" ...>Peruuta</button>
    </div>
    <div style="font-size:.65rem;color:var(--light);...">Fokus A Priori · v1.0.0 · MIT-lisenssi</div>
  </div>
```

- [ ] **Step 2: Lisää toggle-nappi**

Nykyinen (rivi 3302):
```html
    <div style="font-size:.65rem;color:var(--light);font-weight:300;text-align:center;letter-spacing:.04em">Fokus A Priori · v1.0.0 · MIT-lisenssi</div>
```

Korvataan:
```html
    <button id="perf-toggle-btn" onclick="togglePerfMode()" style="font-family:'DM Sans',sans-serif;font-size:.75rem;font-weight:400;padding:.4rem .85rem;border-radius:var(--r-md);border:1.5px solid var(--border);color:var(--muted);background:var(--surface);cursor:pointer;width:100%">⚡ Nopea tila: pois</button>
    <div style="font-size:.65rem;color:var(--light);font-weight:300;text-align:center;letter-spacing:.04em">Fokus A Priori · v1.0.0 · MIT-lisenssi</div>
```

- [ ] **Step 3: Lisää _updatePerfBtn()-kutsu openProfile()-funktioon**

`openProfile()` avataan profiilipaneeli — napin tila pitää päivittää aina kun paneeli avataan. Etsi `openProfile()`-funktio:

```bash
grep -n "function openProfile" /home/jaakko/fokus/index.html
```

Lisää `_updatePerfBtn();` kutsun `document.getElementById('profile-panel').classList.add('fap-open');` -rivin jälkeen.

Nykyinen (openProfile()-funktio):
```js
  document.getElementById('profile-panel').classList.add('fap-open');
```

Korvataan:
```js
  document.getElementById('profile-panel').classList.add('fap-open');
  _updatePerfBtn();
```

- [ ] **Step 4: Syntaksi + manuaalinen testi**

```bash
node --check /home/jaakko/fokus/index.html
```

Avaa `http://localhost:8080` selaimessa:
1. Klikkaa ⚙ Profiili
2. Varmista että "⚡ Nopea tila: pois" -nappi näkyy
3. Klikkaa nappia → tekstin pitää muuttua "⚡ Nopea tila: päällä"
4. Tarkista DevTools → Elements: `<html data-perf="lite">` pitää näkyä
5. Klikkaa uudelleen → attribuutti poistuu, teksti palaa "pois"
6. Lataa sivu uudelleen — jos nopea tila oli päällä, sen pitää pysyä päällä

- [ ] **Step 5: Commit**

```bash
cd /home/jaakko/fokus && git add index.html && git commit -m "perf: add Nopea tila toggle button to profile panel"
```

---

## Task 4: Push

- [ ] **Push GitHubiin**

```bash
cd /home/jaakko/fokus && git push origin main
```

---

## Valmis ✓

| Task | Status |
|------|--------|
| CSS lite-lohko | ☐ |
| JS togglePerfMode/initPerfMode | ☐ |
| Profile panel toggle-nappi | ☐ |
| GitHub push | ☐ |
