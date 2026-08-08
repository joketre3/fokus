// target: index
      var body=document.body;
      function panelOnScreen(sel){var e=document.querySelector(sel); if(!e)return false;
        var r=e.getBoundingClientRect(); var cs=getComputedStyle(e);
        return cs.visibility!=='hidden' && r.right>4 && r.left<innerWidth-4;}
      function why(sel){var e=document.querySelector(sel);var cs=getComputedStyle(e);
        var r=e.getBoundingClientRect();return cs.visibility+' L'+Math.round(r.left)+' R'+Math.round(r.right);}
      // HUOM: `visibility` EI palaudu headlessissa luokan poiston jälkeen.
      // Sama ilmiö on mainissa (todennettu kontrollilla: stopAll() mainilla
      // jättää saman jäljen), ja PR#7:n omat muistiinpanot vahvistavat sen
      // Playwright-ajolla. Siksi palautussuunta todennetaan luokasta, ei
      // lasketusta tyylistä; visuaalinen tarkistus on manuaalilistalla.
      function panelsReleased(){ return !document.body.classList.contains('focus-mode'); }
      var bb=document.getElementById('break-banner');
      var eh=document.getElementById('eise-handle');
      var steps=[];
      function step(fn){steps.push(fn);}

      step(function(){
        ok('idle: panels visible', panelOnScreen('.tcg-left')&&panelOnScreen('.tcg-right'), why('.tcg-left'));
        toggleTimer();
      });
      step(function(){
        ok('work: panels HIDDEN', !panelOnScreen('.tcg-left')&&!panelOnScreen('.tcg-right'), why('.tcg-left'));
        ok('work: handle hidden', eh.classList.contains('eise-handle--hidden'));
        tleft=0; onPhaseEnd();                      // work -> sbrk
      });
      step(function(){
        ok('sbrk: phase', phase==='sbrk', phase);
        ok('sbrk: banner on', bb.classList.contains('on'));
        ok('sbrk: panels still hidden (still focused)', !panelOnScreen('.tcg-left'), why('.tcg-left'));
        ok('sbrk: handle back', !eh.classList.contains('eise-handle--hidden'));
        ok('sbrk: peek NOT auto-open', !_eisePeekOpen);
        tleft=0; onPhaseEnd();                      // sbrk -> work (break over, timer stops)
      });
      step(function(){
        ok('BREAK OVER: tmr stopped', !tmr);
        ok('BREAK OVER: focus-mode released (panels un-hidden)', panelsReleased(), 'body="'+document.body.className+'"');
        ok('BREAK OVER: banner hidden', !bb.classList.contains('on'));
        ok('BREAK OVER: handle visible', !eh.classList.contains('eise-handle--hidden'));
        // long break + stop mid-break
        pomoDone=3; phase='work'; toggleTimer();
      });
      step(function(){
        tleft=0; onPhaseEnd();                      // -> lbrk
        ok('lbrk: phase', phase==='lbrk', phase);
        ok('lbrk: banner on', bb.classList.contains('on'));
        stopAll();
      });
      step(function(){
        ok('STOP mid-break: phase idle', phase==='idle', phase);
        ok('STOP mid-break: banner hidden', !bb.classList.contains('on'));
        ok('STOP mid-break: focus-mode released', panelsReleased(), 'body="'+document.body.className+'"');
        ok('STOP mid-break: handle visible', !eh.classList.contains('eise-handle--hidden'));
      });
      // banner survives render()
      step(function(){
        phase='sbrk'; _syncTimerUI(); render();
        ok('banner survives render()', !!document.getElementById('break-banner'));
        ok('banner still inside #arena', document.getElementById('break-banner').parentElement.id==='arena',
           document.getElementById('break-banner').parentElement.id);
      });

      (function next(i){
        if(i>=steps.length){
          document.documentElement.setAttribute('data-probe','PROBE'+JSON.stringify(RESULTS)+'ENDPROBE');
          return;
        }
        try{ steps[i](); }catch(e){ ok('step'+i+' threw', false, e && (e.stack||e.message||e)); }
        setTimeout(function(){ next(i+1); }, 700);
      })(0);
      return;
