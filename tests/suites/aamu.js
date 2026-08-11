// target: aamu
      ok('aamu booted', typeof allTasks!=='undefined', typeof allTasks);
      // 2 min rule: quick task (id 7, est 0) must be filtered out of the wizard
      ok('quick task filtered from wizard', allTasks.every(function(t){return t.id!==7;}),
         allTasks.map(function(t){return t.id+':'+t.est}).join(' '));
      ok('non-quick tasks present', allTasks.length>0, allTasks.length);
      ok('done task filtered', allTasks.every(function(t){return t.id!==10;}));
      // Odottava suodatetaan nyt pois: muokkausmodaalin ⏳ siirtää kortin pois
      // velhosta, joten sen palaaminen listalle uudelleen ladattaessa olisi ristiriita
      ok('waiting task filtered from wizard (id 9)', allTasks.every(function(t){return t.id!==9;}),
         allTasks.map(function(t){return t.id;}).join(' '));

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
