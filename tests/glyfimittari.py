#!/usr/bin/env python3
"""Glyfimittari: muste-%, komponenttimäärä ja parittainen IoU.

Aja ennen kuin lisäät uuden glyfin settiin:

    python3 tests/glyfimittari.py          # pelkkä nykytila + kynnys
    # kirjoita luonnokset tests/uudet-glyfit.svg -tiedostoon ja aja uudestaan

Paluuarvo 1 = kollisio (uusi glyfi osuu johonkin naapuriin korkeammalle
kuin hyväksyttyjen pahin pari). Katso tulos AINA myös silmällä rinnakkain
lähisukulaisten kanssa: mittari ja silmä löytävät eri asiat.

Lukee symbolit index.html:n <defs>istä, lisää luonnokset (UUDET),
renderöi kunkin canvasille kolmessa koossa ja palauttaa luvut.

Kynnys kalibroidaan HYVÄKSYTTYJEN glyfien keskinäisestä IoU:sta:
jos uusi osuu johonkin naapuriin korkeammalle kuin nykyinen pahin pari,
se on kollisio.
"""
import sys, os, re, json

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(HERE, 'tests'))
from harness import run  # noqa: E402

SCR = os.path.dirname(os.path.abspath(__file__))
# Luonnostiedosto on valinnainen: ilman sita skripti mittaa pelkan
# nykyisen setin ja tulostaa kynnyksen, jota vasten uusi glyfi arvioidaan.
UUDET_PATH = os.path.join(SCR, 'uudet-glyfit.svg')


def symbolit(path):
    s = open(path, encoding='utf-8').read()
    out = {}
    for m in re.finditer(r'<symbol id="(g-[a-z0-9]+)"(.*?)</symbol>', s, re.S):
        out[m.group(1)] = '<symbol id="%s"%s</symbol>' % (m.group(1), m.group(2))
    return out


TESTI = r"""
const SIZES = [8, 14, 28, 56];
function draw(sym, size){
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ' +
              'width="' + size + '" height="' + size + '">' +
              sym.replace('<symbol', '<g').replace('</symbol>', '</g>')
                 .replace(/id="[^"]*"/, '') + '</svg>';
  return new Promise(function(res){
    const img = new Image();
    img.onload = function(){
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, size, size);
      res(ctx.getImageData(0, 0, size, size));
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  });
}
function bits(d, size){
  const b = new Uint8Array(size*size);
  for (let i = 0; i < size*size; i++) b[i] = d.data[i*4+3] > 60 ? 1 : 0;
  return b;
}
function komponentit(b, size){
  const seen = new Uint8Array(size*size);
  let n = 0;
  for (let i = 0; i < size*size; i++){
    if (!b[i] || seen[i]) continue;
    n++; const st = [i]; seen[i] = 1;
    while (st.length){
      const p = st.pop(), x = p % size, y = (p / size) | 0;
      [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(d){
        const nx = x + d[0], ny = y + d[1];
        if (nx < 0 || ny < 0 || nx >= size || ny >= size) return;
        const q = ny*size + nx;
        if (b[q] && !seen[q]) { seen[q] = 1; st.push(q); }
      });
    }
  }
  return n;
}
function iou(a, b){
  let inter = 0, uni = 0;
  for (let i = 0; i < a.length; i++){
    if (a[i] || b[i]) uni++;
    if (a[i] && b[i]) inter++;
  }
  return uni ? inter/uni : 0;
}

(async function(){
  const SYMS = __SYMS__;
  const UUDET = __UUDET__;
  const names = Object.keys(SYMS);
  const res = { koot: {}, iou: {}, uudet: UUDET };
  const bit16 = {}, bit14 = {}, bit8 = {};
  for (const n of names){
    res.koot[n] = {};
    for (const s of SIZES){
      const d = await draw(SYMS[n], s);
      const b = bits(d, s);
      let ink = 0; for (let i = 0; i < b.length; i++) ink += b[i];
      res.koot[n]['s' + s] = { muste: +(100*ink/b.length).toFixed(1), osat: komponentit(b, s) };
      if (s === 28) bit16[n] = b;
      if (s === 14) bit14[n] = b;
      if (s === 8)  bit8[n]  = b;
    }
  }
  for (let i = 0; i < names.length; i++){
    for (let j = i+1; j < names.length; j++){
      // Kollisio syntyy PIENESSA koossa, jossa yksityiskohdat sulautuvat:
      // 28px:n IoU paastaa lapi parin joka on 14px:ssa sama merkki
      // (g-paiva vs g-etsi loytyi silmalla, ei 28px:n luvusta).
      const v28 = iou(bit16[names[i]], bit16[names[j]]);
      const v14 = iou(bit14[names[i]], bit14[names[j]]);
      // 8px on karkein siivila: siina kaksi eri sadetta ontoa rengasta
      // sulautuu samaksi mokkyraksi, jota IoU ei nae 14/28px:ssa.
      const v8 = iou(bit8[names[i]], bit8[names[j]]);
      const v = Math.max(v28, v14, v8);
      if (v > 0.25) res.iou[names[i] + '|' + names[j]] =
        +v.toFixed(3);
    }
  }
  document.documentElement.setAttribute('data-probe',
    'PROBE' + JSON.stringify([{t:'tulos', pass:true, d:JSON.stringify(res)}]) + 'ENDPROBE');
})();
"""


def main():
    syms = symbolit(os.path.join(HERE, 'index.html'))
    uudet = {}
    if os.path.exists(UUDET_PATH):
        raw = open(UUDET_PATH, encoding='utf-8').read()
        for m in re.finditer(r'<symbol id="(g-[a-z0-9]+)"(.*?)</symbol>', raw, re.S):
            uudet[m.group(1)] = '<symbol id="%s"%s</symbol>' % (m.group(1), m.group(2))
    syms.update(uudet)

    js = (TESTI.replace('__SYMS__', json.dumps(syms))
               .replace('__UUDET__', json.dumps(list(uudet))))
    page = os.path.join(SCR, 'glyfimittari.html')
    open(page, 'w', encoding='utf-8').write(
        '<!doctype html><meta charset="utf-8"><body><script>%s</script></body>' % js)

    data, err, _ = run(page, width=400, height=400, budget=15000)
    if not data:
        print('EI TULOSTA\n', err[-800:]); return 1
    r = json.loads(data[0]['d'])

    print('%-16s %-22s %-22s %s' % ('glyfi', '14px', '28px', '56px'))
    for n in sorted(r['koot']):
        k = r['koot'][n]
        tag = ' <-- UUSI' if n in r['uudet'] else ''
        print('%-16s %-22s %-22s %s%s' % (
            n,
            'muste %5.1f%% osat %d' % (k['s14']['muste'], k['s14']['osat']),
            'muste %5.1f%% osat %d' % (k['s28']['muste'], k['s28']['osat']),
            'muste %5.1f%% osat %d' % (k['s56']['muste'], k['s56']['osat']), tag))

    parit = sorted(r['iou'].items(), key=lambda kv: -kv[1])
    vanhat = [(k, v) for k, v in parit if not any(u in k for u in r['uudet'])]
    uudet_p = [(k, v) for k, v in parit if any(u in k for u in r['uudet'])]
    # Kynnys ei ole aloita|seis: se on tarkoituksellinen play/stop-pari.
    # Otetaan hyvaksyttyjen pahin pari joka EI ole tuo tunnettu pari.
    vanhat_f = [(k, v) for k, v in vanhat if k != 'g-aloita|g-seis']
    raja = vanhat_f[0][1] if vanhat_f else 0.5
    print('\nIoU max(8px, 14px, 28px) — hyvaksyttyjen pahimmat parit:')
    for k, v in vanhat[:6]:
        print('  %-40s %.3f' % (k, v))
    print('  kynnys (paras ilman aloita|seis -paria): %.3f' % raja)
    print('\nUusien parit:')
    fail = 0
    for k, v in uudet_p[:14]:
        lippu = 'KOLLISIO' if v > raja else 'ok'
        if v > raja: fail += 1
        print('  %-40s %.3f  %s' % (k, v, lippu))
    if not uudet_p:
        print('  (ei yli 0.25 osuvaa paria)')
    print('\nTULOS:', 'KOLLISIOITA %d' % fail if fail else 'ei kollisioita')
    return 1 if fail else 0


if __name__ == '__main__':
    sys.exit(main())
