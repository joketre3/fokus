// target: index
      // Ajastettujen tehtävien vapautus.
      //
      // Vika: checkScheduledTasks vertasi täsmäminuuttiin
      // (s.time===currentHHMM). Jos selain oli kiinni sillä minuutilla,
      // tehtävä jäi scheduled_hidden:true pysyvästi — näkyi vain pakassa,
      // tähti ei nostanut sitä käteen, eikä syytä voinut todeta mistään.
      //
      // Korjaus nostaa päätöksen puhtaaseen scheduleDue(s, now, last)
      // -predikaattiin, jota voi testata kiinteillä kellonajoilla.

      ok('scheduleDue on olemassa',
         typeof window.scheduleDue === 'function',
         typeof window.scheduleDue);

      ok('localDateStr on olemassa',
         typeof window.localDateStr === 'function',
         typeof window.localDateStr);

      if (typeof window.scheduleDue !== 'function' ||
          typeof window.localDateStr !== 'function') {
        ok('loput testit ohitettu — apufunktiot puuttuvat', false, '');
      } else {

      // ── localDateStr: paikallinen päivä, ei UTC ──────────────────────
      // toISOString() palauttaa UTC-päivän. Suomessa (UTC+3) keskiyön ja
      // klo 03:00 välillä se on eri päivä kuin kalenterissa, jolloin
      // s.date < todayStr -vertailu heittäisi vuorokauden.
      var puoliYo = new Date(2026, 7, 13, 0, 30, 0); // 13.8.2026 klo 00:30
      ok('localDateStr antaa paikallisen paivan keskiyolla',
         window.localDateStr(puoliYo) === '2026-08-13',
         window.localDateStr(puoliYo) + ' (UTC-versio antaisi 2026-08-12)');

      // ── once ──────────────────────────────────────────────────────────
      var nyt = new Date(2026, 7, 12, 12, 0, 0); // ke 12.8.2026 klo 12:00

      ok('once: eilinen ajastus laukeaa jalkikateen',
         window.scheduleDue({type:'once',date:'2026-08-11',time:'08:00'}, nyt, null),
         'selain oli kiinni eilen klo 8');

      ok('once: tanaan aiemmin laukeaa',
         window.scheduleDue({type:'once',date:'2026-08-12',time:'08:00'}, nyt, null),
         '');

      ok('once: tanaan myohemmin ei laukea',
         !window.scheduleDue({type:'once',date:'2026-08-12',time:'18:00'}, nyt, null),
         '');

      ok('once: jo laukaistu ei laukea uudelleen',
         !window.scheduleDue({type:'once',date:'2026-08-11',time:'08:00',triggered:true}, nyt, null),
         '');

      ok('once: taman minuutin ajastus laukeaa',
         window.scheduleDue({type:'once',date:'2026-08-12',time:'12:00'}, nyt, null),
         'vanha === -vertailu osui vain tahan tapaukseen');

      // ── repeat ────────────────────────────────────────────────────────
      // 12.8.2026 on keskiviikko → getDay() === 3
      ok('fixture: testipaiva on keskiviikko', nyt.getDay() === 3, String(nyt.getDay()));

      ok('repeat: tanaan aiemmin laukeaa',
         window.scheduleDue({type:'repeat',days:[3],time:'08:00'}, nyt, null),
         '');

      ok('repeat: jo tanaan laukaistu ei laukea uudelleen',
         !window.scheduleDue({type:'repeat',days:[3],time:'08:00'}, nyt, '2026-08-12'),
         '');

      ok('repeat: eilen laukaistu laukeaa taas tanaan',
         window.scheduleDue({type:'repeat',days:[3],time:'08:00'}, nyt, '2026-08-11'),
         '');

      ok('repeat: vaara viikonpaiva ei laukea',
         !window.scheduleDue({type:'repeat',days:[1,5],time:'08:00'}, nyt, null),
         'ma+pe, tanaan ke');

      ok('repeat: tanaan myohemmin ei laukea viela',
         !window.scheduleDue({type:'repeat',days:[3],time:'18:00'}, nyt, null),
         '');

      // ── Integraatio: jumissa ollut kortti vapautuu ja paatyy katteen ──
      var eilen = new Date();
      eilen.setDate(eilen.getDate() - 1);
      var eilenStr = window.localDateStr(eilen);

      tasks.push({ id: 950, text: 'Tee syksyn starttivuorot', verbi: 'Tee',
                   kuvaus: 'syksyn starttivuorot', quad: 'q1', est: 1,
                   done: false, frog: false, waiting: false, pomos: 0,
                   tags: [], projectId: null,
                   schedule: { type:'once', date: eilenStr, time: '08:00' },
                   scheduled_hidden: true });

      var inboxOf = function(){
        return tasks.filter(function(t){ return !t.done && !t.scheduled_hidden; });
      };

      ok('lahtotila: piilotettu kortti ei ole inboxissa',
         inboxOf().filter(function(t){ return t.id === 950; }).length === 0,
         '');

      checkScheduledTasks();

      var t950 = tasks.find(function(t){ return t.id === 950; });
      ok('myohastynyt kortti vapautuu checkScheduledTasksissa',
         t950 && t950.scheduled_hidden === false,
         t950 ? String(t950.scheduled_hidden) : 'kortti kadonnut');

      ok('vapautunut kortti on inboxissa',
         inboxOf().filter(function(t){ return t.id === 950; }).length === 1,
         '');

      // Vapautunut q1-kortti on kelvollinen kadessa — tahti toimii taas.
      t950.handForced = true;
      var kadessa = buildHandQueue(inboxOf()).filter(function(t){ return t.id === 950; });
      ok('tahti nostaa vapautuneen kortin katteen',
         kadessa.length === 1,
         'kasi: ' + buildHandQueue(inboxOf()).map(function(t){return t.id;}).join(','));

      // ── repeat-tilan synkkaus: t.schedLast, ei localStorage ───────────
      // sched_last_<id> jäi laitekohtaiseksi, joten toistoajastus laukesi
      // uudelleen jokaisella laitteella erikseen.
      tasks.push({ id: 951, text: 'Tee aamurutiini', verbi: 'Tee',
                   kuvaus: 'aamurutiini', quad: 'q2', est: 1,
                   done: false, frog: false, waiting: false, pomos: 0,
                   tags: [], projectId: null,
                   schedule: { type:'repeat', days:[0,1,2,3,4,5,6], time:'00:01' },
                   scheduled_hidden: true });

      checkScheduledTasks();
      var t951 = tasks.find(function(t){ return t.id === 951; });
      ok('repeat-kortti vapautuu',
         t951 && t951.scheduled_hidden === false,
         t951 ? String(t951.scheduled_hidden) : 'kortti kadonnut');

      ok('repeat-laukaisu kirjataan tehtavaan (synkkaa laitteiden valilla)',
         t951 && t951.schedLast === window.localDateStr(new Date()),
         t951 ? String(t951.schedLast) : '');

      ok('repeat-laukaisua ei kirjata localStorageen',
         localStorage.getItem('sched_last_951') === null,
         String(localStorage.getItem('sched_last_951')));

      }
