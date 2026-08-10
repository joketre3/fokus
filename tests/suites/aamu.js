// target: aamu
      ok('aamu booted', typeof allTasks!=='undefined', typeof allTasks);
      // 2 min rule: quick task (id 7, est 0) must be filtered out of the wizard
      ok('quick task filtered from wizard', allTasks.every(function(t){return t.id!==7;}),
         allTasks.map(function(t){return t.id+':'+t.est}).join(' '));
      ok('non-quick tasks present', allTasks.length>0, allTasks.length);
      ok('done task filtered', allTasks.every(function(t){return t.id!==10;}));
      ok('waiting task still present (id 9)', allTasks.some(function(t){return t.id===9;}));

      // fe(0)
      ok('aamu fe(0)="⚡"', fe(0)==='⚡', fe(0));

      // 1-3-5 meter
      ok('day135 element exists', !!document.getElementById('day135'));
      ok('day135Counts is a function', typeof day135Counts==='function');
      ok('renderDay135 is a function', typeof renderDay135==='function');

      // drive it: put tasks into slots and check counts + id types
      slots.aamu=[1,2]; slots.paiva=[3]; slots.loppu=[];
      selectedFrog=1;
      var c=day135Counts();
      // 1: est2 + frog -> iso ; 2: est1 -> keski ; 3: est3 -> iso
      ok('day135Counts iso=2', c.iso===2, JSON.stringify(c));
      ok('day135Counts keski=1', c.keski===1, JSON.stringify(c));
      ok('slot ids are numbers (frog match works)', typeof slots.aamu[0]==='number', typeof slots.aamu[0]);
      renderDay135();
      var h=document.getElementById('day135');
      ok('renderDay135 draws 3 slots', h.children.length===3, h.children.length);
      ok('iso slot flagged over (2>1)', h.children[0].classList.contains('over'), h.children[0].className);
      ok('slot shows n/max text', /2\/1/.test(h.textContent), h.textContent);

      // dedupe: same id in two slots counted once
      slots.aamu=[2]; slots.paiva=[2]; slots.loppu=[2];
      var c2=day135Counts();
      ok('duplicate id counted once', c2.keski===1, JSON.stringify(c2));

      // budget tokens defined
      var cs=getComputedStyle(document.documentElement);
      ok('--budget-ok defined', cs.getPropertyValue('--budget-ok').trim().length>0, cs.getPropertyValue('--budget-ok'));
      ok('--budget-over defined', cs.getPropertyValue('--budget-over').trim().length>0, cs.getPropertyValue('--budget-over'));

      // ===== Design audit: selection must not rebuild the list =====
      // Rebuilding with innerHTML made every CSS transition on .q2-task /
      // .frog-card dead code — the new node was born in its final state.
      q2Tasks=allTasks.filter(function(t){return t.quad==='q2';});
      if(q2Tasks.length===0)q2Tasks=[allTasks[0]];
      selectedQ2=[];
      renderQ2();
      var q2id=q2Tasks[0].id, q2node=document.getElementById('q2-'+q2id);
      ok('DA q2 row rendered with a stable id', !!q2node, 'q2-'+q2id);
      toggleQ2(q2id);
      var q2after=document.getElementById('q2-'+q2id);
      ok('DA toggleQ2 kept the SAME node (no innerHTML rebuild)', q2after===q2node,
         q2after===q2node?'same node':'node was replaced');
      ok('DA toggleQ2 marked it selected', q2after&&q2after.classList.contains('selected'),
         q2after?q2after.className:'missing');
      ok('DA toggleQ2 drew the check mark', q2after&&q2after.querySelector('.q2-check').textContent==='✓',
         q2after?JSON.stringify(q2after.querySelector('.q2-check').textContent):'missing');
      toggleQ2(q2id);
      ok('DA toggleQ2 deselects on second call',
         document.getElementById('q2-'+q2id)===q2node&&!q2node.classList.contains('selected'),
         q2node.className);

      // frog: same principle
      selectedQ2=q2Tasks.slice(0,1).map(function(t){return t.id;});
      selectedFrog=null;
      renderFrog();
      var cands=getFrogCandidates();
      if(cands.length){
        var fid=cands[0].id, fnode=document.getElementById('frog-'+fid);
        ok('DA frog card rendered with a stable id', !!fnode, 'frog-'+fid);
        if(fnode){
          selectFrog(fid);
          // !!fnode in the condition: without it a tree that renders no ids
          // would compare null===null and pass misleadingly.
          ok('DA selectFrog kept the SAME node (no innerHTML rebuild)',
             !!fnode&&document.getElementById('frog-'+fid)===fnode,
             document.getElementById('frog-'+fid)===fnode?'same node':'node was replaced');
          ok('DA selectFrog marked it selected', fnode.classList.contains('selected'), fnode.className);
          selectFrog(fid);
          ok('DA selectFrog toggles off', !fnode.classList.contains('selected'), fnode.className);
          ok('DA selectFrog syncs btn3 disabled', document.getElementById('btn3').disabled===true,
             'disabled='+document.getElementById('btn3').disabled);
        }
      }

      // screen transition is an animation (display cannot transition)
      var sIn=false;
      try{
        Array.prototype.forEach.call(document.styleSheets,function(ss){
          Array.prototype.forEach.call(ss.cssRules||[],function(r){
            if(r.type===CSSRule.KEYFRAMES_RULE&&r.name==='screen-in')sIn=true;
          });
        });
      }catch(_){}
      ok('DA screen-in keyframes defined', sIn, 'keyframes screen-in');
