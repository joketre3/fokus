# Fokus — Strategiakooste (toukokuu 2026)

Tämä dokumentti kokoaa Claude Code -web-session keskeiset päätökset ja analyysit.
Voidaan lukea tai jatkaa suoraan työpöydällä.

---

## Tuote lyhyesti

Fokus on suomenkielinen tuottavuustyökalu (puhdas HTML/JS):
- **index.html** — pääsovellus, Eisenhower-matriisi (Q1–Q4), Firebase Auth + Firestore jo toteutettu
- **aamu.html** — 4-vaiheinen aamusuunnittelurituaali (Q1-tarkistus → Q2-valinta → Sammakko → Lukujärjestys), vain localStorage
- **swipe.html** — Tinder-tyylinen tehtävien läpikäynti, vain localStorage
- **faptcg.html** — muu näkymä

Teema: DM Serif Display + DM Sans, luontoteemat (Havumetsä, Aurinko, Usva), mobiilioptimoitu (max-width 520px), Pomodoro-pohjainen aika-arviointi.

---

## Kaupallistamisanalyysi

### Vahvuudet
- Metodologinen tiukkuus: pakottaa käyttäjän Eisenhower-prosessin läpi, ei vain tarjoa sitä näkymänä
- Aamusuunnittelurituaali on ainutlaatuinen — lähinnä Sunsama ($20/kk) mutta halvemmalla ja selkeämmällä metodologialla
- Visuaalisesti viimeistelty, rauhallinen estetiikka erottuu kilpailijoista

### Suurimmat esteet kaupallistamiselle
1. **aamu.html ja swipe.html ilman Firebase-synkrointia** → suunnitelma tehty (ks. `docs/firebase-integraatio-suunnitelma.md`)
2. **Ei maksujärjestelmää** → Stripe + Vercel/Netlify serverless functions
3. **Suomenkieli rajaa markkinan** → pitkän tähtäimen englanninkielinen versio

### Suorin kilpailija
**TickTick** ($3/kk) — on Eisenhower-matriisi ja Pomodoro. Fokuksen etu: ohjattu rituaali, parempi design, yksinkertaisempi.

---

## Differointistrategia

Kaksi realistista tietä:

**Tie 1 — Niche syvyys (aloita tästä)**
"Pohjoismainen tuottavuusrituaali" — pysytään suomeksi, rakennetaan vahva brändi pienessä markkinassa. Realistinen katto ~€2–5k MRR.

**Tie 2 — Globaali haastaja (myöhemmin)**
"Opinionated daily planning for makers" — englanninkielinen, kilpaillaan Sunsaman ja Akiflown kanssa halvemmalla ja selkeämmällä metodologialla.

**Suositus:** Aloita Tie 1:llä, siirry Tie 2:een kun backend on paikallaan ja ensimmäiset maksavat käyttäjät löydetty.

---

## Backend-arkkitehtuuri

### Nykytila
- Firebase Auth (Google-kirjautuminen) ✅ — index.html
- Firestore-synkronointi ✅ — index.html
- localStorage → Firestore -migraatio ✅ — index.html
- aamu.html Firebase-integraatio ❌
- swipe.html Firebase-integraatio ❌
- Maksujärjestelmä ❌

### Suunniteltu arkkitehtuuri

```
[Selain]
    ├── Firebase Auth (Google + email/password)
    ├── Firestore (tehtävät, asetukset, workspace)
    └── Stripe.js (maksulomake)

[Serverless — Vercel tai Netlify, ilmainen tier]
    ├── POST /stripe/checkout
    ├── POST /stripe/webhook
    └── GET  /stripe/portal

[Firestore]
    └── users/{uid}/subscription → status, tier, expires_at
```

### Freemium-malli

| | Ilmainen | Premium (€6/kk tai €50/v) |
|---|---|---|
| Tehtäviä | 30 | Rajaton |
| Työtiloja | 1 | Rajaton |
| Synkronointi | ✅ | ✅ |
| Teemat | 1 | Kaikki |
| Data export | ❌ | ✅ |

---

## Tehdyt päätökset

1. **Järjestys:** Suunnitelma ensin → backend → freemium → englanti. Ei modernisaatioita ennen arkkitehtuuripäätöksiä.
2. **Backend:** Pysytään Firebasessa, ei migraatiota Supabaseen.
3. **Serverless:** Vercel tai Netlify webhookeille (ilmainen tier riittää alussa).
4. **Kotipalvelin:** Hyvä kehitystyökaluille ja oppimiseen, ei tuotantodatalle.

---

## Seuraavat askeleet (prioriteettijärjestys)

- [ ] **1. Firebase-integraatio aamu.html ja swipe.html:ään** — suunnitelma: `docs/firebase-integraatio-suunnitelma.md`
- [ ] **2. Stripe + Vercel-funktiot** — checkout, webhook, subscription-status Firestoreen
- [ ] **3. Freemium-rajojen enforkointi** — tarkista `users/{uid}/subscription.tier`
- [ ] **4. Email-kirjautuminen** Google-kirjautumisen rinnalle
- [ ] **5. Englanninkielinen versio** — myöhemmin, kun pohja on kunnossa
