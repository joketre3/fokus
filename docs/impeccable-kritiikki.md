# Fokus A Priori — Impeccable Init + Kritiikki

## Konteksti

Käytetään /impeccable-skilliä analysoimaan Fokus A Priori -sovelluksen
nykytila ja tunnistamaan parannuskohteet. PRODUCT.md puuttuu — luodaan
ensin, sitten kritiikki.

Projekti: `/home/jaakko/fokus/`  
Rekisteri: **product** (työkalu, ei markkinointisivu)  
Käyttäjät: Kaikki suomalaiset tietotyöläiset  
Brändi: Tarkka, rauhoittava, ammatillinen  
Anti-referenssi: AI-startup-estetiikka (gradientit, glassmorphism, futuristinen)

---

## Vaihe 1: Kirjoita PRODUCT.md

Tiedosto: `/home/jaakko/fokus/PRODUCT.md`

```markdown
# Product

## Register

product

## Users

Suomalaiset tietotyöläiset jotka hallitsevat tehtävälistoja työssä.
Ensisijainen käyttäjä: sosiaaliohjaaja julkisessa sote-organisaatiossa —
keskeytyksiä, palavereita, kirjausmonia, deadlinejä.
Käytetään pöytäkoneella tai kannettavalla selaimessa. Mobiili toissijainen.

## Product Purpose

Fokus A Priori on Eisenhower-matriisipohjainen tehtävienhallinta johon on
yhdistetty Pomodoro-ajastin, TCG-henkinen tehtäväjono (käsi/arena/jono) ja
valinnainen AI-analyysi. Onnistuminen on: käyttäjä tietää millä tehtävällä
aloittaa aamulla ja pystyy pysymään fokuksessa läpi päivän.

## Brand Personality

Tarkka, rauhoittava, ammatillinen.
Ei leikkisä eikä yritystuottavuus-kliininen — välimaasto: luotettava
työkaveri jolla on selkeä mieli.

## Anti-references

- AI-startup-estetiikka: gradientit, glassmorphism dekoraationa,
  futuristinen/tekoälyhehku
- Notion/Todoist: sterillit valkoiset SaaS-näkymät
- Feature-creep UI: liian monta toimintoa näkyvissä kerralla

## Design Principles

1. Fokus ensin — yksi aktiivinen tehtävä kerralla, kaikki muu piilossa
2. Rauhallinen varmuus — käyttöliittymä ei kilpaile tehtävien kanssa huomiosta
3. Suomalaiseen kontekstiin sopiva — ei hypeä, ei koristetta ilman funktiota
4. Nopeus tärkeämpää kuin täydellisyys — toimii myös hitaalla laitteella
5. Progressiivinen paljastaminen — vasta-alkajalle yksinkertainen,
   kokeneelle koko voima saatavilla

## Accessibility & Inclusion

WCAG AA tavoite. Lite-tila hitaille laitteille (MacBook 2010, Intel HD).
Vältä backdrop-filter-riippuvuutta oleellisessa sisällössä.
Reduced motion tuettava.
```

---

## Vaihe 2: Kritiikki — löydetyt ongelmat

### P0 — Kriittiset (estää käytön tai rikkoo visuaalisen identiteetin)

**P0-1: Aurinko-teeman tausta on "AI-oletus 2026"**
- `--paper: rgba(255,248,235,.90)` = lämmin kermainen beige
- Impeccable kieltää eksplisiittisesti koko lämpimän neutralin alueen (OKLCH L 0.84-0.97, C < 0.06, hue 40-100)
- Korjaus: vaihda Aurinko-teema johonkin joka kantaa lämpöä aksentin ja typografian kautta, ei taustavärin; esim. puhdas valkoinen (#fefefe) tai terrakottalähtöinen tummempi mid-tone

**P0-2: `aamu.html` visuaalinen poikkeavuus pääsovelluksesta**
- Oletusväri `--ink:#1a1c18; --paper:#f2f0e8` (vaalea) kun pääsovellus on tumma
- Sama lämmin kerma-papi kuin Aurinko-teemassa — kaksoistabu
- Korjaus: aamu.html seuraa pääsovelluksen teemaa (localStorage `fap_theme`)
  tai käyttää Usvametsä-tyylistä tummaa oletuksena

**P0-3: Muted-teksti kontrastiepäilys**
- `--muted: rgba(255,255,255,.55)` läpinäkyvillä pinnoilla
- Efektiivinen kontrasti riippuu taustasta — pitää mitata
- Normaali teksti vaatii 4.5:1, suuri teksti 3:1
- Korjaus: nosta rgba(.55) → rgba(.72) tai käytä kiinteää arvoa joka
  mitataan teeman taustaväriä vasten

### P1 — Merkittävät (heikentää käytettävyyttä tai tunnelmaa)

**P1-1: `--text-xs: .65rem` ≈ 10.4px — liian pieni luettavaksi**
- Alle 11px on käytännössä jokaisessa yhteydessä liian pieni body-tekstiksi
- Korjaus: nosta .65rem → .72rem tai .75rem minimum; tarkista kaikki
  käyttökohdat

**P1-2: Ajastimen SVG käyttää hardkoodattuja värejä `#c0392b`**
- `stroke="#c0392b"`, `fill="#c0392b"`, `iconPlay` ja `iconStop` —
  eivät reagoi teemaan
- Aurinko-teemassa pomo-väri on `--pomo:#c4681e`, Havussa `#c0432b`,
  mutta SVG polkit ovat aina punainen/tumma
- Korjaus: käytä `var(--pomo)` SVG-fill/stroke-attribuuttien sijaan CSS:llä
  (`.pring circle { stroke: var(--pomo) }`)

**P1-3: Navigation — näkyykö käyttäjälle miten vaihtaa näkymiä?**
- Sovelluksessa on v-inbox, v-matrix, v-done, v-projects mutta
  navigointimekaniikka pitää tarkistaa — onko se selkeästi esillä?
- Varoitus: jos navigointi on hampurilainen-valikossa tai epäselvä →
  tärkeimmät näkymät pitää olla aina käden ulottuvilla

**P1-4: Tyhjät tilat (empty states) waiting- ja turn-paneleissa**
- Waiting: "Ei odottavia" on pelkkä teksti
- Turn: "Ei tehtäviä jonossa" (display:none kun on tehtäviä — oikein)
- Uuden käyttäjän Inbox on tyhjä ilman eväitä mitä tehdä seuraavaksi
- Korjaus: suunnittele merkitykselliset tyhjät tilat jotka ohjaavat toimintaan

**P1-5: Hand bar -kortit (130×182px) — TCG-visuaali alle potentiaalinsa**
- Korttien rakenne on olemassa mutta design-yksityiskohtia pitää tarkistaa:
  ovatko verbi-ikonit riittävän näkyviä? Onko kortilla selkeä hierarkia?

**P1-6: Reduced motion -tuki**
- CSS-transitiot ovat laajat — onko `@media (prefers-reduced-motion: reduce)`
  toteutettu (lite-tila poistaa transitiot mutta se ei ole sama asia kuin
  järjestelmäasetus)
- Korjaus: lisää reduced-motion media query kaikkiin animaatioihin

### P2 — Parannukset (tekee käytöstä nautinnollisempaa)

**P2-1: CSS-muuttujien nimeäminen sekoittaa metaforia**
- `--paper`, `--warm`, `--light` sekaisin `--surface`, `--surface-md`,
  `--surface-strong` kanssa
- Ei kriittinen mutta vaikeuttaa ylläpitoa ja uusien teema-varianttien
  kirjoittamista

**P2-2: Fonttiaste — isot otsikot vs. pienin teksti (10px)**
- Skaala 0.65rem → 1.8rem on laaja mutta alaosa on ongelma (P1-1)
- Hierarkia DM Serif Display vs DM Sans ei ehkä hyödynnetä täysimääräisesti
- Ehdotus: tarkista onko serif-headlinea käytetty riittävästi identiteetin
  luomiseen

**P2-3: Usvametsä-teema lite-moodissa**
- Lite-moodissa `--paper` ja `--surface` muuttuvat opaakeiksi (.97)
- Tämä tarkoittaa että teema näyttää erilaiselta kahdella eri laitteella
- Korjaus: varmista että lite-moodi versio on yhtä visuaalisesti eheä kuin
  backdrop-filter-versio

**P2-4: Onboarding**
- `#onboarding` on olemassa mutta `display:none` oletuksena
- Uusi käyttäjä näkee tyhjän Inboxin ilman ohjausta
- Korjaus: aktivoi onboarding kun localStorage on tyhjä

---

## Vaihe 3: Suositellut seuraavat komennot

Tärkeysjärjestyksessä:

1. **`$impeccable audit index.html`** — mitattava tekninen tarkistus
   (a11y, kontrasti, responsive)
2. **P0-korjaukset** käsin (ks. yllä) — aurinko-teema, aamu.html, muted-kontrasti  
3. **`$impeccable polish index.html`** — kattava viimeistelypassi P1/P2-kohtien
   pohjalta
4. **`$impeccable document`** — luo DESIGN.md nykyisestä visuaalisesta järjestelmästä

---

## Verifikaatio

```bash
python3 -m http.server 8080
# Testaa: http://localhost:8080
# Vaihda kaikki 3 teemaa
# Tarkista aamu.html teema-yhdenmukaisuus
# Testaa mobiili (640px viewport)
# Tarkista contrast-ratio muted-tekstille
```
