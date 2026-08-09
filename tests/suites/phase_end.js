// target: index
// Vaiheen vaihto ei saa katketa ilmoituskerroksen virheeseen.
//
// Löytyi manuaalitestissä M3: `new Notification()` heittää TypeErrorin mm.
// Chrome for Androidilla vaikka permission on 'granted'. Heitto jätti
// onPhaseEnd():n kesken ENNEN startTmr():ää → ajastin jäi seisomaan näyttöön
// 00:01, tauko käynnistyi vasta ▶-painalluksesta.
//
// Headless ei löydä tätä itsestään: Notification.permission on siellä
// 'denied', joten haara ei aja koskaan. Siksi konstruktori pakotetaan
// heittämään — juuri niin kuin se oikealla laitteella tekee.
      window.Notification = function(){
        throw new TypeError("Failed to construct 'Notification': Illegal constructor.");
      };
      Object.defineProperty(window.Notification, 'permission', {
        get: function(){ return 'granted'; }, configurable: true
      });

      var naytto = function(){ return (document.getElementById('ttime')||{}).textContent; };
      var steps = [];

      steps.push(function(){
        toggleTimer();
        // pakota työjakso loppumaan 3 s päästä oikean tick():n kautta
        startTleft = 3; tleft = 3; startAt = Date.now();
      });
      steps.push(function(){});                     // +1.5 s — kesken
      steps.push(function(){});                     // +3.0 s
      steps.push(function(){});                     // +4.5 s
      steps.push(function(){                        // +6.0 s — jakson piti loppua
        ok('työ→tauko: phase vaihtui', phase==='sbrk'||phase==='lbrk', 'phase='+phase);
        ok('työ→tauko: AJASTIN KÄY (ei jää seisomaan)', !!tmr && !!startAt,
           'tmr='+(!!tmr)+' startAt='+(!!startAt));
        ok('työ→tauko: näyttö ei jumissa 00:01:ssä', naytto()!=='00:01', 'näyttö='+naytto());
        ok('työ→tauko: tleft on tauon pituus', tleft>1, 'tleft='+tleft);
        // tauko loppumaan 3 s päästä
        startTleft = 3; tleft = 3; startAt = Date.now();
      });
      steps.push(function(){});                     // +7.5 s
      steps.push(function(){});                     // +9.0 s
      steps.push(function(){});                     // +10.5 s
      steps.push(function(){                        // +12.0 s — tauko ohi
        ok('tauko→työ: phase vaihtui', phase==='work', 'phase='+phase);
        ok('tauko→työ: ajastin pysähtyi (tarkoituksella)', !tmr, 'tmr='+(!!tmr));
        ok('tauko→työ: NÄYTTÖ PÄIVITTYI työjakson pituuteen', naytto()!=='00:01',
           'näyttö='+naytto());
        ok('tauko→työ: tleft = WORK', tleft===WORK, 'tleft='+tleft+' WORK='+WORK);
        // ▶ aloittaa uuden pomodoron, ei jumita tauolle
        toggleTimer();
        ok('▶ tauon jälkeen käynnistää työjakson', phase==='work' && !!tmr,
           'phase='+phase+' tmr='+(!!tmr));
        stopAll();
      });

      (function next(i){
        if(i>=steps.length){
          document.documentElement.setAttribute('data-probe','PROBE'+JSON.stringify(RESULTS)+'ENDPROBE');
          return;
        }
        try{ steps[i](); }catch(e){ ok('step'+i+' threw', false, e && (e.stack||e.message||e)); }
        setTimeout(function(){ next(i+1); }, 1500);
      })(0);
      return;
