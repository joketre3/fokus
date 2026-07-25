# Vaihe 2: Kriittiset bugit — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Korjaa 4 kriittistä bugia: puuttuvat try/catch localStorage:ssa, väärä avain swipe.html:ssä, popup-timerin kovakoodatut arvot ja AI-analyysin virheviestit.

**Architecture:** Kaikki korjaukset ovat pieniä muutoksia olemassa olevaan koodiin — ei uusia abstraktioita. Kuvio `loadTimerSettings()`:ssa (index.html:4259) on malli oikealle try/catch-käytölle.

**Tech Stack:** Vanilla JS, single-file HTML, manuaalinen selaintestaus, git commit per task.

---

## Tiedostot

| Tiedosto | Muutokset |
|----------|-----------|
| `index.html` | Task 1: `:7392–7394` (save try/catch) |
| `index.html` | Task 2: `:7407–7408` + `:7484` (load JSON.parse try/catch) |
| `swipe.html` | Task 3: `:289–291` (väärä localStorage-avain) |
| `index.html` | Task 4: `:4132` (popup-timer WORK/SBRK/LBRK) |
| `index.html` | Task 5: `:4592–4604` (runAnalysis response.ok + virheviestin tarkennus) |

---

## Task 1: save() — QuotaExceededError hylätään hiljaa

**Files:**
- Modify: `index.html:7392–7394`

Mobiilissa localStorage-kiintiö voi täyttyä. `localStorage.setItem()` heittää `QuotaExceededError` jota ei napata — tallennus epäonnistuu hiljaa.

Referenssimalli: `loadTimerSettings()` index.html:4261 näyttää oikean try/catch-kuvion.

- [ ] **Step 1: Lue nykyinen koodi**

Lue rivit 7392–7395 ja varmista:
```js
function save(){
  localStorage.setItem(wsStorageKey(),JSON.stringify({tasks:tasks,nid:nid,active:active,turn:turn,pomoDone:pomoDone,totalPomos:totalPomos,date:dtEl.value,projects:projects,pnid:pnid}));
  if(window._scheduleFsSave) window._scheduleFsSave();
}
```

- [ ] **Step 2: Korvaa save()-funktio**

```js
function save(){
  try{
    localStorage.setItem(wsStorageKey(),JSON.stringify({tasks:tasks,nid:nid,active:active,turn:turn,pomoDone:pomoDone,totalPomos:totalPomos,date:dtEl.value,projects:projects,pnid:pnid}));
  }catch(e){
    if(e.name==='QuotaExceededError'||e.name==='NS_ERROR_DOM_QUOTA_REACHED'){
      notify('Tallennus epäonnistui: selain muisti täynnä');
    }
  }
  if(window._scheduleFsSave) window._scheduleFsSave();
}
```

- [ ] **Step 3: Varmista muutos lukemalla rivit 7392–7402**

- [ ] **Step 4: Commit**

```bash
cd /home/jaakko/fokus && git add index.html && git commit -m "fix: catch QuotaExceededError in save() and notify user"
```

---

## Task 2: load() — JSON.parse kaataa sovelluksen korruptoituneella datalla

**Files:**
- Modify: `index.html:7407–7408` (load-funktio)
- Modify: `index.html:7484` (focus-tapahtumankäsittelijä)

Kaksi `JSON.parse()`-kutsua ilman try/catch. Korruptoitunut tai katkennut localStorage (esim. selainkaatuminen kirjoituksen aikana) kaataa koko sovelluksen.

- [ ] **Step 1: Lue load()-funktio rivit 7396–7412**

Varmista että rivi 7408 on:
```js
    var d=JSON.parse(r);
```

- [ ] **Step 2: Korjaa load()-funktion JSON.parse (rivi 7407–7408)**

Nykyinen:
```js
  if(r){
    var d=JSON.parse(r);
    tasks=d.tasks||[];nid=d.nid||1;
```

Korvataan:
```js
  if(r){
    var d;try{d=JSON.parse(r);}catch(e){d={};}
    tasks=d.tasks||[];nid=d.nid||1;
```

- [ ] **Step 3: Lue focus-käsittelijä rivit 7479–7489**

Varmista että rivi 7484 on:
```js
  var d = JSON.parse(raw);
```

- [ ] **Step 4: Korjaa focus-käsittelijän JSON.parse (rivi 7484)**

Nykyinen:
```js
  var d = JSON.parse(raw);
  // Tarkista onko data muuttunut sitten viime renderin
  var newSig = (d.tasks||[]).length + '_' + (d.active||'') + '_' + (d.turn||d.queue||[]).join(',');
```

Korvataan:
```js
  var d;try{d=JSON.parse(raw);}catch(e){return;}
  // Tarkista onko data muuttunut sitten viime renderin
  var newSig = (d.tasks||[]).length + '_' + (d.active||'') + '_' + (d.turn||d.queue||[]).join(',');
```

- [ ] **Step 5: Commit**

```bash
cd /home/jaakko/fokus && git add index.html && git commit -m "fix: guard JSON.parse in load() and focus handler against corrupted localStorage"
```

---

## Task 3: swipe.html — queueTotalMin() lukee väärää localStorage-avainta

**Files:**
- Modify: `swipe.html:289–291`

`queueTotalMin()` lukee `'eis_v5'` (legacy key ilman workspace-suffiksia). Kaikki ei-oletus-työtilan käyttäjät saavat väärän budjetin. `loadData()` samassa tiedostossa (rivi 244) tekee saman oikein: `'eis_v5_'+wsId`.

- [ ] **Step 1: Lue rivit 287–296**

Varmista:
```js
function queueTotalMin(){
  var raw=localStorage.getItem('eis_v5');
  var dtasks=(raw?JSON.parse(raw).tasks:[])||[];
```

- [ ] **Step 2: Korjaa queueTotalMin()**

Nykyinen:
```js
function queueTotalMin(){
  var raw=localStorage.getItem('eis_v5');
  var dtasks=(raw?JSON.parse(raw).tasks:[])||[];
```

Korvataan:
```js
function queueTotalMin(){
  var wsId=localStorage.getItem('fap_active_ws')||'work';
  var raw=localStorage.getItem('eis_v5_'+wsId);
  var dtasks=(raw?JSON.parse(raw).tasks:[])||[];
```

- [ ] **Step 3: Manuaalinen testi**

Avaa DevTools → Console swipe.html:ssä:
```js
// Aseta työtila ja testaa
localStorage.setItem('fap_active_ws', 'work');
console.log('queueTotalMin:', queueTotalMin()); // pitäisi vastata oikeaa dataa
```

- [ ] **Step 4: Commit**

```bash
cd /home/jaakko/fokus && git add swipe.html && git commit -m "fix: queueTotalMin() reads workspace-qualified localStorage key (was using legacy 'eis_v5')"
```

---

## Task 4: Popup-timer — kovakoodatut WORK/SBRK/LBRK ignoroivat käyttäjän asetukset

**Files:**
- Modify: `index.html:4132`

Popup-timer kovakoodaa `WORK=1500,SBRK=300,LBRK=1200` vaikka käyttäjä olisi asettanut esim. 50 minuutin session. Yläikkunassa (`window.opener`) on oikeat arvot muuttujissa `WORK`, `SBRK`, `LBRK` — niitä voi lukea suoraan. Fallback-arvot pitää säilyttää jos opener ei ole saatavilla.

- [ ] **Step 1: Lue rivit 4130–4140**

Varmista rivi 4132:
```js
    +'  var WORK=1500,SBRK=300,LBRK=1200,total=WORK;'
```

- [ ] **Step 2: Korvaa rivi 4132**

Nykyinen:
```js
    +'  var WORK=1500,SBRK=300,LBRK=1200,total=WORK;'
```

Korvataan:
```js
    +'  var WORK=(window.opener&&window.opener.WORK)||1500,SBRK=(window.opener&&window.opener.SBRK)||300,LBRK=(window.opener&&window.opener.LBRK)||1200,total=WORK;'
```

- [ ] **Step 3: Varmista muutos lukemalla rivit 4130–4140**

Tarkista että `total=WORK` on edelleen lopussa ja ympäröivä koodi on ehjä.

- [ ] **Step 4: Commit**

```bash
cd /home/jaakko/fokus && git add index.html && git commit -m "fix: popup timer reads WORK/SBRK/LBRK from window.opener instead of hardcoded defaults"
```

---

## Task 5: runAnalysis() — response.ok puuttuu, virheviestit epätarkkoja

**Files:**
- Modify: `index.html:4592–4604`

`response.json()` kutsutaan tarkistamatta `response.ok`. HTTP 401 (väärä avain), 429 (rate-limit) ja 529 (ylikuormitus) kaikki tuottavat saman viestin. Lisätään `response.ok`-tarkistus ja HTTP-statukseen perustuvat virheviestin.

- [ ] **Step 1: Lue rivit 4591–4606**

Varmista:
```js
    });
    var data=await response.json();
    var raw=data.content[0].text;
    var clean=raw.replace(/```json|```/g,'').trim();
    var result=JSON.parse(clean);
    renderAIResults(result,inbox);
  }catch(err){
    document.getElementById('ai-loading').style.display='none';
    document.getElementById('ai-results').style.display='block';
    var hasKey=!!localStorage.getItem('fap_apikey');
    document.getElementById('ai-results').innerHTML='<div style="font-size:.8rem;color:var(--pomo);padding:1rem;background:rgba(168,76,40,.07);border-radius:8px;line-height:1.6">'
      +(hasKey?'Analyysi epäonnistui. Tarkista API-avain profiilista tai verkkoyhteytesi.':'API-avain puuttuu. Avaa <strong>⚙ Profiili</strong> ja lisää Anthropic API-avain.')
      +'</div>';
  }
```

- [ ] **Step 2: Korvaa rivit 4592–4604**

Nykyinen lohko (rivit 4592–4604):
```js
    });
    var data=await response.json();
    var raw=data.content[0].text;
    var clean=raw.replace(/```json|```/g,'').trim();
    var result=JSON.parse(clean);
    renderAIResults(result,inbox);
  }catch(err){
    document.getElementById('ai-loading').style.display='none';
    document.getElementById('ai-results').style.display='block';
    var hasKey=!!localStorage.getItem('fap_apikey');
    document.getElementById('ai-results').innerHTML='<div style="font-size:.8rem;color:var(--pomo);padding:1rem;background:rgba(168,76,40,.07);border-radius:8px;line-height:1.6">'
      +(hasKey?'Analyysi epäonnistui. Tarkista API-avain profiilista tai verkkoyhteytesi.':'API-avain puuttuu. Avaa <strong>⚙ Profiili</strong> ja lisää Anthropic API-avain.')
      +'</div>';
  }
```

Korvataan:
```js
    });
    if(!response.ok) throw new Error('HTTP '+response.status);
    var data=await response.json();
    var raw=data.content[0].text;
    var clean=raw.replace(/```json|```/g,'').trim();
    var result=JSON.parse(clean);
    renderAIResults(result,inbox);
  }catch(err){
    document.getElementById('ai-loading').style.display='none';
    document.getElementById('ai-results').style.display='block';
    var hasKey=!!localStorage.getItem('fap_apikey');
    var status=err&&err.message?parseInt(err.message.replace('HTTP ',''),10):0;
    var msg=!hasKey?'API-avain puuttuu. Avaa <strong>⚙ Profiili</strong> ja lisää Anthropic API-avain.'
      :status===401?'Virheellinen API-avain. Tarkista avain profiilista.'
      :status===429?'API-kutsuraja ylitetty. Odota hetki ja yritä uudelleen.'
      :status===529?'Anthropicin palvelin ylikuormittunut. Yritä myöhemmin uudelleen.'
      :'Analyysi epäonnistui. Tarkista verkkoyhteytesi.';
    document.getElementById('ai-results').innerHTML='<div style="font-size:.8rem;color:var(--pomo);padding:1rem;background:rgba(168,76,40,.07);border-radius:8px;line-height:1.6">'+msg+'</div>';
  }
```

- [ ] **Step 3: Varmista muutos lukemalla rivit 4591–4610**

- [ ] **Step 4: Commit**

```bash
cd /home/jaakko/fokus && git add index.html && git commit -m "fix: check response.ok in runAnalysis(), show specific error for HTTP 401/429/529"
```

---

## Vaihe 2 — Valmis ✓

| Task | Tiedosto | Status |
|------|----------|--------|
| save() QuotaExceededError | index.html:7392 | ☐ |
| load() JSON.parse try/catch | index.html:7408, :7484 | ☐ |
| swipe.html workspace-avain | swipe.html:289 | ☐ |
| Popup-timer WORK/SBRK/LBRK | index.html:4132 | ☐ |
| runAnalysis response.ok | index.html:4592 | ☐ |

---

## Siirtymä → Vaihe 3: Koodin konsolidointi

**Vaihe 3 kattaa:**
1. localStorage-vakioiden yhtenäistäminen (`WS_ACTIVE` raw-stringit → vakio kaikkialla)
2. `fe()` duplikaatin poisto swipe.html:stä
3. `POMO_MIN` lukemaan `fap_timer_settings`:stä swipe.html:ssä ja aamu.html:ssä
4. `renderCardNew()` jakaminen `renderArenaCard()` + `renderDeckCard()`-funktioiksi

**Siirtymäehto:** Kaikki 5 commitia tehty, selain ei näytä console-virheitä, sovellus toimii normaalisti.
