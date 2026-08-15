#!/usr/bin/env python3
"""PNG-rajaus ja nearest-neighbor -suurennos ilman PIL:iä.
Kaytto: crop.py sisaan.png ulos.png x y w h [kerroin]"""
import sys, zlib, struct


def read_png(path):
    d = open(path, 'rb').read()
    assert d[:8] == b'\x89PNG\r\n\x1a\n'
    i, idat, w = 8, b'', None
    while i < len(d):
        ln = struct.unpack('>I', d[i:i+4])[0]
        typ = d[i+4:i+8]
        data = d[i+8:i+8+ln]
        if typ == b'IHDR':
            w, h, bd, ct = struct.unpack('>IIBB', data[:10])
            assert bd == 8 and ct in (2, 6), (bd, ct)
            ch = 3 if ct == 2 else 4
        elif typ == b'IDAT':
            idat += data
        elif typ == b'IEND':
            break
        i += 12 + ln
    raw = zlib.decompress(idat)
    stride = w * ch
    rows, prev, p = [], bytearray(stride), 0
    for _ in range(h):
        f = raw[p]; p += 1
        line = bytearray(raw[p:p+stride]); p += stride
        for x in range(stride):
            a = line[x-ch] if x >= ch else 0
            b = prev[x]
            c = prev[x-ch] if x >= ch else 0
            if f == 1:   line[x] = (line[x] + a) & 255
            elif f == 2: line[x] = (line[x] + b) & 255
            elif f == 3: line[x] = (line[x] + (a + b) // 2) & 255
            elif f == 4:
                pa, pb, pc = abs(b-c), abs(a-c), abs(a+b-2*c)
                pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[x] = (line[x] + pr) & 255
        rows.append(line); prev = line
    return w, h, ch, rows


def write_png(path, w, h, ch, rows):
    ct = 2 if ch == 3 else 6
    raw = b''.join(b'\x00' + bytes(r) for r in rows)
    def chunk(t, d):
        c = struct.pack('>I', len(d)) + t + d
        return c + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    out = b'\x89PNG\r\n\x1a\n'
    out += chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, ct, 0, 0, 0))
    out += chunk(b'IDAT', zlib.compress(raw, 6)) + chunk(b'IEND', b'')
    open(path, 'wb').write(out)


src, dst, x, y, cw, chh = sys.argv[1], sys.argv[2], *map(int, sys.argv[3:7])
k = int(sys.argv[7]) if len(sys.argv) > 7 else 3
w, h, ch, rows = read_png(src)
out = []
for ry in range(y, min(y+chh, h)):
    line = rows[ry]
    px = [line[(rx*ch):(rx*ch+ch)] for rx in range(x, min(x+cw, w))]
    big = bytearray()
    for p in px:
        big += p * k
    for _ in range(k):
        out.append(big)
write_png(dst, len(out[0])//ch, len(out), ch, out)
print(dst, len(out[0])//ch, 'x', len(out))
