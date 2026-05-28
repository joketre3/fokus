# Firebase-integraatio: aamu.html ja swipe.html

Tämä suunnitelma kuvaa täsmälleen mitä muutoksia tehdään ja mihin kohtaan.
Perustuu index.html:n olemassa olevaan Firebase-toteutukseen — käytetään
täsmälleen samaa patternia molemmissa tiedostoissa.

---

## Yhteenveto muutoksista

| Tiedosto | Mitä muutetaan |
|---|---|
| `aamu.html` | +Firebase script-blokki, init IIFE odottaa authia, saveData() synkronoi Firestoreen, auth-UI logo-bariin |
| `swipe.html` | +Firebase script-blokki, startSwipe() odottaa authia, saveQueue() synkronoi Firestoreen, auth-UI headeriin |

---

## aamu.html

### 1. Lisää Firebase script-blokki ennen `</head>`

Etsi rivi jossa lukee `</style>` (tyyliblokin loppu, noin rivi 347).
Lisää heti sen jälkeen, ennen `</head>`-tagia:

```html
<!-- Firebase SDK -->
<script type="module">
  import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
  import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
  import { getFirestore, doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

  const firebaseConfig = {
    apiKey: "AIzaSyBHYckayJPQq7rsa609Si07RAz8BGvWT8U",
    authDomain: "fokus-a-priori.firebaseapp.com",
    projectId: "fokus-a-priori",
    storageBucket: "fokus-a-priori.firebasestorage.app",
    messagingSenderId: "15493800957",
    appId: "1:15493800957:web:df81346e3165c10d9aaf94"
  };

  const app = initializeApp(firebaseConfig);
  window._firebaseAuth = getAuth(app);
  const db = getFirestore(app);

  async function saveToFirestore(uid, wsId, data) {
    try {
      await setDoc(doc(db, 'users', uid, 'workspaces', wsId), data);
    } catch(e) {
      console.warn('⚠️ Firestore-tallennus epäonnistui:', e.message);
    }
  }

  async function loadFromFirestore(uid, wsId) {
    try {
      const snap = await getDoc(doc(db, 'users', uid, 'workspaces', wsId));
      if (snap.exists()) return snap.data();
    } catch(e) {
      console.warn('⚠️ Firestore-lataus epäonnistui:', e.message);
    }
    return null;
  }

  let _saveTimer = null;
  window._scheduleFsSave = function() {
    clearTimeout(_saveTimer);
    _saveTimer = setTimeout(function() {
      if (!window.currentUser) return;
      const wsId = localStorage.getItem('fap_active_ws') || 'work';
      const raw = localStorage.getItem('eis_v5_' + wsId);
      if (!raw) return;
      try { saveToFirestore(window.currentUser.uid, wsId, JSON.parse(raw)); } catch(e) {}
    }, 500);
  };

  window.kirjauduGooglella = function() {
    signInWithPopup(window._firebaseAuth, new GoogleAuthProvider())
      .catch(e => console.error('❌ Kirjautuminen epäonnistui:', e.message));
  };

  onAuthStateChanged(getAuth(app), async function(user) {
    const signinBtn = document.getElementById('auth-signin-btn');
    const signedInEl = document.getElementById('auth-signed-in');
    const userLabel = document.getElementById('auth-user-label');

    if (user) {
      window.currentUser = user;
      if (signinBtn) signinBtn.style.display = 'none';
      if (signedInEl) signedInEl.style.display = 'inline-flex';
      if (userLabel) userLabel.textContent = user.displayName ? user.displayName.split(' ')[0] : user.email.split('@')[0];

      const wsId = localStorage.getItem('fap_active_ws') || 'work';
      const fsData = await loadFromFirestore(user.uid, wsId);

      if (fsData && Array.isArray(fsData.tasks) && fsData.tasks.length > 0) {
        localStorage.setItem('eis_v5_' + wsId, JSON.stringify(fsData));
      } else {
        const localRaw = localStorage.getItem('eis_v5_' + wsId);
        if (localRaw) {
          try { saveToFirestore(user.uid, wsId, JSON.parse(localRaw)); } catch(e) {}
        }
      }
    } else {
      window.currentUser = null;
      if (signinBtn) signinBtn.style.display = 'inline-flex';
      if (signedInEl) signedInEl.style.display = 'none';
    }

    // Kutsu init kun auth on selvinnyt (kirjautunut tai ei)
    if (typeof window._fsLoadComplete === 'function') {
      window._fsLoadComplete();
      window._fsLoadComplete = null; // ajetaan vain kerran
    }
  });
</script>
```

---

### 2. Muokkaa init-IIFE (noin rivi 475)

**Ennen:**
```javascript
(function(){
  var t = localStorage.getItem('fap_theme') || 'usva';
  document.documentElement.setAttribute('data-theme', t);
  updateClock();
  setInterval(updateClock, 60000);
  loadData();
  renderQ1();
})();
```

**Jälkeen:**
```javascript
(function(){
  var t = localStorage.getItem('fap_theme') || 'usva';
  document.documentElement.setAttribute('data-theme', t);
  updateClock();
  setInterval(updateClock, 60000);

  // Odota Firebase authia — _fsLoadComplete kutsutaan kun auth on selvinnyt
  window._fsLoadComplete = function() {
    loadData();
    renderQ1();
  };

  // Fallback: jos Firebase ei lataudu 3s sisällä, ajetaan ilman synkrointia
  setTimeout(function() {
    if (typeof window._fsLoadComplete === 'function') {
      window._fsLoadComplete();
      window._fsLoadComplete = null;
    }
  }, 3000);
})();
```

---

### 3. Muokkaa saveData() (noin rivi 522)

Etsi `saveData()`-funktion loppu. Lisää yksi rivi `localStorage.setItem()`-kutsun jälkeen:

**Ennen:**
```javascript
  localStorage.setItem(key, JSON.stringify(d));
}
```

**Jälkeen:**
```javascript
  localStorage.setItem(key, JSON.stringify(d));
  if (window._scheduleFsSave) window._scheduleFsSave();
}
```

---

### 4. Lisää auth-UI logo-bariin (noin rivi 352)

Etsi:
```html
<div class="logo-bar">
  <div class="logo">Fo🌲us</div>
  <div class="time-badge" id="timeBadge"></div>
</div>
```

Korvaa:
```html
<div class="logo-bar">
  <div class="logo">Fo🌲us</div>
  <div style="display:flex;align-items:center;gap:.5rem">
    <div class="time-badge" id="timeBadge"></div>
    <button id="auth-signin-btn" onclick="window.kirjauduGooglella()"
      style="font-family:'DM Sans',sans-serif;font-size:.68rem;font-weight:500;
             padding:.3rem .65rem;border-radius:20px;border:1.5px solid var(--light);
             background:white;color:var(--muted);cursor:pointer">
      Kirjaudu
    </button>
    <span id="auth-signed-in" style="display:none;align-items:center;gap:.35rem;
          font-family:'DM Sans',sans-serif;font-size:.68rem;color:var(--muted)">
      <span style="width:7px;height:7px;border-radius:50%;background:#34A853;display:inline-block"></span>
      <span id="auth-user-label"></span>
    </span>
  </div>
</div>
```

---

## swipe.html

### 1. Lisää Firebase script-blokki ennen `</style>`-tagin jälkeen

Sama blokki kuin aamu.html:ssa (kopio suoraan ylhäältä).
Ainut ero: `_fsLoadComplete` kutsuu `loadData()` swipe-kontekstissa — ei `renderQ1()`.

```javascript
  // onAuthStateChanged-lohkon lopussa:
  if (typeof window._fsLoadComplete === 'function') {
    window._fsLoadComplete();
    window._fsLoadComplete = null;
  }
```

---

### 2. Muokkaa init (noin rivi 237)

**Ennen:**
```javascript
(function(){
  var t=localStorage.getItem('fap_theme')||'usva';
  document.documentElement.setAttribute('data-theme',t);
  // ... muita init-asioita
})();
```

**Jälkeen** — lisää `_fsLoadComplete` + 3s fallback täsmälleen kuten aamu.html:ssa.
`_fsLoadComplete` kutsuu vain `loadData()` (swipessä data ladataan vasta kun käyttäjä
painaa "Aloita" — joten init ei kutsu loadData:a suoraan, vaan se tapahtuu `startSwipe()`-funktiossa):

```javascript
window._fsLoadComplete = function() {
  // swipe.html: data ladataan startSwipe()-kutsussa, ei heti
  // Aseta vain lippu että Firebase on valmis
  window._firebaseReady = true;
};
```

---

### 3. Muokkaa startSwipe() (noin rivi 235)

**Ennen:**
```javascript
function startSwipe(override){
  budgetMin=(override===0)?0:getSelectedMin();
  loadData();
  ...
}
```

**Jälkeen** — `loadData()` kutsutaan vasta Firebase-readyn jälkeen.
Koska `startSwipe()` on käyttäjän painike-funktio, Firebase on jo ehtinyt ladata
auth-tilan (3s fallback varmistaa tämän). Ei tarvita muutosta itse funktioon —
`loadData()` lukee jo päivitetyn localStorage-datan joka on synkronoitu Firestoresta.

> Ei muutosta `startSwipe()`-funktioon.

---

### 4. Muokkaa saveQueue() (noin rivi 270)

**Ennen:**
```javascript
  localStorage.setItem(key,JSON.stringify(d));
}
```

**Jälkeen:**
```javascript
  localStorage.setItem(key,JSON.stringify(d));
  if (window._scheduleFsSave) window._scheduleFsSave();
}
```

---

### 5. Lisää auth-UI headeriin

Etsi `.hdr`-elementti (rivi ~577 body-osassa):
```html
<div class="hdr">
  <div class="hdr-logo">Fo🌲us</div>
  <button class="hdr-back" ...>← Takaisin</button>
  <div class="hdr-count" id="counter"></div>
</div>
```

Lisää auth-indikaattori `hdr-logo`-divin jälkeen:
```html
<span id="auth-signed-in" style="display:none;align-items:center;gap:.3rem;
      font-family:'DM Sans',sans-serif;font-size:.65rem;color:var(--muted)">
  <span style="width:6px;height:6px;border-radius:50%;background:#34A853;display:inline-block"></span>
  <span id="auth-user-label"></span>
</span>
<button id="auth-signin-btn" onclick="window.kirjauduGooglella()"
  style="font-family:'DM Sans',sans-serif;font-size:.65rem;font-weight:500;
         padding:.25rem .55rem;border-radius:20px;border:1.5px solid var(--light);
         background:white;color:var(--muted);cursor:pointer">
  Kirjaudu
</button>
```

---

## Testausohje toteutuksen jälkeen

1. Avaa `index.html` → kirjaudu Googlella
2. Lisää muutama tehtävä Q1 ja Q2:een
3. Avaa `aamu.html` uudessa välilehdessä — tehtävien pitäisi näkyä
4. Käy läpi aamusuunnittelu ja paina "Valmis"
5. Palaa `index.html`:ään — frog ja jono-järjestys pitäisi olla päivittynyt
6. Kokeile toisella laitteella/selaimella kirjautuneena — datan pitäisi synkronoitua

**Tarkista konsolista:**
- `✅ Firebase alustettu` — SDK latautui
- `☁️ Data ladattu Firestoresta` — tai `📦 Migraatio: localStorage → Firestore`
- Ei punaisia virheilmoituksia

---

## Mahdolliset ongelmat

**"Permission denied" Firestoressa**
→ Tarkista Firebase Console → Firestore → Rules.
Tarvittava sääntö:
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

**Tehtävät eivät synkronoidu aamu.html → index.html välillä**
→ `saveData()`:ssa täytyy olla `window._scheduleFsSave()` kutsu.
→ Tarkista että molemmat sivut käyttävät samaa `fap_active_ws`-arvoa.

**Auth-tila ei säily sivulta toiselle**
→ Firebase Auth säilyttää tilan automaattisesti `localStorage`:ssa.
→ Varmista että molemmat sivut käyttävät täsmälleen samaa `firebaseConfig.appId`.
