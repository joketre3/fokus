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

      // ── D: ⏳ ei enää tarkoita kahta asiaa ────────────────────────────
      // Pakkakortin ⏳N oli arvioitu pomodoro-määrä (t.est), mutta ⏳
      // merkitsee Odottaa-tilaa joka muualla. Sama symboli kahdessa
      // merkityksessä luki väärin.
      invSetCat('all', null);
      renderInventory();
      var invHtml = document.getElementById('inv-grid').innerHTML;
      ok('pakkakortissa ei ole tiimalasia',
         invHtml.indexOf('⏳') < 0,
         invHtml.indexOf('⏳') < 0 ? '' : 'tiimalasi loytyi yha');
      ok('arvio kirjoitetaan auki (pom)',
         invHtml.indexOf(' pom') >= 0,
         '');

      // ── B: fmtSchedule ────────────────────────────────────────────────
      ok('fmtSchedule on olemassa',
         typeof window.fmtSchedule === 'function',
         typeof window.fmtSchedule);

      var kertaTask = { schedule:{type:'once',date:'2026-08-12',time:'08:00'},
                        scheduled_hidden:false };
      ok('fmtSchedule once: suomalainen paivamaara',
         window.fmtSchedule(kertaTask) === '📅 Ajastettu 12.8.2026 klo 08:00',
         window.fmtSchedule(kertaTask));

      var laukaistu = { schedule:{type:'once',date:'2026-08-11',time:'08:00',triggered:true},
                        scheduled_hidden:false };
      ok('fmtSchedule once: jo laukaistu kertoo menneesta',
         window.fmtSchedule(laukaistu).indexOf('Ilmestyi') >= 0,
         window.fmtSchedule(laukaistu));

      var toisto = { schedule:{type:'repeat',days:[1,3],time:'08:00'} };
      ok('fmtSchedule repeat: viikonpaivat lyhenteina',
         window.fmtSchedule(toisto) === '🔁 Ma, Ke klo 08:00',
         window.fmtSchedule(toisto));

      // Pakkakortin rivi on 8px ja ~125px levea. "Ma, Ti, Ke, To, Pe" ei
      // mahdu sinne eika kerro enempaa kuin "arkisin".
      ok('fmtSchedDays: ma-pe on arkisin',
         window.fmtSchedDays([1,2,3,4,5]) === 'arkisin',
         window.fmtSchedDays([1,2,3,4,5]));
      ok('fmtSchedDays: koko viikko on paivittain',
         window.fmtSchedDays([0,1,2,3,4,5,6]) === 'päivittäin',
         window.fmtSchedDays([0,1,2,3,4,5,6]));
      ok('fmtSchedDays: la+su on viikonloppuisin',
         window.fmtSchedDays([0,6]) === 'viikonloppuisin',
         window.fmtSchedDays([0,6]));
      ok('fmtSchedDays: sunnuntai on viikon viimeinen',
         window.fmtSchedDays([0,1]) === 'Ma, Su',
         window.fmtSchedDays([0,1]));

      // Lyhyt muoto jattaa "Ajastettu"-etuliitteen pois, mutta ei
      // myohassa-tietoa — se on juuri se mita kortista pitaa nahda.
      ok('fmtSchedule short: ei Ajastettu-etuliitetta',
         window.fmtSchedule(kertaTask, true) === '📅 12.8.2026 klo 08:00',
         window.fmtSchedule(kertaTask, true));

      var myohassaT = { schedule:{type:'once',date:eilenStr,time:'08:00'},
                        scheduled_hidden:true };
      ok('fmtSchedule merkitsee myohassa olevan',
         window.fmtSchedule(myohassaT).indexOf('myöhässä') >= 0,
         window.fmtSchedule(myohassaT));

      ok('fmtSchedule ilman ajastusta on tyhja',
         window.fmtSchedule({ schedule:null }) === '',
         '"' + window.fmtSchedule({ schedule:null }) + '"');

      // Ajastusrivi piirtyy korttiin myos ilman kayttajan lisatietoja.
      var kortti = renderArenaCard(t950, null, false, 'hand');
      var schedEl = kortti.querySelector('.tcg-card__sched');
      ok('ajastusrivi piirtyy korttiin ilman omaa lisatietotekstia',
         !!schedEl && schedEl.textContent.indexOf('📅') === 0,
         schedEl ? schedEl.textContent : 'rivia ei ole');

      // Kayttajan oma teksti tulee ajastusrivin jalkeen, ei sen tilalle.
      t950.lisatiedot = 'Muista soittaa esihenkilolle';
      var kortti2 = renderArenaCard(t950, null, false, 'hand');
      var notes2 = kortti2.querySelector('.tcg-card__notes-tcg');
      ok('oma teksti sailyy ajastusrivin rinnalla',
         !!notes2 && notes2.textContent.indexOf('📅') === 0
           && notes2.textContent.indexOf('Muista soittaa') > 0,
         notes2 ? notes2.textContent : 'lohkoa ei ole');

      ok('ajastustekstia ei kirjoiteta t.lisatiedotiin',
         t950.lisatiedot === 'Muista soittaa esihenkilolle',
         t950.lisatiedot);

      // ── C: Ajastetut-kategoria pakassa ────────────────────────────────
      tasks.push({ id: 952, text: 'Tee lokakuun raportti', verbi: 'Tee',
                   kuvaus: 'lokakuun raportti', quad: 'q2', est: 2,
                   done: false, frog: false, waiting: false, pomos: 0,
                   tags: [], projectId: null,
                   schedule: { type:'once', date:'2026-10-01', time:'09:00' },
                   scheduled_hidden: true });

      invSetCat('scheduled', null);
      var vainAjastetut = getInventoryFilteredTasks();
      ok('Ajastetut-kategoria suodattaa piilotetut ajastetut',
         vainAjastetut.length === 1 && vainAjastetut[0].id === 952,
         vainAjastetut.map(function(t){return t.id;}).join(','));

      buildInvSidebar();
      var sbText = document.getElementById('inv-sidebar').textContent;
      ok('Ajastetut-nappi on sivupalkissa',
         sbText.indexOf('Ajastetut') >= 0,
         '');

      renderInventory();
      ok('ajastusrivi nakyy pakkakortissa',
         document.querySelectorAll('.inv-card__sched').length === 1,
         document.querySelectorAll('.inv-card__sched').length + ' rivia');

      // Asettelu: rivi ei saa mennä tähtinapin alle eikä leikkautua.
      // Ensimmäinen versio teki molemmat — "— myöhässä" jäi napin taakse.
      var invCard = document.querySelector('.inv-card');
      var sEl = invCard.querySelector('.inv-card__sched');
      var starEl = invCard.querySelector('.inv-card__star-btn');
      var rS = sEl.getBoundingClientRect(),
          rB = starEl.getBoundingClientRect(),
          rC = invCard.getBoundingClientRect();
      ok('ajastusrivi ei mene tahtinapin alle',
         rS.right <= rB.left || rS.bottom <= rB.top,
         'rivi ' + Math.round(rS.right) + ', tahti alkaa ' + Math.round(rB.left));
      ok('ajastusrivi nakyy kokonaan (ei leikkausta)',
         sEl.scrollHeight <= sEl.clientHeight + 1,
         sEl.scrollHeight + '/' + sEl.clientHeight + ' "' + sEl.textContent + '"');
      ok('ajastusrivi pysyy kortin sisalla',
         rS.bottom <= rC.bottom + 1,
         Math.round(rS.bottom) + ' vs ' + Math.round(rC.bottom));

      // ── E: ajastuksen poisto muokkausmodaalista ───────────────────────
      ok('clearTaskSchedule on olemassa',
         typeof window.clearTaskSchedule === 'function',
         typeof window.clearTaskSchedule);

      openEditModal(952);
      var row = document.getElementById('edit-sched-row');
      ok('modaali nayttaa ajastuksen',
         !!row && row.style.display === 'flex'
           && document.getElementById('edit-sched-text').textContent.indexOf('1.10.2026') >= 0,
         row ? document.getElementById('edit-sched-text').textContent : 'rivia ei ole');

      clearTaskSchedule();
      var t952 = tasks.find(function(t){ return t.id === 952; });
      ok('poisto tyhjentaa ajastuksen',
         t952 && t952.schedule === null,
         t952 ? String(t952.schedule) : 'kortti kadonnut');
      ok('poisto vapauttaa kortin piilosta',
         t952 && t952.scheduled_hidden === false,
         t952 ? String(t952.scheduled_hidden) : '');

      closeEditModal();
      invSetCat('all', null);

      }
