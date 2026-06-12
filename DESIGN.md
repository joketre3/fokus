---
name: Fokus A Priori
description: Eisenhower-matriisi ja Pomodoro yhdistettynä — yksi aktiivinen tehtävä kerrallaan.
colors:
  gold: "#c49a3a"
  gold-dim: "#c49a3a26"
  forest-green: "#4fa870"
  terracotta: "#c4681e"
  pomo-red: "#a84c28"
  wait-blue: "#3a6b8a"
  frog-olive: "#6b8a30"
  q1-urgent-important: "#a84c28"
  q2-important: "#2d5a3d"
  q3-urgent: "#7a6a50"
  q4-low: "#9a9a8e"
  ink-dark: "#f2f2f2"
  ink-light: "#2d2417"
  surface-usva: "#162818"
  surface-havu: "#040e09"
  surface-aurinko: "#faf8f0"
typography:
  display:
    fontFamily: "'DM Serif Display', Georgia, serif"
    fontWeight: 400
    fontSize: "2.2rem"
    lineHeight: 1.1
    letterSpacing: "-0.02em"
    fontStyle: "italic"
  headline:
    fontFamily: "'DM Serif Display', Georgia, serif"
    fontWeight: 400
    fontSize: "1rem"
    letterSpacing: "-0.01em"
    fontStyle: "italic"
  body:
    fontFamily: "'DM Sans', system-ui, sans-serif"
    fontWeight: 300
    fontSize: "0.875rem"
    lineHeight: 1.55
  label:
    fontFamily: "'DM Sans', system-ui, sans-serif"
    fontWeight: 500
    fontSize: "0.72rem"
    letterSpacing: "0.06em"
    textTransform: "uppercase"
  tcg:
    fontFamily: "'Cinzel', Georgia, serif"
    fontWeight: 600
    fontSize: "0.65rem"
    letterSpacing: "0.08em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  full: "50%"
spacing:
  xs: "0.35rem"
  sm: "0.55rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.gold}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "0.6rem 1.4rem"
  button-primary-hover:
    backgroundColor: "#b8882a"
    textColor: "#ffffff"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.gold}"
    rounded: "{rounded.md}"
    padding: "0.4rem 0.9rem"
  button-ghost-hover:
    backgroundColor: "{colors.gold-dim}"
    textColor: "{colors.gold}"
  chip-quad-q1:
    backgroundColor: "{colors.q1-urgent-important}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "0.15rem 0.45rem"
  chip-quad-q2:
    backgroundColor: "{colors.q2-important}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "0.15rem 0.45rem"
  input-default:
    backgroundColor: "rgba(30,55,40,0.42)"
    textColor: "{colors.ink-dark}"
    rounded: "{rounded.md}"
    padding: "0.65rem 1rem"
---

# Design System: Fokus A Priori

## 1. Overview

**Creative North Star: "Pohjoismainen Rituaali"**

Fokus A Priori on suomalainen tuottavuusrituaali. Ei ohjelmistoprojektin kojelauta — rituaali, joka alkaa aamusuunnittelulla, kulkee läpi päivän yhden tehtävän kerrallaan, ja päättyy selkeytymisen tunteeseen. Visuaalinen kieli on lainattu pohjoisesta metsästä: tummat, rauhalliset pinnat, kulta-aksentti kuin auringonvalo havupuiden läpi. Kaikki turha on karsittu.

Järjestelmässä on kolme teemaa. **Usvametsä** (oletus) on tumma lasipinta usvaisella metsätaustalla — translucent kerrostetuilla pinnoilla. **Havumetsä** on tätäkin tummempi, puhdas, ilman kuvaa. **Aurinko** on valoisa vaihtoehto: kermavalkoinen, terracotta-aksentti, lämminhenkinen mutta ei dekoratiivinen. Kaikki kolme käyttävät samaa typografista hierarkiaa ja samat Eisenhower-maastokoodit.

Järjestelmä hylkää tietoisesti: AI-startup-estetiikan (gradientit, glassmorphism dekoraationa, neonhehku), sterillit SaaS-valkoiset näkymät (Notion, Todoist), ja feature-creep UI:n jossa liikaa toimintoja kilpailee huomiosta. Progressiivinen paljastaminen on periaate numero viisi.

**Key Characteristics:**
- Yksi aktiivinen tehtävä — areena hallitsee, kaikki muu taka-alalla
- Rauhallinen varmuus — käyttöliittymä ei kilpaile tehtävien kanssa huomiosta
- Kolme teemaa samalla tokenijärjestelmällä
- TCG-korttiesteetiikka areenakortissa — ainutlaatuinen, ei geneerinen
- Nopea tila hitaille laitteille — suorituskyky on ominaisuus

## 2. Colors: The Terrain Codes

Palette on johdettu metsästä, ei brändipyörästä. Värit koodaavat tehtävien prioriteetin kuin maastomerkit — ilman selitystä.

### Primary

- **Rituaalikulta** (#c49a3a): Kultainen aksentti, johdettu usvametsäteemin identity-väristä. Primäärinen toimintoväri (CTA-napit, aktiivinen focus-indikaattori, lainaukset). Käytetään säästellen — sen harvinaisuus on pointti. Havumetsässä korvataan metsänvihreällä (#4fa870), Aurinkoteemassa terracottalla (#c4681e).

- **Pomodoro-terracotta** (#a84c28): Ajastimen väri ja Q1-kvadrantin merkki (TEE HETI). Myös hälytys- ja poistatoiminnot. Visuaalinen signaali: "tämä on kiireellistä ja tärkeää."

### Secondary

- **Havumetsänvihreä** (#4fa870 / havuteemassa, #2d5a3d Q2-maastona): Q2-kvadrantti (AIKATAULUTA). Tärkeä mutta ei kiireinen — kasvun väri. Sammakko-toiminto (#6b8a30 oliivinvihreä) on sammakkotehtävän signature-väri.

- **Odotussininen** (#3a6b8a): Odottavat tehtävät ja aikataulutus. Tauon väri myös ajastimessa. Rauhoittava — ei kriittinen.

### Tertiary

- **Delegoi-okra** (#7a6a50): Q3-kvadrantti (DELEGOI). Lämmin, neutraali — kiireinen mutta ei tärkeä. Hillitty.

- **Hylkää-kivi** (#9a9a8e): Q4-kvadrantti (POISTA). Kivenharmaa — ei kriittinen, ei kiireinen. Neutraali signaaliarvo.

### Neutral

- **Inkki-valkoinen** (rgba(255,255,255,.95)): Pääelementtien teksti tummissa teemoissa. Täysin peittävä vain display-tyypografalle; body-teksti 72% opasiteetti (muted).
- **Pintakerrostumat** (rgba(30,55,40,.35–.65)): Usvametsässä neljä pintatasoa xs/sm/md/strong — translucent dark-green pints taustakuvan päällä. Luo syvyyden ilman varjoja.
- **Aurinkoteeman muste** (#2d2417): Lämpimän ruskea muste vaalealla taustalla. Ei kylmä musta.

### Named Rules

**The One Accent Rule.** Kultainen (#c49a3a) esiintyy korkeintaan 10% mistä tahansa näkymästä. Sen harvinaisuus on pointti — kaikki muut elementit saavat huomion sen kautta.

**The Terrain Code Rule.** Eisenhower-värit (terracotta/metsänvihreä/okra/kivi) ovat ainoastaan kvadranttimerkintöjä. Niitä ei käytetä yleisinä UI-aksentteina tai dekoraationa.

## 3. Typography

**Display Font:** DM Serif Display (italic, Georgia fallback)
**Body Font:** DM Sans (300/400/500, system-ui fallback)
**TCG-korttifont:** Cinzel (600, TCG-areenakortit ainoastaan)

**Character:** DM Serif Display italic tuo hallitun lämpimyyden ja persoonan — kuin käsinkirjoitettu muistiinpano ammatillisessa kontekstissa. DM Sans 300 kehystää sen minimalistisesti ilman steriilyyttä. Cinzel on tarkoituksella eristetty TCG-kortille; se ei esiinny muualla.

### Hierarchy

- **Display** (DM Serif Display italic, 2.2rem, lh 1.1, ls -0.02em): Ajastimen aika, modaaliotsikot, logo. Maksimissaan 2 esiintymää näkymässä kerrallaan.
- **Headline** (DM Serif Display italic, 1rem, ls -0.01em): Paneeliotsikot, projektikortit, viikkoyhteenveto-otsikko.
- **Title** (DM Sans 500, 1rem, lh 1.3): Nappi-teksti CTA-napeissa, tärkeiden modaalielementtien nimiotsikot.
- **Body** (DM Sans 300, 0.875rem, lh 1.55): Pääsisältö, tehtävätekstit, seliteteksti. Max line-length n. 65ch.
- **Label** (DM Sans 500, 0.72rem, ls 0.06em, uppercase): Kvadranttimerkinnät (TEE HETI, AIKATAULUTA jne.), pieni infomerkintä. Vain 1–4 sanan lyhenteet.
- **Micro** (DM Sans 300, 0.65–0.70rem): Metadata, Pomodoro-arviot, päivämäärät. Ei koskaan alle 0.65rem.

### Named Rules

**The Two Families Rule.** DM Serif Display ja DM Sans. Cinzel on erillinen, TCG-kontekstin leimasimetri — ei typografinen valinta muuhun käyttöön. Kolme perhettä yhteensä — rajaa ei ylitetä.

**The Weight-Not-Size Rule.** Hierarkia ensin painon kontrastilla (300 → 500), sitten koolla. Avoid flat 400-weight everything.

## 4. Elevation

Järjestelmä on **litteä lepotilassa, nostettu vuorovaikutuksessa**. Pintojen syvyys syntyy tummissa teemoissa rgba-kerrostumien (--surface-xs → --surface-strong) kautta, ei varjoilla. Varjot ovat reaktioita tilaan, eivät dekoraatiota.

### Shadow Vocabulary

- **Hover-nosto** (`box-shadow: 0 6px 20px rgba(0,0,0,.18)` + `transform: scale(1.02) translateY(-2px)`): Tehtäväkortit ja toimintaelementit hover-tilassa. Nostoefekti on tärkeä — osoittaa että elementti on klikattavissa.
- **Status-ring** (`box-shadow: 0 0 0 2px rgba(väri,.08)`): Erikoistilaiset kortit (sammakko, odottaa, tarkastelussa). Hienovarainen — täydennetään border-color-muutoksella.
- **Arena-hehku** (`0 0 0 1px rgba(196,154,58,.35), 0 0 40px 8px rgba(196,154,58,.30), 0 0 80px 16px rgba(196,154,58,.15), 0 12px 36px rgba(196,154,58,.20)`): Ainoastaan TCG-areenakortilla. Kultainen hehku kertoo tämän olevan aktiivinen tehtävä. Ei käytetä muualla.
- **Modaali** (`box-shadow: 0 12px 40px rgba(0,0,0,.2)`): Paneeleja ja dialogi-ikkunoita. Yksinkertainen diffuusi varjo.
- **Eise-peek-nostatus** (`box-shadow: 0 2px 6px rgba(0,0,0,.08)`): Eisenhower-peek-kortit hover-tilassa. Kevyin varjo järjestelmässä.

### Named Rules

**The Flat-By-Default Rule.** Elementit ovat litteissä lepotilassa. Varjot ovat tilan muutoksia — hover, status, focus — eivät pintatekstuuria. Arena-hehku on ainoa poikkeus, ja se on tarkoituksellinen identiteettielementti.

**The Depth-Through-Surface Rule.** Usvametsässä syvyys syntyy rgba-pintatasoilla (--surface-xs .35 → --surface-strong .65), ei varjoilla. Nopea tila korvaa nämä opaakeiksi muuttamatta arkkitehtuuria.

## 5. Components

### Buttons

**Varma ja suoraviivainen — ei dekoratiivinen.**

- **Shape:** Gently rounded (8px, --r-md). Ei pill-muotoa CTA-napeille.
- **Primary (kultainen):** `background: #c49a3a`, `color: white`, `padding: 0.6rem 1.4rem`, `font-weight: 500`. Hover: tummempi kulta (#b8882a), ei varjoa.
- **Ghost/outline:** `border: 1.5px solid var(--accent)`, `color: var(--accent)`, `background: transparent`. Hover: `background: var(--accent-dim)`. Käytetään toissijaisiin toimintoihin.
- **Danger:** Ghost-muoto mutta `border-color: var(--pomo)`, `color: var(--pomo)`. Hover aktivoi punaisen.
- **Disabled:** `opacity: 0.35`, `cursor: not-allowed`. Ei muuta käsittelyä.
- **Transition:** `opacity 0.2s`, `background 0.15s` — ei transform-animaatiota napeilla.

### Cards / Containers

**Kolmitasoinen pintahierarkia tummissa teemoissa.**

- **Tehtäväkortti (.card):** `background: var(--surface)` (rgba .42), `border: 1px solid var(--border)` (rgba .25), `border-radius: 8px`, `padding: 0.7rem 1rem`. Hover: nosto + varjo + `scale(1.02)`. Toimintorivi piilossa hover/needs-review-tilaan asti (grid-template-rows 0fr → 1fr + opacity).
- **Projektikortti (.proj-card):** Sama peruspinta. Projektiväri näkyy `box-shadow: inset 0 3px 0 <väri>` yläreunassa — ei side-tab-reunaa.
- **TCG-arennakortti (.tcg-card--arena):** Täysin erilainen — MTG-tyylinen, kultainen hehku, DM Serif Display otsikko, Cinzel-typelinja. Erikoistapaus, ei geneerinen malli.
- **Eise-peek-kortit:** Miniatyyri-matriisikortit eise-peek-paneelissa. `padding: 0.25rem 0.45rem`, pienet kvadranttipisteet.
- **Modaalit/paneelit:** `border-radius: 12px` (--r-lg), `border: 1px solid var(--border)`, `box-shadow: 0 12px 40px rgba(0,0,0,.2)`. Tummissa teemoissa backdrop-filter: blur(14px) käytössä — pois Nopea tila -tilassa.

### Inputs / Fields

- **Style:** `background: var(--surface)`, `border: 1px solid var(--border)`, `border-radius: 8px`, `padding: 0.65rem 1rem`, `color: var(--ink)`. Ei erillistä placeholder-tyyliä; käyttää selainten oletusta.
- **Focus:** `outline: none` — kaikilla on visuaalinen korvike (border-color muutos tai ympäröivä kontaineri). Label `for=`-attribuutit vaaditaan kaikilla.
- **Error/disabled:** Rajattu käyttö — tehtävien validointi tapahtuu enimmäkseen logiikalla, ei lomakkeilla.

### Navigation

- **Yläpalkki (hdr):** `position: sticky top: 0`, `background: var(--surface-md)`, `backdrop-filter: blur(14px)`. Logo vasemmalla (DM Serif Display italic SVG), ajastin-widget oikealla.
- **Hampurilaisvalikko:** Ensisijainen navigaatio sivunäkymien välillä. Aktiivinen näkymä näkyy nappi-tekstissä. Asetukset tässä, ei profiilipaneelissa.
- **Eisenhower-paneeli (.eise-peek):** Piiloutuu/ilmaantuu draggaamalla tai klikkauksella yläreunassa. Ei perinteinen navigaatio — tilanäyttö.
- **Inventory (.inv-cat-item):** Vasemman sivupaneelin kategorianavigointi. Aktiivinen tila: `background: var(--surface-strong)`, `font-weight: 500` — ei side-tab-reunaa.

### Signature Component: TCG-areennakortti

Fokuksen selkein identiteettielementti. Kun ajastin käynnistyy, aktiivinen tehtävä täyttää areenan MTG-kortin muodossa: kultainen kehys, usvapinta, Cinzel-kirjasinlinja tyyppiriville, kustannuspisteet Pomodoro-arviolle. Otsikko käyttää DM Serif Display:tä, runko DM Sansia — kaksi perhettä rinnakkain samassa elementissä. Ei esiinny muissa konteksteissa.

### Pomodoro-widget

Kaksi tilaa: **täysi** (130×130px SVG-ring, iso kellonaika DM Serif Display 2.2rem) ja **mini** (kiinnitetty yläpalkkiin, 42px ring, 1.2rem aika). Tila vaihtuu kun ajastin käynnistyy. Ring: `stroke: var(--pomo)` (terracotta tai teeman mukainen). Transitio: vain `opacity`, ei width/height (näkymän muutos on välitön, ei animoitu).

## 6. Z-index-skaala

| Taso | Käyttö |
|---|---|
| 0–9 | Komponentin sisäiset kerrostumat |
| 10–99 | Kiinteä chrome (handle, sticky-palkit) |
| 100–199 | Notifikaatiot (`.notif`, `#nt`) |
| 200–399 | Paneelit ja perusmodaalit (overlay 200, modaali 201, eise-move-menu 210, verb-pop 300) |
| 400–499 | Pinotut modaalit (jatko 401, wiz 401) |
| 500–599 | Ylin perusmodaali (edit-modal 500) |
| 600 | Lisätiedot-popup (voi avautua edit-modalin päältä) |
| 700 | Undo-banner (aina päällimmäinen) |

## 7. TCG-rarity

Rarity = **tärkeys** (Eisenhower) — väri-identiteetti = kvadrantti, manakustannus = est:

| Tier | Ehto | Visuaali |
|---|---|---|
| mythic | `frog` | kultakehysgradientti + holo + 🐸-sinetti |
| rare | q1/q2 | kultainen sisärengas + kullattu set-symboli |
| uncommon | q3 | hopearengas + hopeinen set-symboli |
| common | q4 | ei metallia, himmeä set-symboli |

Set-symboli = työtilan alkukirjain (Cinzel) typelinen oikeassa reunassa. Holo vain mythicillä — niukkuus (yksi sammakko/päivä) on osa metodologiaa. Metallisävyt ovat neutraaleja → 60-30-10-värisääntö säilyy.

**Metalli- ja levytokenit:** `--gold` `#c49a3a` / `--gold-hi` `#e8c66a` / `--gold-deep` `#6b4f1c` (eivät seuraa `--accent`ia), `--metal-silver` `#b8bcc0` / `--metal-silver-hi` `#e2e6ea`, `--tcg-plate-ink` `#f4f0e4` / `--tcg-plate-ink-dim` `#e8dcc0` / `--tcg-gold-ink` `#f0d9a8`, `--tcg-stop` `#7a2020`, `--ink-on-art` `#fff`, `--pomo-hi` `#e8623a`, `--q2-bright` `#4a8a4a`, `--frog-deep` `#3d7a52`. Plate pysyy tummana kaikissa teemoissa (aurinko asettaa tumman `--plate-top`in tarkoituksella).

## 8. Do's and Don'ts

### Do

- **Do** käytä DM Serif Display italisoituna otsikko- ja display-elementeissä — se on brändin ääni.
- **Do** käytä rgba-pintatasoja (--surface-xs/surface/surface-md/surface-strong) syvyyteen tummissa teemoissa varjojen sijasta.
- **Do** pidä kultainen (#c49a3a) harvinaisena: vain primäärinen CTA, aktiivinen focus, accent-tason merkinnät.
- **Do** käytä `box-shadow: inset 0 3px 0 <väri>` projektivärien näyttämiseen — ei border-left side-tabeja.
- **Do** käytä `grid-template-rows: 0fr → 1fr` piilotettavaan sisältöön max-height-transitioiden sijasta.
- **Do** lisää `html[data-perf="lite"]` -yhteensopivuus uusille animaatioille — MacBook 2010 on reaalinen käyttäjä.
- **Do** käytä tehtävälle verbiprefixiä: "Soita", "Sovi", "Kirjaa" — toimintavalmis 2 sekunnissa.
- **Do** näytä navigaatiossa aina aktiivinen näkymä hampurilaisnapin tekstissä.

### Don't

- **Don't** käytä `border-left` tai `border-right` yli 1px väriaksenttina korteissa tai listakohteissa. Korvaa `box-shadow: inset` tai taustavärillä.
- **Don't** lisää backdrop-filter ilman fallbackia — Nopea tila poistaa sen, pintojen täytyy toimia opaakeina.
- **Don't** käytä gradientteja tai glassmorphismia dekoraationa. Usvametsän läpinäkyvät pinnat ovat tarkoituksellisia, eivät "cool"-estetiikkaa.
- **Don't** käytä Cinzel-fonttia muualla kuin TCG-areenakortilla. Se on kontekstuaalinen leimasimetri, ei brändifontti.
- **Don't** animoi `width`, `height`, `max-height` tai `padding`-ominaisuuksia. Käytä `transform`, `opacity`, tai `grid-template-rows`.
- **Don't** laita asetuksia profiilipaneeliin — käyttäjä ei löydä niitä sieltä. Kaikki asetukset hampurilaisvalikon Asetukset-osioon.
- **Don't** käytä Eisenhower-maastokoodeja (terracotta/metsänvihreä/okra/kivi) yleisinä UI-aksentteina. Ne ovat kvadranttimerkintöjä.
- **Don't** tee SaaS-tyylistä sterilliä valkoisuutta (Notion/Todoist-estetiikka). Aurinkoteema on lämmin mutta ei kliiininen.
- **Don't** käytä feature-creep UI:ta — progressiivinen paljastaminen, ei kaikkea kerralla näkyvissä.
- **Don't** käytä `position: fixed` elementtiä transformatun vanhemman sisällä — se positionoituu vanhempaan, ei viewporttiin.
