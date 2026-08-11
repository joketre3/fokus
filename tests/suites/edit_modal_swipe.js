// target: swipe
      // ===== Jaettu muokkausmodaali swipe.html:ssä =====
      // Siemen: active=1 (sammakko), turn=[2,3]; id 7 pika, id 9 odottaa, id 10 tehty
      var EM=document.getElementById('edit-modal');
      var isOpen=function(){ return EM && EM.style.display==='flex'; };
      var stored=function(){ return JSON.parse(localStorage.getItem('eis_v5_work')||'{}'); };
      var sTask=function(id){ return (stored().tasks||[]).find(function(t){return t.id===id;}); };
      var deckHas=function(id){ return tasks.some(function(t){return t.id===id;}); };

      ok('SW modaali on DOM:issa', !!EM);
      ok('SW FokusEdit rekisteröity', typeof FokusEdit==='object' && typeof FokusEdit.open==='function');
      ok('SW vanha #edit-panel poistettu', !document.getElementById('edit-panel'));

      startSwipe(0);
      ok('SW pakassa on kortteja', tasks.length>0, 'n='+tasks.length);
      ok('SW pakka ei sisällä tehtyä (10)', !deckHas(10));
      ok('SW pakka ei sisällä pikatehtävää (7)', !deckHas(7));

      // ── 1. ✎ avaa modaalin ──
      var edBtn=null;
      var btns=document.querySelectorAll('#active-card button');
      for(var i=0;i<btns.length;i++){ if(btns[i].textContent.indexOf('Muokkaa')>=0) edBtn=btns[i]; }
      ok('SW1 kortilla on ✎-nappi', !!edBtn);
      var firstId=tasks[idx].id;
      if(edBtn) edBtn.click();
      ok('SW1 modaali aukeaa', isOpen(), 'display='+(EM&&EM.style.display));
      ok('SW1 teksti ladattu', document.getElementById('edit-text').value===tasks[idx].text,
         document.getElementById('edit-text').value);
      ok('SW1 done-napin teksti', document.getElementById('edit-done-btn').textContent.indexOf('Merkitse tehdyksi')>=0,
         document.getElementById('edit-done-btn').textContent);

      // ── 2. Näppäinoikopolku ei saa laueta modaalin ollessa auki ──
      var idxBefore=idx;
      document.dispatchEvent(new KeyboardEvent('keydown',{key:'d',bubbles:true}));
      ok('SW2 d-näppäin ei swaippaa modaalin ollessa auki', idx===idxBefore, 'idx '+idxBefore+'->'+idx);

      // ── 3. Esc sulkee ──
      document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
      ok('SW3 Esc sulkee modaalin', !isOpen(), 'display='+(EM&&EM.style.display));

      // ── 4. Muokkaus tallentuu levylle ──
      FokusEdit.open(firstId);
      document.getElementById('edit-text').value='Soita uusi nimi';
      document.getElementById('edit-esl').value=3;
      document.getElementById('edit-save-btn').click();
      ok('SW4 teksti tallentui localStorageen', sTask(firstId).text==='Soita uusi nimi', sTask(firstId).text);
      ok('SW4 verbi synkassa', sTask(firstId).verbi==='Soita', sTask(firstId).verbi);
      ok('SW4 kuvaus synkassa', sTask(firstId).kuvaus==='uusi nimi', sTask(firstId).kuvaus);
      ok('SW4 arvio tallentui', sTask(firstId).est===3, 'est='+sTask(firstId).est);
      ok('SW4 modaali sulkeutui', !isOpen());

      // ── 5. Sammakko: yksikäsitteinen koko pakassa ──
      var frogTarget=tasks.find(function(t){return t.id!==1;});
      if(frogTarget){
        FokusEdit.open(frogTarget.id);
        document.getElementById('edit-frog').classList.add('on');
        document.getElementById('edit-save-btn').click();
        ok('SW5 uusi sammakko tallentui', sTask(frogTarget.id).frog===true, 'frog='+sTask(frogTarget.id).frog);
        ok('SW5 vanha sammakko (1) nollattiin', sTask(1).frog===false, 'frog='+sTask(1).frog);
      }

      // ── 6. ✓ Tehty ──
      var doneId=tasks[0].id;
      FokusEdit.open(doneId);
      document.getElementById('edit-done-btn').click();
      ok('SW6 done tallentui levylle', sTask(doneId).done===true, 'done='+sTask(doneId).done);
      ok('SW6 doneAt asetettu', !!sTask(doneId).doneAt);
      ok('SW6 kortti poistui pakasta', !deckHas(doneId), 'n='+tasks.length);
      ok('SW6 pois jonosta', (stored().turn||[]).indexOf(doneId)<0 && stored().active!==doneId,
         'id='+doneId+' active='+stored().active+' turn='+(stored().turn||[]).join(','));

      // ── 7. ⏳ Odottaa — kortti jää pakkaan (kuten latauksessa), poistuu jonosta ──
      var waitId=tasks[0].id;
      FokusEdit.open(waitId);
      document.getElementById('edit-wait-btn').click();
      ok('SW7 waiting tallentui levylle', sTask(waitId).waiting===true, 'waiting='+sTask(waitId).waiting);
      ok('SW7 kortti jää pakkaan', deckHas(waitId));
      ok('SW7 poistui jonosta', (stored().turn||[]).indexOf(waitId)<0 && stored().active!==waitId,
         'id='+waitId+' active='+stored().active+' turn='+(stored().turn||[]).join(','));

      // ── 8. Odottavan kortin nappi = palauta vuoroon ──
      var wt=tasks.find(function(t){return t.waiting;});
      if(wt){
        FokusEdit.open(wt.id);
        ok('SW8 odottavan kortin nappi', document.getElementById('edit-wait-btn').textContent.indexOf('Palauta vuoroon')>=0,
           document.getElementById('edit-wait-btn').textContent);
        document.getElementById('edit-wait-btn').click();
        ok('SW8 waiting=false', sTask(wt.id).waiting===false, 'waiting='+sTask(wt.id).waiting);
        ok('SW8 takaisin jonoon', stored().active===wt.id||(stored().turn||[]).indexOf(wt.id)>=0,
           'id='+wt.id+' active='+stored().active+' turn='+(stored().turn||[]).join(','));
      }else{
        ok('SW8 odottava kortti pakassa', false, 'ei löytynyt — siemen muuttunut?');
      }

      // ── 9. Pikatehtävä (est 0) poistuu pakasta ──
      var quickId=tasks[0].id;
      FokusEdit.open(quickId);
      document.getElementById('edit-esl').value=0;
      document.getElementById('edit-save-btn').click();
      ok('SW9 est=0 tallentui', sTask(quickId).est===0, 'est='+sTask(quickId).est);
      ok('SW9 pikatehtävä poistui pakasta', !deckHas(quickId));

      // ── 10. Tyhjä teksti ei tallenna eikä sulje ──
      var keepId=tasks[0].id, keepText=sTask(keepId).text;
      FokusEdit.open(keepId);
      document.getElementById('edit-text').value='   ';
      document.getElementById('edit-save-btn').click();
      ok('SW10 tyhjä teksti: ei tallenneta', sTask(keepId).text===keepText, sTask(keepId).text);
      ok('SW10 tyhjä teksti: modaali jää auki', isOpen());
      FokusEdit.close();
