// target: index
      ok('app booted (tasks global)', typeof tasks!=='undefined' && tasks.length>0, typeof tasks!=='undefined'?tasks.length+' tasks':'undefined');
      ok('no JS error banner', !document.getElementById('fatal-error'));
      ok('active loaded', active===1, 'active='+active);
      ok('turn loaded', JSON.stringify(turn)==='[2,3]', JSON.stringify(turn));
      ok('arena rendered a card', !!document.querySelector('.tcg-card--arena-size, .tcg-card'), document.querySelectorAll('.tcg-card').length+' cards');
      ok('turn-list has rows', document.getElementById('turn-list').children.length>0, document.getElementById('turn-list').children.length);
