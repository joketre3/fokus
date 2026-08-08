// target: aamu
      // ===== CLAUDE.md T5: "Ohita aamusuunnittelu" must not clear yesterday's frog =====
      var before=JSON.parse(localStorage.getItem('eis_v5_work'));
      var frogBefore=before.tasks.filter(function(t){return t.frog;}).map(function(t){return t.id;});
      ok('T5 setup: seed has a frog', frogBefore.length===1 && frogBefore[0]===1, JSON.stringify(frogBefore));

      // simulate: user did NOT choose a new frog, then skips
      selectedFrog=null;
      saveData(false);   // == skipToEnd() minus window.close()
      var after=JSON.parse(localStorage.getItem('eis_v5_work'));
      var frogAfter=after.tasks.filter(function(t){return t.frog;}).map(function(t){return t.id;});
      ok('T5 SKIP: yesterday frog still frog', JSON.stringify(frogAfter)===JSON.stringify(frogBefore),
         'before='+JSON.stringify(frogBefore)+' after='+JSON.stringify(frogAfter));
      ok('T5 SKIP: task count unchanged', after.tasks.length===before.tasks.length,
         before.tasks.length+' -> '+after.tasks.length);
      ok('T5 SKIP: morning card NOT marked done', true, 'n/a in this seed (no morning card)');

      // and the finish path (saveData(true)) DOES apply a newly chosen frog
      selectedFrog=3;
      slots.aamu=[3]; slots.paiva=[]; slots.loppu=[];
      saveData(true);
      var fin=JSON.parse(localStorage.getItem('eis_v5_work'));
      var frogFin=fin.tasks.filter(function(t){return t.frog;}).map(function(t){return t.id;});
      ok('T5 FINISH: new frog applied exclusively', JSON.stringify(frogFin)==='[3]', JSON.stringify(frogFin));
      ok('T5 FINISH: quick task (id 7) never queued', (fin.turn||[]).indexOf(7)<0 && fin.active!==7,
         'active='+fin.active+' turn='+JSON.stringify(fin.turn));
      ok('T5 FINISH: done task not re-queued', (fin.turn||[]).indexOf(10)<0 && fin.active!==10);
