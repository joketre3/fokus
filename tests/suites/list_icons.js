// target: index
      // Vaihe 6: pakka, listat ja kvadranttimerkit samaan ikonisettiin.
      //
      // Neljä pintaa jäi vaiheiden 2–5 ulkopuolelle: tehtäväpakka
      // (.inv-card), Eisenhower-peek, matriisin listarivit ja odottavat.
      // Niissä elää kolme vikaluokkaa, jotka kaikki on aiemmin todettu
      // muualla:
      //   1. UI-emoji glyfin sijaan (vaiheen 5 vikaluokka)
      //   2. kvadrantti pelkkänä värinä — väri ei saa olla ainoa tiedon
      //      kantaja (PDF-periaate, ks. suunnitelman taulukko)
      //   3. oma ad hoc -SVG rekisterin ohi (vaiheen 2 vikaluokka:
      //      kolme rinnakkaista karttaa ajautui erilleen)
      //   4. kovakoodattu hex inline-tyylissä (The Theme Scope Rule)
      //
      // Mittari on rakennettu ENNEN korjausta: kaikkien näiden väitteiden
      // on kaaduttava korjaamattomassa puussa (`--tree /tmp/base-tree`).

      // ── Alueet ───────────────────────────────────────────────────────
      // Pakka ja peek eivät renderöidy itsestään; matriisi ja odottavat
      // tulevat render():stä.
      renderInventory();
      renderEisePeek();

      // Tähtikortti (handForced) on pakan oma tila eikä sitä ole
      // siemenessä — ilman sitä ⭐/☆ ei piirry lainkaan ja väite menisi
      // läpi tyhjästi.
      var _star = tasks.filter(function(t){ return !t.done; })[1];
      if (_star) { _star.handForced = true; renderInventory(); }

      function alue(sel){ return document.querySelector(sel); }
      var ALUEET = [
        ['pakka',      '#inv-modal'],
        ['peek',       '#eise-peek-grid'],
        ['matriisi q1','#mq1'],
        ['matriisi q3','#mq3'],
        ['odottavat',  '#waiting-list']
      ].filter(function(a){ return !!alue(a[1]); });

      ok('kaikki viisi aluetta ovat DOM:issa', ALUEET.length === 5,
         ALUEET.map(function(a){ return a[0]; }).join(', '));

      // Tyhjä alue tekee jokaisesta väitteestä tosi. Sisältö on siis
      // todettava ensin — muuten mittari on aina vihreä.
      var SISALTO = {
        'pakka':       '.inv-card',
        'peek':        '.eise-peek-card',
        'matriisi q1': '.qti',
        'matriisi q3': '.qti',
        'odottavat':   '.waiting-item'
      };
      ALUEET.forEach(function(a){
        var n = alue(a[1]).querySelectorAll(SISALTO[a[0]]).length;
        ok(a[0] + ': alueella on rivejä', n > 0, n + ' kpl');
      });

      // ── 1. Ei UI-emojeja ─────────────────────────────────────────────
      // Sallitut ovat typografisia merkkejä, eivät ikoneita: väliviivat,
      // erotinpiste, nuolet lauseen osana, kertomerkki sulkunappina ja
      // vetokahvan pistekuvio. Kaikki muu symbolialueilta on ikoni ja
      // kuuluu settiin.
      //
      // Tehtävän oma teksti EI ole kuorta: käyttäjä saa kirjoittaa
      // nimeen mitä tahansa, ja aamusuunnittelukortin nimi ('☀ …') on
      // dataa joka on tallennettu localStorageen. Nimisolmut karsitaan
      // kloonista ennen skannausta — muuten mittari väittää vikaa
      // paikassa jota vaihe 6 ei kosketa.
      var NIMET = '.inv-card__name, .eise-peek-card-txt, .qtin, .waiting-item__text';
      var SALLITUT = '·×–—→←⠿◆';
      var OIRE = /[←-⇿⌀-➿⬀-⯿️★☆⭐⚡⏳✓✔]|[\ud83c-\ud83e][\udc00-\udfff]/g;
      function kuoriTeksti(el){
        var k = el.cloneNode(true);
        [].slice.call(k.querySelectorAll(NIMET)).forEach(function(n){
          n.parentNode.removeChild(n);
        });
        return k.textContent || '';
      }
      ALUEET.forEach(function(a){
        var txt = kuoriTeksti(alue(a[1]));
        var osumat = (txt.match(OIRE) || []).filter(function(c){
          return SALLITUT.indexOf(c) < 0;
        });
        ok(a[0] + ': ei UI-emojeja', osumat.length === 0,
           osumat.length ? osumat.join(' ') : 'puhdas');
      });

      // ── 2. Kvadrantti on muoto, ei pelkkä väri ───────────────────────
      // Sama tieto kannetaan kortilla jo #q-q1…#q-q4 -merkeillä
      // (vaihe 4). Listoissa se on yhä väripallo tai kirjainlappu, joka
      // katoaa värisokealta ja harmaatulosteesta.
      function qMerkit(juuri, riviSel){
        var rivit = [].slice.call(juuri.querySelectorAll(riviSel));
        var ilman = rivit.filter(function(r){
          return !r.querySelector('use[href^="#q-q"]');
        });
        return [rivit.length, ilman.length];
      }
      var pakkaQ = qMerkit(alue('#inv-modal'), '.inv-card');
      ok('pakka: jokaisella kortilla kvadranttimerkki muotona',
         pakkaQ[0] > 0 && pakkaQ[1] === 0,
         pakkaQ[1] + ' / ' + pakkaQ[0] + ' korttia ilman #q-merkkia');

      var waitQ = qMerkit(alue('#waiting-list'), '.waiting-item');
      ok('odottavat: jokaisella rivilla kvadranttimerkki muotona',
         waitQ[0] > 0 && waitQ[1] === 0,
         waitQ[1] + ' / ' + waitQ[0] + ' rivia ilman #q-merkkia');

      // Siirtovalikko on transientti: se rakennetaan vasta klikkauksesta.
      var peekKortti = document.querySelector('#eise-peek-grid .eise-peek-card');
      if (peekKortti) {
        eiseOpenMoveMenu(peekKortti, parseInt(peekKortti.dataset.id, 10),
                         peekKortti.dataset.quad);
        var menu = document.querySelector('.eise-move-menu');
        var mQ = menu ? qMerkit(menu, '.eise-move-item') : [0, 1];
        ok('siirtovalikko: kohteen kvadrantti muotona',
           mQ[0] > 0 && mQ[1] === 0,
           mQ[1] + ' / ' + mQ[0] + ' kohdetta ilman #q-merkkia');
        eiseCloseMoveMenu();
      } else {
        ok('siirtovalikko: kohteen kvadrantti muotona', false,
           'peek-korttia ei loytynyt');
      }

      // ── 3. Kaikki SVG tulee spritestä ────────────────────────────────
      // svgFrogFilled / svgHourglass / svgTomatoFilled piirtävät oman
      // muotonsa paikan päällä. Ne ovat neljäs rinnakkainen ikonirekisteri
      // — täsmälleen se rakenne joka vaiheessa 2 ajautui erilleen.
      // Sprite-viittaus tunnistuu <use>:sta.
      ALUEET.forEach(function(a){
        var svgt = [].slice.call(alue(a[1]).querySelectorAll('svg'));
        var omat = svgt.filter(function(s){ return !s.querySelector('use'); });
        ok(a[0] + ': jokainen SVG on sprite-viittaus', omat.length === 0,
           omat.length + ' / ' + svgt.length + ' omaa piirrosta');
      });

      // ── 4. Ei kovakoodattuja hexeja inline-tyyleissa ─────────────────
      // Teematon väriliteraali on aina bugi jossain teemassa (The Theme
      // Scope Rule). JS:n asettama inline-tyyli on niistä pahin: se voittaa
      // teemalohkot eikä näy CSS:ää lukemalla.
      //
      // Hexiä ei voi etsiä sellaisenaan: selain normalisoi
      // `style.background='#c49a3a'` muotoon `rgb(196, 154, 58)`, joten
      // /#[0-9a-f]{6}/ ei löydä siitä mitään. Suora rgb()-literaali
      // inline-tyylissä on sama vika toisessa kirjoitusasussa — tokeni
      // säilyy `var(--x)`-muodossa eikä osu tähän.
      var LITERAALI = /\brgba?\(/g;
      ALUEET.forEach(function(a){
        var kaikki = [].slice.call(alue(a[1]).querySelectorAll('[style]'));
        var loydot = [];
        kaikki.forEach(function(el){
          var s = el.getAttribute('style') || '';
          if (LITERAALI.test(s)) loydot.push((el.className || el.tagName) + ':' + s.slice(0, 40));
          LITERAALI.lastIndex = 0;
        });
        ok(a[0] + ': ei varilitteraalia inline-tyylissa', loydot.length === 0,
           loydot.length ? loydot.slice(0, 3).join(' | ') : 'puhdas');
      });

      // ── 5. Verbiglyfi tulee samasta rekisterista ─────────────────────
      // Vaihe 2 todensi tämän pakan verb-bg:lle; peek ja matriisi jäivät
      // ilman verbiä kokonaan. Väite on tässä siksi, että jos vaihe 6
      // lisää niihin verbin, sen on tultava iconId():stä eikä uudesta
      // kartasta.
      var vaarat = [];
      ALUEET.forEach(function(a){
        [].slice.call(alue(a[1]).querySelectorAll('use')).forEach(function(u){
          var h = u.getAttribute('href') || '';
          if (h.indexOf('#g-') !== 0 && h.indexOf('#q-') !== 0) vaarat.push(a[0] + h);
        });
      });
      ok('kaikki use-viittaukset osoittavat settiin', vaarat.length === 0,
         vaarat.length ? vaarat.slice(0, 5).join(' ') : 'vain #g-* ja #q-*');
