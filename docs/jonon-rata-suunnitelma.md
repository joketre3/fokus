# Tehtäväjonon näkyvyys — rata areenan lattialla

Haara: `claude/task-queue-visibility-ymx47m`

## Tila

| Osa | Tila |
|---|---|
| **A — `mockup-jono.html`** | ✅ **valmis työpuussa, committoimatta** (86 kt, `??` git statuksessa) |
| B — index.html | ⬜ odottaa mockup-porttia |
| C — koherenssikorjaukset | ⬜ ei aloitettu |

Seuraava askel: mockup committiin → **Jaakon katselmointi selaimessa** → variantin
valinta → Osa B. Osa C ei ole riippuvainen portista ja voi mennä ensin.

## Context

Kortin kulku on `Lisää tehtävä → Q → pakka/käsi → jono → areena`. Toiminnallisesti
tämä on oikein, mutta **visuaalinen lupaus ei vastaa toimintaa**: käsiviuhka lepää
areenakortin alapuolella, joten käsikortin napautus näyttää kortin lyömiseltä
areenalle. Todellisuudessa `promoteToHand` (index.html:9702) tekee `turn.push(id)`
aina kun areena on varattu, ja kortti katoaa 44px kiskon taakse oikeaan reunaan.
Ainoa palaute on toast ja hover-`title`.

Syy on rakenteellinen, ei kosmeettinen. Sovelluksella on kuusi vyöhykettä, joista
neljä on fyysisiä paikkoja pöydällä — **pakka** (palkki josta kortit nousevat),
**käsi** (viuhka pöydän alta), **areena** (3D-huone), **tehdyt** — ja kaksi on
tekstilistoja laatikossa: **tehtäväjono** ja **odottavat**. Ne kaksi jotka eivät
puhu korttikieltä ovat täsmälleen ne joista tämä työ kysyy.

Tavoite: tehtäväjono saa oman fyysisen paikkansa pöydällä — **rata areenan
lattialla** — ja kädestä lähtevä kortti näyttää minne se on menossa jo ennen
napautusta.

### Tutkimuslöydökset jotka muuttivat kysymyksenasettelua

**1. Käden järjestys luokan sisällä on lisäysjärjestys, ei matriisin järjestys.**
`buildHandQueue` (9636) järjestää ämpärit `q1+frog → q1 → q2+frog → q2`, mutta
ämpärin sisällä ei lajitella lainkaan — `inbox.filter` säilyttää `tasks`-taulukon
järjestyksen eli id-järjestyksen. Matriisi taas lajittelee `t.order`illa
(render() ~10140). **Kortin raahaaminen matriisissa ei vaikuta käden
järjestykseen** — kaksi eri totuutta samasta prioriteetista.

**2. Käden maksimi on kahdessa paikassa eri.** `buildHandQueue` palauttaa 7 ja
varoittaa `'Näkyvissä 7 / N pakotettua'`, mutta `renderHandBar` (9979) tekee
`.slice(0, 5)`. Varoitusteksti on väärä; 6. ja 7. tähtikortti katoavat äänettä.

**3. Tauko on jo nyt "tauko on tauko" — ei muutosta.** `_syncTimerUI` (8626)
asettaa `focus-mode = !!tmr`, ja `onPhaseEnd` kutsuu `startTmr()` myös tauolle,
joten `tmr` on tauolla ei-null → `body.focus-mode .tcg-left/.tcg-right` on
`visibility:hidden` (4837). Nykykäytös vastaa jo tehtyä päätöstä. **Taukopolkuun
ei kosketa**, ja rata perii saman säännön: näkyvissä vain kun `tmr === null`.

### Lukitut päätökset

| Kysymys | Päätös |
|---|---|
| Jonon paikka | **Rata lattialla** — kortit seisovat areenan lattialla, loittonevat perspektiivissä |
| Tauko | **Ei muutosta** — tauolla ei paljasteta mitään, banneri riittää |
| Siirtymän palaute | **Kohde reagoi** saapumisessa **+ kortti näyttää kohteensa etukäteen** hoverilla/fokuksella |
| Ei tehdä | Lentoanimaatiota; käsi→areena -käytöksen muutosta (jono = päivän sitoumus, 1-3-5 mittaa `active+turn`) |
| Työjärjestys | **Mockup ensin** hyväksyntäportiksi, kuten `mockup-yhtenainen.html` ja `mockup-poyta.html` |

---

## Osa A — `mockup-jono.html` ✅ valmis

Toteutunut sisältö: 3 varianttia · 3 teemaa · lite-kytkin · jonon pituus 0/1/3/5/8 ·
ajastintila · ennakkokorostuksen pakotus · **9 elävää geometrialiukua** + "Kopioi
tokenit" · URL-parametrit (`?v=v2&t=aurinko&n=5&lite=1&focus=1&ctl=0`) katselmointia
ja kuvakaappauksia varten. Lavaste (huone, kortti, kiskot, PAKKA-palkki, käsiviuhka)
poimittu `index.html`:stä sellaisenaan, jotta geometria mitataan oikeaa taustaa vasten.

**Todennettu headless-sondilla** (`scratchpad/probe.py`, siirtymät jäädytettynä):

| Väite | Tulos |
|---|---|
| `@property`-rekisteröinti invalidoi variantin vaihdon | ✅ transform-matriisit muuttuvat V1↔V2↔V3 |
| `--card-base` mitataan, ei arvata | ✅ 156px (oletus 188px olisi ollut 32px pielessä) |
| Rata ei törmää oikeaan kiskoon | ✅ 1920/1440/1280/1100 → väli 292/52/58/55px |
| `--lane-max` laskee kapeassa ikkunassa | ✅ 4 → 3 → 2 kortti, `+N` kasvaa vastaavasti |
| Fokustila piilottaa radan (työ **ja** tauko) | ✅ `visibility:hidden`, palautuu pysäytyksessä |
| Ennakkokorostus osuu oikeaan kohteeseen | ✅ jono → haamu radalla, tyhjä jono → areenaslotti |
| Käsi täyttyy viiteen | ✅ (fixture laajennettiin 9 → 13 tehtävään) |

**Neljä vikaa löytyi mittaamalla, ei katsomalla** — kaikki korjattu:
1. V2:n ja V3:n ensimmäinen kortti jäi **kokonaan** areenakortin taakse. Jonon tärkein
   kortti oli näkymätön. Presetit korjattu: V2 kurkistaa 63px, V3 39px.
2. Haamupaikka osui täydellä radalla viimeisen kortin **päälle** (sama `--qi`). Nyt
   `.lane--full` piilottaa haamun ja kisko kertoo sen sijaan — palaute ei saa kadota
   juuri siinä tapauksessa jossa kohde on näkymättömissä.
3. `+N`-siru istui radan akselilla neljännen kortin takana ja kilpaili kiskosta
   1440px:ssä. Siirretty viimeisen kortin päälle (nosto = kortin korkeus tällä
   etäisyydellä, `--lane-card-w * 1.4 * (1 - qi*scale)`).
4. Fixturessa oli vain 3 vapaata q1/q2-tehtävää → käsi jäi vajaaksi eikä
   ennakkokorostusta voinut arvioida.

**Suunnittelupäätös joka syntyi tekemällä:** ilmakehä on `--room-haze`
(huoneen oma väri `.lane-card::after`-peitteenä), ei pelkkä `brightness()`.
Kortin plate on tumma **kaikissa** teemoissa, joten pelkkä tummennus olisi
lukenut varjona vaaleassa huoneessa. Tokenina se tummuu usvassa/havussa ja
vaalenee auringossa — sama sääntö, oikea suunta molempiin.

### Alkuperäinen spec (toteutunut alla kuvatusti)

Itsenäinen tiedosto repon mockup-konvention mukaan: teemakytkimet (usva/havu/aurinko)
+ lite-kytkin + **korttimääräsäädin (0/1/3/5/8)** tyhjän tilan, ylivuodon ja kapean
ikkunan testaamiseen. Kopioi `#arena-room`-kerrokset ja `.tcg-card`-ilmeen
`index.html`:stä niin, että radan geometria mitataan oikeaa lavastetta vasten.

Kolme varianttia vierekkäin vaihdettavina:

| # | Variantti | Idea |
|---|---|---|
| **V1** | **Rata oikealle** | Kortit loittonevat oikealle lattiaa pitkin, kuin jono ihmisiä. Eniten vaakatilaa, luetuin järjestys. |
| **V2** | **Rata taakse** | Kortit loittonevat suoraan areenakortin taakse huoneen syvyyteen. Vahvin syvyysvaikutelma, raskain okkluusio. |
| **V3** | **Rata kaartaen** | Kortit lähtevät areenakortin takaa ja kaartuvat oikealle loitoten. V1:n luettavuus + V2:n syvyys. |

Kaikissa varianteissa demottava myös: **kohteen ennakkokorostus** (nappi joka
simuloi käsikortin hoveria) ja **saapumisreaktio** (nappi joka lisää kortin rataan).

### Radan geometria — yksi kaava, ei käsin viritettyjä arvoja

Sama kuri kuin pidetyssä viuhkassa (`--fan-r`/`--fan-step`): yksi rekisteröity
indeksi ohjaa sijaintia, kokoa ja nostoa.

```css
@property --qi{syntax:'<number>';inherits:false;initial-value:0}
```

`@property`-rekisteröinti on **pakollinen**, ei tyylikysymys: rekisteröimätön
custom property ei invalidoi siitä laskettua transformia, ja tilanvaihto jää
jumiin vanhaan matriisiin (viuhkan `--fan-step`-opetus, CLAUDE.md).

Tokenit `:root`iin:

```
--lane-gap:...    /* etäisyys areenakortin reunasta ensimmäiseen ratakorttiin */
--lane-x:...      /* vaakasiirtymä per askel */
--lane-y:...      /* pystynosto per askel (kauempana = ylempänä ruudulla) */
--lane-tilt:...   /* kierto per askel */
--lane-fade:...   /* kirkkauden lasku per askel */
```

Per-kortti (arvot viritetään mockupissa):

```css
#queue-lane .tcg-card--lane{
  position:absolute; bottom:0; left:0;
  transform-origin:0 100%;      /* pivot kortin tyvessä → kortti seisoo lattialla */
  transform:
    translate(calc(var(--lane-gap) + var(--qi) * var(--lane-x)),
              calc(-1 * var(--qi) * var(--lane-y)))
    scale(calc(1 - var(--qi) * .11))
    rotate(calc(var(--qi) * var(--lane-tilt)));
  filter:brightness(calc(1 - var(--qi) * var(--lane-fade)));
}
```

**Radan lattiaviiva on sama kuin areenakortin.** `_syncCastShadow()` (index.html,
hae nimellä) mittaa jo areenakortin alareunan ja asettaa `--card-base`. Rata
ankkuroidaan samaan viivaan, jolloin kortit seisovat samalla lattialla eivätkä
kellu. Ks. Osa B, kohta 2.

### Ratkaistava mockup-portilla

- **V1 / V2 / V3** — kumpi luetaan nopeimmin, kumpi kestää teemanvaihdon
- **Näkyvien korttien määrä** ja `+N`-sirun muoto ylivuodolle
- **Onko rata klikattava** vai puhtaasti visuaalinen (ks. Osa B, a11y-huomio)
- **Kapean ikkunan raja** — millä leveydellä rata putoaa 4→3→2 korttiin

---

## Osa B — `index.html`-toteutus (mockup-hyväksynnän jälkeen)

### Mitä mockup lisäsi tähän specciin

- **Uusi tokeni `--room-haze`** kaikkiin kolmeen teemaan (usva `#071009`,
  havu `#010402`, aurinko `#d8c6a4`) + `--lane-ghost`. Ei ollut alkuperäisessä
  suunnitelmassa; ks. suunnittelupäätös Osa A:ssa.
- **Kortti käärittävä `.lane-card`-elementtiin.** `.tcg-card--hand::after` on jo
  varattu hoverin osumakentälle, joten ilmakehäpeite tarvitsee oman kääreen.
  Transform menee kääreelle, `.tcg-card` sisällä on tavallinen.
- **`z-index` JS:stä, ei `calc()`illa.** Kauempi kortti maalautuu lähemmän taakse
  (`40 - i`); `calc()`-arvo `z-index`issä on selainkohtaisesti epäluotettava.
- **`.lane--full`-luokka** kun näkyviä on `--lane-max` verran → haamu pois, kisko
  kertoo.
- **`--lane-max` luetaan `getComputedStyle`illa** `:root`ista; media-kyselyt
  laskevat sen 4 → 3 → 2 (rajat 1400 / 1200 / 1024px).
- **Fonttien lataus muuttaa kortin korkeutta** → `--card-base` mitattava uudelleen
  `document.fonts.ready`ssä. Mockupissa tämä oli ero 156px vs. väärä alkuarvo.

### 1. DOM ja render-polku

`<div id="queue-lane" aria-hidden="true">` **`#arena`n lapseksi**, ja
**lisättävä render()n keep-listaan** (index.html:10088) — muuten se poistetaan
joka renderissä:

```js
if(ch.id!=='eise-peek'&&ch.id!=='eise-handle'&&ch.id!=='arena-room'
   &&ch.id!=='break-banner'&&ch.id!=='queue-lane')ch.remove();
```

Uusi `renderQueueLane(inbox)` kutsutaan `render()`istä `renderTurnPanel(inbox)`in
vierestä. Se lukee **saman `turn`-taulukon** kuin paneeli — ei uutta datamallia.

Kortit rakennetaan olemassa olevalla `renderArenaCard(t, null, anyFrog, 'lane')`:lla.
`'hand'`-moodi palaa aikaisin rivillä 9350 pelkän platen kanssa (ei stats/footer/
jatkokorttia) — täsmälleen mitä rata tarvitsee. Kaksi riviä:

- rivi 9259: `var compact = (mode==='hand'||mode==='lane');`
  `var modeClass = compact ? (mode==='lane'?'tcg-card--hand tcg-card--lane':'tcg-card--hand') : 'tcg-card--arena-size';`
- rivi 9350: `if(compact){ ... return card; }`

### 2. Lattiaviivan jakaminen

`_syncCastShadow()` asettaa nyt `--card-base`n **`#arena-room`iin**. Siirretään
asetus **`#arena`an** — custom propertyt periytyvät alaspäin, joten
`.arena-room__castshadow`in `var(--card-base, 188px)` toimii ennallaan, ja
`#queue-lane` saa saman viivan. Lisätään `renderQueueLane`in perään kutsu, jotta
rata asettuu heti eikä vasta seuraavassa resizessa.

### 3. Kerrokset

`#arena-room` luo `perspective`illä oman stacking-kontekstin, joten sen sisäiset
z-arvot (lattia 1, spot 2, vinjetti 4) romahtavat yhdeksi tasoksi `#arena`n
sisällä. `#queue-lane` z:2 asettuu siis huoneen päälle ja areenakortin (z:3) alle
— oikein.

Seuraus: **huoneen vinjetti ei tummenna ratakortteja.** Ilmakehän vaimennus
tehdään radan omalla `filter:brightness()`illä `--qi`:n mukaan, kuten viuhkassa
(`brightness(calc(1 - var(--ia) * .05))`).

### 4. Tilasäännöt

```css
/* Rata näkyy vain kun ajastin ei käy — työ JA tauko piilottavat sen */
body.focus-mode #queue-lane{ visibility:hidden; opacity:0; pointer-events:none; }
```

`visibility` eikä pelkkä `transform`, The Rail Rulen mukaisesti. **`_syncTimerUI`
ei muutu** — `focus-mode` kattaa jo sekä työn että tauon.

Mobiilissa `#queue-lane{display:none}` alle 900px (The Field Rule: kentällä kortti
on ainoa asia ruudulla; jono on oma välilehtensä).

Sivupaneelit ovat z:40 ja maalautuvat radan päälle avautuessaan — tarkoituksellista:
kisko auki = "hallitse jonoa", rata kiinni = "katso jonoa".

### 5. Saavutettavuus

`renderArenaCard` asettaa `tabindex="0"` ehdoitta (rivi 9263). Rata on **visuaalinen
peili**, ei toinen hallintapinta: kontaineri `aria-hidden="true"`, korteille
`tabindex="-1"` ja `pointer-events:none`. Näin tab-järjestys ei kaksinkerru ja
paneeli pysyy ainoana muokkauspintana (✎ / × / raahaus).

Jos mockup-portilla päädytään klikattavaan rataan, se on **oikopolku eikä ainoa
reitti** (The Gesture Rulen henki) — jokaiselle rataklikkaukselle on oltava
vastine paneelissa.

### 6. Kohteen ennakkokorostus

`renderHandBar`iin (9971) käsikorttia kohti `mouseenter`/`mouseleave`/`focus`/`blur`:

```js
document.body.dataset.handTarget = (active===null) ? 'arena' : 'queue';
```

CSS reagoi:
- `body[data-hand-target="arena"]` → areenaslotti saa kultarenkaan (kortti nousee tähän)
- `body[data-hand-target="queue"]` → radan häntään ilmestyy katkoviivainen haamupaikka + oikean kiskon badge saa korostuksen

Sama tieto kuin nykyisessä `card.title`ssä (9004), mutta näkyvänä eikä 1 s
viiveellä ilmestyvänä työkaluvihjeenä. Reduced-motion ja lite: staattinen ääriviiva,
ei pulssia.

### 7. Saapumisreaktio

`renderQueueLane` seuraa `_prevLaneIds`-taulukkoa täsmälleen kuten `renderHandBar`
seuraa `_prevHandIds` ja `renderTurnPanel` seuraa `_prevTurnIds` — uusi kortti saa
`.lane-card--arriving`-luokan.

Hehku **`::after`-pseudoon ja `opacity`-animaationa**, ei `box-shadow`-keyframena:
`box-shadow`-animaatio on main-thread-repaint (korttipöytä-kierroksen opetus).

Kun kortti laskeutuu radan näkyvän osan ulkopuolelle (tai rata on piilossa), kisko
reagoi sen sijaan: `#turn-tab-count` saa `.tab-badge--bump`-luokan ~400 ms ajaksi.
Molemmat reduced-motion-vartion takana.

---

## Osa C — koherenssikorjaukset (irrallisia radasta, voi toimittaa erikseen)

**C1 — Käden järjestys seuraa matriisia.** `buildHandQueue`in neljä ämpäriä
lajitellaan `(a.order||0)-(b.order||0)`, kuten matriisi tekee. Sen jälkeen kortin
raahaaminen matriisin sisällä ohjaa myös käden järjestystä — yksi totuus
prioriteetista. (Vastaus alkuperäiseen kysymykseen "missä järjestyksessä luokan
sisällä": **tällä hetkellä lisäysjärjestyksessä**, mikä ei ole kenenkään valinta.)

**C2 — Käden maksimi yhteen vakioon.** `HAND_MAX = 5` `:root`-tason vakioksi,
käyttöön sekä `buildHandQueue`in varoitustekstissä että `renderHandBar`in
`slice`ssä. Nyt varoitus lupaa 7 ja ruudulla on 5.

---

## Verifiointi

**Mockup (Osa A) — ✅ mitattu, ⬜ katselmoimatta:**

Automaattinen osuus on ajettu (ks. Tila-taulukko Osa A:ssa). Jäljellä on se osa
jota sondi ei voi tehdä — **Jaakon silmä selaimessa**:

1. `python3 -m http.server 8080` → `http://localhost:8080/mockup-jono.html`
2. **Valitse variantti.** Suorin linkitys: `?v=v1`, `?v=v2`, `?v=v3`
3. Teemat: `?v=<valittu>&t=usva|havu|aurinko`, lisäksi `&lite=1`
4. Virittele geometria liu'uilla → **"Kopioi tokenit"** → luvut Osa B:hen
5. Vie hiiri **käsikortin** päälle alareunassa: osoittaako ennakkokorostus oikeaan?
6. Kontrasti: ratakorttien teksti kauimmaisella `--lane-haze`-tasolla, erityisesti
   aurinkoteemassa (kontrastisondi, ei kuvakaappaus — kuvakaappaus ei todenna
   teematyötä; aurinkokierroksella pikselidiffi oli 0,000 % vaikka 14 vikaa korjaantui)

**Avoin, ratkaistava portilla:** onko rata klikattava vai puhtaasti visuaalinen.
Nykytoteutus on `pointer-events:none` + `aria-hidden` — hallinta on paneelissa.

**index.html (Osat B & C):**
1. Syntaksi: CLAUDE.md:n script-extraktio + `node --check /tmp/chk.js`
   (`node --check` ei toimi `.html`-tiedostoille suoraan)
2. `python3 tests/run.py`
3. **Kontrolliajo:** `git archive HEAD | tar -x -C /tmp/base-tree` →
   `python3 tests/run.py --tree /tmp/base-tree`. Ilman tätä ennestään rikki
   olevat väitteet luetaan tämän muutoksen regressioiksi (pidetyn viuhkan
   kierroksella niitä oli 4).
4. **Pikselivertailu animaatiot jäädytettynä**
   (`*,*::before,*::after{animation:none!important;transition:none!important}`)
   — ilman jäädytystä areenan hehku antaa ~16–22 % kohinaa. Odotus: **0 %
   fokustilassa** (rata piilossa), ero vain lepotilassa.
5. Impeccable-delta merge-edeltävään committiin, ei `HEAD`iin — baseline on
   **4 osumaa / 3 kategoriaa** eikä niitä korjata, vain delta mitataan.
6. Käsin selaimessa (headless ei kata näitä):
   - Käsikortin hover → oikea kohde korostuu (areena kun jono tyhjä, radan häntä muuten)
   - Napautus → kortti ilmestyy radalle korostuen; jos radan ulkopuolelle, kiskon badge nykäisee
   - ▶ ajastin → rata, kiskot ja käsi katoavat; tauolla **pysyvät** kadonneina; ▶-painalluksen jälkeen palaavat
   - Matriisissa raahaus Q1:n sisällä → käden järjestys seuraa (C1)
   - 6 tähtikorttia → varoitusteksti ja ruudulla näkyvä määrä täsmäävät (C2)

**Palautus:** `git revert <sha>` osittain (C on erillinen commit radasta).

---

## Rajaus

Ei tässä työssä: **Odottavat**-paneeli säilyy ennallaan. Sillä on sama
metaforakuilu, mutta eri lääke (kääntyneet kortit sivupöydällä + odotuksen ikä
näkyviin, jotta mikään ei mätäne listalla hiljaa) ja se ansaitsee oman
kierroksensa. Rata on ensin, koska se on se polku jonka käyttäjä kulkee joka päivä.
