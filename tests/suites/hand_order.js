// target: index
      // Kaksi koherenssiväitettä kädestä.
      //
      // C1: matriisissa raahattu järjestys (t.order) ohjaa myös kättä.
      //     Aiemmin buildHandQueue ei lajitellut ämpärin sisällä lainkaan,
      //     joten sama prioriteetti näytti kahdelta eri totuudelta:
      //     matriisissa raahausjärjestys, kädessä lisäysjärjestys.
      //
      // C2: käden koko on yksi luku. Aiemmin buildHandQueue palautti 7 ja
      //     renderHandBar näytti .slice(0,5) — varoitusteksti lupasi
      //     seitsemän korttia joista kaksi ei koskaan päätynyt ruudulle.

      var inbox = function(){
        return tasks.filter(function(t){ return !t.done && !t.scheduled_hidden; });
      };

      // ── C1 ────────────────────────────────────────────────────────────
      var t4 = tasks.find(function(t){ return t.id === 4; });
      var t8 = tasks.find(function(t){ return t.id === 8; });
      ok('fixture: 4 ja 8 ovat vapaita q2-kortteja',
         !!t4 && !!t8 && t4.quad === 'q2' && t8.quad === 'q2',
         t4 && t8 ? (t4.quad + '/' + t8.quad) : 'puuttuu');

      delete t4.order; delete t8.order;
      var plain = buildHandQueue(inbox()).map(function(t){ return t.id; });
      ok('ilman t.orderia lisaysjarjestys sailyy',
         plain.indexOf(4) >= 0 && plain.indexOf(8) >= 0 &&
         plain.indexOf(4) < plain.indexOf(8),
         plain.join(','));

      // Matriisin raahaus asettaa t.orderin kvadrantin sisalla (render():n
      // qTasks.forEach(function(t,i){t.order=i})). Kaanetaan jarjestys.
      t8.order = 0; t4.order = 1;
      var byOrder = buildHandQueue(inbox()).map(function(t){ return t.id; });
      ok('t.order ohjaa kaden jarjestysta amparin sisalla',
         byOrder.indexOf(8) >= 0 && byOrder.indexOf(4) >= 0 &&
         byOrder.indexOf(8) < byOrder.indexOf(4),
         byOrder.join(','));
      delete t4.order; delete t8.order;

      // ── C2 ────────────────────────────────────────────────────────────
      ok('HAND_MAX on maaritelty', window.HAND_MAX === 5, String(window.HAND_MAX));

      for (var i = 0; i < 8; i++) {
        tasks.push({ id: 900 + i, text: 'Tee tahtikortti ' + i, verbi: 'Tee',
                     kuvaus: 'tahtikortti ' + i, quad: 'q1', est: 1,
                     done: false, frog: false, waiting: false, handForced: true,
                     pomos: 0, tags: [], projectId: null,
                     schedule: null, scheduled_hidden: false });
      }
      var forced = buildHandQueue(inbox());
      ok('yli HAND_MAXin pakotettuja -> leikkaus HAND_MAXiin',
         forced.length === window.HAND_MAX,
         forced.length + ' palautettu, HAND_MAX=' + window.HAND_MAX);

      render();
      var painted = document.querySelectorAll('#hand-bar-cards .tcg-card--hand').length;
      ok('renderoity maara vastaa buildHandQueueta',
         painted === forced.length,
         painted + ' renderoity vs ' + forced.length + ' palautettu');
