/* Fokus A Priori — service worker
 *
 * Tavoite: sovellus aukeaa lentokoneessa ja katvealueella, mutta EI jää
 * koskaan jumiin vanhaan versioon. GitHub Pages + service worker on tunnettu
 * vanhentumisansa, joten navigointi haetaan aina ensin verkosta ja välimuisti
 * on vain varajärjestelmä.
 *
 * Versionumero on nostettava kun app shell muuttuu — activate pyyhkii
 * kaikki muut fokus-välimuistit.
 */
var CACHE = 'fokus-v1';

var SHELL = [
  'index.html',
  'aamu.html',
  'swipe.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'icon-180.png'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      // addAll on kaikki-tai-ei-mitään: yksi 404 kaataisi koko asennuksen.
      // Haetaan yksitellen, jotta puuttuva tiedosto ei estä offline-tukea.
      return Promise.all(SHELL.map(function(url){
        return c.add(new Request(url, {cache:'reload'}))['catch'](function(err){
          console.warn('[sw] esivälimuistitus ohitettu:', url, err && err.message);
        });
      }));
    })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        return k === CACHE ? null : caches['delete'](k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

// Sivu voi pyytää uutta workeria ottamaan vallan heti (päivitysnappi).
self.addEventListener('message', function(e){
  if (e.data === 'skip-waiting') self.skipWaiting();
});

self.addEventListener('fetch', function(e){
  var req = e.request;
  if (req.method !== 'GET') return;

  var url;
  try { url = new URL(req.url); } catch(err) { return; }

  // Vieras origin (gstatic, fonts, Firestore) jätetään koskematta.
  // Firestoren pitkä pollaus hajoaa jos se ohjataan välimuistin läpi.
  if (url.origin !== self.location.origin) return;

  // Navigointi: verkko ensin, välimuisti vain jos verkkoa ei ole.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(function(res){
        var copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put(req, copy); });
        return res;
      })['catch'](function(){
        return caches.match(req).then(function(hit){
          return hit || caches.match('index.html');
        });
      })
    );
    return;
  }

  // Muu oman originin sisältö: näytä välimuistista heti, päivitä taustalla.
  e.respondWith(
    caches.match(req).then(function(hit){
      var net = fetch(req).then(function(res){
        if (res && res.status === 200) {
          var copy = res.clone();
          caches.open(CACHE).then(function(c){ c.put(req, copy); });
        }
        return res;
      })['catch'](function(){ return hit; });
      return hit || net;
    })
  );
});
