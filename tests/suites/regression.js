// target: index
      // ===== Test 3: Done modal restore / delete =====
      // restore seed state in memory
      tasks.push({id:200,text:'Valmis testi',quad:'q1',est:1,done:true,pomos:1,
                  doneAt:new Date().toISOString(),tags:[],frog:false,waiting:false,
                  verbi:'Valmis',kuvaus:'testi',projectId:null,schedule:null,scheduled_hidden:false});
      render();
      openDoneModal();
      var dm=document.getElementById('done-modal');
      ok('T3 done modal opens', dm && (dm.classList.contains('ham-open')||getComputedStyle(dm).display!=='none'));
      var restoreBtn=document.querySelector('#done-modal [data-done-act="restore"][data-done-id="200"]');
      var delBtn=document.querySelector('#done-modal [data-done-act="delete"][data-done-id="200"], #done-modal [data-done-act="del"][data-done-id="200"]');
      ok('T3 restore button present INSIDE modal (clone keeps data-attrs)', !!restoreBtn,
         restoreBtn?'found':'MISSING - listeners lost on innerHTML clone');
      if(restoreBtn){
        restoreBtn.click();
        ok('T3 restore actually un-dones the task', tasks.find(function(t){return t.id===200;}).done===false,
           'done='+tasks.find(function(t){return t.id===200;}).done);
        var stillListed=!!document.querySelector('#done-modal [data-done-id="200"]');
        ok('T3 modal list refreshes after restore', !stillListed, stillListed?'row still shown':'row gone');
      }
      // delete path
      tasks.push({id:201,text:'Poistettava',quad:'q1',est:1,done:true,pomos:1,
                  doneAt:new Date().toISOString(),tags:[],frog:false,waiting:false,
                  verbi:'Poista',kuvaus:'ttava',projectId:null,schedule:null,scheduled_hidden:false});
      render(); openDoneModal();
      var db=document.querySelector('#done-modal [data-done-act="del"][data-done-id="201"]');
      ok('T3 delete button present in modal', !!db, db?'found':'MISSING');
      if(db){ db.click();
        ok('T3 delete removes task', !tasks.some(function(t){return t.id===201;}));
      }
      closeDoneModal();

      // ===== ICS: full-day reminder must carry the chosen date, not the previous day =====
      var captured=null; var OrigBlob=window.Blob;
      window.Blob=function(parts,opts){ captured=String(parts[0]); return new OrigBlob(parts,opts); };
      var oldCreate=URL.createObjectURL; URL.createObjectURL=function(){return 'blob:stub';};
      var oldRevoke=URL.revokeObjectURL; URL.revokeObjectURL=function(){};
      generoiICS({verbi:'Sovi',kuvaus:'tapaaminen',text:'Sovi tapaaminen',lisatiedot:'',linkki:'',projekti:''},
                 'muistutus', new Date('2026-07-28T00:00:00'), null, 30);
      window.Blob=OrigBlob; URL.createObjectURL=oldCreate; URL.revokeObjectURL=oldRevoke;
      ok('ICS produced', !!captured, captured?captured.split('\r\n').slice(4,8).join(' | '):'nothing');
      if(captured){
        ok('ICS DTSTART = chosen day 20260728 (not 20260727)', /DTSTART;VALUE=DATE:20260728/.test(captured),
           (captured.match(/DTSTART[^\r\n]*/)||[''])[0]);
        ok('ICS DTEND = next day 20260729', /DTEND;VALUE=DATE:20260729/.test(captured),
           (captured.match(/DTEND[^\r\n]*/)||[''])[0]);
        ok('ICS summary = verbi + kuvaus', /SUMMARY:Sovi tapaaminen/.test(captured),
           (captured.match(/SUMMARY[^\r\n]*/)||[''])[0]);
        ok('ICS CRLF line endings', captured.indexOf('\r\n')>0);
      }
      ok('TZ offset is UTC+2/+3 (test is meaningful)', Math.abs(new Date('2026-07-28T00:00:00').getTimezoneOffset())>=120,
         'offsetMin='+new Date('2026-07-28T00:00:00').getTimezoneOffset());
