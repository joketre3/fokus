# PR-testaus ja merge-prosessi (2026-08-08)

Läpikäynti kaikista avoimista PR:istä, niiden testeistä ja `.md`-tiedostojen
tekemättömistä testilistoista. Automaattiset testit on **ajettu** (ks.
`tests/`); manuaalilistalla on vain se, mitä headless ei pysty todentamaan.

---

## 1. Yhteenveto: avoimet PR:t

| PR | Otsikko | Kanta | Merge mainiin | Automaattitestit | Suositus |
|---|---|---|---|---|---|
| [#8](https://github.com/joketre3/fokus/pull/8) | 2 min -sääntö, 1-3-5, keskeytysparkki | ajan tasalla | **puhdas** | 55/56 | Korjaa 1 bugi → merge **ensin** |
| [#7](https://github.com/joketre3/fokus/pull/7) | Fokustila päättyy tauon loppuessa | ajan tasalla | puhdas mainiin, **CLAUDE.md-konflikti #8:n jälkeen** | 20/20 | Merge #8:n jälkeen |
| [#6](https://github.com/joketre3/fokus/pull/6) | Aurinkoteeman värinäkyvyys | ajan tasalla | puhdas mainiin, **1 hunk konflikti #7:n kanssa** | kontrastimittaus ✅ | Merge viimeisenä |
| [#5](https://github.com/joketre3/fokus/pull/5) | Käsiviuhkan vaihtoehdot | 3 mergeä jäljessä | **konflikti** (1 + 3 hunkia) | — | Odota: vaatii Jaakon designvalinnan |
| [#2](https://github.com/joketre3/fokus/pull/2) | Firebase-integraatiosuunnitelma | **orpo historia** | ei yhteistä kantaa | — | **Poimi 2 doc-tiedostoa, sulje PR** |
| [#1](https://github.com/joketre3/fokus/pull/1) | obra/superpowers skills | **orpo historia** | ei yhteistä kantaa | — | **Sulje** |

`#1` ja `#2` haarautuvat commitista `6b80127`, joka ei ole nykyisen `main`in
esi-isä. Niiden `index.html` on 907 kt (nykyinen: 571 kt) eli edeltää
taustakuvien poistoa ja koko yhtenäistä näkymää. **Niitä ei voi mergetä** —
koodi valuisi kuukausia taaksepäin.

---

## 2. Löydetyt bugit

### 🔴 BLOKKAA MERGEN — PR #8: pikatehtäväksi muutettu sammakko jää sammakoksi

`saveEditModal()` (`index.html`, "// Sammakko" -lohko) nollaa `t.frog`in
pika-haarassa, mutta heti perässä oleva `t.frog=wantFrog;` kirjoittaa sen
takaisin:

```js
if(isQuick(t)){
  ...
  t.frog=false;              // ← tämä
}
var wantFrog=document.getElementById('edit-frog').classList.contains('on');
if(wantFrog&&!t.frog){tasks.forEach(function(x){x.frog=false;});}
t.frog=wantFrog;             // ← kumoutuu tässä
```

**Seuraus:** kun sammakko muutetaan arviolla 0 pikatehtäväksi, se poistuu
areenalta, jonosta ja kädestä (pikatehtäviä suodatetaan kaikkialta) mutta jää
päivän sammakoksi. Päivän tärkein tehtävä katoaa näkyvistä ja on
tavoitettavissa vain pikanipusta — silti 🐸-merkittynä.

**Korjaus** (yksi rivi, `t.frog=wantFrog;` → ):
```js
t.frog = wantFrog && !isQuick(t);
```

Testi on jo olemassa: `tests/suites/habits.js` → `demote: frog cleared`.

### 🟡 EI BLOKKAA — PR #8: pikatehtävä voi jäädä haamuksi jonoon

`promoteToHand()` (↑-nappi matriisissa) ei suodata pikatehtäviä, mutta
`renderTurnPanel()` suodattaa. Todennettu: `turn=[2,3,7]` → lista näyttää 2
riviä, `turn-count` näyttää 2, mutta `turn.length` on 3.

Näkyvä oire on lievä (tehtävä nousee areenalle kun jono tyhjenee, ja on siellä
näkyvissä), joten tämä voi mennä seuraavaan kierrokseen. Korjaus olisi
`promoteToHand`in alkuun `if(isQuick(t)){ openPikaModal(); return; }`.

### 🟡 EI BLOKKAA — PR #8: `.pika-btn` kontrasti aurinkoteemassa

Uusi pikanappi käyttää `color:var(--muted)` tummalla well-paneelilla eikä sillä
ole aurinko-ylikirjoitusta. Kontrastisondi antaa 2,2:1, mutta elementti on
gradienttitaustalla → sondin tiedossa oleva väärä positiivi. **Tarkista
silmällä** aurinkoteemassa (manuaalitesti M6).

---

## 3. Merge-järjestys ja konfliktien ratkaisut

Testattu käytännössä: kaikki neljä järjestystä kokeiltiin, tämä on halvin.

### Vaihe 1 — PR #8 (puhdas)
```bash
git checkout main && git pull
git merge --no-edit origin/claude/integrointi-fokukseen-nue1ri
```
Ei konflikteja. **Korjaa ensin `t.frog` -bugi** (yllä) joko PR-haaralle tai
merge-commitin päälle.

### Vaihe 2 — PR #7 (1 konflikti: `CLAUDE.md`)
```bash
git merge --no-edit origin/claude/sidebars-hidden-break-4tx99c
```
Yksi hunk, molemmat puolet ovat **puhtaita lisäyksiä** samaan kohtaan
(`### Tuottavuustavat…` vs `### Fokustila + taukokehotus…`).
**Ratkaisu: säilytä molemmat osiot peräkkäin.**

### Vaihe 3 — PR #6 (2 konfliktia: `CLAUDE.md` + `index.html`)
```bash
git merge --no-edit origin/claude/aurinko-theme-color-visibility-a8uezb
```
- `CLAUDE.md`: taas kaksi lisäystä samaan kohtaan → **säilytä molemmat.**
- `index.html`: yksi 3-rivinen hunk, `.eise-peek-sub`.
  **Ratkaisu: ota PR #6:n `--faint` perussääntöön ja säilytä PR #7:n
  `--break`-muunnelma:**
  ```css
  .eise-peek-sub{font-size:var(--text-xs);color:var(--faint);flex:1}
  /* Tauolla peek peittää koko areenan → taukokehotus tulee tähän */
  .eise-peek-sub--break{color:color-mix(in srgb, var(--brk-ink,#2980b9) 50%, var(--ink));font-size:.82rem;font-weight:500}
  ```

### Vaihe 4 — validointi ennen pushia
```bash
python3 -c "import re;open('/tmp/chk.js','w').write('\n;\n'.join(
  m.group(2) for m in re.finditer(r'<script([^>]*)>(.*?)</script>',
  open('index.html').read(), re.S) if 'src=' not in m.group(1)
  and not ('type=' in m.group(1) and 'module' in m.group(1))))"
node --check /tmp/chk.js

grep -o "^function [a-zA-Z_$][a-zA-Z0-9_$]*" index.html | sort | uniq -c | awk '$1>1'
python3 tests/run.py
```
Duplikaattitarkistus on pakollinen: rinnakkaishaarojen merge on tuonut ennenkin
saman funktion kahdesti. **Todennettu: tässä mergessä ei duplikaatteja.**

### Vaihe 5 — PR #5 myöhemmin
Vaatii rebasen `main`in päälle. Konfliktit:
- `index.html` 1 hunk: PR #5 palauttaa `#pb{position:sticky}` +
  `.card-new--arena/hand` -mobiilisäännöt, jotka `31f4bb8` poisti
  **duplikaattina**. → **ota HEAD (tyhjä), älä palauta.**
- `CLAUDE.md` 3 hunkia: lisäyksiä, säilytä molemmat puolet.

PR #5 on ennen kaikkea **designvalinta** (käsiviuhka B: pidetty viuhka, yksi
pivot). Se koskee samaa geometriaa kuin #7:n fokustila ja #8:n PAKKA-palkki, ja
`mockup-kasi.html` on olemassa vertailua varten. **Katso mockup ensin, päätä,
sitten rebase.**

### PR #2 — poimi dokumentit, sulje PR
`CLAUDE.md` viittaa kahteen tiedostoon joita **ei ole `main`issa**:
```bash
git checkout origin/claude/desktop-claude-reports-visibility-QtZMI -- \
  docs/strategia-kooste-2026-05.md docs/firebase-integraatio-suunnitelma.md
git commit -m "docs: palauta strategiakooste ja Firebase-suunnitelma"
```
Älä ota mitään muuta siitä haarasta. Sulje sen jälkeen PR #2 ja PR #1.

---

## 4. Testit — mikä on jo ajettu

Uusi `tests/`-hakemisto. Ajo: `python3 tests/run.py` (~3 min).

Kontrolli ajettu molempiin suuntiin: suite **läpäisee merge-tuloksen** ja
**kaatuu `main`iin** (19 väitettä), eli se todella mittaa muutoksia — mukaan
lukien PR #7:n korjaama bugi, joka näkyy `main`illa muodossa
`body="focus-mode eise-open"` tauon jälkeen.

| Suite | Väitteitä | Tulos merge-puussa |
|---|---|---|
| `smoke` | 6 | ✅ |
| `timer_break` (PR #7) | 20 | ✅ |
| `habits` (PR #8) | 56 | ⚠️ 55 — sammakkobugi |
| `regression` (CLAUDE.md-lista) | 12 | ✅ |
| `aamu` (PR #8) | 18 | ✅ |
| `aamu_skip` (CLAUDE.md T5) | 7 | ✅ |
| `swipe` (CLAUDE.md T4) | 16 | ✅ |

Lisäksi ajettu erikseen:

- **`_clearLocalAppData` yksikkötestinä Nodessa** (funktio on
  moduulinäkyvyydessä, ei tavoitettavissa sivun sisältä). Todennettu:
  `fap_theme`, `fap_perf`, `fap_onboarded`, `fap_timer_settings` säilyvät,
  kaikki `eis_v5*` ja muut `fap_*` (ml. **`fap_apikey`**) poistuvat, eikä
  indeksipohjaisessa iteroinnissa ole ohitusbugia.
- **WCAG-kontrastisondi** kaikille kolmelle teemalle (PR #6:n varsinainen
  tarkoitus). Jokaisen tekstisolmun väri + alfakompositoitu tausta:

  | Teema | main | PR #6 | merge |
  |---|---|---|---|
  | aurinko | 92 osumaa | **62** | 64 |
  | usva | 72 | **52** | 52 |
  | havu | 72 | **52** | 52 |

  Merge-puun 2 lisäosumaa aurinkoteemassa ovat PR #8:n uusi pikanappi, ja
  molemmat ovat gradienttitaustalla → sondin tiedossa oleva väärä positiivi.
  **PR #6 ei regressoi tummia teemoja — se parantaa niitäkin** (`--faint`
  tertiäärivärinä).
- **Syntaksitarkistus** (`node --check`) kaikille haaroille ja merge-tulokselle:
  `index.html`, `aamu.html`, `swipe.html` — kaikki läpi.

---

## 5. Manuaalitestit — mitä headless EI pysty todentamaan

Merkitse rasti kun testattu. Nämä ovat kaikki syitä joista on jo dokumentoitu
todiste, eivät varmuuden vuoksi -listaa.

### Firebase-riippuvaiset (ei mitenkään automatisoitavissa)
Näistä 2 on ollut **CLAUDE.md:ssä testaamattomana livenä 2026-07-28 alkaen.**

- [ ] **M1** Kirjaudu ulos → sivu latautuu uudelleen, tehtävät ja työtilat
      tyhjenevät, teema + ajastinasetukset säilyvät, API-avain katoaa
      *(avainten käsittely jo todennettu yksikkötestillä — jäljellä vain
      uloskirjautumispolun laukaisu)*
- [ ] **M2** Vaihda työtilaa kirjautuneena: muokkaa tehtävää → vaihda heti
      työtilaa → palaa takaisin. Muutos tallessa. Toisen laitteen muutos näkyy
      vaihdon jälkeenkin (kuuntelija kytkeytyi uudelleen)

### PR #7 — fokustila
- [ ] **M3** Käynnistä pomodoro, anna työjakson päättyä, **anna tauon päättyä
      loppuun asti** → sivupaneelit, käsi ja PAKKA tulevat takaisin ilman että
      ajastinta tarvitsee käynnistää ja pysäyttää
      *(`visibility` ei palaudu headlessissa — sama ilmiö on `main`issa, joten
      tämä on ainoa tapa nähdä se)*
- [ ] **M4** Taukobanneri näkyy areenassa eikä peitä kortin toimintonappeja
      mobiilissa (< 900 px), eikä hyppää desktopilla
- [ ] **M5** Avaa matriisi kesken tauon → taukokehotus näkyy otsikkorivillä

### PR #6 — aurinkoteema (PR:n oma lista, kaikki auki)
- [ ] **M6** Aurinko + Lisää tehtävä: verbinapit, kvadranttivalitsin,
      arviovalitsin ja placeholderit luettavia; **uusi pikanappi luettava**
- [ ] **M7** Aurinko + välilehdet: tekstit ja laskurimerkit näkyvissä
- [ ] **M8** Aurinko + verbi-popover (▾): vaalea paneeli, tumma teksti
- [ ] **M9** Aurinko + Ketju-paneeli: otsikko ja × näkyvissä
- [ ] **M10** Aurinko + ajastin-popup (↗): kellonumerot tummia vaalealla
- [ ] **M11** Usva & havu yleissilmäys: ennallaan, tyhjät tilat ja ×-napit
      aiempaa selvemmin näkyvissä
- [ ] **M12** Nopea tila (aurinko-lite): ei mudanväristä, pinnat opaakkeja

### PR #8 — tavat
- [ ] **M13** Keskeytysparkki mobiilissa: ajastinwidget kasvaa 45 → 80 px eikä
      valu reunan yli *(headless raportoi `innerWidth`in väärin — mittaus ei
      kelpaa)*
- [ ] **M14** Arviosliderin veto nollaan tuntuu luontevalta, ja "alle 2 min —
      tee heti" -selite vaihtuu

### Yleinen
- [ ] **M15** Impeccable-detektorin delta (`detect.mjs` on vain Jaakon koneella):
      odotus **0** eli sama 4 osumaa / 3 kategoriaa kuin baseline

---

## 6. Suositeltu eteneminen

1. Korjaa PR #8:n sammakkobugi → `python3 tests/run.py habits` → 56/56
2. Merge #8 → #7 → #6 yllä olevilla ratkaisuilla
3. `node --check` + duplikaattigrep + `python3 tests/run.py` → kaikki läpi
4. Aja manuaalilista M1–M15 selaimessa **ennen pushia** — koodi menee suoraan
   GitHub Pagesiin
5. Poimi PR #2:n kaksi dokumenttia, sulje PR #1 ja #2
6. PR #5 omana kierroksenaan designvalinnan jälkeen
