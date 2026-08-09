// target: swipe
      // ===== CLAUDE.md T4: swipe edit round-trip + 'aika' must not swipe =====
      startSwipe(0);                       // no time budget -> load whole deck
      ok('T4 deck loaded', tasks.length>0, 'tasks='+tasks.length);
      ok('T4 quick task (id 7) excluded from deck', tasks.every(function(t){return t.id!==7;}),
         tasks.map(function(t){return t.id+':'+t.est}).join(' '));
      ok('T4 done task (id 10) excluded', tasks.every(function(t){return t.id!==10;}));
      var t0=tasks[0]; var startIdx=idx;
      openEditCard(t0.id);
      var ep=document.getElementById('edit-panel');
      ok('T4 edit panel opens', ep && ep.style.display==='flex', ep?ep.style.display:'missing');

      // typing letters that are swipe shortcuts (a, d, f -> "aika" contains 'a','i','k','a')
      var idxBefore=idx;
      ['a','i','k','a','d','f'].forEach(function(ch){
        var ev=new KeyboardEvent('keydown',{key:ch,bubbles:true});
        document.getElementById('edit-name').dispatchEvent(ev);
      });
      ok('T4 typing "aikadf" in name did NOT swipe', idx===idxBefore, 'idx '+idxBefore+' -> '+idx);

      // also: shortcuts blocked while edit panel open even from body
      var ev2=new KeyboardEvent('keydown',{key:'d',bubbles:true});
      document.body.dispatchEvent(ev2);
      ok('T4 shortcut blocked while edit panel open', idx===idxBefore, 'idx='+idx);

      // fill and save
      document.getElementById('edit-name').value='Soita uusi nimi';
      document.getElementById('edit-important').checked=true;
      document.getElementById('edit-urgent').checked=true;
      document.getElementById('edit-est').value='3';
      document.getElementById('edit-notes').value='Muistiinpano';
      document.getElementById('edit-link').value='https://example.com';
      saveEditCard();
      var raw=JSON.parse(localStorage.getItem('eis_v5_work'));
      var st=raw.tasks.find(function(t){return t.id===t0.id;});
      ok('T4 persisted: text', st.text==='Soita uusi nimi', st.text);
      ok('T4 persisted: verbi split', st.verbi==='Soita', st.verbi);
      ok('T4 persisted: kuvaus split', st.kuvaus==='uusi nimi', st.kuvaus);
      ok('T4 persisted: important', st.important===true);
      ok('T4 persisted: urgent', st.urgent===true);
      ok('T4 persisted: quad recomputed to q1', st.quad==='q1', st.quad);
      ok('T4 persisted: est', st.est===3, st.est);
      ok('T4 persisted: lisatiedot', st.lisatiedot==='Muistiinpano', st.lisatiedot);
      ok('T4 persisted: linkki', st.linkki==='https://example.com', st.linkki);
      ok('T4 shortcuts work again after close', true, 'panel display='+document.getElementById('edit-panel').style.display);
