# Ajastetut kortit — näkyvyys ja myöhästyneiden vapautus

Päivä: 2026-08-12
Tila: hyväksytty, toteutus alkamassa

## Oire

Tehtävä "Syksyn starttivuorot" näkyy vain pakassa. Tähti (⭐ handForced) tarttuu
korttiin mutta kortti ei koskaan päädy käteen. Mikään näkymä ei kerro miksi.

## Juurisyy

`checkScheduledTasks` (index.html:10976) vapauttaa `scheduled_hidden`-lipun vain
jos sovellus on auki täsmälleen ajastettuna minuuttina:

```js
if(s.date===todayStr && s.time===currentHHMM && !s.triggered)
```

Tarkistus ajetaan minuutin välein. Jos selain oli kiinni sillä minuutilla,
tehtävä jää `scheduled_hidden:true` pysyvästi. Myöhästyneille ei ole kiinniottoa.

Seuraukset ketjussa:

- `inbox` (10631) suodattaa `scheduled_hidden` pois → `buildHandQueue` ei näe korttia
- Pakka (13934) ei suodata mitään → kortti näkyy vain siellä
- Pakan tähtinappi (14003) tarjotaan kaikille `!t.done`-korteille ilman
  kelpoisuustarkistusta → tähden saa laittaa korttiin joka ei voi päätyä käteen
- `t.schedule` luetaan vain `checkScheduledTasks`issa → ajastusta ei voi nähdä,
  muuttaa eikä poistaa

Sivulöydös: pakkakortin `⏳2` (14000) on **arvio** (`t.est`), ei Odottaa-tila.
Sama symboli merkitsee Odottaa-tilaa muualla (1866, 9840, 13417). Tämä johti
väärään diagnoosiin käyttöä tehdessä.

## Muutokset

### A — Myöhästyneet ajastukset vapautuvat

`checkScheduledTasks` (10983-11001):

```
once:   !s.triggered && (s.date < tänään || (s.date === tänään && s.time <= nyt))
repeat: päivä osuu && s.time <= nyt && lastTriggered !== tänään
```

Menneitä `repeat`-päiviä ei kaiveta takaisin — toistuva päiväsarja ei saa
kasautua ruudulle.

`sched_last_<id>` (10993) siirtyy `localStorage`sta `t.schedLast`iin, jotta
toistoajastus synkkaa laitteiden välillä. Migraatio: jos `t.schedLast` puuttuu
ja vanha avain on olemassa, luetaan se kerran ja poistetaan.

### B — Ajastusrivi lisätietoihin

Yhteinen muotoilija `fmtSchedule(t)`:

- `once` → `📅 Ajastettu 12.8.2026 klo 08:00`
- `repeat` → `🔁 Ma, Ke klo 08:00`
- myöhässä → perään `— myöhässä`

Kaksi piirtopaikkaa:

1. **Kortti** (9785, `.tcg-card__notes-tcg`): kursivoitu rivi ennen käyttäjän
   tekstiä, väli alle. Lohkon ehto laajenee: piirtyy myös kun `lisatiedot`
   puuttuu mutta `schedule` on.
2. **Muokkausmodaali** (13253): kursiivirivi `#edit-notes`-textarean
   **yläpuolelle**.

Teksti renderöidään, sitä **ei kirjoiteta `t.lisatiedot`iin**. Syy: tallennus
(7550) lukisi sen käyttäjän omaksi tekstiksi → monistuisi joka avauksella ja
jäisi vanhentuneeksi kun ajastus muuttuu. Textarean sisällä kursiivi ei
myöskään ole mahdollinen.

### C — "Ajastetut" pakan kategoriaksi

`filterInventory` (13813) saa haaran `cat === 'scheduled'` →
`t.schedule && t.scheduled_hidden`.
Nappi ryhmään `g0` (13892) laskurilla, samalla `makeBtn`-kaavalla.

### D — ⏳ tarkoittaa kahta asiaa

Pakkakortin arvio `⏳2` (14000) → `2 pom`, sama kieli kuin TCG-kortilla (9793).
⏳ jää yksin merkitsemään Odottaa-tilaa.

### E — Ajastus muokkausmodaaliin

Modaali näyttää nykyisen ajastuksen ja tarjoaa "Poista ajastus" -napin, joka
tyhjentää `t.schedule` ja `t.scheduled_hidden`. Ilman tätä ajastusta ei saa pois
muuten kuin poistamalla tehtävä.

## Toteutusjärjestys

A → D → B → C → E. A on juurisyy; ilman sitä B ja C vain näyttävät jumissa
olevan kortin siistimmin.

## Testaus

Yksikkötestit `tests/`-hakemistossa vakiintuneen tavan mukaan. Kriittiset
tapaukset:

- `once` eilen, selain ollut kiinni → vapautuu
- `once` tänään tunnin päästä → ei vapaudu
- `once` jo `triggered` → ei vapaudu uudelleen
- `repeat` tänään aiemmin, ei vielä laukaistu → vapautuu kerran
- `repeat` sama päivä toisen kerran → ei vapaudu uudelleen
- `fmtSchedule` molemmat tyypit, myöhässä ja ei
