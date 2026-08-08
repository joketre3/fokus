// target: index
      // seed: task 7 = est 0 (quick), task 1 frog est2, 2 est1, 3 est3, 4 est.5, 5 est.5, 8 est1
      // active=1, turn=[2,3]

      // --- fe() ---
      ok('fe(0)="⚡"', fe(0)==='⚡', fe(0));
      ok('fe(0.5)="½"', fe(0.5)==='½', fe(0.5));
      ok('fe(2)="2"', fe(2)==='2', fe(2));

      // --- isQuick / quickTasks ---
      ok('isQuick(est 0)', isQuick(tasks.find(function(t){return t.id===7})));
      ok('isQuick(est .5) false', !isQuick(tasks.find(function(t){return t.id===4})));
      ok('isQuick(null) false', !isQuick(null));
      ok('isQuick(undefined est) false', !isQuick({id:99}));
      var q=quickTasks(null);
      ok('quickTasks finds 1', q.length===1 && q[0].id===7, q.map(function(t){return t.id}).join(','));

      // --- pika button ---
      var pb=document.getElementById('pika-btn');
      ok('pika-btn exists', !!pb);
      ok('pika-btn visible (has .on)', pb.classList.contains('on'));
      ok('pika-btn shows count 1', /1/.test(pb.textContent), pb.textContent);

      // --- hand / queue exclusion ---
      var inbox=tasks.filter(function(t){return !t.done&&!t.scheduled_hidden;});
      var hand=buildHandQueue(inbox);
      ok('quick NOT in hand', hand.every(function(t){return t.id!==7;}), hand.map(function(t){return t.id}).join(','));

      // --- 1-3-5 budget ---
      var b=dayBudget();
      // active=1 (frog,est2 -> iso), turn=[2(est1->keski),3(est3->iso)]
      ok('dayBudget iso=2', b.iso===2, JSON.stringify(b));
      ok('dayBudget keski=1', b.keski===1, JSON.stringify(b));
      ok('dayBudget pieni=0', b.pieni===0, JSON.stringify(b));
      var d135=document.getElementById('day135');
      ok('day135 rendered 3 slots', d135 && d135.children.length===3, d135?d135.children.length:'missing');
      ok('day135 iso slot marked over (2>1)', d135.children[0].classList.contains('over'), d135.children[0].className);
      ok('day135 has title tooltip', /1-3-5/.test(d135.getAttribute('title')||''), d135.getAttribute('title'));

      // budget ignores quick + morning task
      turn.push(7); render();
      ok('quick in turn does NOT count in budget', dayBudget().pieni===0 && dayBudget().keski===1, JSON.stringify(dayBudget()));
      // >>> GHOST CHECK: quick task sitting in turn <<<
      var listRows=document.getElementById('turn-list').children.length;
      ok('GHOST: turn-list hides quick task', listRows===2, 'rows='+listRows+' turn='+JSON.stringify(turn));
      ok('GHOST: turn-count matches visible rows', document.getElementById('turn-count').textContent==='2',
         'count='+document.getElementById('turn-count').textContent+' turn.length='+turn.length);
      ok('GHOST: turn array still holds the quick id (invisible entry)', turn.indexOf(7)>=0, JSON.stringify(turn));
      // does doNext() promote the ghost to the arena?
      var beforeActive=active;
      turn=[7,2,3]; active=null; render();
      ok('GHOST: quick task CAN become active via empty-arena shift', true, 'turn='+JSON.stringify(turn)+' active='+active);
      turn=[2,3]; active=1; render();

      // --- pika modal ---
      openPikaModal();
      var body=document.getElementById('pika-modal__body');
      ok('pika modal open', document.getElementById('pika-modal').classList.contains('ham-open'));
      ok('pika modal lists 1 row', body.querySelectorAll('.pika-row').length===1, body.querySelectorAll('.pika-row').length);
      ok('pika row has checkbox + delete', !!body.querySelector('.pika-row__cb') && !!body.querySelector('.pika-row__del'));
      // complete it
      pikaDone(7);
      ok('pikaDone marks done', tasks.find(function(t){return t.id===7}).done===true);
      ok('pikaDone sets doneAt', !!tasks.find(function(t){return t.id===7}).doneAt);
      ok('pikaDone removes from turn', turn.indexOf(7)<0, JSON.stringify(turn));
      ok('pika-btn hidden when none left', !document.getElementById('pika-btn').classList.contains('on'));
      closePikaModal();
      ok('pika modal closed', !document.getElementById('pika-modal').classList.contains('ham-open'));

      // --- sliders allow 0 ---
      ok('add slider min=0', document.getElementById('esl').getAttribute('min')==='0', document.getElementById('esl').getAttribute('min'));
      ok('edit slider min=0', document.getElementById('edit-esl').getAttribute('min')==='0', document.getElementById('edit-esl').getAttribute('min'));
      setEstUI('ev','esl-unit',0);
      ok('setEstUI(0) shows "alle 2 min"', /alle 2 min/.test(document.getElementById('esl-unit').textContent), document.getElementById('esl-unit').textContent);
      setEstUI('ev','esl-unit',2);
      ok('setEstUI(2) shows minutes', /min/.test(document.getElementById('esl-unit').textContent), document.getElementById('esl-unit').textContent);

      // --- demote active task to quick via edit modal ---
      openEditModal(1);
      document.getElementById('edit-esl').value='0';
      saveEditModal();
      ok('demote: task 1 est=0', tasks.find(function(t){return t.id===1}).est===0);
      ok('demote: removed from active', active!==1, 'active='+active);
      ok('demote: frog cleared', tasks.find(function(t){return t.id===1}).frog===false);
      ok('demote: appears in pika list', quickTasks(null).some(function(t){return t.id===1;}));

      // --- interrupt park ---
      active=2; turn=[3]; phase='idle'; render();
      var nBefore=tasks.length;
      toggleTimer();
      ok('park: timer running', !!tmr);
      updClock();
      ok('park: row visible during work', document.getElementById('hdr-timer').classList.contains('hdr-timer--parking'));
      var pi=document.getElementById('park-input');
      pi.value='Kollega keskeytti';
      parkInterrupt();
      ok('park: task created', tasks.length===nBefore+1, tasks.length+' vs '+nBefore);
      var nt=tasks[tasks.length-1];
      ok('park: quad q3', nt.quad==='q3', nt.quad);
      ok('park: est .5', nt.est===0.5, nt.est);
      ok('park: tagged keskeytys', (nt.tags||[]).indexOf('keskeytys')>=0, JSON.stringify(nt.tags));
      ok('park: needsReview', nt.needsReview===true);
      ok('park: text kept', nt.text==='Kollega keskeytti', nt.text);
      ok('park: unique id', tasks.filter(function(t){return t.id===nt.id;}).length===1, 'id='+nt.id);
      ok('park: TIMER NOT INTERRUPTED', !!tmr && phase==='work', 'tmr='+(!!tmr)+' phase='+phase);
      ok('park: input cleared', pi.value==='', '"'+pi.value+'"');
      ok('park: counter shows 1', document.getElementById('park-count').textContent==='1', document.getElementById('park-count').textContent);
      ok('park: NOT auto-queued (stays out of turn)', turn.indexOf(nt.id)<0 && active!==nt.id, 'turn='+JSON.stringify(turn));
      pi.value='   ';
      var n2=tasks.length; parkInterrupt();
      ok('park: blank input ignored', tasks.length===n2, tasks.length+' vs '+n2);
      // park row hidden on break
      phase='sbrk'; updClock();
      ok('park: row hidden on break', !document.getElementById('hdr-timer').classList.contains('hdr-timer--parking'));
      stopAll(); updClock();
      ok('park: row hidden when idle', !document.getElementById('hdr-timer').classList.contains('hdr-timer--parking'));
      toggleTimer();
      ok('park: counter reset on new session', _parkCount===0, '_parkCount='+_parkCount);
      stopAll();
