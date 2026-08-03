/* Fokus A Priori — service worker
 *
 * Tarkoitus: offline-tuki. EI mitään muuta.
 *
 * Perussääntö: tämä worker koskee vain siihen mihin sen on pakko. Firestore,
 * Google-kirjautuminen ja Anthropic API menevät koskemattomina läpi — niille ei
 * kutsuta respondWith()iä lainkaan, jolloin selain hoitaa ne täsmälleen kuten
 * ilman workeria. Se yksi sääntö pitää pilvisynkan ja kirjautumisen ennallaan.
 *
 * Dokumentit haetaan network-first: index.html muuttuu jatkuvasti ja menee
 * suoraan GitHub Pagesiin, joten cache-first tarkoittaisi että korjaukset eivät
 * näy käyttäjälle. Välimuisti on vain verkottoman tilan varasuunnitelma.
 *
 * HÄTÄJARRU — lue tämä ennen kuin yrität perua service workeria:
 * pelkkä `git revert` EI riitä. Worker jää asennettuna selaimeen ja jatkaa
 * toimintaansa vaikka repo palautettaisiin. Poistaminen vaatii jommankumman:
 *   1) Korvaa TÄMÄN tiedoston sisältö tällä ja deployaa:
 *        self.addEventListener('install', () => self.skipWaiting());
 *        self.addEventListener('activate', (e) => e.waitUntil((async () => {
 *          for (const k of await caches.keys()) await caches.delete(k);
 *          await self.registration.unregister();
 *          for (const c of await self.clients.matchAll()) c.navigate(c.url);
 *        })()));
 *   2) Tai sivulta: navigator.serviceWorker.controller.postMessage({type:'FOKUS_UNREGISTER'})
 * Ks. myös CLAUDE.md, osio "Asennettava työpöytäsovellus".
 */

var VERSION = 'fokus-v1';
var CACHE = VERSION;

/* Sovelluskuori. Nämä esiladataan asennuksessa, jotta ensimmäinen verkoton
 * käynnistys toimii. Puuttuva tiedosto ei saa kaataa koko asennusta. */
var SHELL = [
  './',
  './index.html',
  './aamu.html',
  './swipe.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png'
];

/* Versioituja, muuttumattomia CDN-osoitteita — turvallisia cache-firstinä.
 * HUOM: tämä on tarkoituksella tarkka etuliitelista eikä origin-tason sääntö.
 * www.gstatic.com tarjoilee muutakin kuin Firebase-SDK:n, ja
 * *.googleapis.com sisältää Firestoren live-liikenteen jota EI saa välimuistittaa. */
var CDN_PREFIXES = [
  'https://fonts.googleapis.com/',
  'https://fonts.gstatic.com/',
  'https://www.gstatic.com/firebasejs/'
];

function isCdnCacheable(url) {
  for (var i = 0; i < CDN_PREFIXES.length; i++) {
    if (url.indexOf(CDN_PREFIXES[i]) === 0) return true;
  }
  return false;
}

/* Saman originin staattinen resurssi, jota ei tarvitse hakea verkosta joka kerta. */
function isStaticAsset(pathname) {
  return /\.(png|svg|ico|webmanifest|woff2?)$/i.test(pathname);
}

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (cache) {
      // Yksi kerrallaan + catch: yksikin 404 ei saa estää asennusta.
      return Promise.all(SHELL.map(function (u) {
        return cache.add(new Request(u, { cache: 'reload' })).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        return k === CACHE ? null : caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

/* Hätäjarru sivulta käsin. */
self.addEventListener('message', function (e) {
  if (!e.data || e.data.type !== 'FOKUS_UNREGISTER') return;
  e.waitUntil((async function () {
    var keys = await caches.keys();
    for (var i = 0; i < keys.length; i++) await caches.delete(keys[i]);
    await self.registration.unregister();
    var cs = await self.clients.matchAll();
    for (var j = 0; j < cs.length; j++) cs[j].navigate(cs[j].url);
  })());
});

self.addEventListener('fetch', function (e) {
  var req = e.request;

  // Vain GET. POST/PUT (Firestore, Anthropic) ei kuulu tänne lainkaan.
  if (req.method !== 'GET') return;

  var url;
  try { url = new URL(req.url); } catch (err) { return; }

  // Vain http(s) — chrome-extension: yms. ohitetaan.
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  var sameOrigin = (url.origin === self.location.origin);

  // ── Ristiorigin ───────────────────────────────────────────────
  if (!sameOrigin) {
    // Kaikki muu paitsi tarkka sallittulista menee koskemattomana läpi:
    // Firestore, identitytoolkit, accounts.google.com, api.anthropic.com …
    if (!isCdnCacheable(url.href)) return;

    e.respondWith(
      caches.match(req).then(function (hit) {
        if (hit) return hit;
        return fetch(req).then(function (res) {
          // Vain onnistuneet vastaukset talteen. Opaque (no-cors) kelpaa myös,
          // koska fontit ja SDK haetaan cross-origin ilman CORS-otsakkeita.
          if (res && (res.ok || res.type === 'opaque')) {
            var copy = res.clone();
            caches.open(CACHE).then(function (c) { c.put(req, copy); });
          }
          return res;
        });
      }).catch(function () { return fetch(req); })
    );
    return;
  }

  // ── Saman originin dokumentit → network-first ────────────────
  var isDoc = (req.mode === 'navigate') ||
              (req.destination === 'document') ||
              /\.html$/i.test(url.pathname) ||
              url.pathname.endsWith('/');

  if (isDoc) {
    e.respondWith(
      fetch(req).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () {
        // Verkko poikki → viimeisin onnistunut versio, tai sovelluskuori.
        return caches.match(req).then(function (hit) {
          return hit || caches.match('./index.html');
        });
      })
    );
    return;
  }

  // ── Saman originin staattiset → cache-first ──────────────────
  if (isStaticAsset(url.pathname)) {
    e.respondWith(
      caches.match(req).then(function (hit) {
        if (hit) return hit;
        return fetch(req).then(function (res) {
          if (res && res.ok) {
            var copy = res.clone();
            caches.open(CACHE).then(function (c) { c.put(req, copy); });
          }
          return res;
        });
      }).catch(function () { return fetch(req); })
    );
    return;
  }

  // Kaikki muu saman originin liikenne: ei käsittelyä.
});
