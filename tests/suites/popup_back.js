// target: swipe
      // ===== Paluu pääsovellukseen: window.close() ei riitä =====
      // Selain sulkee vain skriptin itse avaaman ikkunan. Mobiilissa (?back=1)
      // ja suoraan avattuna close() on no-op → nappi ei saa jäädä siihen.
      var db=document.getElementById('doneBackBtn');
      ok('PB nappi on DOM:issa', !!db);
      ok('PB goBackToApp on olemassa', typeof goBackToApp==='function');
      var oc=db?(db.getAttribute('onclick')||''):'';
      ok('PB nappi kutsuu goBackToApp:ia', oc.indexOf('goBackToApp')>=0, oc);
      ok('PB nappi ei kutsu paljasta window.close():a', oc.indexOf('window.close')<0, oc);

      // Testisivulla ei ole openeria → sama tilanne kuin suoraan avattuna
      ok('PB ilman openeria nappi ei lupaa sulkemista',
         db && db.textContent.indexOf('Sulje')<0, db?db.textContent:'-');
      var hb=document.getElementById('hdrBack');
      ok('PB yläpalkin nappi = ← Takaisin', hb && hb.textContent.indexOf('Takaisin')>=0,
         hb?hb.textContent:'-');

      // ── close() kutsutaan (popup-tapaus) ──
      startSwipe(0); showDone();
      var realClose=window.close, closed=0;
      window.close=function(){ closed++; };
      db.click();
      clearTimeout(_backTimer);   // estä testiajon oma navigointi
      ok('PB klikkaus yrittää sulkea ikkunan', closed===1, 'kutsuja '+closed);

      // ── opener fokusoidaan ENNEN sulkemista ──
      var order=[], focused=0, openerOk=true;
      try{
        window.opener={ closed:false, focus:function(){ focused++; order.push('focus'); } };
      }catch(e){ openerOk=false; }
      window.close=function(){ closed++; order.push('close'); };
      if(openerOk){
        goBackToApp();
        clearTimeout(_backTimer);
        ok('PB opener fokusoidaan', focused===1, 'kutsuja '+focused);
        ok('PB fokus ennen sulkemista', order.join(',')==='focus,close', order.join(','));
      }else{
        ok('PB opener-stub asetettavissa', false, 'window.opener ei ole kirjoitettavissa');
      }
      try{ window.opener=null; }catch(e){}
      window.close=realClose;

      // ── varmistusajastin on olemassa ja peruttavissa ──
      ok('PB varmistusajastin asetetaan', typeof _backTimer!=='undefined');

      // ── Jaakon havainto: close() on no-op (mobiili / suoraan avattu).
      //    Silloin varmistuksen ON vietävä takaisin historian kautta.
      //    Asynkroninen: fallback laukeaa 150 ms:n kuluttua.
      var backs=0, histOk=true;
      try{ history.back=function(){ backs++; }; }catch(e){ histOk=false; }
      window.close=function(){ /* no-op, kuten samassa välilehdessä */ };
      goBackToApp();
      setTimeout(function(){
        window.close=realClose;
        if(histOk){
          ok('PB close() no-op → paluu historian kautta', backs===1,
             'history.back-kutsuja '+backs+', history.length='+history.length);
        }else{
          ok('PB history.back stubattavissa', false, 'ei kirjoitettavissa');
        }
        ok('PB pagehide peruu ajastimen',
           (function(){
             var fired=0;
             history.back=function(){ fired++; };
             goBackToApp();
             window.dispatchEvent(new Event('pagehide'));
             return fired===0;
           })(), 'ajastin ei saa laueta sivun poistuessa');
        document.documentElement.setAttribute('data-probe','PROBE'+JSON.stringify(RESULTS)+'ENDPROBE');
      }, 500);
      return;
