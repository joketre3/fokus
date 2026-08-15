#!/usr/bin/env python3
"""Aja Fokuksen selaintestit headless-Chromella.

    python3 tests/run.py                 # kaikki suitet työhakemistoa vasten
    python3 tests/run.py smoke habits    # vain nimetyt suitet
    python3 tests/run.py --tree /polku   # aja jotain muuta puuta vasten

Suite on `tests/suites/*.js`. Ensimmäinen rivi kertoo kohdetiedoston
(`// target: index|aamu|swipe`). Runko ajetaan sivun sisällä; käytössä on
`ok(nimi, ehto, lisatieto)`. Asynkroninen suite kirjoittaa `data-probe`n itse
ja päättyy `return;`iin — ks. timer_break.js.

Testien tila siemenetään `tests/seed.py`:llä ennen sovelluksen skriptejä.
Teema valitaan rivillä `// theme: aurinko` (oletus usva).
"""
import sys, os, re, glob

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from harness import build, run, report          # noqa: E402
from seed import seed_js, FRANK_TASKS, FRANK_PROJECTS   # noqa: E402

TARGETS = {"index": "index.html", "aamu": "aamu.html", "swipe": "swipe.html"}

# Siemenvalinta. Suite ilmoittaa sen rivillä `// seed: <nimi>` heti
# target-rivin jälkeen; ilman riviä käytetään oletusta. Frankenstein-siemen
# on maksimikuormitettu kortti jokaisessa kolmessa renderöintimoodissa
# (areena / rata / käsi) — ks. seed.py.
SEEDS = {
    "default": lambda: seed_js(),
    "frank":   lambda: seed_js(active=1, turn=(2,), tasks=FRANK_TASKS,
                               projects=FRANK_PROJECTS),
}
# Suitet, jotka mittaavat asettuneita CSS-siirtymiä, tarvitsevat pidemmän budjetin.
SLOW = {"timer_break", "phase_end"}

# Jaetut lohkot on kopioitu useaan tiedostoon (single-file-rajoite).
# Ajautuminen on tehtävä näkyväksi, muuten kopiot eriytyvät hiljaa.
#
# edit-modal on kopioitu vain kahteen popupiin — index.html:llä on oma,
# laajempi modaalinsa. sched-lohko sen sijaan on kaikissa kolmessa:
# ajastuksen logiikka on sama riippumatta siitä mistä sovellus avataan.
SHARED_BLOCKS = [
    ("edit-modal",
     "<!-- BEGIN fokus:edit-modal v1", "<!-- END fokus:edit-modal v1 -->",
     ["aamu.html", "swipe.html"]),
    ("sched",
     "/* BEGIN fokus:sched v1", "/* END fokus:sched v1 */",
     ["index.html", "aamu.html", "swipe.html"]),
    # Ikonilohko on vain popupeissa: index.html:ssä sama sprite on osa
    # isompaa <defs>iä (qart, logo, kvadranttimerkit), eikä sitä voi
    # rajata samaksi merkkijonoksi. Symbolien yhtenevyys index.html:ään
    # varmistetaan erikseen (check_icon_sync).
    ("icons",
     "<!-- BEGIN fokus:icons v1", "<!-- END fokus:icons v1 -->",
     ["aamu.html", "swipe.html"]),
]


def check_one_block(tree, label, begin, end, names):
    """Palauttaa virheiden määrän. Lohkon on oltava merkki merkiltä sama."""
    blocks = {}
    for name in names:
        path = os.path.join(tree, name)
        if not os.path.exists(path):
            continue
        src = open(path, encoding="utf-8").read()
        i = src.find(begin)
        if i < 0:
            print(f"  [FAIL] {name}: jaettu {label}-lohko puuttuu")
            blocks[name] = None
            continue
        j = src.find(end, i)
        if j < 0:
            print(f"  [FAIL] {name}: {label}-lohkon END-merkintä puuttuu")
            blocks[name] = None
            continue
        blocks[name] = src[i:j + len(end)]
    vals = [b for b in blocks.values()]
    if not vals or any(v is None for v in vals):
        return 1
    if len(set(vals)) != 1:
        sizes = ", ".join(f"{k} {len(v)} merkkiä" for k, v in blocks.items())
        print(f"  [FAIL] {label}-lohkot eroavat toisistaan ({sizes})")
        return 1
    print(f"  [PASS] {label} identtinen ({len(vals[0])} merkkiä) "
          f"-> {', '.join(blocks)}")
    return 0


def check_icon_sync(tree):
    """Popupien symbolit ovat kopio index.html:n <defs>istä.

    Kopio ajautuu erilleen hiljaa: <use href> ei varoita puuttuvasta eikä
    vanhentuneesta symbolista, se renderöi tyhjää tai vanhaa muotoa. Siksi
    jokainen popupin g-* verrataan merkki merkiltä index.html:n vastaavaan.
    """
    src = open(os.path.join(tree, "index.html"), encoding="utf-8").read()
    master = {m.group(1): re.sub(r"\s+", " ", m.group(0))
              for m in re.finditer(r'<symbol id="(g-[a-z0-9]+)".*?</symbol>', src, re.S)}
    bad = 0
    for name in ("aamu.html", "swipe.html"):
        s = open(os.path.join(tree, name), encoding="utf-8").read()
        i = s.find("<!-- BEGIN fokus:icons v1")
        j = s.find("<!-- END fokus:icons v1 -->", i)
        if i < 0 or j < 0:
            print(f"  [FAIL] {name}: ikonilohko puuttuu")
            bad += 1
            continue
        syms = {m.group(1): re.sub(r"\s+", " ", m.group(0))
                for m in re.finditer(r'<symbol id="(g-[a-z0-9]+)".*?</symbol>', s[i:j], re.S)}
        eri = [k for k, v in syms.items() if master.get(k) != v]
        if eri:
            print(f"  [FAIL] {name}: {len(eri)} symbolia eroaa index.html:stä: "
                  + ", ".join(sorted(eri)))
            bad += 1
        else:
            print(f"  [PASS] {name}: {len(syms)} symbolia = index.html")
    return bad


def check_shared_block(tree):
    bad = sum(check_one_block(tree, *b) for b in SHARED_BLOCKS)
    bad += check_icon_sync(tree)
    n = len(SHARED_BLOCKS) + 2
    if bad:
        print("  == shared_block: EPÄONNISTUI")
    else:
        print(f"  == shared_block: {n}/{n} passed")
    return bad


def load(path):
    src = open(path, encoding="utf-8").read()
    m = re.match(r"//\s*target:\s*(\w+)\s*\n", src)
    target = m.group(1) if m else "index"
    if m:
        src = src[m.end():]
    s = re.match(r"//\s*seed:\s*(\w+)\s*\n", src)
    seed = "default"
    if s:
        seed = s.group(1)
        src = src[s.end():]
        if seed not in SEEDS:
            raise SystemExit(f"{path}: tuntematon siemen '{seed}' "
                             f"(tunnetut: {', '.join(SEEDS)})")
    # Teema rivilla `// theme: aurinko`. Attribuutti EI yksin riita:
    # initTheme lukee localStoragen ja ylikirjoittaa sen, joten `fap_theme`
    # on kylvettava samalla. Ilman tata teemasuite ajaa hiljaa oletusteemaa
    # ja on aina vihrea.
    t = re.match(r"//\s*theme:\s*(\w+)\s*\n", src)
    theme = "usva"
    if t:
        theme = t.group(1)
        src = src[t.end():]
        if theme not in ("usva", "havu", "aurinko"):
            raise SystemExit(f"{path}: tuntematon teema '{theme}'")
    return TARGETS[target], seed, theme, src


def main(argv):
    tree, names = os.getcwd(), []
    i = 0
    while i < len(argv):
        if argv[i] == "--tree":
            tree = argv[i + 1]; i += 2
        else:
            names.append(argv[i]); i += 1

    out = os.path.join(HERE, ".out")
    os.makedirs(out, exist_ok=True)

    files = sorted(glob.glob(os.path.join(HERE, "suites", "*.js")))
    if names:
        files = [f for f in files
                 if os.path.basename(f)[:-3] in names]
        if not files and "shared_block" not in names:
            print("Ei suiteja nimillä: " + ", ".join(names)); return 2

    total_fail = 0
    if not names or "shared_block" in names:
        print("\n### shared_block  [aamu.html + swipe.html]")
        total_fail += check_shared_block(tree)

    for f in files:
        name = os.path.basename(f)[:-3]
        page, seed, theme, body = load(f)
        src = os.path.join(tree, page)
        if not os.path.exists(src):
            print(f"\n### {name}: OHITETTU (puuttuu {src})"); continue
        print(f"\n### {name}  [{page}]" + ("" if seed == "default" else f"  seed={seed}")
              + ("" if theme == "usva" else f"  theme={theme}"))
        out_page = os.path.join(out, f"page_{name}.html")
        delay = 1200 if name in SLOW else 2500
        budget = 26000 if name in SLOW else 12000
        seed_src = SEEDS[seed]() + f"localStorage.setItem('fap_theme','{theme}');\n"
        build(src, out_page, seed_src, body, theme=theme, delay=delay)
        res, err, _ = run(out_page, budget=budget)
        if res is None:
            print("  !! ei probe-tulostetta"); print("  " + err[-600:].replace("\n", "\n  "))
            total_fail += 1; continue
        total_fail += report(name, res)

    print(f"\n{'='*54}\n{'KAIKKI LÄPI' if total_fail==0 else str(total_fail)+' EPÄONNISTUNUTTA VÄITETTÄ'}")
    return 1 if total_fail else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
