// target: index
      // Ikonirekisteri (vaihe 2). Kolme karttaa yhdistettiin yhdeksi:
      // _TCG_VERB_ID (kortti, käskymuoto), INV_VERB_ICONS (pakka,
      // nominalisaatio) ja VERB_ICONS (kuollut). Ne olivat jo ehtineet
      // ajautua erilleen — siksi väitteet ovat nimenomaan siitä, että
      // MOLEMMAT kirjoitusasut päätyvät samaan glyfiin.

      // ── Rekisteri on olemassa ────────────────────────────────────────
      ok('ICON-setti on taytetty', typeof ICON === 'object' &&
         Object.keys(ICON).length === 32, Object.keys(ICON).length + ' nimea');
      ok('vanhat kartat poistettu',
         typeof window._TCG_VERB_ID === 'undefined' &&
         typeof window.VERB_ICONS === 'undefined', 'ei _TCG_VERB_ID / VERB_ICONS');

      // ── Kaksi kirjoitusasua, yksi glyfi ──────────────────────────────
      // Tämä on koko yhdistämisen syy: aiemmin 'Soita' ja 'soittaminen'
      // olivat eri kartoissa eikä mikään pakottanut niitä samaan ikoniin.
      var PARIT = [
        ['Soita', 'soittaminen'], ['Sovi', 'sopiminen'],
        ['Kirjaa', 'kirjaaminen'], ['Tee', 'tekeminen'],
        ['Vie', 'vieminen'], ['Varaa', 'varaaminen'],
        ['Tapaa', 'tapaaminen'], ['Lue', 'lukeminen']
      ];
      PARIT.forEach(function(p){
        ok('"' + p[0] + '" ja "' + p[1] + '" samaan glyfiin',
           verbIcon(p[0]) === verbIcon(p[1]), verbIcon(p[0]) + ' / ' + verbIcon(p[1]));
      });

      // ── Ääkköset eivät saa karata id:hen ─────────────────────────────
      // Glyfi on #g-selvita, verbi on 'Selvitä'. Ilman normalisointia
      // haku tuottaisi '#g-selvitä' eikä mikään symboli täsmäisi.
      ok('Selvita -> #g-selvita', verbIcon('Selvitä') === '#g-selvita', verbIcon('Selvitä'));
      ok('Laheta -> #g-laheta', verbIcon('Lähetä') === '#g-laheta', verbIcon('Lähetä'));
      ok('isot ja pienet kirjaimet sama', verbIcon('SOITA') === verbIcon('soita'),
         verbIcon('SOITA'));

      // ── Fallback ─────────────────────────────────────────────────────
      ok('tuntematon verbi -> fallback', verbIcon('kalastus') === '#g-tee', verbIcon('kalastus'));
      ok('tyhja -> fallback', verbIcon('') === '#g-tee' && verbIcon(null) === '#g-tee',
         verbIcon('') + ' / ' + verbIcon(null));
      // Osittainen tasmays kattaa vain prefiksit kumpaankin suuntaan:
      // 'soittaminen asiakkaalle' alkaa tunnetulla aliaksella, 'soit' on
      // sellaisen alku. 'soitto' EI ole kummankaan prefiksi, joten se
      // tarvitsee oman aliaksensa — vanha koodi pudotti sen fallbackiin.
      ok('prefiksi eteenpain: "soittaminen asiakkaalle"',
         verbIcon('soittaminen asiakkaalle') === '#g-soita',
         verbIcon('soittaminen asiakkaalle'));
      ok('prefiksi taaksepain: "soit"', verbIcon('soit') === '#g-soita', verbIcon('soit'));
      ok('substantiivimuoto: "Soitto"', verbIcon('Soitto') === '#g-soita', verbIcon('Soitto'));
      ok('substantiivimuoto: "Tarkistus"', verbIcon('Tarkistus') === '#g-tarkista',
         verbIcon('Tarkistus'));

      // ── tier ─────────────────────────────────────────────────────────
      // Sigil-symboleja ei ole vielä olemassa; kunnes ICON_S täyttyy
      // vaiheessa 3, tier 's' on pudottava glyfiin eikä tuottaa
      // viittausta symboliin jota ei ole.
      ok('tier s putoaa glyfiin nimelle jolla ei ole sigilia',
         verbIcon('Soita', 's') === '#g-soita', verbIcon('Soita', 's'));

      // Sovi on ainoa jolla on molemmat tiheydet. Ne ovat samasta
      // mitatusta geometriasta: taysi 7 sormea sigiliksi, karsittu 4
      // glyfiksi — taydella maaralla sormiraot umpeutuvat jo 20px:ssa.
      ok('sovi: tier s antaa sigilin', verbIcon('Sovi', 's') === '#s-sovi',
         verbIcon('Sovi', 's'));
      ok('sovi: oletus on yha glyfi', verbIcon('Sovi') === '#g-sovi', verbIcon('Sovi'));
      ok('#s-sovi on defsissa', !!document.getElementById('s-sovi'),
         document.getElementById('s-sovi') ? 'on' : 'puuttuu');
      ok('jokaiselle ICON_S-nimelle loytyy #s-symboli',
         Object.keys(ICON_S).every(function(n){ return !!document.getElementById('s-' + n); }),
         Object.keys(ICON_S).join(', '));

      // ── Jokainen alias osoittaa olemassa olevaan symboliin ───────────
      // Kirjoitusvirhe aliaskartassa tuottaisi rikkinäisen <use href>:n,
      // joka renderöityy hiljaa tyhjänä — ei virhettä konsoliin.
      var rikki = [];
      Object.keys(VERB_ALIAS).forEach(function(k){
        var id = verbIcon(k).slice(1);
        if (!document.getElementById(id)) rikki.push(k + '->' + id);
      });
      ok('kaikki aliakset osoittavat olemassa olevaan symboliin',
         rikki.length === 0, rikki.length ? rikki.join(', ') : Object.keys(VERB_ALIAS).length + ' aliasta');

      // ── Jokainen ICON-nimi on myos <defs>issa ────────────────────────
      var puuttuu = Object.keys(ICON).filter(function(n){
        return !document.getElementById('g-' + n);
      });
      ok('jokaiselle ICON-nimelle loytyy #g-symboli',
         puuttuu.length === 0, puuttuu.length ? puuttuu.join(', ') : '32/32');

      // ── Kvadranttimerkit ─────────────────────────────────────────────
      var qPuuttuu = ['q1','q2','q3','q4'].filter(function(q){
        return !document.getElementById('q-' + q);
      });
      ok('kvadranttimerkit ovat defsissa', qPuuttuu.length === 0,
         qPuuttuu.length ? qPuuttuu.join(', ') : '4/4');

      // ── Areenakortti kayttaa uutta rekisteria ────────────────────────
      // Kortin oma polku on eri kuin verbIcon(): renderArenaCard hakee
      // id:n ja antaa sen _tcgSvgIconille, joka rakentaa <use>:n.
      var kortti = document.querySelector('.tcg-card--arena-size');
      ok('areenakortti renderoityi', !!kortti, kortti ? 'on' : 'puuttuu');
      if (kortti) {
        var uses = [].slice.call(kortti.querySelectorAll('use'))
          .map(function(u){ return u.getAttribute('href'); });
        var glyfeja = uses.filter(function(h){ return h && h.indexOf('#g-') === 0; });
        ok('kortilla on uuden setin glyfeja', glyfeja.length > 0, uses.join(' '));
        ok('kortilla ei ole vanhoja verb-i-* viittauksia',
           uses.every(function(h){ return !h || h.indexOf('#verb-i-') !== 0; }),
           uses.join(' '));
      }

      // ── Pakka kayttaa samaa rekisteria ───────────────────────────────
      // Aiemmin pakalla oli oma kartta (INV_VERB_ICONS) nominalisaatio-
      // avaimilla, ja puolet sen arvoista oli emojeja — sama verbi
      // saattoi nayttaa kortilla SVG:lta ja pakassa emojilta.
      renderInventory();
      var invCards = document.querySelectorAll('#inv-modal .inv-card');
      ok('pakassa on kortteja', invCards.length > 0, invCards.length + ' korttia');

      var bgs = document.querySelectorAll('#inv-modal .inv-card__verb-bg');
      var bgUses = [].slice.call(bgs).map(function(b){
        var u = b.querySelector('use');
        return u ? u.getAttribute('href') : (b.textContent || '').trim();
      });
      ok('verb-bg on SVG-glyfi, ei emoji',
         bgUses.length > 0 && bgUses.every(function(h){ return h.indexOf('#') === 0; }),
         bgUses.slice(0, 5).join(' '));

      // Emojifallback oli 📋 — jos rekisteri ei tunnista verbia, tuloksen
      // on oltava #g-tee eika merkki.
      ok('pakassa ei ole emojifallbackia',
         bgUses.every(function(h){ return h !== '\u{1F4CB}'; }),
         bgUses.slice(0, 5).join(' '));

      // Kategorianapit: sama rekisteri, mutta glyfikoossa.
      var catUses = [].slice.call(
        document.querySelectorAll('#inv-modal .inv-cat-item use')
      ).map(function(u){ return u.getAttribute('href'); });
      ok('verbikategorioiden napit kayttavat glyfeja',
         catUses.length === 0 || catUses.every(function(h){ return h.indexOf('#g-') === 0; }),
         catUses.length ? catUses.slice(0, 5).join(' ') : 'ei verbikategorioita seedissa');

      // ── Toimintonimi ilman aliasta ───────────────────────────────────
      // Kuvakaappaus pakasta paljasti taman: kayttaja voi kirjoittaa
      // verbiksi 'Odottava', ja #g-odottaa on olemassa — mutta verbName
      // katsoi vain VERB_ALIASia, joten se putosi fallbackiin.
      ok('setissa oleva nimi loytyy ilman aliasta',
         verbIcon('odottaa') === '#g-odottaa', verbIcon('odottaa'));
      ok('"Odottava" -> #g-odottaa', verbIcon('Odottava') === '#g-odottaa',
         verbIcon('Odottava'));
      ok('"Sammakko" -> #g-sammakko', verbIcon('Sammakko') === '#g-sammakko',
         verbIcon('Sammakko'));
