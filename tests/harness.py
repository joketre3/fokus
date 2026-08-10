#!/usr/bin/env python3
"""Headless test harness for fokus single-file HTML.
Injects a localStorage seed + a test script, runs Chrome --dump-dom,
and reads results back out of a data-probe attribute."""
import re, sys, os, json, subprocess, html as htmlmod, tempfile

import os, shutil
CHROME = os.environ.get("CHROME_BIN") or shutil.which("google-chrome") or "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"

def build(src_path, out_path, seed_js, test_js, theme="usva", delay=2500):
    doc = open(src_path, encoding="utf-8").read()
    seed = f"""<script>
try{{
  localStorage.clear();
  {seed_js}
}}catch(e){{console.error('seed',e)}}
document.documentElement.setAttribute('data-theme','{theme}');
</script>"""
    # seed must run before app scripts -> right after <body>
    i = doc.find('<body')
    i = doc.index('>', i) + 1
    doc = doc[:i] + seed + doc[i:]

    probe = """<script>
(function(){
  var RESULTS=[];
  function ok(name,cond,detail){RESULTS.push({t:name,pass:!!cond,d:(detail===undefined?'':String(detail))});}
  function fail(name,e){RESULTS.push({t:name,pass:false,d:'THREW: '+e});}
  window.__ok=ok;
  setTimeout(function(){
    try{
__TESTS__
    }catch(e){ fail('harness', e && (e.stack||e.message||e)); }
    document.documentElement.setAttribute('data-probe','PROBE'+JSON.stringify(RESULTS)+'ENDPROBE');
  }, __DELAY__);
})();
</script>"""
    probe = probe.replace("__TESTS__", test_js).replace("__DELAY__", str(delay))
    j = doc.rfind('</body>')
    doc = doc[:j] + probe + doc[j:]
    open(out_path, "w", encoding="utf-8").write(doc)

def run(page_path, width=1440, height=900, budget=None):
    if budget is None: budget = 9000
    cmd = [CHROME, "--headless=new", "--no-sandbox", "--disable-gpu",
           "--disable-dev-shm-usage", "--hide-scrollbars",
           f"--window-size={width},{height}",
           "--virtual-time-budget=%d" % budget,
           "--run-all-compositor-stages-before-draw",
           "--dump-dom", "file://" + os.path.abspath(page_path)]
    # TZ kiinnitetään: ICS-testi todentaa nimenomaan UTC+2/+3:n päivänvaihtoansan
    env = dict(os.environ, TZ=os.environ.get("FOKUS_TZ", "Europe/Helsinki"))
    p = subprocess.run(cmd, capture_output=True, text=True, timeout=180, env=env)
    out = p.stdout
    m = re.search(r'data-probe="(.*?)"', out, re.DOTALL)
    if not m:
        return None, p.stderr[-2000:], out
    raw = htmlmod.unescape(m.group(1))
    raw = raw[raw.index("PROBE")+5 : raw.rindex("ENDPROBE")]
    return json.loads(raw), p.stderr[-2000:], out

def report(label, results):
    if results is None:
        print(f"  !! {label}: NO PROBE OUTPUT"); return 1
    bad = 0
    for r in results:
        mark = "PASS" if r["pass"] else "FAIL"
        if not r["pass"]: bad += 1
        print(f"  [{mark}] {r['t']}" + (f"  -> {r['d']}" if r["d"] else ""))
    print(f"  == {label}: {len(results)-bad}/{len(results)} passed")
    return bad
