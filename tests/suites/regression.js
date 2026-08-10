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

      // ===== Design audit: touch reachability + hover guards =====
      // Headless reports hover:hover/pointer:fine, so these media blocks never
      // MATCH here — assert the rules exist in the cascade instead. Without
      // them the Done-modal buttons and the peek quick-done are unreachable on
      // touch, and the 52px hand-card lift fires on tap.
      function cssRules(){
        var out=[];
        Array.prototype.forEach.call(document.styleSheets,function(ss){
          var rules; try{rules=ss.cssRules;}catch(_){return;}
          (function walk(list,media){
            Array.prototype.forEach.call(list||[],function(r){
              if(r.type===CSSRule.MEDIA_RULE)walk(r.cssRules,(media?media+' && ':'')+r.conditionText);
              else if(r.selectorText)out.push({sel:r.selectorText,media:media||'',css:r.cssText});
            });
          })(rules,'');
        });
        return out;
      }
      var R=cssRules();
      function has(selRe,mediaRe){
        return R.some(function(r){return selRe.test(r.sel)&&mediaRe.test(r.media);});
      }
      ok('DA .tact-wrap opened under (hover:none)', has(/\.tact-wrap/,/hover:\s*none/),
         R.filter(function(r){return /\.tact-wrap/.test(r.sel);}).map(function(r){return '['+r.media+']';}).join(' '));
      ok('DA .tact opened under (hover:none)', has(/^\.tact$/,/hover:\s*none/));
      ok('DA .qdnb revealed under (hover:none)', has(/\.qdnb/,/hover:\s*none/),
         R.filter(function(r){return /\.qdnb/.test(r.sel);}).map(function(r){return '['+r.media+']';}).join(' '));
      // The 52px lift must ONLY exist behind a fine-pointer hover guard.
      var lifts=R.filter(function(r){return /\.tcg-card--hand:hover/.test(r.sel)&&/translateY\(-52px\)/.test(r.css);});
      ok('DA hand-card 52px lift exists', lifts.length>0, 'rules='+lifts.length);
      ok('DA hand-card lift is behind (hover:hover) and (pointer:fine)',
         lifts.length>0&&lifts.every(function(r){return /hover:\s*hover/.test(r.media)&&/pointer:\s*fine/.test(r.media);}),
         lifts.map(function(r){return '['+r.media+']';}).join(' '));
      // The desktop rule that moves transform-origin must carry the same guard,
      // otherwise a >=900px touch tablet gets a new pivot with no lift.
      var origins=R.filter(function(r){return /#hand-bar-cards\s+\.tcg-card--hand:hover/.test(r.sel)&&/transform-origin/.test(r.css);});
      ok('DA desktop hand-hover transform-origin is guarded too',
         origins.length===0||origins.every(function(r){return /hover:\s*hover/.test(r.media)&&/pointer:\s*fine/.test(r.media);}),
         origins.map(function(r){return '['+r.media+']';}).join(' '));
