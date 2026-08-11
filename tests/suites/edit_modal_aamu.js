// target: aamu
      // ===== Jaettu muokkausmodaali aamu.html:ssä =====
      // Siemen: id 1 sammakko (q1), 2 q1, 3/4/8 q2, 7 pika, 9 odottaa, 10 tehty
      var EM=document.getElementById('edit-modal');
      var isOpen=function(){ return EM && EM.style.display==='flex'; };
      var stored=function(){ return JSON.parse(localStorage.getItem('eis_v5_work')||'{}'); };
      var sTask=function(id){ return (stored().tasks||[]).find(function(t){return t.id===id;}); };
      var inWizard=function(id){ return allTasks.some(function(t){return t.id===id;}); };

      ok('AM modaali on DOM:issa', !!EM);
      ok('AM FokusEdit rekisteröity', typeof FokusEdit==='object' && typeof FokusEdit.open==='function');
      ok('AM velhossa on tehtäviä', allTasks.length>0, 'n='+allTasks.length);
      ok('AM tehty (10) ei ole velhossa', !inWizard(10));
      ok('AM pikatehtävä (7) ei ole velhossa', !inWizard(7));
      ok('AM odottava (9) ei ole velhossa', !inWizard(9));

      // ── 1. Vaihe 1: ✎ kortilla ──
      var q1btns=document.querySelectorAll('#q1Area .ca-btn');
      var q1Edit=null;
      for(var i=0;i<q1btns.length;i++){ if(q1btns[i].textContent.indexOf('Muokkaa')>=0) q1Edit=q1btns[i]; }
      ok('AM1 vaiheen 1 kortilla on ✎', !!q1Edit, 'nappeja '+q1btns.length);
      var q1Id=q1Tasks[q1Index]?q1Tasks[q1Index].id:null;
      if(q1Edit) q1Edit.click();
      ok('AM1 modaali aukeaa', isOpen(), 'display='+(EM&&EM.style.display));
      ok('AM1 oikea kortti ladattu', document.getElementById('edit-text').value===sTask(q1Id).text,
         document.getElementById('edit-text').value);

      // ── 2. Muokkaus tallentuu levylle, jono säilyy ──
      var actBefore=stored().active, turnBefore=(stored().turn||[]).join(',');
      document.getElementById('edit-text').value='Soita muokattu A';
      document.getElementById('edit-save-btn').click();
      ok('AM2 teksti tallentui', sTask(q1Id).text==='Soita muokattu A', sTask(q1Id).text);
      ok('AM2 verbi synkassa', sTask(q1Id).verbi==='Soita', sTask(q1Id).verbi);
      ok('AM2 jono ennallaan', stored().active===actBefore && (stored().turn||[]).join(',')===turnBefore,
         'active='+stored().active+' turn='+(stored().turn||[]).join(','));
      ok('AM2 modaali sulkeutui', !isOpen());
      ok('AM2 kortti näkyy yhä vaiheessa 1', document.getElementById('q1Area').textContent.indexOf('Soita muokattu A')>=0);

      // ── 3. Vaihe 2: ✎ ei saa togglata valintaa ──
      goStep2();
      var rows=document.querySelectorAll('#q2Area .q2-task');
      ok('AM3 vaiheessa 2 on rivejä', rows.length>0, 'n='+rows.length);
      var q2Id=q2Tasks[0].id;
      var selBefore=selectedQ2.slice().join(',');
      var rowEdit=document.querySelector('#q2-'+q2Id+' .q2-edit');
      ok('AM3 rivillä on ✎', !!rowEdit);
      if(rowEdit) rowEdit.click();
      ok('AM3 ✎ ei toggloinut valintaa', selectedQ2.slice().join(',')===selBefore,
         'ennen "'+selBefore+'" jälkeen "'+selectedQ2.join(',')+'"');
      ok('AM3 modaali aukeaa rivistä', isOpen());

      // ── 4. ✓ Tehty poistaa kortin velhosta ──
      document.getElementById('edit-done-btn').click();
      ok('AM4 done tallentui levylle', sTask(q2Id).done===true, 'done='+sTask(q2Id).done);
      ok('AM4 doneAt asetettu', !!sTask(q2Id).doneAt);
      ok('AM4 kortti poistui velhosta', !inWizard(q2Id));
      ok('AM4 rivi katosi listalta', !document.getElementById('q2-'+q2Id));
      ok('AM4 pois jonosta', stored().active!==q2Id && (stored().turn||[]).indexOf(q2Id)<0,
         'id='+q2Id+' active='+stored().active+' turn='+(stored().turn||[]).join(','));

      // ── 5. ⏳ Odottaa poistaa kortin velhosta ──
      var waitId=q2Tasks[0].id;
      FokusEdit.open(waitId);
      ok('AM5 wait-napin teksti', document.getElementById('edit-wait-btn').textContent.indexOf('odottamaan')>=0,
         document.getElementById('edit-wait-btn').textContent);
      document.getElementById('edit-wait-btn').click();
      ok('AM5 waiting tallentui', sTask(waitId).waiting===true, 'waiting='+sTask(waitId).waiting);
      ok('AM5 kortti poistui velhosta', !inWizard(waitId));
      ok('AM5 pois jonosta', stored().active!==waitId && (stored().turn||[]).indexOf(waitId)<0,
         'id='+waitId+' active='+stored().active+' turn='+(stored().turn||[]).join(','));

      // ── 6. Sammakko modaalista säilyy vaiheeseen 3 ──
      var frogId=q2Tasks[0]?q2Tasks[0].id:null;
      if(frogId){
        FokusEdit.open(frogId);
        document.getElementById('edit-frog').classList.add('on');
        document.getElementById('edit-save-btn').click();
        ok('AM6 sammakko tallentui', sTask(frogId).frog===true, 'frog='+sTask(frogId).frog);
        ok('AM6 vanha sammakko (1) nollattiin', sTask(1).frog===false, 'frog='+sTask(1).frog);
        if(selectedQ2.indexOf(frogId)<0) toggleQ2(frogId);   // ehdokkaaksi vaiheeseen 3
        goStep3();
        ok('AM6 valinta säilyi vaiheeseen 3', selectedFrog===frogId, 'selectedFrog='+selectedFrog);
      }

      // ── 7. Tyhjä teksti ei tallenna eikä sulje ──
      var keepId=q1Tasks[0].id, keepText=sTask(keepId).text;
      FokusEdit.open(keepId);
      document.getElementById('edit-text').value='   ';
      document.getElementById('edit-save-btn').click();
      ok('AM7 tyhjä teksti: ei tallenneta', sTask(keepId).text===keepText, sTask(keepId).text);
      ok('AM7 tyhjä teksti: modaali jää auki', isOpen());
      document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
      ok('AM7 Esc sulkee modaalin', !isOpen(), 'display='+(EM&&EM.style.display));
