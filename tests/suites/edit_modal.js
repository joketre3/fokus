// target: index
      // ===== Muokkausmodaalin tilanapit: tehty / odottaa =====
      // Siemen: active=1 (sammakko), turn=[2,3], id 9 odottaa, id 10 tehty
      var EM=document.getElementById('edit-modal');
      var dnB=document.getElementById('edit-done-btn');
      var wtB=document.getElementById('edit-wait-btn');
      var find=function(id){return tasks.find(function(t){return t.id===id;});};
      var isOpen=function(){return EM.style.display==='flex';};

      ok('EM napit ovat DOM:issa', !!dnB&&!!wtB, 'done='+!!dnB+' wait='+!!wtB);
      ok('EM napit ovat muokkausmodaalin sisalla', !!dnB&&!!dnB.closest('#edit-modal'));

      // ── 1. Jonokortti → tehty ──
      openEditModal(2);
      ok('EM1 modaali aukeaa', isOpen(), 'display='+EM.style.display);
      ok('EM1 done-napin teksti', dnB.textContent.indexOf('Merkitse tehdyksi')>=0, dnB.textContent);
      ok('EM1 wait-napin teksti', wtB.textContent.indexOf('odottamaan')>=0, wtB.textContent);
      ok('EM1 wait-nappi nakyvissa', wtB.style.display!=='none', 'display='+wtB.style.display);
      dnB.click();
      ok('EM1 tehtava merkitty tehdyksi', find(2).done===true, 'done='+find(2).done);
      ok('EM1 doneAt asetettu', !!find(2).doneAt, find(2).doneAt);
      ok('EM1 poistui jonosta', turn.indexOf(2)<0, 'turn='+turn.join(','));
      ok('EM1 modaali sulkeutui', !isOpen(), 'display='+EM.style.display);

      // ── 2. Kesken jäänyt muokkaus tallentuu ENNEN toimintoa ──
      openEditModal(4);
      document.getElementById('edit-text').value='Soita uusi nimi';
      wtB.click();
      ok('EM2 muokattu teksti tallentui', find(4).text==='Soita uusi nimi', find(4).text);
      ok('EM2 verbi synkassa', find(4).verbi==='Soita', find(4).verbi);
      ok('EM2 kuvaus synkassa', find(4).kuvaus==='uusi nimi', find(4).kuvaus);
      ok('EM2 waiting=true', find(4).waiting===true, 'waiting='+find(4).waiting);
      ok('EM2 modaali sulkeutui', !isOpen());

      // ── 3. Odottava kortti → palauta vuoroon ──
      openEditModal(9);
      ok('EM3 odottavan kortin nappi = palauta vuoroon', wtB.textContent.indexOf('Palauta vuoroon')>=0, wtB.textContent);
      wtB.click();
      ok('EM3 waiting=false', find(9).waiting===false, 'waiting='+find(9).waiting);
      ok('EM3 takaisin vuoroon', active===9||turn.indexOf(9)>=0, 'active='+active+' turn='+turn.join(','));

      // ── 4. Tehty kortti (PAKKA avaa modaalin myös tehdylle) ──
      openEditModal(10);
      ok('EM4 tehdyn kortin nappi = palauta tekemattomiin', dnB.textContent.indexOf('Palauta')>=0, dnB.textContent);
      ok('EM4 tehdylla kortilla ei odotusnappia', wtB.style.display==='none', 'display='+wtB.style.display);
      dnB.click();
      ok('EM4 done=false palautuksen jalkeen', find(10).done===false, 'done='+find(10).done);
      ok('EM4 doneAt tyhjennetty', find(10).doneAt===null, String(find(10).doneAt));
      openEditModal(5);
      ok('EM4 odotusnappi palaa nakyviin ei-tehdylla kortilla', wtB.style.display!=='none', 'display='+wtB.style.display);
      closeEditModal();

      // ── 5. Tyhjä teksti estää toiminnon (sama sääntö kuin Tallenna-napilla) ──
      openEditModal(6);
      document.getElementById('edit-text').value='   ';
      dnB.click();
      ok('EM5 tyhja teksti: ei merkita tehdyksi', find(6).done===false, 'done='+find(6).done);
      ok('EM5 tyhja teksti: modaali jaa auki', isOpen(), 'display='+EM.style.display);
      closeEditModal();

      // ── 6. Areenan kortti: ketjukortti nousee kärkeen (doneActive-haara) ──
      var mkChain=function(id,pos){return {id:id,text:'Tee ketjun osa '+pos,verbi:'Tee',kuvaus:'ketjun osa '+pos,
        quad:'q1',important:true,urgent:true,est:1,done:false,frog:false,waiting:false,tags:[],
        projectId:null,schedule:null,scheduled_hidden:false,pomos:0,doneAt:null,lisatiedot:null,linkki:null,
        chainId:'ctest',chainPosition:pos,chainTotal:2,isChained:true};};
      tasks.push(mkChain(300,1)); tasks.push(mkChain(301,2));
      active=300; turn=[5,301]; render();
      openEditModal(300);
      dnB.click();
      ok('EM6 aktiivinen kortti merkittiin tehdyksi', find(300).done===true, 'done='+find(300).done);
      ok('EM6 ketjukortti nousi areenalle', active===301, 'active='+active+' turn='+turn.join(','));
