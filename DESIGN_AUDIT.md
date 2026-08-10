# Design/animaatioauditointi — Fokus A Priori

**Tehty:** 2026-08-10
**Menetelmä:** [emil-design-eng](https://animations.dev/) -viitekehys (Emil Kowalski) sovellettuna kaikkiin kolmeen tiedostoon erikseen (index.html, aamu.html, swipe.html).
**Tila:** Vain analyysi + korjausehdotukset. **Ei koodimuutoksia tehty** — tämä PR on hyväksyttäväksi/kommentoitavaksi ennen toteutusta.

## Miten lukea tätä

Jokainen taulukko: `Rivi(t) | Ongelma | Before | After | Why | Vakavuus`. Vakavuus on kolmiportainen (matala/keski/korkea) ja tarkoittaa käyttäjälle näkyvää vaikutusta, ei koodin siistiyttä. **Korkea** = toiminto on rikki tai selvästi häiritsevä jollain laitteella/tilanteessa, ei vain "tuntuisi paremmalta".

Rivinumerot ovat tämän commitin (`main`) mukaisia ja liikkuvat ajan myötä — hae funktion/luokan nimellä jos numero ei enää täsmää.

**Ei liputettu uudelleen** (jo tunnistettuja ja hyväksyttyjä tietoisia päätöksiä, ks. CLAUDE.md): `--ease-out-back`-bounce TCG-korteille, aurinkoteeman `.eise-card:hover`-varjo, `data-perf="lite"`-nollaus, olemassa oleva `prefers-reduced-motion`-tuki index.html:ssä ja aamu.html:ssä.

---

## Yhteenveto koko koodikannasta

Kolme tiedostoa ovat kolmella eri kypsyystasolla:

- **index.html** — animaatiopohja (tokenit, easing, reduced-motion, perf-lite) on hyvin rakennettu. Jäljellä olevat ongelmat ovat systeemisiä toistoja: hover-säännöt ilman kosketusvartiota, epätasainen `:active`-palaute, muutama `ease-in`-jäänne.
- **aamu.html** — ei kaadu, mutta rakenteellinen vika toistuu kolmesti: näkymät/kortit rakennetaan `innerHTML=''`-tuholla joka klikkauksella, jolloin CSS:ään kirjoitetut transitiot eivät koskaan pääse ajamaan. Ei custom easingiä, ei perf-lite-tukea.
- **swipe.html** — koko tiedoston ydintoiminto (swipe-ele) on toteutettu ilman nopeuslaskentaa, pointer capturea tai multi-touch-suojaa. Lisäksi todellinen muistivuoto: `document`-tason `mousemove`/`mouseup`-kuuntelijat kertyvät jokaisella kortinvaihdolla eikä niitä koskaan poisteta.

**Suurimmat yksittäiset löydökset (korkea vakavuus, toiminnallisia — eivät vain viimeistelyä):**

1. `index.html`: Tehdyt-modaalin Palauta/×-napit ja Eisenhower-peekin pikakuittausnappi avautuvat vain `:hover`illa — kosketuslaitteella tavoittamattomissa.
2. `index.html`: mobiilin käsihyllyn kortit perivät desktop-hover-säännön (`!important`, 52px translateY) — napautus voi laukaista sen vahingossa juuri ennen `promoteToHand`-siirtoa.
3. `swipe.html`: `document.addEventListener('mousemove'/'mouseup', …)` rekisteröidään uudelleen joka kortilla, ei koskaan poisteta — kertyvä muistivuoto pitkässä selaussessiossa.
4. `swipe.html`: drag-ele on pelkkä 80px-etäisyyskynnys ilman nopeuslaskentaa — nopea lyhyt "flick" ei laukea, vaikka käyttäjän aikomus on selvä.
5. `swipe.html`: muokkauspaneeli (bottom sheet) vaihtaa `display:none↔flex` ilman mitään siirtymää — ainoa modaalimainen pinta tiedostossa, ja sillä on nolla animaatiota.
6. `aamu.html`: neljän vaiheen velho vaihtaa näkymää `display:none/flex`-togglella ilman transitiota; Q1/Q2/sammakko-valinnat rakentavat listan `innerHTML=''`:llä joka klikkauksella, joten niihin kirjoitetut CSS-transitiot ovat kuollutta koodia.

---

## index.html

Perusteellinen läpikäynti: `transition`, `@keyframes`, `animation:`, `:hover`, `:active`, `transform-origin`, `ease-in`, `scale(0`, kosketus-/pointer-tapahtumat, `clip-path`, `blur`.

### Napit / painalluspalaute

| Rivi(t) | Ongelma | Before | After | Why | Vakavuus |
|---|---|---|---|---|---|
| 405–406, 445–446, 2207–2208, 2773–2789, 5015–5016, 5103–5105 | `.eise-close`, `.eise-move-item`, `.modal-hdr__close`, `.turn-card__remove/__edit`, `.eise-peek-q-btn`, `.verb-pop button` — ei `:active`-tilaa | `.eise-close{...transition:color .15s,background .15s}` (ei active) | `.eise-close:active{transform:scale(.94)}` | Sama Solidius-malli on jo käytössä `.tcg-card`/`.turn-card`-korteille, mutta ei näille yleisille napeille | keski |
| 270–271, 296–297 | `.qbtn`, `.hud-quad` — vain `:hover`, ei `:active` | `.qbtn:hover{border-color:var(--pomo)}` | + `.qbtn:active{transform:scale(.92)}` | Pieniä ikoninappeja käytetään usein — puuttuva painallustila korostuu juuri toistuvassa käytössä | keski |
| 3254–3274 | `.pika-btn` (2 min -pikatehtävälista) — ei `:active` | `.pika-btn:hover{...}` | + `:active{transform:scale(.97)}` | Systeeminen puute, ei yksittäistapaus | matala |
| 2107–2124 | `.ham-row` — hampurilaisvalikon rivit, vain `:hover{background}` | `.ham-row:hover{background:var(--surface)}` | + `:active{background:var(--surface-strong)}` | Mobiilin päävalikko (bottom sheet) nojaa kosketukseen — hover ei koskaan laukea siellä, `:active` on ainoa luotettava palaute | keski |

### Hover-tilat kosketuslaitteilla — funktionaalinen, ei vain kosmeettinen

| Rivi(t) | Ongelma | Before | After | Why | Vakavuus |
|---|---|---|---|---|---|
| 276–279, 10205–10213 | `.tact-wrap`/`.tact` (Tehdyt-modaalin Palauta/×-napit) avautuvat **vain** `:hover`illa; ei click-togglea. `grid-template-rows:0fr`+`overflow:hidden` = nollakorkeus levossa | `.card:hover .tact-wrap{grid-template-rows:1fr}` | Lisää tap-toggle: `.card.tact-open .tact-wrap{grid-template-rows:1fr}` + JS-klikkauskuuntelija | Kosketuslaitteella napit ovat tavoittamattomissa — käyttäjä ei voi palauttaa/poistaa valmiita tehtäviä. Rikki toiminto, ei animaatiomaku | **korkea** |
| 393–394 | `.qdnb` (Eisenhower-peekin "Tehty"-pikanappi) `opacity:0` levossa, paljastuu vain `.qti:hover`illa | `.qdnb{opacity:0}` `.qti:hover .qdnb{opacity:1}` | Sama tap-toggle-korjaus | `#eise-peek` on dokumentoidusti mobiilikäytössä — pikakuittaus ei toimi siellä ilman hoveria | **korkea** |
| koko tiedosto | Yksikään `:hover`-sääntö ei ole `@media (hover:hover) and (pointer:fine)`-suojattu | `.card:hover{transform:scale(1.02) translateY(-2px)}` (globaali) | `@media (hover:hover) and (pointer:fine){ .card:hover{...} }` | Kosketus laukaisee `:hover`in napautuksella ja se voi jäädä "jumiin" kunnes käyttäjä napauttaa muualle | keski |
| 3007–3013 | `.tcg-card--hand:hover{transform:translateY(-52px) scale(1.1) ... !important}` ei ole `min-width:900px`-lohkon sisällä → koskee myös mobiilin käsihyllyä, jolla ei ole vaimennusta | (kuten yllä) | Sama `(hover:hover) and (pointer:fine)`-suojaus, tai `html.is-mobile .tcg-card--hand:hover{transform:none}` | Napautus mobiilin käsihyllyssä voi laukaista 52px:n `!important`-lennon juuri ennen `promoteToHand`-siirtoa | **korkea** |

### Popoverit / valikot ilman siirtymää

| Rivi(t) | Ongelma | Before | After | Why | Vakavuus |
|---|---|---|---|---|---|
| 5101–5105, 12390 | `#verb-pop` vaihtaa `display:none`↔`grid`illä, ei transitiota | `.verb-pop{display:none}` `.verb-pop.on{display:grid}` | `.verb-pop{opacity:0;transform:scale(.95);transition:opacity 150ms var(--ease-out),transform 150ms var(--ease-out)}` | Popoverin pitäisi skaalautua triggeristä, ei ilmestyä hypähtäen | keski |
| 444, 5935 | `.eise-move-menu` — JS luo/poistaa DOM-noden suoraan, ei opacity/scale-siirtymää | `menu.className='eise-move-menu'` | Alkutila `opacity:0;transform:scale(.95)` + `.on`-luokka `requestAnimationFrame`illa | Pieni kontekstivalikko hyötyy 125–200ms scale-in:stä triggerin kohdalta | matala |

### Drag / swipe (areenakortin kosketuseleet)

| Rivi(t) | Ongelma | Before | After | Why | Vakavuus |
|---|---|---|---|---|---|
| 11239–11305 | Oikea=Tehty/vasen=Odottaa/ylös=Seuraava laukeavat vain matkakynnyksestä (`THRESH=80`), ei nopeudesta | `if(dir==='x'&&dx>THRESH)fired='done';` | `velocity=Math.abs(dx)/elapsedTime; if(dx>THRESH||velocity>0.11)fired='done';` | Nopea, päättäväinen pyyhkäisy alle 80px:n matkalla ei laukaise mitään | keski |

### Kestot / easing

| Rivi(t) | Ongelma | Before | After | Why | Vakavuus |
|---|---|---|---|---|---|
| 133, 812, 9928 | `--ease-in` käytössä `.card-exiting`- ja FLIP-poistuvien rivien siirtymissä | `.card-exiting{animation:card-exit .4s ease-in both}` | `ease-out` tai `--ease-in-out` | Älä käytä ease-iniä UI:ssa edes poistumisessa — hidas alku tuntuu jumittavalta | matala |
| 483 | `.notif`-toast: `transition:opacity .3s,transform .3s ease-out` — opacitylle ei eksplisiittistä easingiä | (kuten rivillä) | `transition:opacity .3s var(--ease-out),transform .3s var(--ease-out)` | Kaksi samanaikaista ominaisuutta eri käyrillä voi näyttää epäsynkroniselta | matala |

### Suorituskyky

| Rivi(t) | Ongelma | Before | After | Why | Vakavuus |
|---|---|---|---|---|---|
| 3443–3448, 3482–3483 | `.pbox--arena` transitioi `padding`/`margin-bottom`/`gap`/`font-size` — kaikki layoutin laukaisevia | `transition:padding .25s ease,margin-bottom .25s ease,...` | `transform:scale()` yhdellä wrapperilla, tai hyväksy tietoisena poikkeuksena (harvoin laukeava) | Näiden animointi pakottaa layout+paint joka framella GPU-only-reitin sijaan — juuri MacBook Pro 2010 -kohderyhmällä ero näkyy eniten | keski |
| 264, 10203 | `.card{will-change:transform}` pysyvästi päällä jokaisella Tehdyt-modaalin rivillä | `.card{...will-change:transform}` | Lisää JS:llä vain `pointerenter`/`pointerdown`-hetkellä, poista `pointerleave`/`pointerup`illa | Pysyvä `will-change` pitää kompositointikerroksen turhaan muistissa isossa listassa | matala |

---

## aamu.html

`prefers-reduced-motion`-tuki on olemassa (rivit 397–399), mutta ei `data-perf="lite"`-tukea eikä yhtään custom easing -käyrää.

### Puuttuvat siirtymät (wizard-tason)

| Rivi(t) | Ongelma | Before | After | Why | Vakavuus |
|---|---|---|---|---|---|
| 107–113, 710–715, 757–765, 823–830 | Vaiheiden väliset näkymänvaihdot (`.screen`↔`.screen.active`) eivät animoi — pelkkä `display:none`→`flex` | `.screen{display:none} .screen.active{display:flex}` | `.screen{display:none;opacity:0} .screen.active{display:flex;opacity:1;transition:opacity 200ms ease-out}` | 4-vaiheinen velho nähdään kerran per käyttökerta — ansaitsee standard-animaation, elementit jotka ilmestyvät ilman transitiota tuntuvat rikkinäisiltä | korkea |
| 657–689 (`renderQ1`) | Q1-korttien vaihto tuhoaa ja luo kortin uudelleen `innerHTML=''`:llä — sisältö vaihtuu jarrutta | `area.innerHTML=''; area.appendChild(card);` | Fade/slide-crossfade uudelle kortille (`opacity 0→1` + `translateX(4px)→0`, 150ms ease-out) | Useita tehtäviä käydään läpi peräkkäin — ilman siirtymää sisältö "hyppää" | keski |

### Kuollut CSS — transition ei koskaan laukea

| Rivi(t) | Ongelma | Before | After | Why | Vakavuus |
|---|---|---|---|---|---|
| 169–191, 718–755 (`renderQ2`/`toggleQ2`) | `.q2-task`/`.q2-check`-transitionit kirjoitettu, mutta `renderQ2()` tekee `innerHTML=''` ja luo rivit uudelleen jokaisella klikkauksella → uusi elementti syntyy suoraan lopputilassa | `area.innerHTML=...; ...` joka `toggleQ2`-kutsulla | Päivitä vain kosketetun rivin `classList.toggle('selected', sel)`, jätä muut nodet koskematta | Sama juurisyy kuin monessa muussa tämän koodikannan bugissa: innerHTML-kloonaus pudottaa tilan | korkea |
| 204–222, 788–821 (`renderFrog`/`selectFrog`) | Sama vika sammakkokorteissa — `frogArea` tyhjennetään ja rakennetaan uudelleen joka klikkauksella | `area.innerHTML=''; cands.forEach(...)` | Toggle `classList` olemassa olevilla node-viittauksilla; tallenna `id→node`-mappi | Valinnan `box-shadow`-ilmestyminen on aina hyppäys, ei koskaan pehmeä | keski |

### Hover ilman kosketusvartiota

| Rivi(t) | Ongelma | Before | After | Why | Vakavuus |
|---|---|---|---|---|---|
| 156, 212, 290, 303, 366, 375 | `.ca-btn`, `.frog-card`, `.si-rm`, `.sp-btn`, `.btn-main`, `.btn-ghost` — ei `(hover:hover) and (pointer:fine)`-vartiota | `.frog-card:hover{border-color:var(--accent);transform:translateY(-1px);}` | `@media (hover:hover) and (pointer:fine){ .frog-card:hover{...} }` | Popup avataan myös mobiilissa samaan välilehteen — kosketuksella `:hover` jää jumiin napautuksen jälkeen | keski |

### Puuttuva easing-standardi

| Rivi(t) | Ongelma | Before | After | Why | Vakavuus |
|---|---|---|---|---|---|
| 14–22, 96, 150, 173, 185, 208, 300, 364, 373 | Ei yhtään custom easing -tokenia — kaikki transitionit jättävät timing functionin pois | `transition:filter .15s,transform .15s;` | `:root{--ease-out:cubic-bezier(.23,1,.32,1)} .ca-btn{transition:filter 150ms var(--ease),transform 150ms var(--ease-out)}` | index.html:ssä on jo `--ease-out-back`; tämä popup ei jaa easing-standardia sen kanssa | matala |

### Puuttuva/epätasainen paina-palaute

| Rivi(t) | Ongelma | Before | After | Why | Vakavuus |
|---|---|---|---|---|---|
| 296–304 (`.sp-btn`) | Toistuvasti klikattava aikataulunappi ei saa `:active`-tilaa | `.sp-btn:hover{...}` (ei active) | `.sp-btn:active{transform:scale(.96)}` + `transition:transform 120ms ease-out` | Ilman painopalautetta käyttäjä ei saa vahvistusta ennen listan muutosta | matala |
| 285–290 (`.si-rm`) | Poista-nappi vaihtaa väriä hoverissa ilman `transition`-määritystä | `.si-rm:hover{color:var(--pomo);}` | `.si-rm{transition:color 120ms ease}` | Epäjohdonmukainen muiden nappien kanssa | matala |
| 383–389 (`.back-btn`) | `:active`-tausta ilmestyy/katoaa ilman transitiota | `.back-btn:active{background:rgba(0,0,0,.06)}` | `.back-btn{transition:background 120ms ease}` | Epäjohdonmukainen paina-tuntuma samassa napistossa | matala |

### Reduced-motion ja perf-tila

| Rivi(t) | Ongelma | Before | After | Why | Vakavuus |
|---|---|---|---|---|---|
| 397–399 | `prefers-reduced-motion` nollaa myös opasiteettisiirtymät kokonaan | `*,*::before,*::after{transition-duration:.01ms!important}` | Jätä `opacity`-transitiot, nollaa vain `transform`-pohjaiset | "Reduced motion means fewer and gentler animations, not zero" | matala |
| koko tiedosto | `data-perf="lite"`-tukea ei ole ollenkaan | — | Lisää sama periaate kuin index.html:ssä | Rikkoo arkkitehtuurin johdonmukaisuuden (data-perf pitäisi kattaa kaikki tiedostot) | matala |

---

## swipe.html

Drag-toteutus (`setupDrag`, rivit 533–559) on koko tiedoston ydin ja saa oman pääotsikkonsa.

### Drag-toteutus

| Rivi(t) | Ongelma | Before | After | Why | Vakavuus |
|---|---|---|---|---|---|
| 546–552 | Ei nopeuslaskentaa — pelkkä 80px-etäisyyskynnys | `if(curX>80)swipeRight();else if(curX<-80)swipeLeft();` | Tallenna `dragStartTime`; `onEnd`issa `v=Math.abs(curX)/(Date.now()-dragStartTime); if(Math.abs(curX)>=80||v>0.11) …` | Nopea, lyhyt flick ei koskaan laukea vaikka aikomus on selvä | korkea |
| 533–559 | Ei pointer capturea — erilliset touch/mouse-kuuntelijat Pointer Eventsin sijaan | `wrap.addEventListener('touchstart',onStart,...); wrap.addEventListener('mousedown',onStart);` | `wrap.addEventListener('pointerdown',onStart); wrap.setPointerCapture(e.pointerId);` | Pointer capture takaa vedon jatkumisen vaikka sormi livahtaa kortin ulkopuolelle | korkea |
| 536, 546 | Ei multi-touch-suojaa — `onStart` resetoi `startX`in myös toisen sormen koskettaessa | `function onStart(e){dragging=true;startX=...}` | `function onStart(e){if(dragging)return; if(e.touches&&e.touches.length>1)return; ...}` | Toinen sormi ruudulla resetoi vetopisteen kesken vedon → kortti nykäisee | keski |
| 556–558 | **Kuuntelijavuoto:** `document.addEventListener('mousemove'/'mouseup', ...)` lisätään joka `renderStack()`-kutsulla, ei koskaan poisteta | (kuten rivillä) | Poista edellisen kortin kuuntelijat ennen uuden lisäämistä, tai siirrä kuuntelijat `wrap`iin jotta ne kuolevat noden mukana | Jokainen selattu tehtävä lisää pysyvästi kaksi `document`-kuuntelijaa — pitkässä sessiossa todellinen suorituskykyongelma | korkea |
| 540 | Rotaatio ei ole rajattu — `curX*0.07` kasvaa lineaarisesti loputtomiin | `rotate('+(curX*0.07)+'deg)` | `rot=Math.max(-20,Math.min(20,curX*0.07))` | Pehmeä yläraja (friktio kovan stopin sijaan) | matala |
| 542–544 | Tint-opacity kulkee `.1s`-transitiolla samaan aikaan kun `transform` seuraa sormea 1:1 ilman transitiota | `.tint{transition:opacity .1s}` | Poista transition tint-luokasta vedon ajaksi | Sijainti ja värivihje reagoivat sormeen eri viiveellä | matala |
| — | Ei friktiota/dampingia epäonnistuneen vedon paluulle — sama 300ms-käyrä kuin poistoanimaatiolla | `wrap.classList.add('animating');wrap.style.transform='';` | Nopeampi paluu (esim. 180ms) epäonnistuneelle vedolle | Käyttäjä perui — järjestelmän pitäisi vastata nopeasti | matala |

### Pinon eteneminen

| Rivi(t) | Ongelma | Before | After | Why | Vakavuus |
|---|---|---|---|---|---|
| 525–531, 362–367 | Poistoanimaation (300ms) jälkeen koko pino rakennetaan uudelleen `innerHTML`-tyhjennyksellä ilman transitiota — taustakortin nousu tapahtuu hyppäyksenä | `setTimeout(function(){idx++;renderStack();...},300);` → `stack.innerHTML='';` | Säilytä olemassa olevat shadow-cardit DOM:issa, animoi niiden scale/opacity-siirtymä (.15–.2s ease-out) ennen uuden kortin lisäämistä taakse | Käyttäjä näkee tämän hyppäyksen jokaisella pyyhkäisyllä | korkea |
| 34 | `.progress-fill{transition:width .3s ease}` animoi layout-laukaisevaa `width`ia | `transition:width .3s ease` | `transform:scaleX(pct)` + `transform-origin:left` + `transition:transform .3s ease-out` | Vain `transform`/`opacity` ohittavat layoutin | matala |

### Tilanvaihdot ilman transitiota

| Rivi(t) | Ongelma | Before | After | Why | Vakavuus |
|---|---|---|---|---|---|
| 218, 428, 449 | Muokkauspaneeli (bottom sheet) vaihtaa `display:none↔flex` suoraan — ei sisään-/ulostuloanimaatiota, backdrop ilmestyy hyppäyksenä | `#edit-panel.style.display='flex'/'none'` | CSS: `#edit-panel{opacity:0;pointer-events:none;transition:opacity .2s ease-out} .on{opacity:1;pointer-events:auto}` + sisäkkäre `translateY(100%)→0` | Ainoa modaalimainen pinta tiedostossa, ja sillä on nolla animaatiota | korkea |

### Hover ilman kosketussuojaa

| Rivi(t) | Ongelma | Before | After | Why | Vakavuus |
|---|---|---|---|---|---|
| 20, 60, 78, 85 | `.act-btn:hover{transform:scale(1.08)}`, `.time-opt`, `.done-btn`, `.qp-rm` — ei kosketusvartiota koko tiedostossa | `.act-btn:hover{transform:scale(1.08)}` | `@media(hover:hover) and (pointer:fine){...}` | Kosketusnäytöllä `:hover` laukeaa napautuksesta ja jää päälle — nimenomaan swipe/kosketus-UI | keski |

### Näppäinoikopolut animoituna

| Rivi(t) | Ongelma | Before | After | Why | Vakavuus |
|---|---|---|---|---|---|
| 561–571, 507–531 | `ArrowRight/ArrowLeft/d/a/f` laukaisevat saman 300ms-lentoanimaation kuin sormivedolla | `if(e.key==='ArrowRight'\|\|e.key==='d')swipeRight();` → 300ms | Lyhyempi/nolla-animaatio näppäinpolulle (esim. 100–120ms) | "Never animate keyboard-initiated actions" — toistuva pikanäppäinkäyttö tuntuu hitaalta | keski |

### Perf-tila ja reduced-motion

| Rivi(t) | Ongelma | Before | After | Why | Vakavuus |
|---|---|---|---|---|---|
| — | `data-perf="lite"` / `fap_perf`-tuki puuttuu kokonaan | ei mitään | Sama periaate kuin index.html:ssä + `fap_perf`-luku käynnistyksessä | Heikkotehoisella koneella swipe-kortin animaatiot voivat nykiä vaikka nopea tila on päällä | keski |
| 148–150 | `prefers-reduced-motion` on olemassa ja kattaa oikein `*,*::before,*::after` | — | — (ei löydös, mainittu kontrastina) | — | — |

### Painikepalaute (pienet puutteet)

| Rivi(t) | Ongelma | Before | After | Why | Vakavuus |
|---|---|---|---|---|---|
| 407–411, 493 | "✎ Muokkaa" ja `.qp-rm` (poista jonosta) eivät saa `:active`-palautetta, vaikka muut napit saavat | ei `:active`-sääntöä | `:active{transform:scale(.93)}` | Epäjohdonmukainen — osa napeista tuntuu kuuntelevan kosketusta, osa ei | matala |
| 39 | `cursor:grab` ei vaihdu `grabbing`iksi vedon ajaksi | `.card-wrap{cursor:grab}` | JS: `wrap.style.cursor='grabbing'` `onStart`issa, `'grab'` `onEnd`issa | Odotettu hiiripohjaisen vedon signaali | matala |
| 40 | Poistoanimaation käyrä `cubic-bezier(.4,0,.2,1)` (Material-standardi) eikä vahva ease-out | `transition:transform .3s cubic-bezier(.4,0,.2,1)` | `transition:transform .3s var(--ease-out)` | Nykyinen käyrä on lattea, ei anna yhtä napakkaa tuntumaa | matala |

---

## Ehdotettu toteutusjärjestys

1. **Korkeat, toiminnalliset ensin** (rikki kosketuslaitteella tai muistivuoto): index.html tap-toggle Tehdyt/peek-napit + mobiilihover-korjaus, swipe.html kuuntelijavuoto + pointer capture + velocity-kynnys + muokkauspaneelin transitio, aamu.html innerHTML-uudelleenrakennus (Q1/Q2/sammakko) → korvaa classList-toggleilla jotta olemassa olevat CSS-transitiot alkavat toimia.
2. **Keski**: hover-guardit kaikkiin kolmeen tiedostoon (`(hover:hover) and (pointer:fine)`), `:active`-palaute puuttuvissa napeissa, aamu.html:n wizard-vaiheiden siirtymä, swipe.html:n pinon crossfade ja näppäinoikopolkujen animaationopeutus.
3. **Matala**: `ease-in`→`ease-out`-vaihdot, easing-tokenien lisäys aamu.html:ään, `will-change`-siivous, pienet epäjohdonmukaisuudet (`cursor:grabbing`, transition-käyrien yhtenäistäminen).

Jokainen kohta on itsenäinen — ei riippuvuuksia toisiinsa. Voidaan toteuttaa yksi kerrallaan omana committinaan.
