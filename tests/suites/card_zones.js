// target: index
// seed: frank
      // Kortin RAJAUSVYÖHYKKEET — mitä tehtäväkortista oikeasti näkyy.
      //
      // Kortti renderöityy kolmessa rajauksessa, mutta se on suunniteltu vain
      // yhteen (areena). Käsiviuhkasta näkyy vasen yläkulma ja radalta oikea
      // laita — ja juuri niissä kohdissa kortilla ei ole tunnistetietoa.
      // Tämä suite lukitsee rajausgeometrian, jotta viuhkan (--fan-step) tai
      // radan (--lane-step, --lane-scale) säätö ei hiljaa hukuta indeksiä.
      //
      // Siemen on Frankenstein-kortti (seed.py): pisin verbi, 8 pomodoroa,
      // toistuva ajastus, projekti, linkki, kaksirivinen lisätieto. Jos kehys
      // kestää tämän, se kestää koko pakan.
      //
      // Slot-raportit ovat ok(true, detail) — ne dokumentoivat nykytilan
      // mittaamalla, eivät väitä siitä. Tavoiteväitteet tulevat vaiheessa 4.

      function R(el){ var r = el.getBoundingClientRect();
        return {l:Math.round(r.left), t:Math.round(r.top),
                r:Math.round(r.right), b:Math.round(r.bottom),
                w:Math.round(r.width), h:Math.round(r.height)}; }

      // ── Tila: 4 ratakorttia. Frankenstein pysyy radan ENSIMMÄISENÄ. ────
      for (var i = 0; i < 3; i++) {
        tasks.push({ id: 900+i, text: 'Sovi palaveri numero '+i, verbi: 'Sovi',
                     kuvaus: 'palaveri numero '+i, quad: (i%2? 'q1':'q2'),
                     est: 1+i, done:false, frog:false, waiting:false, pomos:0,
                     tags:[], projectId:null, schedule:null,
                     scheduled_hidden:false });
      }
      active = 1;
      turn = [2, 900, 901, 902];
      render();

      ok('viewport on tyopoytakaista', window.innerWidth >= 1400,
         window.innerWidth + 'x' + window.innerHeight);

      // ── Frankenstein ei saa ylivuotaa ─────────────────────────────────
      var arena = document.querySelector('#arena .tcg-card--arena-size');
      ok('areenakortti renderoityy', !!arena);
      var aR = arena ? R(arena) : null;

      if (arena) {
        // Platen scrollHeight EI kelpaa mittariksi. Se lukee mukaan kaksi
        // tarkoituksella yli menevaa koristetta, jotka overflow:hidden
        // leikkaa: q-taiteen full-bleed SVG:n (scale 1.06 -> 448px kun
        // plate on 414) ja kuva-alueen halo-pseudon (bottom:-8%). Mitattu
        // 2026-08-15: halo pois -> 426 pysyy, taide selittaa loput.
        // Sisaltovirta on se mika voi oikeasti ylivuotaa, joten se
        // lasketaan platen omista flex-lapsista.
        var plate = arena.querySelector('.tcg-card__plate');
        var flow = 0;
        [].slice.call(plate.children).forEach(function(ch){
          var cs = getComputedStyle(ch);
          if (cs.position === 'absolute' || cs.display === 'none') return;
          flow += ch.offsetHeight + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom);
        });
        ok('Frankenstein: plate ei ylivuoda',
           flow <= plate.clientHeight + 1,
           'sisalto ' + Math.round(flow) + ' vs client ' + plate.clientHeight);

        var body = arena.querySelector('.tcg-card__body');
        ok('Frankenstein: runko ei ylivuoda',
           body.scrollHeight <= body.clientHeight + 1,
           'scroll ' + body.scrollHeight + ' vs client ' + body.clientHeight);

        var meta = arena.querySelector('.tcg-card__meta-tcg');
        var bR = R(body), mR = meta ? R(meta) : null;
        ok('Frankenstein: meta-rivi pysyy rungon sisalla',
           !!mR && mR.b <= bR.b + 1,
           mR ? ('meta.b=' + mR.b + ' body.b=' + bR.b) : 'ei meta-rivia');

        var sched = arena.querySelector('.tcg-card__sched');
        ok('Frankenstein: ajastusrivi renderoityy', !!sched,
           sched ? sched.textContent : '-');
      }

      // ── KÄSI: lepotilan rajaus ────────────────────────────────────────
      // Pystyrajaus ei tule #hand-barista (se on koko .wrapin korkuinen)
      // vaan viewportin pohjasta ja PAKKA-palkista (z:65) sen paalla.
      var deckRail = document.getElementById('deck-rail');
      var hClipBot = deckRail ? R(deckRail).t : window.innerHeight;
      var handCards = [].slice.call(
        document.querySelectorAll('#hand-bar-cards .tcg-card--hand'));

      ok('kasi renderoi kortteja', handCards.length >= 3, String(handCards.length));

      var handVis = handCards.map(function(c, i){
        var r = R(c), nxt = handCards[i+1] ? R(handCards[i+1]) : null;
        return { w: nxt ? Math.max(0, nxt.l - r.l) : r.w,
                 h: Math.max(0, Math.min(r.b, hClipBot) - r.t),
                 r: r };
      });

      // Limitetyt kortit = kaikki paitsi viimeinen (paallimmainen).
      var lapped = handVis.slice(0, -1);
      ok('kasi: limitetyn kortin nakyva kaistale >= 55px',
         lapped.length > 0 && lapped.every(function(v){ return v.w >= 55; }),
         lapped.map(function(v){ return v.w; }).join(','));

      ok('kasi: nakyva korkeus lepotilassa 80-110px',
         handVis.every(function(v){ return v.h >= 80 && v.h <= 110; }),
         handVis.map(function(v){ return v.h; }).join(','));

      // ── RATA: syvyysrajaus ────────────────────────────────────────────
      var laneCards = [].slice.call(
        document.querySelectorAll('#queue-lane .lane-card'));

      ok('rata renderoi --lane-max korttia', laneCards.length === 4,
         String(laneCards.length));

      var laneVis = laneCards.map(function(c, i){
        var r = R(c);
        // Kortti i on edellisen TAKANA ja sen oikealla puolella; nollas on
        // areenakortin takana. Nakyva kaistale on oikea reuna.
        var prev = i === 0 ? aR : R(laneCards[i-1]);
        var px = prev ? Math.max(0, r.r - Math.max(prev.r, r.l)) : r.w;
        var inner = c.querySelector('.tcg-card');
        var scale = inner && inner.offsetWidth ? (R(inner).w / inner.offsetWidth) : 1;
        return { px: px, cardPx: Math.round(px / scale), scale: scale, r: r };
      });

      ok('rata: jokaisen kortin kaistale >= 40 kortin px',
         laneVis.length > 0 && laneVis.every(function(v){ return v.cardPx >= 40; }),
         laneVis.map(function(v){ return v.cardPx; }).join(','));

      ok('rata: kaistale kapenee tasaisesti (ei hyppya yli 8px)',
         laneVis.every(function(v, i){
           return i === 0 || (laneVis[i-1].cardPx - v.cardPx) <= 8;
         }),
         laneVis.map(function(v){ return v.cardPx; }).join(' -> '));

      // ── Slot-raportti: mitka tunnisteet jaavat rajauksen ulkopuolelle ──
      var SLOTS = ['.tcg-card__idx--tl', '.tcg-card__idx--br',
                   '.tcg-card__frog-seal',
                   '.tcg-card__typeline',
                   '.tcg-card__set', '.tcg-card__art', '.tcg-card__title',
                   '.tcg-card__meta-tcg'];

      // Kuinka monta prosenttia elementista jaa nakyvaan kaistaleeseen.
      // -1 = elementtia ei ole, -2 = display:none (tarkoituksellinen).
      function visPct(el, visL, visR, visT, visB){
        if (!el) return -1;
        if (getComputedStyle(el).display === 'none') return -2;
        var r = R(el);
        var ovW = Math.max(0, Math.min(r.r, visR) - Math.max(r.l, visL));
        var ovH = Math.max(0, Math.min(r.b, visB) - Math.max(r.t, visT));
        return (r.w && r.h) ? Math.round(100 * (ovW*ovH) / (r.w*r.h)) : 0;
      }

      function slotReport(label, cardEl, visL, visR, visT, visB){
        SLOTS.forEach(function(sel){
          var pct = visPct(cardEl.querySelector(sel), visL, visR, visT, visB);
          if (pct === -1) { ok(label + ' ' + sel, true, 'ei elementtia'); return; }
          if (pct === -2) { ok(label + ' ' + sel, true, 'display:none'); return; }
          ok(label + ' ' + sel, true,
             pct === 0 ? 'PIILOSSA' : (pct >= 99 ? 'kokonaan' : pct + '%'));
        });
      }

      if (handVis.length > 1) {
        var h0 = handVis[0];
        slotReport('KASI[0]', handCards[0],
                   h0.r.l, h0.r.l + h0.w, h0.r.t, Math.min(h0.r.b, hClipBot));
      }
      if (laneVis.length > 1 && aR) {
        var l0 = laneVis[0];
        slotReport('RATA[0]', laneCards[0],
                   Math.max(aR.r, l0.r.l), l0.r.r, l0.r.t, l0.r.b);
        var ln = laneVis[laneVis.length-1], lp = laneVis[laneVis.length-2];
        slotReport('RATA[syvin]', laneCards[laneCards.length-1],
                   Math.max(lp.r.r, ln.r.l), ln.r.r, ln.r.t, ln.r.b);
      }

      // ══ TAVOITEVAITTEET (vaihe 4 — kaksoisindeksi) ═════════════════════
      // Indeksin koko tarkoitus on olla nakyvissa rajauksessa. Nakyvyytta EI
      // voi mitata bboxeista: viuhka on kierretty (±8°) ja rata kierretty +
      // skaalattu, joten getBoundingClientRect antaa akselinsuuntaisen
      // laatikon eika elementtia — kaden TL "vuoti" 9 % pelkasta kierrosta.
      // Osumatesti (elementFromPoint) vastaa oikeaan kysymykseen: onko tama
      // merkki paallimmaisena ruudulla. Se huomioi kierron, limityksen,
      // z-indeksin ja PAKKA-palkin yhdella kertaa.
      //
      // Indeksi on pointer-events:none (kortin klikkaus ei saa osua siihen),
      // joten osumatestin ajaksi se tehdaan osuttavaksi. Vain hit-testaus
      // muuttuu, ei asettelu.
      var _hitStyle = document.createElement('style');
      _hitStyle.textContent = '.tcg-card__idx{pointer-events:auto!important}';
      document.head.appendChild(_hitStyle);

      function symbolsVisible(idxEl){
        var parts = [].slice.call(idxEl.querySelectorAll(
          '.idx__quad, .idx__cost, .idx__verb, .idx__quick'));
        var miss = [];
        parts.forEach(function(pEl){
          var r = pEl.getBoundingClientRect();
          // Keskipiste on kierrosta riippumaton: kierretyn suorakaiteen
          // bboxin keskipiste on sama piste kuin elementin oma keskipiste.
          var n = document.elementFromPoint(Math.round((r.left + r.right) / 2),
                                            Math.round((r.top + r.bottom) / 2));
          if (!(n && (n === idxEl || idxEl.contains(n)))) {
            miss.push(pEl.className.replace('idx__','') +
                      (n ? '(' + (n.className || n.tagName) + ')' : '(tyhja)'));
          }
        });
        return { n: parts.length, miss: miss };
      }

      if (handCards.length > 1) {
        var hHit = symbolsVisible(handCards[0].querySelector('.tcg-card__idx--tl'));
        ok('TAVOITE kasi: TL-indeksin merkit nakyvat limitetylla kortilla',
           hHit.miss.length === 0,
           hHit.n + ' merkkia, peitossa: ' + (hHit.miss.join(',') || '-'));
      }

      if (laneCards.length > 1) {
        var lastI = laneVis.length - 1, lCard = laneCards[lastI], lv = laneVis[lastI];
        var lHit = symbolsVisible(lCard.querySelector('.tcg-card__idx--br'));
        ok('TAVOITE rata: BR-indeksin merkit nakyvat syvimmalla kortilla',
           lHit.miss.length === 0,
           lHit.n + ' merkkia, peitossa: ' + (lHit.miss.join(',') || '-'));

        // Jalanjalki kortin OMISSA pikseleissa: kortin padding 3px +
        // turva-alue + palstan leveys. Verrataan mitattuun kaistaleeseen.
        var innerL = lCard.querySelector('.tcg-card');
        var csL = getComputedStyle(innerL);
        var kL  = parseFloat(csL.getPropertyValue('--idx-k')) || 1;
        var foot = 3 + (parseFloat(csL.getPropertyValue('--idx-gut')) || 0) * kL
                     + (parseFloat(csL.getPropertyValue('--idx-w'))   || 0) * kL;
        ok('BR-jalanjalki kortin px', true,
           foot.toFixed(1) + ' vs kaistale ' + lv.cardPx);

        // Glyfin viiva ruudulla: stroke-width 1.75 / viewBox 24. Alle 1px on
        // tasmalleen vanhojen verb-i-ikonien vika (stroke .3 → 0,14px).
        var vSvg = lCard.querySelector('.tcg-card__idx--br .idx__verb svg');
        var vw = vSvg ? vSvg.getBoundingClientRect().width : 0;
        var stroke = vw * (1.75 / 24);
        ok('TAVOITE rata: verbiglyfin viiva >= 1px syvimmalla kortilla',
           stroke >= 1, stroke.toFixed(2) + 'px (glyfi ' + vw.toFixed(1) + 'px)');
      }

      _hitStyle.remove();

      // ══ TAVOITEVAITTEET (vaihe 4b — radiaalirypas) ═════════════════════
      if (arena) {
        var rad = arena.querySelector('.tcg-card__radial');
        ok('TAVOITE rypas: renderoityy areenakortille', !!rad);

        ok('TAVOITE rypas: vanhat nappirivit poissa',
           !arena.querySelector('.tcg-card__stats') &&
           !arena.querySelector('.tcg-card__actions-tcg'));

        if (rad) {
          // Avataan luokalla: headlessissa ei ole hiirta, joten :hover ei
          // laukea. is-open on sama tila jota kosketuslaite kayttaa.
          // Satelliittien sijainti tulee `translate`-propertysta, jota
          // animoidaan 300ms — ilman transition-katkaisua mittaus osuu
          // valitilaan ja kaikki napit ovat viela keskipisteessa.
          var _noAnim = document.createElement('style');
          _noAnim.textContent = '.rad{transition:none!important}';
          document.head.appendChild(_noAnim);
          rad.classList.add('is-open');
          void rad.offsetWidth;   // pakota uudelleenlaskenta
          var btns = [].slice.call(rad.querySelectorAll('.rad'));
          ok('TAVOITE rypas: 8 nappia (keskus + 7 satelliittia)',
             btns.length === 8, btns.length + ' nappia');

          var aRect = R(arena);
          var outside = btns.filter(function(b){
            var r = R(b);
            return r.l < aRect.l || r.r > aRect.r || r.t < aRect.t || r.b > aRect.b;
          });
          ok('TAVOITE rypas: yksikaan nappi ei mene kortin ulkopuolelle',
             outside.length === 0, outside.length + ' ulkona');

          // Tormays: kahden napin keskipiste-etaisyys vs. sateiden summa.
          var cs = btns.map(function(b){ var r = R(b);
            return { x:(r.l+r.r)/2, y:(r.t+r.b)/2, rad:r.w/2,
                     cls:(b.className.match(/rad--[a-z]+/)||['?'])[0] }; });
          var hits = [];
          for (var a2 = 0; a2 < cs.length; a2++) {
            for (var b2 = a2+1; b2 < cs.length; b2++) {
              var dx = cs[a2].x - cs[b2].x, dy = cs[a2].y - cs[b2].y;
              var d = Math.sqrt(dx*dx + dy*dy);
              if (d < cs[a2].rad + cs[b2].rad - 1) {
                hits.push(cs[a2].cls + '/' + cs[b2].cls + ' ' + Math.round(d));
              }
            }
          }
          ok('TAVOITE rypas: napit eivat tormaa auki-tilassa',
             hits.length === 0, hits.join(', ') || 'ei tormayksia');

          // Osuma-alue on koko rypaan paalla: ilman sita osoitin putoaa
          // nappien valiseen kuolleeseen tilaan ja rypas romahtaa —
          // silmukka, jonka mockup jo kerran tuotti.
          var hitEl = rad.querySelector('.rad-hit');
          var hR = hitEl ? R(hitEl) : null;
          var worst = 0, worstCls = '-';
          cs.forEach(function(c){
            var cx = hR ? (hR.l+hR.r)/2 : 0, cy = hR ? (hR.t+hR.b)/2 : 0;
            var reach = Math.sqrt((c.x-cx)*(c.x-cx) + (c.y-cy)*(c.y-cy)) + c.rad;
            if (reach > worst) { worst = reach; worstCls = c.cls; }
          });
          ok('TAVOITE rypas: osuma-alue kattaa uloimman napin',
             hR && (hR.w/2) >= worst, hR ?
             ('sade ' + Math.round(hR.w/2) + ' vs ' + worstCls + ' ' + Math.round(worst)) : 'ei osuma-aluetta');

          rad.classList.remove('is-open');
          _noAnim.remove();
        }

        ok('TAVOITE areena: BR-indeksi piilossa (nurkka on toimintojen)',
           getComputedStyle(arena.querySelector('.tcg-card__idx--br')).display === 'none');

        // Frankenstein on est 8 → 8 segmenttia. Vanha mkCostPips romautti yli
        // neljan arvot muotoon "1 pallo + ×N"; mittarissa arvo on pituus.
        var segs = arena.querySelectorAll('.tcg-card__idx--tl .idx__cost .seg');
        ok('TAVOITE mittari: est 8 = 8 segmenttia (ei ×N-romautusta)',
           segs.length === 8, segs.length + ' segmenttia');
      }
