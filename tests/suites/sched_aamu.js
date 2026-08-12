// target: aamu
      // Aamusuunnittelu ja ajastetut tehtävät.
      //
      // Kaksi väitettä:
      //
      // 1. Velho vapauttaa erääntyneet itse. Se aukeaa PWA-pikakuvakkeesta
      //    ilman pääsovellusta (manifest.json), joten aamuksi ajastettu
      //    tehtävä olisi muuten näkymätön juuri aamusuunnittelussa.
      //
      // 2. Tänään ilmestyvä ajastettu kuuluu tähän päivään ja on
      //    suunniteltavissa; myöhemmälle päivälle ajastettu ei.

      ok('jaettu sched-lohko on ladattu',
         typeof localDateStr === 'function' &&
         typeof scheduleDue === 'function' &&
         typeof releaseDueSchedules === 'function' &&
         typeof schedLaterThanToday === 'function',
         [typeof localDateStr, typeof scheduleDue,
          typeof releaseDueSchedules, typeof schedLaterThanToday].join(','));

      var KEY = 'eis_v5_work';
      var nyt = new Date();
      var eilen = new Date(); eilen.setDate(eilen.getDate() - 1);
      var huomenna = new Date(); huomenna.setDate(huomenna.getDate() + 1);

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

      // ── 1. Myöhästynyt vapautuu velhon omassa latauksessa ─────────────
      lisaa(pohja(300, 'Tee syksyn starttivuorot', {
        schedule:{ type:'once', date: localDateStr(eilen), time:'08:00' },
        scheduled_hidden: true }));

      loadData();

      ok('myohastynyt vapautuu velhon latauksessa',
         allTasks.filter(function(t){ return t.id === 300; }).length === 1,
         allTasks.map(function(t){ return t.id; }).join(','));

      ok('vapautus tallentuu localStorageen (ei jaa vain muistiin)',
         tallennettu(300) && tallennettu(300).scheduled_hidden === false,
         tallennettu(300) ? String(tallennettu(300).scheduled_hidden) : 'kadonnut');

      ok('kertaajastus merkitaan laukaistuksi',
         tallennettu(300) && tallennettu(300).schedule.triggered === true,
         tallennettu(300) ? JSON.stringify(tallennettu(300).schedule) : '');

      // ── 2. Tänään myöhemmin ilmestyvä on suunniteltavissa ─────────────
      lisaa(pohja(301, 'Tee iltapaivan palaveri', {
        schedule:{ type:'once', date: localDateStr(nyt), time:'23:59' },
        scheduled_hidden: true }));
      loadData();

      ok('tanaan myohemmin ilmestyva on velhossa mukana',
         allTasks.filter(function(t){ return t.id === 301; }).length === 1,
         allTasks.map(function(t){ return t.id; }).join(','));

      ok('se pysyy piilotettuna kunnes aika tulee',
         tallennettu(301) && tallennettu(301).scheduled_hidden === true,
         tallennettu(301) ? String(tallennettu(301).scheduled_hidden) : '');

      // ── 3. Myöhemmälle päivälle ajastettu ei kuulu tähän aamuun ───────
      lisaa(pohja(302, 'Tee lokakuun raportti', {
        schedule:{ type:'once', date:'2026-10-01', time:'09:00' },
        scheduled_hidden: true }));
      lisaa(pohja(303, 'Tee huomisen juttu', {
        schedule:{ type:'once', date: localDateStr(huomenna), time:'08:00' },
        scheduled_hidden: true }));
      loadData();

      ok('lokakuun tehtava ei ole taman aamun velhossa',
         allTasks.every(function(t){ return t.id !== 302; }),
         allTasks.map(function(t){ return t.id; }).join(','));
      ok('huomiselle ajastettu ei ole taman aamun velhossa',
         allTasks.every(function(t){ return t.id !== 303; }),
         allTasks.map(function(t){ return t.id; }).join(','));

      // Toisto joka ei osu tälle viikonpäivälle
      var eiTanaan = [0,1,2,3,4,5,6].filter(function(d){ return d !== nyt.getDay(); }).slice(0,2);
      lisaa(pohja(304, 'Tee toisen paivan rutiini', {
        schedule:{ type:'repeat', days: eiTanaan, time:'08:00' },
        scheduled_hidden: true }));
      loadData();
      ok('toisen viikonpaivan toisto ei ole velhossa',
         allTasks.every(function(t){ return t.id !== 304; }),
         'paivat ' + eiTanaan.join(',') + ' | tanaan ' + nyt.getDay());

      // ── 4. Ajastus näkyy kortissa ─────────────────────────────────────
      ok('schedLine on olemassa', typeof schedLine === 'function', typeof schedLine);
      ok('schedChip on olemassa', typeof schedChip === 'function', typeof schedChip);

      var t301 = allTasks.find(function(t){ return t.id === 301; });
      ok('schedLine tuottaa ajastusrivin',
         schedLine(t301).indexOf('card-sched') > 0 && schedLine(t301).indexOf('23:59') > 0,
         schedLine(t301));
      ok('schedLine on tyhja ajastamattomalle',
         schedLine(allTasks.find(function(t){ return t.id === 1; })) === '',
         '"' + schedLine(allTasks.find(function(t){ return t.id === 1; })) + '"');
      ok('schedChip nayttaa kellonajan',
         schedChip(t301).indexOf('23:59') > 0,
         schedChip(t301));

      // Q1-kortti piirtää rivin oikeasti.
      q1Tasks = [t301];
      q1Index = 0;
      renderQ1();
      var q1Sched = document.querySelector('#q1Area .card-sched');
      ok('Q1-kortti piirtaa ajastusrivin',
         !!q1Sched && q1Sched.textContent.indexOf('23:59') > 0,
         q1Sched ? q1Sched.textContent : 'rivia ei ole');
