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
      ok('T4 edit panel opens', ep && ep.classList.contains('on'), ep?ep.className:'missing');

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
      ok('T4 shortcuts work again after close', !document.getElementById('edit-panel').classList.contains('on'),
         'panel class='+document.getElementById('edit-panel').className);

      // ===== Design audit: advanceStack promotes nodes instead of rebuilding =====
      // setupDrag must not register document-level listeners (the old leak:
      // two per rendered card, never removed).
      ok('DA no document-level drag listeners in setupDrag',
         setupDrag.toString().indexOf('document.addEventListener')===-1,
         'setupDrag len='+setupDrag.toString().length);

      renderStack();
      var stack=document.getElementById('stack');
      var before=stack.children.length, idxBefore2=idx;
      var activeBefore=document.getElementById('active-card');
      ok('DA stack has 3 cards before advance', before===3, 'children='+before);
      ok('DA active card has an edit button', !!(activeBefore&&activeBefore.querySelector('.edit-btn')));

      advanceStack();
      var activeAfter=document.getElementById('active-card');
      ok('DA idx advanced by one', idx===idxBefore2+1, idxBefore2+' -> '+idx);
      ok('DA a new active card exists', !!activeAfter);
      ok('DA promoted node is the SAME node that was the shadow (no rebuild)',
         activeAfter!==activeBefore && !stack.contains(activeBefore),
         'flown card removed='+(!stack.contains(activeBefore)));
      ok('DA active card is no longer a shadow', activeAfter && !activeAfter.classList.contains('shadow-card'),
         activeAfter?activeAfter.className:'missing');
      ok('DA promoted card kept its edit button', !!(activeAfter&&activeAfter.querySelector('.edit-btn')));
      ok('DA stack refilled to 3 cards', stack.children.length===3, 'children='+stack.children.length);
      ok('DA exactly one back2 card', stack.querySelectorAll('.back2').length===1,
         'back2='+stack.querySelectorAll('.back2').length);
      ok('DA counter follows idx', document.getElementById('counter').textContent===(tasks.length-idx)+' tehtävää',
         document.getElementById('counter').textContent);

      // Drain to the end: advanceStack must reach showDone without throwing
      var guard=0;
      while(idx<tasks.length&&guard++<50)advanceStack();
      ok('DA drained to the end of the deck', idx>=tasks.length, 'idx='+idx+' of '+tasks.length);
      ok('DA done screen shown after last card',
         getComputedStyle(document.getElementById('done-screen')).display!=='none',
         'display='+getComputedStyle(document.getElementById('done-screen')).display);
