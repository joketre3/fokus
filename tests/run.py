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
"""
import sys, os, re, glob

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from harness import build, run, report          # noqa: E402
from seed import seed_js                        # noqa: E402

TARGETS = {"index": "index.html", "aamu": "aamu.html", "swipe": "swipe.html"}
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


def check_shared_block(tree):
    bad = sum(check_one_block(tree, *b) for b in SHARED_BLOCKS)
    n = len(SHARED_BLOCKS)
    if bad:
        print("  == shared_block: EPÄONNISTUI")
    else:
        print(f"  == shared_block: {n}/{n} passed")
    return bad


def load(path):
    src = open(path, encoding="utf-8").read()
    m = re.match(r"//\s*target:\s*(\w+)\s*\n", src)
    target = m.group(1) if m else "index"
    return TARGETS[target], src[m.end():] if m else src


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
        page, body = load(f)
        src = os.path.join(tree, page)
        if not os.path.exists(src):
            print(f"\n### {name}: OHITETTU (puuttuu {src})"); continue
        print(f"\n### {name}  [{page}]")
        out_page = os.path.join(out, f"page_{name}.html")
        delay = 1200 if name in SLOW else 2500
        budget = 26000 if name in SLOW else 12000
        build(src, out_page, seed_js(), body, delay=delay)
        res, err, _ = run(out_page, budget=budget)
        if res is None:
            print("  !! ei probe-tulostetta"); print("  " + err[-600:].replace("\n", "\n  "))
            total_fail += 1; continue
        total_fail += report(name, res)

    print(f"\n{'='*54}\n{'KAIKKI LÄPI' if total_fail==0 else str(total_fail)+' EPÄONNISTUNUTTA VÄITETTÄ'}")
    return 1 if total_fail else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
