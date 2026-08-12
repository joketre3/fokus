// target: swipe
      // Selaus (pakka) ja ajastetut tehtävät.
      //
      // Pakan sopimus on näyttää kortti ja merkitä tila, ei piilottaa —
      // sama periaate kuin odottavilla korteilla (swipe.html:n oma
      // kommentti refresh():ssä). Ajastettu on sama tapaus.
      //
      // Lisäksi selaus vapauttaa erääntyneet itse: se aukeaa
      // PWA-pikakuvakkeesta ilman pääsovellusta, jolloin mikään muu ei
      // ajaisi tarkistusta.

      ok('jaettu sched-lohko on ladattu',
         typeof localDateStr === 'function' &&
         typeof scheduleDue === 'function' &&
         typeof releaseDueSchedules === 'function' &&
         typeof fmtSchedule === 'function',
         [typeof localDateStr, typeof scheduleDue,
          typeof releaseDueSchedules, typeof fmtSchedule].join(','));

      var KEY = 'eis_v5_work';
      var eilen = new Date(); eilen.setDate(eilen.getDate() - 1);

      function lisaa(t){
        var d = JSON.parse(localStorage.getItem(KEY));
        d.tasks.push(t);
        localStorage.setItem(KEY, JSON.stringify(d));
      }
      function tallennettu(id){
        var d = JSON.parse(localStorage.getItem(KEY));
        return d.tasks.find(function(t){ return t.id === id; });
      }
      function pohja(id, text, extra){
        var t = { id:id, text:text, verbi:'Tee', kuvaus:text, quad:'q1',
                  important:true, urgent:true, est:1, done:false, frog:false,
                  waiting:false, pomos:0, tags:[], lisatiedot:null, linkki:null,
                  projectId:null, schedule:null, scheduled_hidden:false };
        for(var k in extra) t[k] = extra[k];
        return t;
      }

      // ── Myöhästynyt vapautuu selauksen omassa latauksessa ─────────────
      lisaa(pohja(400, 'Tee syksyn starttivuorot', {
        schedule:{ type:'once', date: localDateStr(eilen), time:'08:00' },
        scheduled_hidden: true }));

      startSwipe(0);   // ei aikabudjettia -> koko pakka

      ok('myohastynyt vapautuu selauksen latauksessa',
         tallennettu(400) && tallennettu(400).scheduled_hidden === false,
         tallennettu(400) ? String(tallennettu(400).scheduled_hidden) : 'kadonnut');

      ok('vapautunut kortti on pakassa',
         tasks.filter(function(t){ return t.id === 400; }).length === 1,
         tasks.map(function(t){ return t.id; }).join(','));

      // ── Yhä piilotettu ajastettu näkyy pakassa tilamerkinnällä ────────
      lisaa(pohja(401, 'Tee lokakuun raportti', {
        schedule:{ type:'once', date:'2026-10-01', time:'09:00' },
        scheduled_hidden: true }));

      startSwipe(0);

      ok('ajastettu kortti nakyy pakassa vaikka on piilotettu',
         tasks.filter(function(t){ return t.id === 401; }).length === 1,
         tasks.map(function(t){ return t.id; }).join(','));

      ok('se pysyy piilotettuna muualta',
         tallennettu(401) && tallennettu(401).scheduled_hidden === true,
         tallennettu(401) ? String(tallennettu(401).scheduled_hidden) : '');

      // ── Kortti kertoo tilan ja ajan ───────────────────────────────────
      var t401 = tasks.find(function(t){ return t.id === 401; });
      var kortti = buildCard(t401, 0);

      var siru = kortti.querySelector('.chip.sched');
      ok('kortissa on ajastettu-siru',
         !!siru && siru.textContent.indexOf('Ajastettu') >= 0,
         siru ? siru.textContent : 'sirua ei ole');

      var rivi = kortti.querySelector('.card-sched');
      ok('kortissa on ajastusrivi kellonajan kanssa',
         !!rivi && rivi.textContent.indexOf('1.10.2026') >= 0
           && rivi.textContent.indexOf('09:00') >= 0,
         rivi ? rivi.textContent : 'rivia ei ole');

      // Ajastamaton kortti ei saa kumpaakaan.
      var tPlain = tasks.find(function(t){ return t.id === 1; });
      var kortti2 = buildCard(tPlain, 0);
      ok('ajastamattomassa kortissa ei ole ajastusmerkintoja',
         !kortti2.querySelector('.chip.sched') && !kortti2.querySelector('.card-sched'),
         '');

      // Vapautunut kortti nayttaa yha milloin se ilmestyi, mutta ilman sirua.
      var t400 = tasks.find(function(t){ return t.id === 400; });
      var kortti3 = buildCard(t400, 0);
      ok('vapautuneessa kortissa ei ole enaa ajastettu-sirua',
         !kortti3.querySelector('.chip.sched'),
         '');
      ok('vapautunut kortti kertoo milloin se ilmestyi',
         !!kortti3.querySelector('.card-sched') &&
         kortti3.querySelector('.card-sched').textContent.indexOf('Ilmestyi') >= 0,
         kortti3.querySelector('.card-sched')
           ? kortti3.querySelector('.card-sched').textContent : 'rivia ei ole');
