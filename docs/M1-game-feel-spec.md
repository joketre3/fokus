# M1 — Game Feel: Solidius + suhteellinen palauteportaikko

**Pohja:** "The Focus Architecture" -deck, päällyskerros (Juicy Diegetic UI).
**Laki:** Prime Directive, lause 1 — *efektin koko vastaa teon kokoa.*
**Periaate lukittu:** Usvametsän rauha säilyy. Mikrotaso on hiljainen. **Wow ansaitaan vain makrossa (Valmis), ja vahvimmin sammakolla.** Ei sensorista inflaatiota.

Tämä speksi on toteutusohje Claude Codelle `joketre3/fokus`, tiedosto `index.html` (~10 500 riviä). Aja aina ensin: `curl -s "https://raw.githubusercontent.com/joketre3/fokus/main/CLAUDE.md"`.

---

## 0. Rajat (ei neuvoteltavissa)

- **Single-file**, ei build-vaihetta, `file://`-yhteensopiva.
- **Mobiili-Edge:** uusi JS-generoitu DOM `createElement` + `textContent`. EI `innerHTML`-merkkijonoja joissa emoji/ajatusviiva tai pakotetut lainausmerkit.
- **Ei `:hover`/`:active` + `transform`** kortin painallukseen (takertuu) → pointer-eventit JS:ssä.
- **Impeccable-detektori:** ei `border-top:Npx solid`. Reuna-aksentit `box-shadow: inset`.
- **3 teemaa** (Havumetsä / Usvametsä / Aurinko): kaikki värit `var(--…)`-muuttujista, ei kovakoodattuja.
- **perf-lite** (`html[data-perf="lite"]`): killaa jo transitiot (`.01ms`) ja holon — **mutta ei @keyframes-animaatioita.** Uudet raskaat animaatiot + partikkelit on erikseen sammutettava lite-tilassa.
- **reduced-motion**: globaali blokki @722 nollaa CSS-animaatiot. JS-partikkelit on lisäksi gateattava `matchMedia('(prefers-reduced-motion:reduce)')`-tarkistuksella.

---

## 1. Tokenit — lisää `:root`-blokkiin (@~11)

```css
/* M1 — game feel */
--ease-out:      cubic-bezier(.22,.61,.36,1);   /* saapuminen */
--ease-out-back: cubic-bezier(.34,1.40,.64,1);  /* maltillinen overshoot, ei pomppiva */
--ease-in:       cubic-bezier(.40,0,1,1);        /* poistuminen */
--dur-micro: 140ms;   /* joka klik, painallus, vuoronvaihto */
--dur-meso:  220ms;   /* kortti areenalle, pomodoro loppuu */
--dur-macro: 320ms;   /* Valmis */
```
**Sääntö:** kaikki uudet animaatiot ja transitiot näistä muuttujista. Ei irrallisia ms-arvoja.

---

## 2. Palauteportaikko (kolme tasoa)

| Taso | Liipaisin (todellinen koukku) | Visuaali | Kesto / easing | Ääni / partikkeli |
|------|------|------|------|------|
| **Mikro** | kortin painallus; `qbtn`/`vbtn` klik; kortti jonoon (`card-enter`); vuoronvaihto | squash .97 + paluu; nappien nopea väri/scale | `--dur-micro` / `ease-out-back` | ei / ei |
| **Meso** | kortti aktivoituu areenalle (`.just-landed`→`arenaLand`); Pomodoro loppuu | kulta-rengaspulssi (on jo) + kevyt scale-in 1.02→1; varjo syvenee | `--dur-meso` / `ease-out` | `soundBell` (on jo) / ei |
| **Makro** | `markDone()` — Valmis | kulta-check-pop + rariteettiporras (alla); kortti poistuu painolla | `--dur-macro` / `ease-in` exit | `soundBell` (on jo) / **vain mythic** |

Makron voimakkuus `rarityOf(t)`-mukaan (funktio on jo @6716: frog→mythic, q1/q2→rare, q3→uncommon, muu→common):

- **common / uncommon:** nykyinen `card-exit` + pieni kulta-check-pop.
- **rare (q1/q2):** + kultainen radial-välähdys kortin takaa, scale-pop 1.06 ennen exitiä.
- **mythic (sammakko):** + **ansaittu wow** — kevyt kultahiukkaspurkaus (8–12 partikkelia, ~500 ms) + voimakkain välähdys. "Sammakko syöty." Tämä on ainoa paikka koko sovelluksessa, jossa partikkelit ovat sallittuja.

---

## 3. M1a — Solidius (painallus)

Kortti tuntuu fyysiseltä esineeltä: painuu pintaan, vapautuu painolla takaisin.

- Kohteet: `.tcg-card` (areena, hand, jono).
- **Pointer-eventit, ei CSS-tila.** Delegoi vakaaseen vanhempaan kontaineriin (areena/hand/jono-kääre — varmista selektori koodista), jotta kuuntelijat selviävät `render()`-uudelleenpiirrosta.
  - `pointerdown`: `transform: scale(.97) translateY(1px)`, `transition: transform 80ms var(--ease-out)`. Varjo kevenee (lähempänä pintaa).
  - `pointerup` / `pointercancel` / `pointerleave`: `transform: none`, `transition: transform var(--dur-micro) var(--ease-out-back)`.
- Älä estä klikkiä — painallus on visuaalinen, toiminta tapahtuu normaalisti.

---

## 4. M1b — Meso (landing)

Vahvista olemassa olevaa, älä korvaa.

- `.just-landed` käynnistää jo `arenaLand` (kulta-rengas .6s). Lisää samalle kortille kevyt sisääntulo: `scale(1.02)→1` `--dur-meso var(--ease-out)`, ja varjon syveneminen.
- Pomodoron loppu: pidä rauhallisena. `soundBell` + pomo-renkaan täyttymä riittää. **Ei juhlaa** — juhla kuuluu vain Valmis-hetkeen.

---

## 5. M1c — Makro (ansaittu wow) — `markDone()` @5980

Nykyrakenne: asettaa `done`/`doneAt`, siirtää active/turn, `soundBell()`, `a11yAnnounce`, lisää `card-exiting`, ja `animationend`→`save();render();`.

**Injektoi `card-exiting`-luokan LISÄÄMISEN ympärille rariteettiporras:**

1. Lue `var rar = rarityOf(t);` ja `var lite = document.documentElement.getAttribute('data-perf')==='lite';` ja `var rm = matchMedia('(prefers-reduced-motion:reduce)').matches;`
2. Piirrä kulta-check-pop kortin päälle (kaikki rariteetit): pieni SVG-checkmark, `scale(.4)→1` pop `--dur-macro var(--ease-out-back)`, sitten fade. `createElement`/`textContent`, ei emoji-template-literaalia.
3. `rar==='rare'` ja `!lite && !rm`: lisää kortin taakse radial kulta-välähdys (`tcg-card__done-flash`, CSS-keyframe, .35s) + scale-pop 1.06.
4. `rar==='mythic'` ja `!lite && !rm`: lisää **kultahiukkaspurkaus** — funktio `frogBurst(cardEl)` joka luo 8–12 absoluuttista div-partikkelia (kultainen `var(--accent)`), levittää ne CSS-animaatiolla ~500 ms, poistaa lopuksi. Voimakkain välähdys.
5. **Fallback (lite tai reduced-motion):** vain kulta-check-pop, ei välähdystä eikä partikkeleita; exit nopeutettu. Toiminnallisuus säilyy identtisenä.
6. Vasta efektin/exitin jälkeen `save();render();` (säilytä nykyinen `animationend`-ketju).

Uudet keyframet `card-enter`-blokin viereen (@~694):
```css
@keyframes done-check-pop{ 0%{opacity:0;transform:scale(.4)} 55%{opacity:1;transform:scale(1.06)} 100%{opacity:1;transform:scale(1)} }
@keyframes done-flash{ 0%{opacity:.55;transform:scale(.85)} 100%{opacity:0;transform:scale(1.5)} }
@keyframes frog-particle{ 0%{opacity:1;transform:translate(0,0) scale(1)} 100%{opacity:0;transform:translate(var(--px),var(--py)) scale(.4)} }
```
perf-lite-sammutus (lisää holo-säännön viereen @~3300):
```css
html[data-perf="lite"] .tcg-card__done-flash,
html[data-perf="lite"] .tcg-card__particle{display:none!important}
html[data-perf="lite"] .just-landed{animation:none!important}
```

---

## 6. Toteutusjärjestys (sub-osat — "toimii"-kuittaus jokaisen jälkeen)

- **M1a** — tokenit + Solidius-painallus. (Pienin, näkyy heti, nolla riski.)
- **M1b** — meso-landingin vahvistus.
- **M1c** — makro-wow porras: ensin common/uncommon check-pop → sitten rare-välähdys → lopuksi mythic-partikkelipurkaus.

Jokainen erikseen. Ei niputeta.

---

## 7. Hyväksyntälista (ennen committia)

- [ ] **Greyscale-testi:** hierarkia ja palaute toimivat ilman väriä (check-pop näkyy muodolla, ei vain kullalla).
- [ ] **reduced-motion:** kaikki kevenee, partikkelit pois, toiminta ennallaan.
- [ ] **perf-lite:** ei partikkeleita, ei välähdystä, ei jankkaa MacBook Pro 2010:llä.
- [ ] **Mobiili-Edge:** uusi DOM `createElement`/`textContent`; ei emoji-template-literaaleja; pointer-eventit toimivat kosketuksella.
- [ ] **Impeccable-detektori** ajettu, ei uusia `border-top`-osumia.
- [ ] **3 teemaa:** kulta (`--accent`) toimii kaikissa; mikään väri ei kovakoodattu.
- [ ] **Sensorinen inflaatio:** mikro on hiljainen, meso rauhallinen, **vain Valmis juhlii** — ja sammakko juhlii eniten.
- [ ] Solidius-kuuntelijat eivät vuoda `render()`-uudelleenpiirrossa (delegointi vakaaseen vanhempaan).

---

## 8. Mitä EI tehdä M1:ssä

- Ei Q2-värin muutosta (kulta vs. vihreä) → **M2.**
- Ei ääniä mikro/meso-tasolle (`soundBell` riittää Valmis-hetkeen).
- Ei "korteille silmiä/räpyttelyä."
- Ei partikkeleita minnekään muualle kuin mythic-Valmis.
