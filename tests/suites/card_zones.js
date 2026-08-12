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
        var plate = arena.querySelector('.tcg-card__plate');
        ok('Frankenstein: plate ei ylivuoda',
           plate.scrollHeight <= plate.clientHeight + 1,
           'scroll ' + plate.scrollHeight + ' vs client ' + plate.clientHeight);

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
      var SLOTS = ['.tcg-card__cost', '.tcg-card__frog-seal',
                   '.tcg-card__typeline', '.tcg-card__typeline .tl-quad',
                   '.tcg-card__set', '.tcg-card__art', '.tcg-card__title',
                   '.tcg-card__meta-tcg'];

      function slotReport(label, cardEl, visL, visR, visT, visB){
        SLOTS.forEach(function(sel){
          var el = cardEl.querySelector(sel);
          if (!el) { ok(label + ' ' + sel, true, 'ei elementtia'); return; }
          // display:none antaisi 0x0-rectin ja lukeutuisi peittyneeksi
          // vaikka kyse on tarkoituksellisesta piilotuksesta.
          if (getComputedStyle(el).display === 'none') {
            ok(label + ' ' + sel, true, 'display:none'); return;
          }
          var r = R(el);
          var ovW = Math.max(0, Math.min(r.r, visR) - Math.max(r.l, visL));
          var ovH = Math.max(0, Math.min(r.b, visB) - Math.max(r.t, visT));
          var pct = (r.w && r.h) ? Math.round(100 * (ovW*ovH) / (r.w*r.h)) : 0;
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
