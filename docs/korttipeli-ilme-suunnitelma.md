# Korttipeli-ilme — vaihe B suunnitelma (jatka tästä työpöydällä)

## Tilanne

Uusi graafinen suunta **"tuottavuus korttipelinä"** hyväksytty. Vaihe A (mockup) valmis:
`mockup-kortti.html` (repo-juuressa) — areenakortti MtG-kehyksellä, tehtäväkäsi viuhkana,
pakkapino, holo vain sammakolle + tärkeille, Cinzel + Inter, ei backdrop-filteriä.

Jaakko: *"jos olemassa olevat ominaisuudet sisällytetään, olen tyytyväinen."*

## Vaihe B — vie ilme `index.html`:ään (säilytä KAIKKI toiminnot)

Periaate: appi saa mockupin **ulkonäön**, mockup ei korvaa logiikkaa. Inkrementaalinen, ei
uudelleenkirjoitusta. Pidä vanha kortti rinnalla lipun takana kunnes uusi on testattu.

1. **CSS:** lisää `mockup-kortti.html`:n `.tcg-card*`-luokat `index.html`:ään olemassa olevan
   `.card-new--arena`-lohkon viereen (index.html:~2504). Säilytä vanhat luokat toistaiseksi.
2. **Lippu:** `window._useCardUI`-tyylinen toggle uuden/vanhan kortin välillä testin ajaksi.
3. **Uudelleenkäytä muuttujat:** `--accent`, `--q1`…`--q4`, `--r-*` (index.html:11–51).
   `--qc` asetetaan JS:llä kortin `quad`-kentästä (kuten mockupin `buildCard`).
4. **Verbi-ikonit toimivat jo:** `svgVerbIcon`/`getVerbIconFromVerbi` (index.html:6028/6090),
   sprite rivit 891–971. Mockup käyttää samoja id:itä.
5. **est-pips:** korvaa `mkPipsNew` (index.html:6114) → `mkCostPips` (pyöreät mana-helmet,
   sama kokonais/puolikas/×N-logiikka). Mockupissa valmis `costPips()`-funktio.
6. **renderCardNew-jako:** nosta arena-haara (index.html:~6188–6389, `if(isArena)`) omaksi
   `renderArenaCard()`-funktioksi joka rakentaa `.tcg-card`-rakenteen mockupin `buildCard`-mallin
   mukaan. **SÄILYTÄ KAIKKI onclick-handlerit ennallaan:** markDone (✓), setFlag, toggleFrog,
   setWaiting (⏳), delUndoable, openEditModal (✏), linkki (🔗), Aloita-ajastin (▶). Vain DOM-
   rakenne ja luokat vaihtuvat, ei toiminnallisuus.
7. **Holo-luokat:** `if(t.frog) add('tcg-card--frog','tcg-card--holo'); else if(t.important) add('tcg-card--holo');`
8. **Käsipalkki** (`#hand-bar`, index.html:~1996): poista `backdrop-filter` (rivit ~2006–2007,
   ~2037), opaakki tausta; sovella viuhka + hover-nosto `.card-new--hand-bar`:iin;
   `overflow:visible` riville ~2058 (overflow:hidden estäisi noston).
9. **Perf-tila:** `html[data-perf="lite"] .tcg-card__plate::before{display:none}` lite-lohkoon (~682).
10. **Fontit:** vaihda `@import` (index.html:~9) → Cinzel + Inter. Tarkista ettei otsikkohierarkia rikkoudu.

## Validointi

- `node --check` syntaksille ennen jokaista korvausta; `sed -n` kontekstin lukuun.
- Mobiili-Edge-testaus (CLAUDE.md haurauskohdat: innerHTML, emoji-template-literaalit, sticky, backdrop).
- Vertaa uutta/vanhaa korttia lipulla rinnakkain; testaa 3 teemaa + nopea tila.
- **Työpöydällä:** Claude Code voi käynnistää appin ja ottaa kuvakaappaukset — hyödynnä tätä.

## Miten jatkaa työpöydällä

Avaa projekti Claude Codessa ja sano esim:
> "Jatka korttipeli-ilmeen vaihe B:tä docs/korttipeli-ilme-suunnitelma.md mukaan — vie
> mockup-kortti.html:n ilme index.html:ään säilyttäen kaikki olemassa olevat ominaisuudet."

## Kriittiset tiedostot
- `mockup-kortti.html` (valmis ilme-referenssi, repo-juuri)
- `index.html` (~2504 arena-CSS, ~6188–6389 renderCardNew, ~1996–2083 hand-bar, 891–971 sprite, 11–51 :root, ~9 fontit, ~682 perf)
- `CLAUDE.md` (rajoitteet 42–51, renderCardNew-jako rivi 178, areenakortin spec 184–189)
