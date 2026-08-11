// target: aamu
      // ===== Paluu pääsovellukseen: window.close() ei riitä =====
      var db=document.getElementById('doneBackBtn');
      ok('PBA näytön 5 nappi on DOM:issa', !!db);
      ok('PBA goBackToApp on olemassa', typeof goBackToApp==='function');
      var oc=db?(db.getAttribute('onclick')||''):'';
      ok('PBA nappi kutsuu goBackToApp:ia', oc.indexOf('goBackToApp')>=0, oc);
      ok('PBA nappi ei kutsu paljasta window.close():a', oc.indexOf('window.close')<0, oc);

      // Testisivulla ei ole openeria → sama tilanne kuin suoraan avattuna
      ok('PBA ilman openeria nappi ei lupaa sulkemista',
         db && db.textContent.indexOf('Sulje')<0, db?db.textContent:'-');
      var bb=document.getElementById('backBtn');
      ok('PBA ← Takaisin näkyvissä samassa välilehdessä', bb && !bb.hidden);

      // ── näytön 5 nappi yrittää sulkea ──
      var realClose=window.close, closed=0;
      window.close=function(){ closed++; };
      db.click();
      clearTimeout(_backTimer);   // estä testiajon oma navigointi
      ok('PBA klikkaus yrittää sulkea ikkunan', closed===1, 'kutsuja '+closed);

      // ── skipToEnd: tallentaa JA palaa ──
      closed=0;
      selectedFrog=null;
      var beforeTs=(JSON.parse(localStorage.getItem('eis_v5_work')||'{}')).updatedAt||0;
      skipToEnd();
      clearTimeout(_backTimer);
      var afterTs=(JSON.parse(localStorage.getItem('eis_v5_work')||'{}')).updatedAt||0;
      ok('PBA skipToEnd tallentaa', afterTs>=beforeTs, beforeTs+' -> '+afterTs);
      ok('PBA skipToEnd palaa sovellukseen', closed===1, 'close-kutsuja '+closed);

      // ── opener fokusoidaan ENNEN sulkemista ──
      var order=[], focused=0, openerOk=true;
      try{
        window.opener={ closed:false, focus:function(){ focused++; order.push('focus'); } };
      }catch(e){ openerOk=false; }
      window.close=function(){ order.push('close'); };
      if(openerOk){
        goBackToApp();
        clearTimeout(_backTimer);
        ok('PBA opener fokusoidaan', focused===1, 'kutsuja '+focused);
        ok('PBA fokus ennen sulkemista', order.join(',')==='focus,close', order.join(','));
      }else{
        ok('PBA opener-stub asetettavissa', false, 'window.opener ei ole kirjoitettavissa');
      }
      try{ window.opener=null; }catch(e){}
      window.close=realClose;
