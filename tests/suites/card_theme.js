// target: index
// theme: aurinko
      // Kortin plate on tumma KAIKISSA teemoissa (aurinko asettaa tumman
      // --plate-topin tarkoituksella), joten sen sisalto ei saa periytya
      // teeman --inkista. Aurinkoteemassa se tarkoittaa mustaa mustalla.
      //
      // Loytyi kayttajalta, ei testeista: kuva-alueen glyfi peri bodyn
      // varin ja oli kontrastilla 1.06:1 kaytannossa nakymaton. Kolmas
      // samaa vikaluokkaa (The Theme Scope Rule) — siksi pysyva mittari.
      //
      // HUOM: teema tulee `// theme:` -rivilta, joka kylvaa SEKA
      // data-theme-attribuutin ETTA fap_theme:n. Pelkka attribuutti ei
      // riita, koska initTheme ylikirjoittaa sen localStoragen arvolla —
      // silloin suite ajaisi hiljaa oletusteemaa ja olisi aina vihrea.

      ok('teema on oikeasti aurinko',
         document.documentElement.getAttribute('data-theme') === 'aurinko',
         'data-theme=' + document.documentElement.getAttribute('data-theme'));
      // Kontrolli: jos tama on valkoinen, teema ei vaihtunut ja loput
      // vaitteet mittaavat vaaraa teemaa.
      var bodyInk = getComputedStyle(document.body).color;
      ok('bodyn muste on vaalean teeman muste', bodyInk.indexOf('255, 255, 255') < 0, bodyInk);

      function rgb(s){ var m = s.match(/[\d.]+/g).map(Number); return [m[0], m[1], m[2]]; }
      function lum(c){
        var a = c.map(function(v){ v /= 255; return v <= .03928 ? v/12.92 : Math.pow((v+.055)/1.055, 2.4); });
        return .2126*a[0] + .7152*a[1] + .0722*a[2];
      }
      function kontrasti(a, b){
        var l1 = lum(a), l2 = lum(b);
        if (l2 > l1) { var t = l1; l1 = l2; l2 = t; }
        return (l1 + .05) / (l2 + .05);
      }
      // Plate-tausta on gradientti, joten sita ei voi lukea
      // backgroundColorista — luetaan kortin oma --plate-bot ja
      // resolvoidaan se probe-elementilla.
      var kortti = document.querySelector('.tcg-card--arena-size');
      ok('areenakortti renderoityi', !!kortti, kortti ? 'on' : 'puuttuu');
      var pohja = null;
      if (kortti) {
        var pb = getComputedStyle(kortti).getPropertyValue('--plate-bot').trim();
        var probe = document.createElement('div');
        probe.style.color = pb;
        document.body.appendChild(probe);
        pohja = rgb(getComputedStyle(probe).color);
        probe.remove();
        ok('plate on tumma myos aurinkoteemassa', lum(pohja) < 0.15,
           pb + ' luminanssi ' + lum(pohja).toFixed(3));
      }

      // Kortin sisalto plate-taustaa vasten. Kynnys 4.5 = WCAG AA
      // leipatekstille; ikonit ovat isoja, mutta sama raja pitaa
      // mittarin yksiselitteisena.
      var KOHTEET = [
        ['kuva-alueen glyfi', '.tcg-card__art svg', 4.5],
        ['otsikko',           '.tcg-card__title',   4.5],
        ['typelinen glyfi',   '.tcg-card__typeline svg', 3.0],
        ['indeksin verbi',    '.tcg-card__idx--tl .idx__verb', 3.0]
      ];
      if (kortti && pohja) {
        KOHTEET.forEach(function(k){
          var el = kortti.querySelector(k[1]);
          if (!el) { ok(k[0] + ' loytyy kortilta', false, k[1] + ' puuttuu'); return; }
          var c = rgb(getComputedStyle(el).color);
          var kk = kontrasti(c, pohja);
          ok(k[0] + ' erottuu platesta (>= ' + k[2] + ':1)', kk >= k[2],
             kk.toFixed(2) + ':1  rgb(' + c.join(',') + ')');
        });
      }

      // Kvadranttimerkki kantaa varinsa --qc:sta, joka on kvadranttivari —
      // se saa olla varillinen, mutta ei sulautua plateen.
      if (kortti && pohja) {
        var q = kortti.querySelector('.tcg-card__idx--tl .idx__quad');
        if (q) {
          var qk = kontrasti(rgb(getComputedStyle(q).color), pohja);
          ok('kvadranttimerkki erottuu platesta (>= 3:1)', qk >= 3.0, qk.toFixed(2) + ':1');
        }
      }
